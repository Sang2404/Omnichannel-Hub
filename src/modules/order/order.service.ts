import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/api-error';
import { GhnService } from '../../integrations/ghn/ghn.service';
import { PayosService } from '../../integrations/payos/payos.service';
import { FacebookService } from '../../integrations/facebook/facebook.service';
import { ShopeeService } from '../../integrations/shopee/shopee.service';
import { getSocketServer } from '../../config/socket';
import { OrderStatus, OrderChannel } from '@prisma/client';
import { z } from 'zod';
import { createOrderSchema, queryOrderSchema } from './order.validation';
import { logger } from '../../shared/utils/logger';

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type QueryOrderInput = z.infer<typeof queryOrderSchema>;

const ghnService = new GhnService();
const payosService = new PayosService();
const fbService = new FacebookService();
const shopeeService = new ShopeeService();

export class OrderService {
  /**
   * Places a new order, calculates shipping fees, generates a PayOS payment link,
   * and automatically sends payment instructions to Facebook Messenger if the order channel is FACEBOOK.
   * 
   * @param input - The validated order parameters from Zod
   * @returns Order details combined with the PayOS payment link checkout details
   */
  async placeOrder(input: CreateOrderInput) {
    const { customerId, channel, items, returnUrl, cancelUrl } = input;

    // 1. Fetch Customer info
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // 2. Validate product stock and compute subtotal & total package weight
    let totalItemsAmount = 0;
    let totalWeight = 0;
    const dbProducts: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw ApiError.notFound(`Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      totalItemsAmount += product.price * item.quantity;
      totalWeight += product.weight * item.quantity;
      dbProducts.push({ product, quantity: item.quantity });
    }

    // 3. Determine shipping fee
    let shippingFee = input.shippingFee;
    if (shippingFee === undefined) {
      if (customer.districtId && customer.wardCode) {
        // Compute fee dynamically using Giao Hàng Nhanh API
        shippingFee = await ghnService.calculateShippingFee(
          customer.districtId,
          customer.wardCode,
          totalWeight
        );
      } else {
        // Fallback flat shipping fee if customer address coordinates are incomplete
        shippingFee = 30000;
        logger.info(`Customer missing GHN details, falling back to default flat fee: ${shippingFee}`);
      }
    }

    const totalAmount = totalItemsAmount + shippingFee;

    // 4. Create the Order and its items inside a database transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          channel,
          customerId,
          status: OrderStatus.PENDING_PAYMENT,
          totalAmount,
          shippingFee,
          items: {
            create: dbProducts.map((p) => ({
              productId: p.product.id,
              quantity: p.quantity,
              price: p.product.price, // Record historical price at order time
            })),
          },
        },
      });
      return newOrder;
    });

    // 5. Generate automated payment request link via PayOS SDK
    const description = `TDMU${order.orderCode} thanh toan`;
    const paymentLinkData = await payosService.createPaymentLink(
      order.orderCode,
      totalAmount,
      description,
      returnUrl,
      cancelUrl
    );

    // Save paymentLinkId return from PayOS client back to Order DB
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        payosPaymentId: paymentLinkData.paymentLinkId,
      },
      include: { items: true },
    });

    // 6. Channel Specific Automation: For Facebook Customers, automatically deliver payment invoice
    if (channel === OrderChannel.FACEBOOK && customer.fbUserId) {
      try {
        const messageText = `Đơn hàng #${order.orderCode} của bạn đã được tạo!\nTổng cộng: ${totalAmount.toLocaleString()}đ (bao gồm ${shippingFee.toLocaleString()}đ ship).\nVui lòng quét mã QR bên dưới hoặc truy cập link sau để thanh toán: ${paymentLinkData.checkoutUrl}`;
        await fbService.sendTextMessage(customer.fbUserId, messageText);
        
        // If PayOS provides a QR code, send it as an image attachment
        if (paymentLinkData.qrCode) {
          // In production, we'd pass a generated image URL or direct base64.
          // For sandbox purposes, we can send a publicly viewable payment link qr code.
          const qrCodeUrl = `https://api.vietqr.io/image/970415-11330099-QRPAY.jpg?accountName=CONG%20TY%20GIAI%20PHAP%20SO%20BINH%20DUONG&amount=${totalAmount}&addInfo=${encodeURIComponent(description)}`;
          await fbService.sendImageMessage(customer.fbUserId, qrCodeUrl);
        }
        logger.info(`Automated invoice dispatched to FB Customer: ${customer.fbUserId}`);
      } catch (fbError) {
        logger.error('Failed to dispatch invoice message to Facebook:', fbError);
      }
    }

