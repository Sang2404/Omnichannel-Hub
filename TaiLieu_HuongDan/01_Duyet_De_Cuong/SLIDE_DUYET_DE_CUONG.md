# 📊 NỘI DUNG SLIDE VÀ KỊCH BẢN THUYẾT TRÌNH DUYỆT ĐỀ CƯƠNG CHI TIẾT
## ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH
- **Sinh viên thực hiện**: Huỳnh Văn Sang — MSSV: 2224802010365 — Lớp: D22CNTT05
- **Giảng viên hướng dẫn**: ThS. Nguyễn Trung Vũ
- **Đơn vị**: Viện Công nghệ số — Trường Đại học Thủ Dầu Một
- **Thời lượng báo cáo quy định**: Tối đa **07 phút** (Đúng quy định của Viện)
- **Tệp Slide PowerPoint (.pptx) đã cập nhật**: 
  - `e:\School\TotNghiep\TaiLieu_BaoCao\5_HuynhVanSang_Slide_DuyetDeCuong.pptx`

---

## 📑 PHẦN 1: CHI TIẾT NỘI DUNG 7 SLIDES PRESENTATION

### 🖼 SLIDE 1: TRANG TIÊU ĐỀ (Title Slide)
- **Đơn vị**: TRƯỜNG ĐẠI HỌC THỦ DẦU MỘT — VIỆN CÔNG NGHỆ SỐ
- **Loại báo cáo**: BÁO CÁO DUYỆT ĐỀ CƯƠNG CHI TIẾT BÁO CÁO TỐT NGHIỆP
- **Tên đề tài**: **XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH**
- **Thông tin chi tiết**:
  - Sinh viên thực hiện: **Huỳnh Văn Sang** — MSSV: **2224802010365**
  - Lớp / Khóa: **D22CNTT05** — Khóa 2022 - 2027
  - Giảng viên hướng dẫn: **ThS. Nguyễn Trung Vũ**

---

### 🖼 SLIDE 2: MỤC TIÊU & PHẠM VI NGHIÊN CỨU
- **📌 Thực trạng & Tính cấp thiết**:
  - Doanh nghiệp SMB tại Việt Nam chủ yếu bán hàng trên Facebook & Shopee.
  - Quản lý phân tán, nhân viên phải nhảy nhiều ứng dụng ➔ Dễ sót tin nhắn, chậm chốt đơn.
  - Sai lệch tồn kho ➔ Bán hết trên Facebook nhưng không cập nhật Shopee ➔ Bị hủy đơn & phạt sàn.
  - Tạo đơn, tính phí ship GHN và gửi mã VietQR thủ công tốn thời gian.
- **🎯 Mục tiêu tổng quát & Cụ thể**:
  - Hợp nhất Chat Messenger và gian hàng Shopee về 1 hệ thống duy nhất.
  - Tự động hóa 100% luồng: Lên đơn ➔ Tạo mã VietQR PayOS ➔ Xác thực Webhook HMAC ➔ Trừ kho & Đẩy vận đơn GHN ➔ Gửi mã vận đơn cho khách.
  - Đồng bộ tồn kho thời gian thực với API Shopee (`v2.product.update_stock`).
  - Phân tích kinh doanh Analytics BI & Dự báo tồn kho với thuật toán **WMA (Weighted Moving Average)**.
- **🌐 Phạm vi**: Nền tảng WebApp, kiến trúc API Adapter & mô phỏng Webhook (Meta Graph API, PayOS VietQR, GHN Sandbox & Shopee Open API v2 Sandbox).

---

### 🖼 SLIDE 3: TRỌNG TÂM 1 — CÔNG NGHỆ DỰ KIẾN SỬ DỤNG
- **💻 Frontend Framework**:
  - ReactJS (Vite build) + TypeScript (Kiểm soát kiểu chặt chẽ).
  - Tailwind CSS + Shadcn UI (Hệ thống thiết kế giao diện hiện đại).
  - Redux Toolkit (Quản lý state tập trung) & Recharts (Biểu đồ BI).
