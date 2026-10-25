import { PrismaClient, Role, OrderChannel, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing database records (order of deletion matters to avoid foreign key violations)
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shopeeProductMapping.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Super Admin, Shop Owner, Staff)
  const salt = await bcrypt.genSalt(10);
  const superAdminPassword = await bcrypt.hash('admin123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const staffPassword = await bcrypt.hash('staff123', salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@omnichannel.vn',
      password: superAdminPassword,
      name: 'Quản Trị Viên Hệ Thống',
      role: Role.SUPER_ADMIN,
      shopName: 'Hệ Thống Omnichannel Hub',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'skillsanh@gmail.com',
      password: adminPassword,
      name: 'Huỳnh Văn Sang (Chủ Shop)',
      role: Role.ADMIN,
      shopName: 'Bình Dương Commerce',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'sinfour503@gmail.com',
      password: staffPassword,
      name: 'Nhân Viên Bán Hàng',
      role: Role.STAFF,
      shopName: 'Bình Dương Commerce',
    },
  });

  console.log(`Created users: Super Admin (${superAdmin.email}), Shop Owner (${admin.email}), Staff (${staff.email})`);

  // 3. Create Products
  const product1 = await prisma.product.create({
    data: {
      sku: 'PROD-JEANS-001',
      name: 'Quần Jeans Slimfit Nam',
      description: 'Quần jeans chất bò co giãn dáng ôm trẻ trung',
      price: 250000,
      stock: 120,
      weight: 600,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      sku: 'PROD-TSHIRT-002',
      name: 'Áo T-Shirt Cotton Unisex',
      description: 'Áo thun cotton 100% thoáng mát, co giãn tốt',
      price: 150000,
      stock: 250,
      weight: 300,
    },
  });

  await prisma.product.create({
    data: {
      sku: 'PROD-JACKET-003',
      name: 'Áo Khoác Gió Chống Nước',
      description: 'Áo khoác gió 2 lớp cản gió chống nước nhẹ',
      price: 450000,
      stock: 45,
      weight: 500,
    },
  });

  console.log('Created products');

  // 4. Create Shopee Product Mappings
  await prisma.shopeeProductMapping.create({
    data: {
      productId: product1.id,
      shopeeItemId: BigInt(22134567890),
      shopeePrice: 280000, // Cấu hình giá bán cao hơn trên Shopee
    },
  });

  await prisma.shopeeProductMapping.create({
    data: {
      productId: product2.id,
      shopeeItemId: BigInt(22134567891),
      shopeePrice: 170000,
    },
  });

  console.log('Created Shopee product mappings');

  // 5. Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      address: '123 Đường 30/4, Phú Hòa, Thủ Dầu Một',
      districtId: 1544, // Mã Thủ Dầu Một trong GHN Sandbox
      wardCode: '290913', // Mã phường Phú Hòa
      fbUserId: 'fb_user_123',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Trần Thị B',
      phone: '0912345678',
      address: '456 Cách Mạng Tháng 8, Hiệp Thành, Thủ Dầu Một',
      districtId: 1544,
      wardCode: '290912',
    },
  });

  console.log('Created customers');

  // 6. Create Orders & Order Items
  await prisma.order.create({
    data: {
      channel: OrderChannel.FACEBOOK,
      customerId: customer1.id,
      status: OrderStatus.PAID,
      totalAmount: 400000,
      shippingFee: 30000,
      payosPaymentId: 'payos_tx_001',
      ghnOrderCode: 'GHN_SHP_999901',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 1,
            price: 250000,
          },
          {
            productId: product2.id,
            quantity: 1,
            price: 150000,
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      channel: OrderChannel.SHOPEE,
      customerId: customer2.id,
      status: OrderStatus.COMPLETED,
      totalAmount: 170000,
      shippingFee: 35000,
      shopeeOrderId: 'SHP_ORD_777702',
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 1,
            price: 170000, // Giá Shopee Mapping
          },
        ],
      },
    },
  });

  console.log('Created orders');

  // 7. Create Conversations & Messages
  const conversation = await prisma.conversation.create({
    data: {
      customerId: customer1.id,
      lastMessage: 'Đơn hàng của mình đã được đóng gói chưa ạ?',
      lastActiveAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'CUSTOMER',
      content: 'Chào shop, mình muốn mua cái quần Jeans Slimfit và áo T-shirt',
      fbMessageId: 'mid.fb_message_001',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'STAFF',
      content: 'Dạ shop chào bạn! Bạn cho shop xin sđt và địa chỉ để shop lên đơn cho mình nhé.',
      fbMessageId: 'mid.fb_message_002',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'CUSTOMER',
      content: 'Sđt mình là 0987654321, địa chỉ 123 Đường 30/4, Phú Hòa, Thủ Dầu Một ạ',
      fbMessageId: 'mid.fb_message_003',
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderType: 'STAFF',
      content: 'Đơn của bạn đã được thanh toán qua QR thành công. Shop đang chuẩn bị gửi hàng cho bạn nhé!',
      fbMessageId: 'mid.fb_message_004',
    },
  });

  console.log('Created conversation history');
  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
