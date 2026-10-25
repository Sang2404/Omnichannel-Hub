# ĐỀ CƯƠNG ĐỀ TÀI BÁO CÁO TỐT NGHIỆP

---

**TRƯỜNG ĐẠI HỌC THỦ DẦU MỘT**  
**VIỆN CÔNG NGHỆ SỐ**  

**CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM**  
**Độc lập - Tự do - Hạnh phúc**  

*Bình Dương, ngày 15 tháng 07 năm 2026*

---

## 1. Thông tin sinh viên
- **Họ và tên**: Huỳnh Văn Sang
- **Mã số sinh viên**: 2224802010365
- **Lớp**: D22CNTT05
- **Khóa**: 2022-2027
- **Số điện thoại**: 0379649280
- **Giảng viên hướng dẫn**: ThS. Nguyễn Trung Vũ

---

## 2. Tên đề tài đăng ký
**Xây dựng hệ thống quản lý bán hàng tích hợp đa kênh OmniHub**

---

## 3. Mục tiêu nghiên cứu
Mục tiêu tổng quát của đề tài là xây dựng hệ thống quản lý bán hàng đa kênh tích hợp quy trình chốt đơn tự động, xử lý thanh toán trực tuyến VietQR, quản lý vận chuyển và đồng bộ tồn kho giữa mạng xã hội (Facebook Messenger) và sàn thương mại điện tử (Shopee), kết hợp bảng điều khiển phân tích kinh doanh (Analytics BI) nhằm hỗ trợ doanh nghiệp tối ưu quy trình vận hành và theo dõi doanh số.

Các mục tiêu cụ thể gồm:
- **Xây dựng chức năng phân quyền người dùng (Admin / Staff)** và quản lý tài khoản với JWT và mã hóa mật khẩu bcrypt.
- **Xây dựng bộ điều hợp API (API Adapter Engine) & Webhook** mô phỏng giao tiếp đa kênh (Facebook Messenger & Shopee API Sandbox), cho phép tự động phản hồi tin nhắn khách hàng, phát sinh link thanh toán VietQR và cập nhật mã vận đơn.
- **Tích hợp Webhook tự động hóa luồng chốt đơn qua Facebook Messenger**, phát sinh link thanh toán VietQR qua SDK PayOS và xác thực giao dịch chuyển khoản bằng HMAC signature.
- **Tích hợp API Giao Hàng Nhanh (GHN)** tính phí vận chuyển theo địa chỉ (quận/huyện, phường/xã), tạo đơn vận chuyển và sinh mã vận đơn gửi cho khách hàng qua Messenger.
- **Triển khai cơ chế đồng bộ tồn kho đa kênh theo thời gian thực**: khi đơn hàng hoàn tất thanh toán, hệ thống tự động trừ kho nội bộ (PostgreSQL) và gọi API Shopee Sandbox (`v2.product.update_stock`) để cập nhật số lượng tồn kho trên sàn Shopee.
- **Xây dựng mô-đun Analytics BI & Dự báo**: tính toán chỉ số KPI kinh doanh, doanh thu, lợi nhuận, phân tích tỷ lệ chuyển đổi kênh bán và áp dụng thuật toán trung bình động có trọng số (**WMA - Weighted Moving Average**) để dự báo nhu cầu nhập kho.
- **Xây dựng giao diện Web (ReactJS, Vite, Tailwind CSS, Shadcn UI)** hỗ trợ Socket.io thông báo và nhắn tin thời gian thực, bảng điều khiển thống kê với Recharts.
- **Chuẩn hóa tài liệu API với OpenAPI 3.0 / Swagger UI**.

---

## 4. Nội dung, phạm vi nghiên cứu

