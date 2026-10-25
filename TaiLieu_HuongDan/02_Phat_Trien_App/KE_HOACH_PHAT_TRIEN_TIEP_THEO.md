# 🚀 KẾ HOẠCH VÀ HƯỚNG DẪN TRIỂN KHAI PHÁT TRIỂN TIẾP THEO (MASTER DEVELOPMENT ROADMAP)
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH (OMNICHANNEL SOCIAL COMMERCE HUB)

> **DÀNH CHO DEVELOPER / AI LẬP TRÌNH BÀN GIAO**: Tài liệu này tổng hợp 100% bối cảnh dự án, hiện trạng Backend đã hoàn thành, kiến trúc API Adapter & Mock Engine, cùng hướng dẫn chi tiết các bước xây dựng Frontend ReactJS (Vite + Tailwind CSS + Shadcn UI + Redux Toolkit) để hoàn thiện sản phẩm bảo vệ khóa luận tốt nghiệp.

---

## 📑 PHẦN 1: HIỆN TRẠNG DỰ ÁN & BỐI CẢNH KỸ THUẬT (SYSTEM CONTEXT)

### 1. Backend & Cơ sở dữ liệu (**ĐÃ HOÀN THÀNH 100%**)
* **Core Framework**: Node.js, Express.js, TypeScript (Strict Mode).
* **Database & ORM**: PostgreSQL trên **Supabase Cloud**, Prisma ORM v5 (`DATABASE_URL`).
* **Queue & Cache**: Redis trên **Upstash Cloud**, BullMQ (xử lý hàng đợi ngầm bất đồng bộ).
* **Real-time Engine**: Socket.io (Đẩy tin nhắn chat và thông báo trạng thái đơn real-time).
* **Bảo mật & Chuẩn hóa**: JWT Authentication, Mã hóa mật khẩu Bcrypt, OpenAPI 3.0 / Swagger UI tại `/api-docs`.

### 2. Kiến trúc API Adapter & Chế độ Giả lập (Mock Engine / Sandbox)
Hệ thống tích hợp 4 dịch vụ bên thứ ba theo mẫu thiết kế **API Adapter Pattern**:
* **Meta Graph API (Facebook Messenger Adapter)**: Nhận Webhook `POST /webhooks/facebook` và gửi tin nhắn qua `facebook.service.ts`.
* **Shopee Open Platform API v2 Sandbox**: Đồng bộ số lượng tồn kho tự động qua API `v2.product.update_stock` với chữ ký HMAC SHA256 (`shopee.service.ts`).
* **PayOS VietQR SDK**: Tự động phát sinh mã QR động và link thanh toán chuyển khoản, giải mã Webhook HMAC (`payos.service.ts`).
* **Giao Hàng Nhanh (GHN) API Sandbox**: Tự động tính phí vận chuyển theo địa chỉ (Quận/Huyện) và tạo vận đơn GHN (`ghn.service.ts`).

### 3. Thông tin tài khoản đăng nhập mẫu (Seed Data trên Supabase)
* **Admin (Chủ shop - Full quyền + Xem Analytics BI)**:
  * Email: `skillsanh@gmail.com` | Password: `admin123`
* **Staff (Nhân viên - Chat, chốt đơn, xem kho)**:
  * Email: `sinfour503@gmail.com` | Password: `staff123`

---

## 📑 PHẦN 2: KẾ HOẠCH PHÁT TRIỂN FRONTEND REACTJS (NHIỆM VỤ TIẾP THEO)

Nhiệm vụ tiếp theo là khởi tạo dự án Frontend tại thư mục `e:\School\TotNghiep\frontend` bằng Vite:

```bash
cd e:\School\TotNghiep
npx create-vite@latest frontend --template react-ts
cd frontend
npm install
npm install tailwindcss postcss autoprefixer @reduxjs/toolkit react-redux react-router-dom socket.io-client recharts lucide-react axios
```

### 🎨 CÁC TRANG VÀ GIAO DIỆN CẦN XÂY DỰNG (UI MODULES)

#### 1. Trang Đăng nhập (`/login`)
* Form đăng nhập bằng Email / Mật khẩu.
* Gọi API `POST /api/auth/login`, lưu JWT token vào Redux Store và `localStorage`.
* Tự động điều hướng theo vai trò (ADMIN ➔ Analytics Dashboard, STAFF ➔ Chat tập trung).

#### 2. Phân hệ Chat tập trung & Luồng chốt đơn 6 bước (`/chat`)
* **Màn hình Chat thời gian thực**: Lấy danh sách hội thoại từ `GET /api/chat/conversations` và tin nhắn từ `GET /api/chat/conversations/:id/messages`. Sử dụng Socket.io nhận tin nhắn mới bất đồng bộ.
* **Khay Tạo đơn nhanh (Quick Order Drawer)**:
  * Nút bấm **"Tạo đơn 1-Click"** nằm ngay trong khung chat.
  * Chọn sản phẩm SKU, nhập số lượng, chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã khách hàng.
  * Tự động gọi API `POST /api/orders` ➔ Backend tự gọi GHN API tính cước ship ➔ Gọi PayOS SDK tạo VietQR ➔ Tự động gửi ảnh VietQR trực tiếp vào ô chat.