- **⚙️ Backend & Database**:
  - Node.js + Express.js theo kiến trúc **Modular Monolith**.
  - PostgreSQL (Supabase Cloud) + Prisma ORM v5.
  - Redis (Upstash Cloud) + BullMQ (Xử lý hàng đợi ngầm bất đồng bộ).
- **⚡ Real-time & Third-Party APIs**:
  - Socket.io (Nhắn tin real-time & thông báo tức thì).
  - Meta Graph API (Page Access Token & Webhook Messenger).
  - PayOS SDK (Thanh toán VietQR động + HMAC signature).
  - Giao Hàng Nhanh API Sandbox (Tính phí ship theo địa chỉ + tạo vận đơn).
  - Shopee Open Platform API v2 Sandbox (Đồng bộ tồn kho sản phẩm).
  - Phân quyền người dùng (JWT Authentication & Mã hóa Bcrypt).

---

### 🖼 SLIDE 4: TRỌNG TÂM 2 — GIẢI PHÁP ĐỀ XUẤT: KIẾN TRÚC & ĐỒNG BỘ KHO
- **🏛️ Kiến trúc Modular Monolith**:
  - Phân chia rõ ràng thành các module độc lập: `Auth`, `Product`, `Order`, `Chat`, `Shipping`, `Analytics`.
  - Giúp mã nguồn dễ bảo trì, dễ mở rộng và đạt hiệu năng cao.
- **⚡ Cơ chế xử lý ngầm bất đồng bộ (Redis & BullMQ)**:
  - Tiếp nhận sự kiện Webhook từ Facebook và PayOS đưa vào Redis Queue.
  - Xử lý bất đồng bộ tránh làm nghẽn Event Loop và chống treo hệ thống khi lưu lượng tăng cao.
- **🔄 Cơ chế đồng bộ kho 2 chiều (Shopee SKU Mapping)**:
  - Liên kết SKU nội bộ với Shopee Item ID trong PostgreSQL.
  - Khi đơn hàng hoàn tất thanh toán (PAID) ➔ Trừ kho nội bộ ➔ Tự động kích hoạt API Shopee Sandbox `v2.product.update_stock` để cập nhật tồn kho gian hàng Shopee.

---

### 🖼 SLIDE 5: TRỌNG TÂM 2 — QUY TRÌNH TỰ ĐỘNG CHỐT ĐƠN 6 BƯỚC (< 1 GIÂY)
- **Bước 1: Chat Messenger & Quick Order Drawer**
  - Khách chat qua Messenger. Nhân viên bật khay tạo đơn nhanh 1-Click ngay trong khung chat mà không cần chuyển trang.
- **Bước 2: Tự động gọi API GHN**
  - Hệ thống gửi địa chỉ quận/huyện sang GHN API để tính cước vận chuyển chuẩn xác.
- **Bước 3: Phát sinh VietQR PayOS**
  - Tạo mã QR động VietQR + Link thanh toán ➔ Tự động gửi ảnh QR vào khung chat Messenger cho khách.
- **Bước 4: Xác thực thanh toán tự động (Chữ ký H-MAC)**
  - Khách quét mã chuyển tiền ➔ PayOS gửi thông báo ➔ Hệ thống tự động giải mã chữ ký bảo mật H-MAC xác thực giao dịch ➔ Đơn đổi sang trạng thái **Đã thanh toán**.
- **Bước 5: Trừ kho nội bộ & Gọi API Shopee**
  - Tự động trừ tồn kho CSDL PostgreSQL và đồng bộ giảm kho trên sàn Shopee qua API v2.
- **Bước 6: Tạo vận đơn GHN & Gửi tin nhắn cho khách**
  - Đẩy đơn sang GHN lấy mã vận đơn ➔ Tự động gửi tin nhắn kèm mã vận đơn GHN tới Messenger khách hàng.

---

### 🖼 SLIDE 6: TRỌNG TÂM 3 — SẢN PHẨM DỰ KIẾN THỰC HIỆN
- **🖥️ Phân hệ Web Admin & Staff**:
  - Giao diện Chat tập trung kết nối Facebook Messenger (Socket.io).
  - Quản lý sản phẩm, mapping gian hàng Shopee, quản lý đơn hàng & mã vận đơn.
