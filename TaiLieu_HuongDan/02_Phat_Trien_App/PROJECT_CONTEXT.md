# 🚀 OMNICHANNEL SOCIAL COMMERCE HUB - SYSTEM CONTEXT & PROMPT SPECIFICATION

> **DÀNH CHO AI / DEVELOPER**: Tài liệu này chứa toàn bộ bối cảnh kiến trúc, Database Schema, luồng xử lý tự động chéo (Cross-channel Workflow), danh sách API Endpoints và hiện trạng dự án. Bất kỳ AI hoặc lập trình viên nào đọc file này đều có thể hiểu 100% dự án và tiếp tục phát triển mà không bị đứt gãy ngữ cảnh.

---

## 1. TỔNG QUAN HỆ THỐNG (SYSTEM OVERVIEW)

- **Tên đề tài**: Nghiên cứu và xây dựng hệ thống quản lý bán hàng đa kênh (Omnichannel Social Commerce Hub) cho Công ty TNHH Giải pháp số Bình Dương.
- **Mô hình kiến trúc**: **Modular Monolith** (Đơn khối phân mô-đun, tách biệt logic các domain nhưng triển khai chung 1 repo Node.js).
- **Techstack Backend (Đã hoàn thành 100%)**:
  - **Core**: Node.js, Express.js, TypeScript (Strict Mode).
  - **Database & ORM**: PostgreSQL (Host trên **Supabase Cloud**), Prisma ORM v5.
  - **Queue & Cache**: Redis (Host trên **Upstash Cloud**), BullMQ (Xử lý hàng đợi Webhook ngầm).
  - **Realtime**: Socket.io (Đẩy dữ liệu Dashboard & Chat real-time).
  - **Validation & Logging**: Zod schema validation (Fail-fast), Winston logger.
- **Techstack Frontend (Chưa triển khai - Kế hoạch tiếp theo)**:
  - ReactJS (Vite), Tailwind CSS, Shadcn UI (Dark Mode), Redux Toolkit, Recharts/Chart.js.

---

## 2. PRISMA DATABASE SCHEMA (POSTGRESQL)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN       // Chủ shop (Toàn quyền + Xem Báo cáo Analytics BI)
  STAFF       // Nhân viên (Chỉ chat, lên đơn, xem kho)
}

enum OrderStatus {
  PENDING_PAYMENT // Chờ quét mã QR
  PAID            // Đã thanh toán tự động (PayOS Webhook)
  PROCESSING      // Đang chuẩn bị hàng
  SHIPPED         // Đã giao cho bên GHN (Mã vận đơn)
  COMPLETED       // Giao thành công
  CANCELLED       // Đơn bị hủy
}

enum OrderChannel {
  FACEBOOK
  SHOPEE
}

enum SenderType {
  CUSTOMER
  STAFF
}

enum MessageType {
  TEXT
  IMAGE
  QR_CODE
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed bcrypt
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
}

model Product {
  id                String                @id @default(uuid())
  sku               String                @unique // Mã quản lý kho gốc
  name              String
  description       String?
  price             Float                 // Giá bán gốc tại kho
  stock             Int                   // Tồn kho gốc nội bộ
  weight            Int                   @default(500) // Grams phục vụ tính ship GHN
  shopeeItemMapping ShopeeProductMapping?
  orderItems        OrderItem[]
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
}

model ShopeeProductMapping {
  id           String   @id @default(uuid())
  productId    String   @unique
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  shopeeItemId BigInt   @unique // ID sản phẩm trên sàn Shopee Sandbox
  shopeePrice  Float    // Giá cấu hình bán trên Shopee
}

model Customer {
  id            String         @id @default(uuid())
  fbUserId      String?        @unique // ID định danh người dùng từ Meta API (PSID)
  name          String
  phone         String?
  address       String?
  districtId    Int?           // Mã Quận/Huyện theo GHN API
  wardCode      String?        // Mã Phường/Xã theo GHN API
  orders        Order[]
  conversations Conversation[]
  createdAt     DateTime       @default(now())
}

model Order {
  id             String       @id @default(uuid())
  orderCode      Int          @unique @default(autoincrement()) // Dùng làm orderCode cho PayOS
  channel        OrderChannel
  customerId     String
  customer       Customer     @relation(fields: [customerId], references: [id])
  status         OrderStatus  @default(PENDING_PAYMENT)
  totalAmount    Float
  shippingFee    Float        @default(0)
  payosPaymentId String?      @unique // ID giao dịch tạo từ PayOS
  ghnOrderCode   String?      @unique // Mã vận đơn từ Giao Hàng Nhanh
  shopeeOrderId  String?      @unique // Mã đơn hàng nếu kéo từ Shopee về
  items          OrderItem[]
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Float    // Giá tại thời điểm mua
}

