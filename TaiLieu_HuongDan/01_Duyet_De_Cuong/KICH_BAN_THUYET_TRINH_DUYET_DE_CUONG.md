# 🎙️ KỊCH BẢN LỜI THOẠI THUYẾT TRÌNH DUYỆT ĐỀ CƯƠNG CHI TIẾT
## ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH
- **Sinh viên thực hiện**: Huỳnh Văn Sang — MSSV: 2224802010365 — Lớp: D22CNTT05
- **Giảng viên hướng dẫn**: ThS. Nguyễn Trung Vũ
- **Đơn vị**: Viện Công nghệ số — Trường Đại học Thủ Dầu Một
- **Thời lượng báo cáo**: Căn chỉnh chuẩn **05 – 07 phút** (Đúng quy định của Viện)

---

### ⏱️ SLIDE 1: MỞ ĐẦU & GIỚI THIỆU (0:00 – 0:45)
*(Hình ảnh Slide 1: Trang tiêu đề Đề tài & Thông tin Sinh viên, GVHD)*

> **"Kính chào Chủ tịch Hội đồng, kính chào quý Thầy Cô trong Hội đồng duyệt đề cương tốt nghiệp Viện Công nghệ số.**
> 
> Em tên là **Huỳnh Văn Sang**, sinh viên lớp D22CNTT05, MSSV: 2224802010365. Dưới sự hướng dẫn của **ThS. Nguyễn Trung Vũ**, hôm nay em xin phép được báo cáo đề cương chi tiết đề tài khóa luận tốt nghiệp với tên gọi: **'Xây dựng hệ thống quản lý bán hàng tích hợp đa kênh OmniHub'**."

---

### ⏱️ SLIDE 2: MỤC TIÊU VÀ PHẠM VI NGHIÊN CỨU (0:45 – 1:45)
*(Hình ảnh Slide 2: Thực trạng & Tính cấp thiết | Mục tiêu & Phạm vi hệ thống)*

> **"Về tính cấp thiết của đề tài:**  
> Hiện nay các doanh nghiệp vừa và nhỏ bán hàng trên mạng xã hội Facebook và sàn Shopee gặp 4 khó khăn lớn:  
> 1. **Quản lý phân tán**: Nhân viên phải nhảy giữa ứng dụng chat và phần mềm bán hàng, rất dễ sót tin nhắn của khách.  
> 2. **Sai lệch tồn kho đa kênh**: Bán hết sản phẩm trên Facebook nhưng không kịp giảm số lượng trên Shopee, dẫn đến cháy hàng và bị phạt sàn do hủy đơn.  
> 3. **Thao tác thủ công**: Việc lên đơn, tính phí ship và gửi mã QR chuyển khoản làm tốn nhiều thời gian.  
> 4. **Khó kiểm soát tài chính**: Rất khó tính Lợi nhuận ròng thực tế sau khi trừ cước ship GHN và 6.5% phí sàn Shopee.  
> 
> **Từ thực trạng đó, mục tiêu tổng quát của đề tài là:**  
> - Hợp nhất toàn bộ khung chat Messenger và gian hàng Shopee về 1 Dashboard duy nhất.  
> - Tự động hóa 100% luồng chốt đơn: Sinh mã VietQR PayOS, xác thực Webhook HMAC, đẩy vận đơn GHN và đồng bộ kho Shopee thời gian thực qua API `v2.product.update_stock`.  
> - Tích hợp phân tích kinh doanh BI và ứng dụng thuật toán **WMA (Weighted Moving Average)** để dự báo tồn kho."

---

### ⏱️ SLIDE 3: CÔNG NGHỆ DỰ KIẾN SỬ DỤNG (1:45 – 2:45)
*(Hình ảnh Slide 3: 4 Khối công nghệ Frontend, Backend, Realtime & API)*

> **"Về công nghệ dự kiến triển khai cho hệ thống:**  
> - **Frontend Framework**: Em lựa chọn **ReactJS xây dựng trên Vite** kết hợp **TypeScript** để đảm bảo kiểm soát kiểu dữ liệu chặt chẽ. Giao diện thiết kế theo Design System **Tailwind CSS & Shadcn UI**, vẽ biểu đồ BI bằng **Recharts**.  
> - **Backend & Cơ sở dữ liệu**: Phát triển trên nền **Node.js & Express.js** theo kiến trúc **Modular Monolith và API Adapter Pattern**. Cơ sở dữ liệu sử dụng **PostgreSQL trên Supabase Cloud** quản lý qua **Prisma ORM v5**, kết hợp **Redis và BullMQ** xử lý hàng đợi ngầm bất đồng bộ.  
> - **Real-time & Tích hợp dịch vụ**: Sử dụng **Socket.io** cho tính năng nhắn tin thời gian thực; kết nối **Meta Graph API Adapter** cho Facebook Messenger Webhook, **PayOS SDK** cho VietQR và **Giao Hàng Nhanh API Sandbox** để tạo vận đơn."

---

### ⏱️ SLIDE 4: SÀN TMĐT & CHUẨN HÓA API (2:45 – 3:45)
*(Hình ảnh Slide 4: Shopee API v2 & Swagger UI chuẩn hóa API)*

> **"Về giải pháp tích hợp sàn Thương mại điện tử và Bảo mật API:**  
> - **Đồng bộ sàn Shopee**: Hệ thống gọi API Shopee Open Platform v2 Sandbox (`v2.product.update_stock`) để cập nhật số lượng tồn kho tự động ngay sau khi đơn hàng hoàn tất thanh toán. Em xây dựng cơ chế **Shopee SKU Mapping** liên kết SKU nội bộ với Shopee Item ID để đồng bộ dữ liệu 2 chiều. Toàn bộ tính năng được thử nghiệm trên môi trường Shopee Sandbox API v2 trước khi đưa vào thực tế.  
> - **Bảo mật hệ thống**: Phân quyền người dùng (Admin / Staff), bảo mật truy cập bằng JWT và mã hóa mật khẩu với Bcrypt.