    return {
      order: updatedOrder,
      payment: paymentLinkData,
    };
  }

  /**
   * Processes a successful payment callback (e.g. from PayOS Webhook).
   * Updates status to PAID, decrements product stocks, synchronizes inventory with Shopee Open API,
   * emits socket.io triggers, sends a thank-you message to Facebook, and registers a GHN shipment.
   * 
   * @param orderCode - Unique order code representing the transaction
   * @param payosPaymentId - PayOS transaction ID for audit trailing
   */
  async handlePaymentSuccess(orderCode: number, payosPaymentId: string) {
    // 1. Fetch Order and relate tables
    const order = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: {
          include: { product: { include: { shopeeItemMapping: true } } },
        },
        customer: true,
      },
    });

    if (!order) {
      throw ApiError.notFound(`Order with code ${orderCode} not found`);
    }

    // Skip redundant processing (e.g. webhook retries)
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      logger.info(`Order #${orderCode} is already processed (Status: ${order.status}). Skipping callback.`);
      return order;
    }

    // 2. Perform Stock Decrement and Shopee sync inside a database transaction
    const processedOrder = await prisma.$transaction(async (tx) => {
      // Update order status to PAID
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          payosPaymentId,
        },
      });

      // Decrement product inventory with Atomic Conditional Locking (Overselling Prevention)
      for (const item of order.items) {
        const affectedRows = await tx.$executeRaw`
          UPDATE "Product"
          SET "stock" = "stock" - ${item.quantity}, "updatedAt" = NOW()
          WHERE "id" = ${item.productId} AND "stock" >= ${item.quantity}
        `;

        if (affectedRows === 0) {
          logger.warn(`[OVERSELLING PREVENTED] Product ${item.productId} has insufficient stock for Order #${orderCode}. Rolling back transaction.`);
          throw ApiError.badRequest(
            `Sản phẩm '${item.product.name}' đã hết hàng trong quá trình thanh toán (Kho không đủ số lượng). Giao dịch được bảo vệ chống bán âm (Overselling Protection).`
          );
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // If the product is mapped to Shopee Sandbox, synchronize the stock chéo
        if (product && item.product.shopeeItemMapping) {
          const shopeeMapping = item.product.shopeeItemMapping;
          // Synchronize stock asynchronously to prevent blocking database transaction commit
          shopeeService.updateStock(shopeeMapping.shopeeItemId, product.stock)
            .then((success) => {
              if (success) {
                logger.info(`Stock synced successfully to Shopee item ${shopeeMapping.shopeeItemId.toString()}`);
                const io = getSocketServer();
                io.emit('stock:synced', {
                  productId: product.id,
                  shopeeItemId: shopeeMapping.shopeeItemId.toString(),
                  newStock: product.stock,
                });
              }
            });
        }
      }

      return updated;
    });

    // 3. Emit real-time Socket.io triggers for dashboards
    try {
      const io = getSocketServer();
      io.emit('order:status-changed', {
        orderId: order.id,
        orderCode: order.orderCode,
        newStatus: OrderStatus.PAID,
      });

      // Emit KPI updates to trigger real-time chart redraws in BI Dashboard
      io.emit('kpi:updated', {
        revenueIncrement: order.totalAmount - order.shippingFee,
        orderId: order.id,
      });
      logger.info(`Broadcasted real-time order update for #${orderCode}`);
    } catch (socketErr) {
      // Non-blocking log
    }

    // Create persistent system notification
    try {
      if (prisma.notification?.create) {
        await prisma.notification.create({
          data: {
            title: `Thanh toán thành công #${orderCode}`,
            message: `Khách hàng ${order.customer.name} đã thanh toán ${order.totalAmount.toLocaleString('vi-VN')}đ qua PayOS VietQR.`,
            category: 'order',
            link: '/orders',
            isRead: false,
          },
        });
      }
    } catch (notifErr) {
      logger.warn('Failed to create payment notification:', notifErr);
    }

    // 4. Send thank-you message to Facebook customer
    if (order.channel === OrderChannel.FACEBOOK && order.customer.fbUserId) {
      try {
        await fbService.sendTextMessage(
          order.customer.fbUserId,
          `Cảm ơn bạn! Đơn hàng #${orderCode} đã được thanh toán thành công.\nShop đang chuẩn bị hàng và sẽ gửi mã vận đơn sớm cho bạn.`
        );
      } catch (fbError) {
        logger.error('Failed to send thank-you message to Facebook customer:', fbError);
      }
    }

    // 5. Automated GHN Shipping Order Dispatch
    const customer = order.customer;
    if (customer.districtId && customer.wardCode && customer.phone && customer.address) {
      try {
        logger.info(`Creating shipping order with Giao Hàng Nhanh for Order #${orderCode}...`);
        
        const packageWeight = order.items.reduce((sum, item) => sum + item.product.weight * item.quantity, 0);
        const ghnItems = order.items.map((item) => ({
          name: item.product.name,
          sku: item.product.sku,
          quantity: item.quantity,
        }));

        const ghnOrderCode = await ghnService.createShippingOrder({
          toName: customer.name,
          toPhone: customer.phone,
          toAddress: customer.address,
          toDistrictId: customer.districtId,
          toWardCode: customer.wardCode,
          weight: packageWeight,
          items: ghnItems,
        });

        // Update tracking code in Database
        await prisma.order.update({
          where: { id: order.id },
          data: {
            ghnOrderCode,
            status: OrderStatus.SHIPPED, // Progress status to SHIPPED
          },
        });

        logger.info(`GHN Order created successfully with code: ${ghnOrderCode}`);

        // Create persistent shipping notification
        try {
          if (prisma.notification?.create) {
            await prisma.notification.create({
              data: {
                title: `Vận đơn GHN đã tạo #${orderCode}`,
                message: `Đơn hàng #${orderCode} đã tạo vận đơn GHN ${ghnOrderCode} cho khách ${customer.name}.`,
                category: 'shipping',
                link: '/orders',
                isRead: false,
              },
            });
          }
        } catch (notifErr) {
          logger.warn('Failed to create shipping notification:', notifErr);
        }

        // Notify customer on Facebook Messenger with tracking details
        if (order.channel === OrderChannel.FACEBOOK && customer.fbUserId) {
          await fbService.sendTextMessage(
            customer.fbUserId,
            `Đơn hàng của bạn đã được bàn giao cho Giao Hàng Nhanh.\nMã vận đơn của bạn là: ${ghnOrderCode}.\nBạn có thể theo dõi đơn hàng qua mã này.`
          );
        }
      } catch (ghnError) {
        logger.error('Failed to create GHN shipping order automatically:', ghnError);
      }
    } else {
      logger.warn(`Order #${orderCode} is paid but missing customer details for GHN dispatch`);
    }

    return processedOrder;
  }

  /**
   * Retrieves list of Orders with pagination and status filters.
   */
  async listOrders(query: QueryOrderInput) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status as OrderStatus;
    }

    const [total, orders] = await prisma.$transaction([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, phone: true },
          },
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      orders,
    };
  }

  /**
   * Retrieves order by ID.
   */
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    return order;
  }

  /**
   * Updates order status manually (e.g. Cancel or progress) with inventory rollback if needed.
   */
  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { include: { shopeeItemMapping: true } } },
        },
        customer: true,
      },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.status === newStatus) {
      return order;
    }

    const oldStatus = order.status;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: newStatus },
      });

      // If cancelling an order that already decremented stock (PAID, SHIPPED, COMPLETED)
      if (newStatus === OrderStatus.CANCELLED && ['PAID', 'SHIPPED', 'COMPLETED'].includes(oldStatus)) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          if (item.product.shopeeItemMapping) {
            const currentProd = await tx.product.findUnique({ where: { id: item.productId } });
            if (currentProd) {
              shopeeService.updateStock(item.product.shopeeItemMapping.shopeeItemId, currentProd.stock)
                .catch((err) => logger.error('Failed to sync restored stock to Shopee:', err));
            }
          }
        }
      }

      return updated;
    });

    try {
      const io = getSocketServer();
      io.emit('order:status-changed', {
        orderId: order.id,
        orderCode: order.orderCode,
        newStatus,
      });
      io.emit('kpi:updated', { orderId: order.id });
    } catch (socketErr) {}

    return updatedOrder;
  }
}

