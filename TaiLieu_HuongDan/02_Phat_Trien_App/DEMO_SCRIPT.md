# 🎬 KỊCH BẢN QUAY DEMO & BÁO CÁO ĐỒ ÁN
## Đề tài: Omnichannel Social Commerce Hub
**Đơn vị ứng dụng**: Công ty TNHH Giải pháp số Bình Dương  
**Thời lượng video đề xuất**: 5 - 6 phút  

---

## 📋 I. CÔNG TÁC CHUẨN BỊ TRƯỚC KHI QUAY / TRÌNH BÀY

1. **Khởi chạy ứng dụng**:
   - Backend Express API Server: `http://localhost:3000`
   - Frontend Vite React App: `http://localhost:5173`
2. **Thông tin đăng nhập mặc định**:
   - **Tài khoản Admin (Full quyền + Xem Lợi Nhuận BI)**:  
     - Email: `skillsanh@gmail.com`  
     - Mật khẩu: `admin123`
   - **Tài khoản Staff (Nhân viên vận hành)**:  
     - Email: `sinfour503@gmail.com`  
     - Mật khẩu: `staff123`
3. **Mở sẵn 2 tab trình duyệt**:
   - Tab 1: Trang ứng dụng `http://localhost:5173`
   - Tab 2: (Tùy chọn) Trang Swagger API `http://localhost:3000/api-docs`

---

## 🎬 II. KỊCH BẢN CHI TIẾT THEO THỜI GIAN

---

### ⏱ PHẦN 1: TỔNG QUAN & ĐĂNG NHẬP (00:00 - 00:40)

- **Thao tác màn hình**:
  1. Mở trang Đăng Nhập (`/login`).
  2. Điền email `skillsanh@gmail.com` và password `admin123`.
  3. Bấm **Đăng Nhập** ➔ Tiến vào trang **Dashboard**.
- **Lời thoại mẫu**:
  > *"Xin chào thầy cô và các bạn. Sau đây em xin trình bày demo hệ thống Quản lý Bán hàng Đa kênh Omnichannel Social Commerce Hub cho Công ty TNHH Giải pháp số Bình Dương. Hệ thống được xây dựng trên kiến trúc Modular Monolith Node.js TypeScript, kết nối PostgreSQL Supabase Cloud và Redis. Sau khi đăng nhập tài khoản Admin, chúng ta tiến vào Trung tâm Vận hành Bán hàng."*
- **Ghi chú điểm cộng**:
  - Show tính năng phím tắt `Ctrl + K` (Command Palette) và Badge hệ thống Realtime Online.

---

### ⏱ PHẦN 2: QUẢN LÝ KHO SẢN PHẨM & ĐỒNG BỘ SHOPEE OPEN API (00:40 - 01:25)

- **Thao tác màn hình**:
  1. Chuyển sang menu **Quản Lý Sản Phẩm** (`/products`).
  2. Xem danh sách sản phẩm tồn kho gốc (*Áo Khoác Gió*, *Áo T-Shirt Cotton*, *Quần Jeans Slimfit*).
  3. Bấm nút **Thêm Sản Phẩm Mới** ➔ Minh họa nhập SKU, Tồn kho, Giá bán và Mã Shopee Item ID.
  4. Trỏ chuột vào Badge **`🟢 Shopee Synced`** hiển thị giá cấu hình bán trên sàn Shopee.
- **Lời thoại mẫu**:
  > *"Tại phân hệ Sản phẩm, hệ thống quản lý danh mục tồn kho gốc nội bộ. Mỗi sản phẩm được ánh xạ trực tiếp với Shopee Item ID trên Shopee Open Platform v2, cho phép thiết lập giá bán riêng trên sàn và tự động hóa việc đồng bộ tồn kho."*

---

### ⏱ PHẦN 3: KHUNG CHAT MESSENGER & TẠO ĐƠN NHANH 1-CLICK (01:25 - 02:30) ⭐ [ĐIỂM NHẤN]

- **Thao tác màn hình**:
  1. Chuyển sang menu **Hội Thoại Messenger** (`/chat`).
  2. Chọn cuộc trò chuyện của khách hàng **Nguyễn Văn A**.
  3. Bấm nút **`⚡ Tạo Đơn Nhanh`** (Quick Order Drawer) phía bên phải.
  4. Chọn sản phẩm *Áo T-Shirt Cotton Unisex*.
  5. Chọn địa chỉ Tỉnh/Thành ➔ Tự động tính phí ship qua **GHN Express API**.
  6. Bấm **`Tạo Đơn & Gửi Link QR`**.
- **Lời thoại mẫu**:
  > *"Trong quá trình tư vấn trực tiếp trên Facebook Messenger, nhân viên có thể lên đơn ngay lập tức với tiện ích ⚡ Tạo Đơn Nhanh. Hệ thống tự động gọi API Giao Hàng Nhanh tính phí ship chính xác theo địa chỉ khách hàng, lưu đơn PENDING_PAYMENT và tự động gửi mã VietQR PayOS kèm link thanh toán vào khung chat cho khách."*

---

### ⏱ PHẦN 4: LUỒNG TỰ ĐỘNG CHÉO (CROSS-CHANNEL WORKFLOW) & PAYOS - GHN (02:30 - 03:45) ⭐ [CỐT LÕI ĐỀ TÀI]