- **📊 Phân hệ Analytics BI & Dự báo nhu cầu WMA**:
  - Báo cáo Lợi Nhuận Ròng thực tế: `Doanh thu - Cước ship GHN - Phí sàn Shopee (6.5%) - Giá vốn`.
  - Thuật toán **WMA (Weighted Moving Average)**: Dự báo sức bán và nhu cầu nhập hàng trong 30 ngày.
  - Cảnh báo tồn kho 3 cấp độ: 🔴 Sắp hết (≤5 sp) | 🟡 Tồn ít | 🟣 Tồn lâu.
- **📦 Đóng gói & Triển khai**:
  - Đóng gói Docker Container sẵn sàng triển khai (`Dockerfile` & `docker-compose.yml`).
  - Kiểm thử và tối ưu hóa hệ thống WebApp.

---

### 🖼 SLIDE 7: KẾ HOẠCH TRIỂN KHAI VÀ HƯỚNG PHÁT TRIỂN
- **📅 Kế hoạch triển khai theo 3 giai đoạn**:
  - *Giai đoạn 1*: Khảo sát chi tiết nghiệp vụ, thiết kế CSDL PostgreSQL, xây dựng Backend Auth JWT, phân quyền và kết nối Meta Graph API / Webhook Messenger.
  - *Giai đoạn 2*: Phát triển giao diện Chat tập trung (ReactJS + Socket.io), tích hợp PayOS VietQR, API Giao Hàng Nhanh và API Shopee v2 đồng bộ tồn kho.
  - *Giai đoạn 3*: Hoàn thiện Analytics BI (WMA), Swagger UI, Dockerize, kiểm thử hệ thống và hoàn thiện quyển báo cáo thuyết minh khóa luận tốt nghiệp.
- **🎯 Dự kiến kết quả**:
  - Nỗ lực thực hiện đúng tiến độ, đảm bảo đầy đủ các tính năng đã đề ra trong đề cương.
  - Hướng tới một sản phẩm có tính thực tiễn cao, hỗ trợ hiệu quả cho mô hình kinh doanh bán hàng đa kênh.
- **Lời cảm ơn & Kính mong nhận được ý kiến đóng góp từ Hội đồng.**

---

## 🎙️ PHẦN 2: KỊCH BẢN LỜI THOẠI THUYẾT TRÌNH (TỐI ĐA 07 PHÚT)

*(Dành cho sinh viên Huỳnh Văn Sang luyện tập nói trước Hội đồng)*

### ⏱️ Minute 0:00 - 0:45 | SLIDE 1: MỞ ĐẦU & GIỚI THIỆU
> *"Kính chào Chủ tịch Hội đồng, kính chào quý Thầy Cô trong Hội đồng duyệt đề cương tốt nghiệp Viện Công nghệ số.*  
> *Em tên là **Huỳnh Văn Sang**, sinh viên lớp D22CNTT05, MSSV: 2224802010365. Dưới sự hướng dẫn của **ThS. Nguyễn Trung Vũ**, hôm nay em xin phép được báo cáo đề cương chi tiết đề tài: **'Xây dựng hệ thống quản lý bán hàng tích hợp đa kênh OmniHub'**."*

---

### ⏱️ Minute 0:45 - 1:45 | SLIDE 2: MỤC TIÊU & PHẠM VI
> *"Về tính cấp thiết: Hiện nay các cửa hàng vừa và nhỏ bán hàng trên mạng xã hội Facebook và sàn Shopee gặp 3 khó khăn lớn:*  
> *1. Tin nhắn bị phân tán, nhân viên tốn nhiều thời gian chốt đơn thủ công.*  
> *2. Rất dễ lệch tồn kho – khi bán hết trên Facebook nhưng không kịp giảm kho trên Shopee dẫn tới bị phạt sàn do hủy đơn.*  
> *3. Thủ công tính cước ship và sinh mã chuyển khoản.*  
> 
> *Mục tiêu của đề tài là xây dựng một nền tảng Web hợp nhất, tự động hóa 100% luồng chốt đơn từ VietQR PayOS, đẩy vận đơn GHN, đồng bộ tồn kho Shopee theo thời gian thực và tích hợp mô-đun Analytics BI dự báo nhu cầu nhập kho."*