---

### ⏱️ SLIDE 5: GIẢI PHÁP & KIẾN TRÚC HỆ THỐNG (3:45 – 4:45)
*(Hình ảnh Slide 5: Kiến trúc System, Xử lý bất đồng bộ Redis BullMQ & Đồng bộ kho 2 chiều)*

> **"Về Kiến trúc tổng thể hệ thống:**  
> - Em áp dụng kiến trúc **Modular Monolith và API Adapter Pattern**, phân chia rõ ràng các module nghiệp vụ như `Auth`, `Product`, `Order`, `Chat`, `Analytics` giúp mã nguồn sạch, dễ nâng cấp và đạt hiệu năng cao.  
> - **Cơ chế xử lý bất đồng bộ ngầm**: Nhằm tránh tình trạng nghẽn Event Loop khi tiếp nhận hàng ngàn Webhook tin nhắn Facebook và sự kiện thanh toán từ PayOS cùng lúc, em đưa các sự kiện vào hàng đợi **Redis & BullMQ** xử lý ngầm, đảm bảo phản hồi tức thì cho người dùng mà không bị Timeout khi gọi các API bên thứ ba."

---

### ⏱️ SLIDE 6: QUY TRÌNH CHỐT ĐƠN 6 BƯỚC TỰ ĐỘNG (4:45 – 5:45)
*(Hình ảnh Slide 6: Luồng liên hoàn 6 bước từ Bước 1 đến Bước 6)*

> **"Điểm nổi bật nhất trong giải pháp đề xuất là Luồng chốt đơn tự động liên hoàn 6 bước thực hiện dưới 1 giây:**  
> - **Bước 1**: Khách nhắn tin Messenger. Nhân viên bật khay Quick Order Drawer ngay trên màn hình chat để chọn sản phẩm và nhập địa chỉ khách.  
> - **Bước 2**: Hệ thống tự động gửi thông tin quận/huyện sang GHN API để tính cước vận chuyển chuẩn xác.  
> - **Bước 3**: PayOS SDK phát sinh mã VietQR động + Link thanh toán, tự động gửi ảnh mã QR trực tiếp vào chat Messenger cho khách.  
> - **Bước 4**: Khách quét mã chuyển khoản thành công ➔ PayOS gửi thông báo ➔ Backend tự động giải mã chữ ký bảo mật H-MAC xác thực giao dịch ➔ Đơn hàng chuyển sang trạng thái **Đã thanh toán** ngay lập tức.  
> - **Bước 5**: Tự động trừ tồn kho PostgreSQL nội bộ và gọi API Shopee v2 Sandbox cập nhật số lượng tồn kho trên gian hàng Shopee.  
> - **Bước 6**: Đẩy đơn sang GHN lấy mã vận đơn và tự động gửi tin nhắn mã vận đơn GHN tới Messenger khách hàng."

---

### ⏱️ SLIDE 7: SẢN PHẨM DỰ KIẾN & PHÂN HỆ CHỨC NĂNG (5:45 – 6:30)
*(Hình ảnh Slide 7: Phân hệ Quản trị Chat, Analytics BI WMA & Tài liệu Kỹ thuật)*

> **"Về Sản phẩm dự kiến hoàn thành:**  
> 1. **Phân hệ Quản trị & Chat tập trung**: WebApp hỗ trợ nhắn tin thời gian thực (Socket.io mô phỏng Messenger), quản lý danh mục SKU, đồng bộ sàn Shopee (Sandbox API) và quản lý đơn hàng.  
> 2. **Phân hệ Analytics BI & Dự báo WMA**: Báo cáo Lợi Nhuận Ròng thực tế theo công thức: `Doanh thu - Cước ship GHN - Phí sàn Shopee (6.5%) - Giá vốn`. Áp dụng **Thuật toán WMA (Weighted Moving Average)** dự báo lượng hàng cần nhập 30 ngày tới và cảnh báo tồn kho 3 mức.  
> 3. **Đóng gói & Triển khai**: Kiểm thử tối ưu hóa hệ thống và đóng gói bằng **Docker Container (`Dockerfile` & `docker-compose.yml`)** sẵn sàng triển khai.  
> 
> Tiến độ triển khai được phân bổ theo 3 giai đoạn rõ ràng nhằm chuẩn bị tốt nhất cho buổi bảo vệ khóa luận.  
> 
> **Em xin trân trọng cảm ơn quý Thầy Cô trong Hội đồng đã chú ý lắng nghe! Em rất mong nhận được những nhận xét và góp ý quý báu từ Hội đồng để đề tài hoàn thiện hơn.**"

---

## 💡 GỢI Ý MẸO NÓI TRƯỚC HỘI ĐỒNG:
- **Tốc độ nói**: Giữ nhịp nói vừa phải (khoảng 120 - 130 từ/phút), không nói quá nhanh.
- **Tương tác Slide**: Khi nói đến slide nào, bạn hãy chỉ tay/con trỏ chuột vào đúng mảng khối đó trên màn hình (Ví dụ: khi nói Bước 1->6 ở Slide 6, bạn rà con trỏ qua từng bước).
- **Văn phong**: Giữ thái độ cầu thị, tôn trọng Hội đồng và sử dụng chính xác các thuật ngữ chuyên ngành đã chuẩn bị.