- **Thao tác màn hình**:
  1. Chuyển sang menu **Quản Lý Đơn Hàng** (`/orders`).
  2. Mở đơn hàng mới tạo ở trạng thái **`Chờ Quét QR`**. Bấm xem Vết vận hành (Activity Timeline).
  3. Bấm icon **Mã QR** ➔ Mở Modal PayOS VietQR.
  4. Bấm nút màu xanh: **`⚡ Mô Phỏng Thanh Toán Quét QR (Sandbox)`**.
  5. Đơn hàng tự động đổi sang **`Đã Thanh Toán`** ➔ **`Đã Đẩy Vận Đơn GHN`** (`SHIPPED`) kèm mã vận đơn `GHN_SHP_xxx`.
  6. Bấm icon **In Nhãn GHN** ➔ Xem tem vận đơn Giao Hàng Nhanh.
- **Lời thoại mẫu**:
  > *"Đây là luồng tự động hóa chéo khép kín của hệ thống: Khi khách quét mã QR thanh toán thành công, PayOS gửi Webhook xác thực chữ ký HMAC SHA-256 về ứng dụng. Hệ thống tự động thực hiện liên hoàn:
  > 1. Đổi trạng thái đơn thành Đã Thanh Toán (PAID).
  > 2. Trừ tồn kho sản phẩm gốc.
  > 3. Gọi API Shopee đồng bộ khấu trừ tồn kho trên sàn.
  > 4. Gọi GHN API tự động tạo vận đơn giao hàng.
  > 5. Gửi tin nhắn thông báo mã vận đơn GHN cho khách qua Facebook Messenger.
  > 6. Bắn tín hiệu Socket.io đổi màu đơn hàng realtime trên Dashboard."*

---

### ⏱ PHẦN 5: QUẢN LÝ KHÁCH HÀNG CRM & ĐỊNH DANH MESSENGER PSID (03:45 - 04:15)

- **Thao tác màn hình**:
  1. Chuyển sang menu **Quản Lý Khách Hàng (CRM)** (`/customers`).
  2. Xem danh sách khách hàng tự động định danh (`Nguyễn Văn A`, `Trần Thị B`).
  3. Bấm nút **Lịch Sử** ➔ Xem các đơn hàng đã đặt của khách.
- **Lời thoại mẫu**:
  > *"Phân hệ CRM tự động định danh người dùng qua Facebook Page Scoped ID (PSID), giúp lưu vết lịch sử giao dịch đa kênh, tính tổng giá trị mua sắm LTV và phân hạng khách hàng VIP."*

---

### ⏱ PHẦN 6: TRÍ TUỆ KINH DOANH ANALYTICS BI & DỰ BÁO WMA 30 NGÀY (04:15 - 05:20) ⭐ [ĐÁNH GIÁ CAO]

- **Thao tác màn hình**:
  1. Chuyển sang menu **Báo Cáo BI & Dự Báo Kho** (`/analytics`).
  2. Xem 4 thẻ KPI (Doanh thu, Lợi nhuận ròng, Đơn hàng, Khách mới).
  3. Xem Biểu đồ xu hướng doanh thu Recharts (Facebook vs Shopee).
  4. Xem Biểu đồ dòng tiền: *Doanh thu − Ship GHN − Phí sàn Shopee (6.5%) − COGS = Lợi nhuận ròng*.
  5. Đọc phần **Tự Động Sinh Nhận Xét Chiến Lược (Auto Insight)**.
  6. Trình bày Widget **Dự Báo Tồn Kho WMA 30 Ngày** & Điểm đặt hàng Reorder Point.
  7. Xem Phễu chuyển đổi Chat Messenger và Thời gian phản hồi nhân viên.
- **Lời thoại mẫu**:
  > *"Phân hệ Analytics BI cung cấp trung tâm trí tuệ kinh doanh cho Admin. Dữ liệu được tính toán thời gian thực từ Database:
  > - Phân tích chi tiết biên lợi nhuận ròng sau khi trừ chi phí vận chuyển GHN và 6.5% phí sàn Shopee.
  > - Áp dụng thuật toán Weighted Moving Average (WMA 30 ngày) dự báo ngày hết hàng và tự động tính Điểm Đặt Hàng Reorder Point.
  > - Phân tích phễu chuyển đổi từ Chat Messenger sang Đơn hàng và đo lường thời gian phản hồi của nhân viên."*

---

### ⏱ PHẦN 7: LỜI KẾT (05:20 - 05:30)

- **Thao tác màn hình**: Quay lại màn hình Dashboard chính.
- **Lời thoại mẫu**:
  > *"Hệ thống cũng đã hoàn thiện đầy đủ tài liệu API tại `/api-docs` và sẵn sàng đóng gói Docker để triển khai lên máy chủ. Em xin chân thành cảm ơn thầy cô và các bạn đã theo dõi. Em xin nhận các câu hỏi góp ý từ hội đồng ạ!"*

---

## 🎯 CÁC MẸO QUAY VIDEO MƯỢT MÀ

1. **Chuẩn bị dữ liệu**: Đảm bảo Backend và Frontend đang chạy sẵn, không bị lag khi chuyển trang.
2. **Âm thanh**: Sử dụng micrô rõ tiếng, nói rành rọt các thuật ngữ (*Prisma ORM, VietQR PayOS, GHN Express, Shopee Open API, Webhook HMAC, WMA Algorithm*).
3. **Tập trung vào tính năng thực tế**: Thầy cô rất thích xem phần quét QR PayOS ➔ tự động tạo vận đơn GHN ➔ tự động trừ kho Shopee. Hãy dừng màn hình 2-3 giây ở đoạn này để người xem thấy rõ sự thay đổi trạng thái!