model Conversation {
  id           String    @id @default(uuid())
  customerId   String
  customer     Customer  @relation(fields: [customerId], references: [id])
  lastMessage  String?
  lastActiveAt DateTime  @default(now())
  messages     Message[]
  createdAt    DateTime  @default(now())
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderType     SenderType   // CUSTOMER hoặc STAFF
  content        String
  messageType    MessageType  @default(TEXT)
  fbMessageId    String?      @unique
  createdAt      DateTime     @default(now())
}
```

---

## 3. LUỒNG XỬ LÝ TỰ ĐỘNG CHÉO CỐT LÕI (CORE CROSS-CHANNEL WORKFLOW)

Hệ thống đã cài đặt hoàn chỉnh kịch bản liên hoàn chéo:

```
[Khách Facebook chốt đơn]
       │
       ▼
[Nhân viên bấm "Tạo Đơn" trên Web] ──► Lưu DB (PENDING_PAYMENT) ──► Tự tính phí ship GHN API
       │
       ▼
[Gọi SDK PayOS] ──► Tạo link VietQR ──► Tự động gửi link thanh toán & ảnh VietQR qua FB Messenger
       │
       ▼
[Khách quét QR & Chuyển khoản thành công]
       │
       ▼
[PayOS bắn Webhook về POST /webhooks/payos]
       │
       ├─► 1. Giải mã HMAC signature, chuyển Order.status = PAID
       ├─► 2. Trừ tồn kho gốc (Product.stock = stock - quantity)
       ├─► 3. Tìm ShopeeProductMapping: Tự động gọi API Shopee [v2.product.update_stock] đồng bộ kho lên sàn
       ├─► 4. Gọi GHN API [shipping-order/create] tạo vận đơn ──► Lưu ghnOrderCode ──► Đổi status = SHIPPED
       ├─► 5. Tự động nhắn tin mã vận đơn GHN cho khách qua Facebook Messenger
       └─► 6. Bắn tín hiệu Socket.io (order:status-changed & kpi:updated) đổi màu đơn hàng trên Dashboard