---

### ⏱️ Minute 1:45 - 3:00 | SLIDE 3: TRỌNG TÂM 1 — CÔNG NGHỆ SỬ DỤNG
> *"Về Công nghệ dự kiến sử dụng cho hệ thống:*  
> *- **Frontend**: Em lựa chọn **ReactJS với Vite** kết hợp **TypeScript** để tăng tính chặt chẽ về kiểu dữ liệu. Giao diện được thiết kế hiện đại bằng **Tailwind CSS & Shadcn UI**, kết hợp **Recharts** vẽ biểu đồ BI.*  
> *- **Backend**: Sử dụng **Node.js & Express.js** theo kiến trúc Modular Monolith và API Adapter Pattern.*  
> *- **Cơ sở dữ liệu & Caching**: **PostgreSQL trên Supabase Cloud** quản lý bằng **Prisma ORM v5**. Kết hợp **Redis (Upstash) và BullMQ** để xử lý hàng đợi ngầm bất đồng bộ.*  
> *- **Tích hợp API bên thứ ba**: Tích hợp **Meta Graph API Adapter** cho Facebook Messenger, **PayOS SDK** cho VietQR, **Giao Hàng Nhanh API Sandbox** cho vận đơn, và **Shopee Open Platform API v2 Sandbox** cho đồng bộ kho. Toàn bộ API được chuẩn hóa qua **Swagger UI**."*

---

### ⏱️ Minute 3:00 - 4:15 | SLIDE 4: TRỌNG TÂM 2 — GIẢI PHÁP ĐỀ XUẤT (KIẾN TRÚC & ĐỒNG BỘ KHO)
> *"Về Giải pháp đề xuất:*  
> *1. **Kiến trúc**: Em thiết kế theo chuẩn **Modular Monolith và API Adapter Pattern**, bóc tách các module độc lập như Auth, Product, Order, Chat giúp hệ thống đạt hiệu năng cao, linh hoạt và cực kỳ dễ bảo trì.*  
> *2. **Cơ chế xử lý ngầm**: Để tránh nghẽn thread khi nhận hàng ngàn Webhook tin nhắn từ Facebook và thanh toán từ PayOS, em đưa sự kiện vào hàng đợi **Redis BullMQ** xử lý bất đồng bộ.*  
> *3. **Đồng bộ tồn kho 2 chiều**: Em xây dựng bảng Shopee Product Mapping liên kết SKU nội bộ với Item ID Shopee. Khi đơn hàng được xác nhận thanh toán, hệ thống lập tức trừ kho PostgreSQL và kích hoạt API Shopee Sandbox `v2.product.update_stock` để cập nhật kho sàn ngay lập tức."*

---

### ⏱️ Minute 4:15 - 5:30 | SLIDE 5: TRỌNG TÂM 2 — LUỒNG TỰ ĐỘNG CHỐT ĐƠN 6 BƯỚC
> *"Nổi bật nhất trong giải pháp là **Luồng chốt đơn tự động liên hoàn 6 bước chỉ trong chưa đầy 1 giây**:*  
> *1. Nhân viên chat với khách trên Messenger và bấm tạo đơn nhanh ngay tại khay Quick Order.*  
> *2. Hệ thống gọi API GHN tính cước phí chính xác theo địa chỉ khách.*  
> *3. Phát sinh mã VietQR động từ PayOS và gửi ảnh QR vào khung chat Messenger cho khách.*  
> *4. Khách quét mã chuyển tiền thành công ➔ PayOS gửi thông báo ➔ Backend tự động giải mã chữ ký bảo mật H-MAC xác thực giao dịch ➔ Đơn hàng chuyển sang trạng thái Đã thanh toán ngay lập tức.*  
> *5. Tự động trừ kho PostgreSQL và gọi API Shopee v2 Sandbox đồng bộ kho gian hàng.*  
> *6. Đẩy đơn sang GHN lấy mã vận đơn và tự động gửi tin nhắn mã vận đơn cho khách qua Messenger."*

