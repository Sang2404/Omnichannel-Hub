import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../order.service';
import { prisma } from '../../../config/database';
import { OrderStatus, OrderChannel } from '@prisma/client';

vi.mock('../../../config/database', () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
    $executeRaw: vi.fn(),
  },
}));

vi.mock('../../../config/socket', () => ({
  getSocketServer: vi.fn(() => ({ emit: vi.fn() })),
}));

describe('Overselling Protection & Concurrency Test', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
    vi.clearAllMocks();
  });

  it('should successfully decrement stock when sufficient inventory is available', async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: 'ord-1',
      orderCode: 1001,
      status: OrderStatus.PENDING_PAYMENT,
      channel: OrderChannel.FACEBOOK,
      items: [
        {
          productId: 'prod-1',
          quantity: 2,
          product: { name: 'Áo T-Shirt', weight: 300, shopeeItemMapping: null },
        },
      ],
      customer: { fbUserId: null },
    });

    // 1 row updated -> Sufficient stock
    (prisma.$executeRaw as any).mockResolvedValue(1);
    (prisma.product.findUnique as any).mockResolvedValue({ id: 'prod-1', stock: 8 });
    (prisma.order.update as any).mockResolvedValue({ id: 'ord-1', status: OrderStatus.PAID });

    const result = await orderService.handlePaymentSuccess(1001, 'pay-123');
    expect(result).toBeDefined();
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('should throw an ApiError and prevent overselling when stock is insufficient (0 rows affected)', async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: 'ord-2',
      orderCode: 1002,
      status: OrderStatus.PENDING_PAYMENT,
      channel: OrderChannel.SHOPEE,
      items: [
        {
          productId: 'prod-1',
          quantity: 5,
          product: { name: 'Áo T-Shirt', weight: 300, shopeeItemMapping: null },
        },
      ],
      customer: { fbUserId: null },
    });

    // 0 rows affected -> stock < quantity (Concurrent race condition)
    (prisma.$executeRaw as any).mockResolvedValue(0);

    await expect(orderService.handlePaymentSuccess(1002, 'pay-456')).rejects.toThrow(
      /Overselling Protection/
    );
  });
});
