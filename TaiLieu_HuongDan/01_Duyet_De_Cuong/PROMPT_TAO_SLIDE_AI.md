# 🚀 PROMPT DÙNG ĐỂ YÊU CẦU AI TẠO SLIDE THUYẾT TRÌNH (BÁO CÁO DUYỆT ĐỀ CƯƠNG CHI TIẾT)

*(Bạn chỉ cần sao chép toàn bộ nội dung trong ô bên dưới và dán vào AI như **ChatGPT / Gamma.app / Claude / Canva AI / SlidesAI** để AI tạo Slide cho bạn).*

```text
Hãy thiết kế cho tôi một bộ Slide thuyết trình PowerPoint hoàn chỉnh (gồm đúng 7 Slide) cho buổi "Báo cáo duyệt đề cương chi tiết Khóa luận tốt nghiệp" của Viện Công nghệ số - Trường Đại học Thủ Dầu Một.

[YÊU CẦU NGHỀ THUẬT & NGUYÊN TẮC BÁO CÁO KHOA HỌC (IMPORTANT RULES)]
- CẤM TUYỆT ĐỐI các câu khẩu hiệu chung chung, sáo rỗng như: "công nghệ hiện đại", "hiệu năng cao", "tích hợp liền mạch", "tối ưu vượt trội". Báo cáo hội đồng chỉ dùng THUẬT NGỮ KỸ THUẬT VÀ DẪN CHỨC CỤ THỂ.
- Tỉ lệ khung hình: 16:9 Widescreen.
- Phong cách giao diện: Modern Tech UI, thiết kế dạng thẻ (Card UI) sạch sẽ, hiện đại, dễ quan sát.
- KHÔNG chèn hình ảnh minh họa hoa mỹ (ảnh gõ laptop, ảnh văn phòng công sở). Dành 100% không gian hiển thị thông tin kỹ thuật.
- Phối màu chủ đạo (Palette):
  + Background: Light Slate (#F8FAFC) hoặc Dark Navy (#0F172A) cho slide tiêu đề và slide kết.
  + Thẻ thông tin (Cards): Trắng (#FFFFFF) với viền Slate mỏng (#E2E8F0) hoặc Navy mờ.
  + Màu chữ nội dung: Đen Slate (#1E293B), Font size 14pt-16pt rõ ràng, tuyệt đối KHÔNG đè chữ.

---

[NỘI DUNG CHI TIẾT CỦA 7 SLIDES - GIỮ NGUYÊN NỘI DUNG DẪN CHỨC KỸ THUẬT]

SLIDE 1: TRANG TIÊU ĐỀ (TITLE SLIDE)
- Tiêu đề chính: BÁO CÁO DUYỆT ĐỀ CƯƠNG CHI TIẾT
- Tên đề tài: XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH
- Thông tin trình bày:
  + Sinh viên thực hiện: Huỳnh Văn Sang — MSSV: 2224802010365
  + Lớp / Khóa: D22CNTT05 — Khóa 2022 - 2027
  + Giảng viên hướng dẫn: ThS. Nguyễn Trung Vũ

SLIDE 2: MỤC TIÊU VÀ PHẠM VI NGHIÊN CỨU
- Card 1 (Bên trái): 📌 THỰC TRẠNG & TÍNH CẤP THIẾT
  • Quản lý phân tán: Bán hàng trên Facebook & Shopee phải dùng nhiều ứng dụng độc lập, dễ sót tin nhắn của khách.
  • Sai lệch tồn kho: Tồn kho không tự động giảm trên Shopee khi bán xong trên Facebook ➔ Dẫn đến bị hủy đơn & phạt sàn.
  • Thao tác thủ công: Tạo đơn, tính phí ship GHN và phát sinh mã chuyển khoản VietQR tốn thời gian.
  • Sai lệch tài chính: Không tính chính xác Lợi nhuận ròng sau khi trừ phí sàn Shopee (6.5%) và phí vận chuyển.
- Card 2 (Bên phải): 🎯 MỤC TIÊU & PHẠM VI HỆ THỐNG
  • Hợp nhất kênh bán: Tích hợp Messenger Chat & Shopee về một Dashboard quản trị duy nhất.
  • Tự động hóa luồng chốt đơn: Sinh mã VietQR PayOS, giải mã HMAC signature Webhook, tự động đẩy vận đơn GHN & gửi mã vận đơn cho khách.
  • Đồng bộ kho 2 chiều: Tự động trừ kho PostgreSQL và gọi API Shopee Sandbox (v2.product.update_stock) khi đơn hoàn tất thanh toán.
  • Analytics BI & Dự báo WMA: Báo cáo KPI lợi nhuận ròng và dự báo tồn kho bằng thuật toán WMA (Weighted Moving Average).
  • Phạm vi ứng dụng: Tích hợp Meta Graph API, PayOS SDK, GHN Open API, Shopee Open Platform API v2.

SLIDE 3: CÔNG NGHỆ DỰ KIẾN SỬ DỤNG TRONG HỆ THỐNG (TRỌNG TÂM 1)
(Bố cục 4 Card lưới 2x2, KHÔNG dùng phụ đề sáo rỗng):
- Card 1: 💻 FRONTEND FRAMEWORK
  • Core Framework: ReactJS (Vite Build) + TypeScript (Strict Type)
  • Design System: Tailwind CSS + Shadcn UI
  • State & Charts: Redux Toolkit, Recharts (BI Analytics)
- Card 2: ⚙️ BACKEND & DATABASE
  • Architecture & Server: Node.js + Express.js (Modular Monolith)
  • Database & ORM: PostgreSQL (Supabase Cloud) + Prisma ORM v5
  • Queue & Cache: Redis (Upstash Cloud) + BullMQ xử lý hàng đợi ngầm
- Card 3: ⚡ REAL-TIME & TÍCH HỢP THIRD-PARTY
  • Real-time Protocol: Socket.io (Messenger chat & thông báo đơn)
  • Facebook OAuth & Webhook: Meta Graph API (Facebook Login & Messenger Webhook)
  • Thanh toán & Vận chuyển: PayOS SDK (VietQR + HMAC verification), GHN Open API (Tạo vận đơn)
- Card 4: 🛒 SÀN TMĐT & CHUẨN HOÁ API
  • Shopee Open Platform: Shopee API v2 (v2.product.update_stock đồng bộ kho)
  • API Specification: OpenAPI 3.0 / Swagger UI (/api-docs)
  • Authentication: JWT (JSON Web Token) + Bcrypt password hashing

SLIDE 4: GIẢI PHÁP ĐỀ XUẤT: KIẾN TRÚC HỆ THỐNG & ĐỒNG BỘ DỮ LIỆU (TRỌNG TÂM 2)
(Bố cục 3 Cột Card đứng):
- Card 1: 🏛️ KIẾN TRÚC SYSTEM
  • Modular Monolith: Phân chia module nghiệp vụ độc lập (Auth, Product, Order, Chat, Analytics) giúp mã nguồn sạch và dễ nâng cấp.
  • RESTful & WebSocket: REST API cho quản trị dữ liệu và Socket.io cho giao tiếp thời gian thực.
  • Swagger UI Docs: Chuẩn hóa toàn bộ API endpoint tại /api-docs.
- Card 2: ⚡ XỬ LÝ BẤT ĐỒNG BỘ & CACHE
  • Redis & BullMQ: Xử lý hàng đợi ngầm cho sự kiện Webhook Facebook Messenger & PayOS.
  • Tránh nghẽn Event Loop: Phản hồi instant cho client, không bị Timeout khi gọi API bên thứ ba.
  • Storage: PostgreSQL trên Supabase Cloud an toàn.
- Card 3: 🔄 CƠ CHẾ ĐỒNG BỘ KHO 2 CHIỀU
  • Shopee SKU Mapping: Liên kết SKU nội bộ với Shopee Item ID trong CSDL.
  • Tự động trừ kho: Khi đơn sang PAID ➔ Trừ kho PostgreSQL nội bộ ngay lập tức.
  • Shopee API Sync: Gọi API v2.product.update_stock cập nhật tồn kho Shopee tự động.

SLIDE 5: LUỒNG XỬ LÝ TỰ ĐỘNG LÊN ĐƠN - THANH TOÁN - VẬN CHUYỂN (TRỌNG TÂM 2 TIẾP)
- Header Banner Top: ⚡ QUY TRÌNH CHỐT ĐƠN LIÊN HOÀN 6 BƯỚC TỰ ĐỘNG TRONG < 1 GIÂY
- Lưới 6 Bước (2 Hàng x 3 Card):
  • Bước 1: Chat Messenger & Quick Order: Khách chat Messenger. Nhân viên dùng Quick Order Drawer tạo đơn ngay trong khung chat.
  • Bước 2: Gọi API GHN tính cước: Tự động gửi quận/huyện sang GHN API lấy cước phí giao hàng chính xác.
  • Bước 3: Phát sinh VietQR PayOS: PayOS SDK sinh mã QR động + Link thanh toán, gửi ảnh QR vào chat cho khách.
  • Bước 4: Xác thực Webhook HMAC: Khách quét QR chuyển tiền ➔ PayOS gửi Webhook ➔ Giải mã HMAC signature ➔ Chuyển đơn sang PAID.
  • Bước 5: Trừ kho & Đồng bộ Shopee: Trừ kho PostgreSQL nội bộ và gọi API Shopee Sandbox v2.product.update_stock.
  • Bước 6: Đẩy đơn GHN & Gửi mã ship: Tự động đẩy đơn lấy mã vận đơn GHN ➔ Gửi ngay tin nhắn mã vận đơn cho khách qua Messenger.

SLIDE 6: SẢN PHẨM DỰ KIẾN THỰC HIỆN & PHÂN HỆ CHỨC NĂNG (TRỌNG TÂM 3)
(Bố cục 3 Cột Card đứng):
- Card 1: 🖥️ PHÂN HỆ QUẢN TRỊ & CHÁT
  • Chat tập trung: Tích hợp Facebook Messenger, hiển thị thông tin PSID khách hàng, lịch sử đơn và bảng tạo đơn nhanh.
  • Quản lý sản phẩm & Kho: Quản lý SKU, giá bán, trọng lượng và Shopee Product Mapping.
  • Quản lý đơn hàng & Vận đơn: Trạng thái đơn (PENDING, PAID, SHIPPING, CANCELLED) và mã vận đơn GHN.
- Card 2: 📊 ANALYTICS BI & DỰ BÁO WMA
  • Báo cáo Lợi Nhuận Ròng: Công thức: Doanh thu - Phí ship GHN - Phí sàn Shopee (6.5%) - Giá vốn = Lợi nhuận ròng.
  • Thuật toán Dự báo WMA: Weighted Moving Average tính toán lượng hàng cần nhập 30 ngày tới.
  • Cảnh báo kho 3 mức: 🔴 Sắp hết hàng (≤5 sp) | 🟡 Tồn kho ít | 🟣 Tồn quá lâu.
- Card 3: 📦 HỒ SƠ & TÀI LIỆU KỸ THUẬT
  • WebApp hoàn chỉnh: Giao diện ReactJS (Shadcn UI) hoạt động mượt trên PC & Mobile.
  • Tài liệu API Swagger UI: Chuẩn OpenAPI 3.0 tại endpoint /api-docs.
  • Đóng gói Docker Container: Cấu hình Dockerfile & docker-compose.yml sẵn sàng triển khai.

SLIDE 7: KẾ HOẠCH TRIỂN KHAI VÀ HƯỚNG PHÁT TRIỂN
- Card 1 (Bên trái): 📅 KẾ HOẠCH TRIỂN KHAI THEO GIAI ĐOẠN
  • Giai đoạn 1: Khảo sát chi tiết nghiệp vụ, thiết kế CSDL PostgreSQL, xây dựng Backend Auth JWT, phân quyền và kết nối Facebook OAuth / Webhook Messenger.
  • Giai đoạn 2: Phát triển UI Chat tập trung (ReactJS + Socket.io), tích hợp PayOS VietQR, GHN API & Shopee API v2 đồng bộ kho.
  • Giai đoạn 3: Hoàn thiện Analytics BI (WMA), Swagger UI, Dockerize, kiểm thử hệ thống và viết báo cáo thuyết minh khóa luận.
- Card 2 (Bên phải): 🎯 DỰ KIẾN KẾT QUẢ & LỜI CẢM ƠN
  • Nỗ lực thực hiện đúng tiến độ, đảm bảo đầy đủ các tính năng đề ra trong đề cương.
  • Đảm bảo tính thực tiễn cao cho mô hình quản lý bán hàng đa kênh.
  • Kính mong nhận được ý kiến đóng góp quý báu từ Quý Thầy Cô trong Hội đồng.
  • EM XIN TRÂN TRỌNG CẢM ƠN QUÝ THẦY CÔ!
```