### Nội dung:
Xây dựng các chức năng chính:
- **Quản lý xác thực và phân quyền**: Đăng ký, đăng nhập bảo mật bằng JWT, phân quyền truy cập theo vai trò Admin (toàn quyền hệ thống, xem báo cáo Analytics BI) và Staff (quản lý chat, tạo đơn hàng, quản lý kho). Tích hợp bộ điều hợp kết nối đa kênh qua Meta Graph API (Page Access Token & Webhook) hỗ trợ chế độ thử nghiệm Mock/Sandbox.
- **Quản lý sản phẩm và đồng bộ kho đa kênh**: Quản lý danh mục sản phẩm, tồn kho gốc, giá bán, trọng lượng. Tích hợp Shopee Product Mapping để liên kết SKU nội bộ với Shopee Item ID và tự động cập nhật tồn kho khi có giao dịch phát sinh.
- **Quản lý khách hàng và Chat tập trung**: Đồng bộ thông tin khách hàng từ Facebook PSID. Giao diện Chat tập trung hỗ trợ nhắn tin Messenger thời gian thực (Socket.io), xem lịch sử giao dịch và tích hợp bảng tạo đơn hàng nhanh ngay trong khung chat.
- **Thanh toán VietQR (PayOS)**: Tạo mã VietQR động theo giá trị đơn hàng, tích hợp Webhook PayOS giải mã HMAC signature để tự động chuyển trạng thái đơn hàng sang PAID.
- **Quản lý vận chuyển (GHN)**: Tính phí giao hàng theo địa chỉ khách qua GHN API, tự động tạo vận đơn khi đơn hàng được thanh toán, lưu mã vận đơn và gửi tin nhắn thông báo mã vận đơn tới khách qua Messenger.
- **Phân tích kinh doanh (Analytics BI) và Dự báo nhu cầu (WMA)**: Cung cấp Dashboard tổng quan với thẻ KPI, đồ thị xu hướng doanh thu, lợi nhuận, so sánh hiệu quả kênh bán (Facebook vs Shopee), cảnh báo hàng tồn kho và tính toán số lượng dự báo nhập hàng theo thuật toán WMA.
- **Tài liệu API**: Xây dựng tài liệu Swagger UI (`/api-docs`) phục vụ tra cứu và thử nghiệm API của hệ thống.

### Phạm vi nghiên cứu:
- Khảo sát và áp dụng cho quy trình quản lý bán hàng đa kênh tại Việt Nam.
- Hệ thống triển khai trên nền tảng Web, truy cập qua trình duyệt máy tính và thiết bị di động.
- **Phạm vi tích hợp bên thứ ba**: Xây dựng kiến trúc API Adapter và mô phỏng giao tiếp Webhook đa kênh trên môi trường thử nghiệm và phát triển (Developer & Sandbox APIs / Mock Engine): Meta Graph API (Facebook Messenger), PayOS API (VietQR Automation), Giao Hàng Nhanh (GHN Open API Sandbox) và Shopee Open Platform API v2 Sandbox.

---

## 5. Phương pháp nghiên cứu / Công nghệ dự kiến sử dụng

### Phương pháp nghiên cứu:
- Phân tích yêu cầu nghiệp vụ và thiết kế hệ thống theo kiến trúc Modular Monolith và API Adapter Pattern.
- Nghiên cứu cơ chế Webhook, xác thực HMAC Signature, bảo mật JWT, RESTful API và giao tiếp dữ liệu thời gian thực với WebSockets (Socket.io).
- Nghiên cứu thuật toán dự báo trung bình động có trọng số (WMA - Weighted Moving Average) áp dụng trong quản lý hàng tồn kho.

### Công nghệ sử dụng:
- **Frontend**: ReactJS (Vite), TypeScript, Tailwind CSS, Shadcn UI, Redux Toolkit, Recharts.
- **Backend**: Node.js, Express.js, TypeScript.
- **Cơ sở dữ liệu**: PostgreSQL (Supabase Cloud), Prisma ORM v5.
- **Queue & Caching**: Redis (Upstash Cloud), BullMQ xử lý hàng đợi ngầm.
- **Realtime**: Socket.io.
- **Tích hợp API bên thứ ba**: Meta Graph API (Facebook Messenger Webhook Adapter), PayOS SDK (VietQR), Giao Hàng Nhanh API Sandbox (GHN), Shopee Open Platform API v2 Sandbox.
- **Tài liệu API**: Swagger UI (OpenAPI 3.0).

---

## 6. Sản phẩm dự kiến
- Hệ thống quản lý bán hàng đa kênh hoàn chỉnh trên nền tảng Web.
- Trang quản trị dành cho Admin và Nhân viên hỗ trợ quản lý nhắn tin đa kênh thời gian thực (mô phỏng Messenger), quản lý sản phẩm, đồng bộ tồn kho sàn Shopee (Sandbox API), lên đơn hàng và xem báo cáo thống kê kinh doanh.
- Giao diện chăm sóc khách hàng tập trung hỗ trợ nhắn tin thời gian thực và thanh toán VietQR.