#### 3. Bảng điều khiển Analytics BI & Dự báo WMA (`/analytics` - Chỉ Admin truy cập)
Xây dựng 8 đồ thị BI thống kê từ API `/api/analytics`:
1. **KPI Cards Overview**: Doanh thu thuần, Lợi nhuận ròng, Tổng đơn hàng, Khách mới (% so với kỳ trước).
2. **Revenue Trend Chart**: Biểu đồ miền/đường doanh thu theo ngày (tách nguồn Facebook vs Shopee).
3. **Channel Performance & Auto Insights**: So sánh tỷ lệ chuyển đổi kênh FB vs Shopee + Thẻ hiển thị nhận xét chiến lược tự động.
4. **Profit Breakdown Chart**: Biểu đồ phân tích dòng tiền (`Doanh thu - Phí ship GHN - Phí sàn Shopee 6.5% - COGS = Lợi nhuận ròng`).
5. **Top Selling Products**: Bảng xếp hạng sản phẩm bán chạy theo số lượng, doanh thu hoặc lợi nhuận.
6. **Inventory Alerts**: Cảnh báo tồn kho 3 mức (🔴 Critical ≤5, 🟡 Low ≤20, 🟣 Overstock).
7. **Inventory Forecast (WMA Algorithm)**: Biểu đồ dự báo lượng hàng bán 30 ngày tới theo thuật toán **Weighted Moving Average** và điểm đặt hàng lại (**Reorder Point**).
8. **Chat Conversion Funnel**: Phễu chuyển đổi từ Chat ➔ Lên đơn và Thời gian phản hồi của nhân viên.

#### 4. Trang Quản lý Sản phẩm & Shopee Mapping (`/products`)
* Bảng danh sách sản phẩm nội bộ (SKU, Tên, Giá bán, Tồn kho gốc).
* Nút bấm cấu hình **Shopee Mapping**: Liên kết SKU nội bộ với Shopee Item ID để đồng bộ kho.
* Form CRUD sản phẩm mới (Admin authority).

#### 5. Trang Quản lý Đơn hàng & Vận đơn GHN (`/orders`)
* Bảng danh sách đơn hàng với Bộ lọc trạng thái (`PENDING_PAYMENT`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`).
* Hiển thị mã vận đơn Giao Hàng Nhanh (`ghnOrderCode`) và mã giao dịch PayOS (`payosPaymentId`).

---

## 📑 PHẦN 3: KIỂM THỬ KỊCH BẢN TỰ ĐỘNG CHỐT ĐƠN 6 BƯỚC (< 1 GIÂY)

Khi bảo vệ khóa luận hoặc kiểm thử hệ thống, quy trình chạy thực tế như sau:

```
[Khách nhắn tin trên Messenger / Web Chat]
       │
       ▼
[Nhân viên bật Quick Order Drawer] ──► Chọn SKU ➔ Nhập địa chỉ ➔ Bấm "Tạo đơn"
       │
       ▼
[Backend xử lý liên hoàn]
  1. Gọi API GHN tính cước ship chính xác
  2. Lưu đơn Order (status = PENDING_PAYMENT)
  3. Gọi PayOS SDK tạo link VietQR + Mã QR động
  4. Gửi ảnh VietQR vào chat Messenger khách hàng qua Socket.io / FB API
       │
       ▼
[Khách chuyển khoản quét mã VietQR]
       │
       ▼
[PayOS gửi Webhook đến POST /webhooks/payos]
       │
       ├─► 解码 HMAC signature ➔ Chuyển Order.status = PAID
       ├─► Trừ kho nội bộ PostgreSQL
       ├─► Gọi API Shopee Sandbox [v2.product.update_stock] đồng bộ tồn kho sàn
       ├─► Gọi API GHN [shipping-order/create] tạo vận đơn
       ├─► Gửi tin nhắn chứa mã vận đơn GHN cho khách
       └─► Bắn tín hiệu Socket.io cập nhật Real-time màu đơn hàng trên Dashboard BI
```

---

## 📑 PHẦN 4: HƯỚNG DẪN BÁO CÁO DUYỆT ĐỀ CƯƠNG VÀ BẢO VỆ TỐT NGHIỆP

1. **Slide thuyết trình (.pptx)**: Sử dụng file đã tạo sẵn tại `e:\School\TotNghiep\TaiLieu_BaoCao\5_HuynhVanSang_Slide_DuyetDeCuong.pptx`.
2. **File Đề cương chuẩn hóa**: Nộp file `e:\School\TotNghiep\TaiLieu_BaoCao\5_HuynhVanSang_Final.docx`.
3. **Kịch bản nói (5-7 phút)**: Sử dụng Kịch bản thuyết trình đã có tại `e:\School\TotNghiep\SLIDE_DUYET_DE_CUONG.md`.
4. **Trả lời Hội đồng về Shopee & Facebook**: Nhấn mạnh việc áp dụng **Kiến trúc API Adapter Pattern** kết hợp với **Shopee Open Platform Sandbox v2** và **Meta Graph API Webhook Adapter**, vừa đảm bảo tính bảo mật vừa mô phỏng 100% luồng nghiệp vụ thực tế của doanh nghiệp.