---

### ⏱️ Minute 5:30 - 6:30 | SLIDE 6: TRỌNG TÂM 3 — SẢN PHẨM DỰ KIẾN THỰC HIỆN
> *"Về Sản phẩm dự kiến thực hiện:*  
> *1. **Web App hoàn chỉnh** gồm trang Chat tập trung thời gian thực (Socket.io mô phỏng Messenger) và trang Quản trị sản phẩm, đơn hàng.*  
> *2. **Mô-đun Analytics BI**: Báo cáo Lợi Nhuận Ròng thực tế bằng công thức: `Doanh thu - Cước ship GHN - Phí sàn Shopee (6.5%) - Giá vốn`. Đồng thời áp dụng **Thuật toán WMA (Weighted Moving Average)** dự báo lượng hàng cần nhập và cảnh báo tồn kho 3 mức.*  
> *3. **Đóng gói Docker Container** và kiểm thử toàn bộ hệ thống sẵn sàng cho việc triển khai."*

---

### ⏱️ Minute 6:30 - 7:00 | SLIDE 7: KẾ HOẠCH & KẾT LUẬN
> *"Kế hoạch triển khai được phân bổ theo 3 giai đoạn rõ ràng để chuẩn bị tốt nhất cho đợt báo cáo khóa luận chính thức. Em sẽ nỗ lực thực hiện đúng tiến độ nhằm đảm bảo tính thực tiễn cao cho sản phẩm.*  
> *Em xin chân thành cảm ơn quý Thầy Cô trong Hội đồng đã chú ý lắng nghe. Em rất mong nhận được những nhận xét và góp ý quý báu từ Hội đồng để đề tài của em được hoàn thiện hơn. Em xin cảm ơn!"*

---

## 💡 PHẦN 3: GỢI Ý CÂU HỎI HỘI ĐỒNG THƯỜNG HỎI & CÁCH TRẢ LỜI

1. **Hội đồng hỏi**: *Tại sao em dùng thuật toán WMA (Weighted Moving Average) mà không dùng SMA hay ARIMA?*
   - **Trả lời**: *"Dạ thưa Thầy/Cô, WMA gán trọng số lớn hơn cho các ngày bán gần nhất (30 ngày gần đây), giúp phản ánh chính xác xu hướng mua sắm ngắn hạn của các shop bán lẻ online hơn là SMA (cùng trọng số) và đơn giản nhẹ nhàng hơn ARIMA (đòi hỏi dữ liệu quá khứ nhiều năm)."*

2. **Hội đồng hỏi**: *Nếu Shopee API bị lỗi hoặc mất mạng thì cơ chế đồng bộ kho xử lý thế nào?*
   - **Trả lời**: *"Dạ thưa Thầy/Cô, hệ thống sử dụng Redis & BullMQ có cơ chế Retry (thử lại tự động 3 lần với khoảng thời gian lùi mũ). Nếu vẫn thất bại, đơn hàng sẽ được đánh dấu cảnh báo để chủ shop có thể sync lại chỉ bằng 1-Click trên giao diện Dashboard."*

3. **Hội đồng hỏi**: *Em kiểm thử tính năng Shopee và Facebook như thế nào trong quá trình làm?*
   - **Trả lời**: *"Dạ thưa Thầy/Cô, em áp dụng Mẫu thiết kế API Adapter (Mock Engine) kết hợp với môi trường Sandbox chính thức của Shopee Open Platform v2, PayOS Sandbox và GHN Dev API. Kiến trúc này cho phép mô phỏng 100% cấu trúc Webhook, giải mã HMAC Signature và quy trình đồng bộ dữ liệu mà vẫn đảm bảo tính độc lập và bảo mật cao."*