```

---

## 4. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

```
e:\School\TotNghiep/
├── prisma/
│   ├── schema.prisma                  # Database schema (PostgreSQL)
│   └── seed.ts                        # Script seed dữ liệu mẫu
├── src/
│   ├── app.ts                         # Cấu hình Express app (CORS, JSON Parser, Error Handler)
│   ├── server.ts                      # Entrypoint khởi tạo HTTP server, Socket.io, BullMQ Workers
│   ├── config/
│   │   ├── database.ts                # Prisma Client Singleton
│   │   ├── env.ts                     # Zod environment variables validation
│   │   ├── redis.ts                   # ioredis client (TLS support cho Upstash Cloud)
│   │   └── socket.ts                  # Socket.io Server Instance Singleton
│   ├── modules/
│   │   ├── auth/                      # Login (JWT), Register (Admin only), Role Middleware
│   │   ├── product/                   # CRUD sản phẩm gốc & Shopee Mapping
│   │   ├── customer/                  # CRUD khách hàng, Auto-register từ FB PSID
│   │   ├── chat/                      # Lấy cuộc hội thoại, tin nhắn, Gửi tin Facebook Messenger
│   │   ├── order/                     # Tạo đơn, tính ship GHN, PayOS QR, Workflow thanh toán
│   │   └── analytics/                 # ⭐ Analytics Engine BI (8 Bảng thống kê kinh doanh)
│   ├── integrations/
│   │   ├── facebook/                  # Meta Graph API client, webhook, send text/image
│   │   ├── payos/                     # PayOS SDK init, createPaymentLink, webhook signature verify
│   │   ├── ghn/                       # GHN Axios client, calculateFee, createOrder
│   │   └── shopee/                    # Shopee client, HMAC signature, updateStock, webhook
│   ├── workers/
│   │   ├── facebook-message.worker.ts # BullMQ worker xử lý tin nhắn ngầm
│   │   └── index.ts                   # Bootstrapping background queue workers
│   ├── routes/
│   │   └── index.ts                   # Route aggregator tổng
│   └── shared/
│       ├── middlewares/               # auth, role, error, validate middleware
│       ├── types/                     # TypeScript type declarations & Express Request augmentation
│       └── utils/                     # api-error, api-response, date.utils, logger (Winston), queue
├── .env                               # Biến môi trường kết nối Supabase & Upstash
├── PROJECT_CONTEXT.md                 # [FILE NÀY] Tài liệu mô tả toàn bộ dự án cho AI
└── SYSTEM_ARCH.md                     # Bản đồ theo dõi tiến độ kiến trúc
```

---

## 5. DANH SÁCH API ENDPOINTS (API REFERENCE)

Tất cả API Endpoints đều chạy dưới tiền tố `/api`.

### A. Auth & Users (`/api/auth`)
- `POST /api/auth/login`: Public login (Trả về JWT token & User info).
- `POST /api/auth/register`: Admin-only (Tạo tài khoản STAFF hoặc ADMIN mới).
- `GET /api/auth/profile`: Authenticated user profile.

### B. Products (`/api/products`)
- `GET /api/products`: Lấy danh sách sản phẩm (hỗ trợ search, pagination).
- `GET /api/products/:id`: Chi tiết sản phẩm.
- `POST /api/products`: Admin-only (Tạo sản phẩm + Shopee mapping).
- `PUT /api/products/:id`: Admin-only (Cập nhật sản phẩm & mapping).
- `DELETE /api/products/:id`: Admin-only (Xóa sản phẩm, cascade mapping).

### C. Customers (`/api/customers`)
- `GET /api/customers`: Danh sách khách hàng.
- `GET /api/customers/:id`: Chi tiết khách hàng.
- `POST /api/customers`: Tạo khách hàng mới.
- `PUT /api/customers/:id`: Cập nhật khách hàng.

### D. Chat (`/api/chat`)
- `GET /api/chat/conversations`: Danh sách cuộc hội thoại.
- `GET /api/chat/conversations/:id/messages`: Lịch sử tin nhắn.
- `POST /api/chat/messages`: Gửi tin nhắn từ Shop đến Facebook khách hàng.

### E. Orders (`/api/orders`)
- `GET /api/orders`: Danh sách đơn hàng (Filter status).
- `GET /api/orders/:id`: Chi tiết đơn hàng.
- `POST /api/orders`: Tạo đơn mới ➡️ Tính ship GHN ➡️ Tạo link PayOS VietQR ➡️ Nhắn Facebook.

### F. Analytics Engine BI (`/api/analytics`) — *Chỉ ADMIN truy cập (403 với Staff)*
- `GET /api/analytics/kpi-overview?period=30d`: Doanh thu thuần, Lợi nhuận thuần, Đơn hàng, Khách mới (+% so sánh kỳ trước).
- `GET /api/analytics/revenue-trend?period=30d`: Line chart doanh thu theo ngày (tách nguồn FB vs Shopee).
- `GET /api/analytics/channel-performance?period=30d`: So sánh hiệu suất kênh FB vs Shopee + **Tự động sinh nhận xét chiến lược (Auto Insight)**.
- `GET /api/analytics/profit-breakdown?period=30d`: Phân tích dòng tiền (Doanh thu - Ship GHN - Phí sàn Shopee 6.5% - COGS = Net Profit).
- `GET /api/analytics/top-products?period=30d&limit=5&sortBy=quantity|revenue|profit`: Top sản phẩm bán chạy.
- `GET /api/analytics/inventory-alerts`: Cảnh báo tồn kho 3 mức (Critical <=5, Low <=20, Overstock) & Kiểm tra đồng bộ Shopee.
- `GET /api/analytics/inventory-forecast?productId=xxx&forecastDays=30`: **Giải thuật Weighted Moving Average (WMA)** dự báo tồn kho 30 ngày + Tìm điểm đặt hàng (**Reorder Point**).
- `GET /api/analytics/chat-conversion?period=30d`: Phễu chuyển đổi Chat ➡️ Đơn hàng & Thời gian phản hồi nhân viên.

### G. Webhooks (Public Endpoints)
- `GET/POST /webhooks/facebook`: Facebook Messenger Verification & Incoming Message Queue.
- `POST /webhooks/payos`: PayOS Payment Callback.
- `POST /webhooks/shopee`: Shopee Order Status Toggle & Stock Deduction.

---

## 6. THÔNG TIN ĐĂNG NHẬP & TEST SẴN CÓ (SEED DATA)

Dữ liệu đã được nạp sẵn trên **Supabase Cloud**:

- **Admin Account (Full access + Analytics)**:
  - Email: `skillsanh@gmail.com`
  - Password: `admin123`
- **Staff Account (Sale / Staff access)**:
  - Email: `sinfour503@gmail.com`
  - Password: `staff123`

---

## 7. HIỆN TRẠNG & KẾ HOẠCH DỰ ÁN (PROJECT STATUS)

- **Backend**: **ĐÃ HOÀN THÀNH 100%** (Đã test compile thành công bằng `npx tsc --noEmit`, không có bất kỳ lỗi type nào).
- **Cơ sở dữ liệu & Cloud**: Đã kết nối Supabase PostgreSQL và Upstash Redis.
- **Frontend**: **CHƯA BẮT ĐẦU**.

### Nhiệm vụ tiếp theo khi bàn giao cho AI khác:
> Xây dựng dự án **Frontend ReactJS (Vite) + Tailwind CSS + Shadcn UI + Redux Toolkit** tại thư mục dự án để kết nối với các API Backend trên.
