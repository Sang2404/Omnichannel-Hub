# 📊 KẾ HOẠCH SLIDE THUYẾT TRÌNH BẢO VỆ THỰC TẬP (7 SLIDES)
## Đề tài: XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH
**Đơn vị ứng dụng**: Công ty TNHH Giải pháp số Bình Dương  
**Sinh viên thực hiện**: Huỳnh Văn Sang (MSSV: 2224802010365 - Lớp D22CNTT05 - Viện Công nghệ số)  
**Thời lượng trình bày**: 7 - 8 phút (Cực kỳ cô đọng, văn phong tự nhiên, dễ đọc)

---

## 🖼 SLIDE 1: TRANG TIÊU ĐỀ (Title Slide)
- **BÁO CÁO THỰC TẬP DOANH NGHIỆP**
- **Đề tài**: XÂY DỰNG HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH
- **Đơn vị thực tập**: Công ty TNHH Giải pháp số Bình Dương
- **Thông tin**:
  - Sinh viên: Huỳnh Văn Sang — MSSV: 2224802010365 — Lớp: D22CNTT05
  - Giảng viên hướng dẫn: ThS. Lê Từ Minh Trí

---

## 🖼 SLIDE 2: LÝ DO CHỌN ĐỀ TÀI & THỰC TRẠNG
- **3 Khó khăn lớn nhất khi vận hành thủ công**:
  1. ⏳ **Mất nhiều thời gian chốt đơn**: Nhân viên phải nhảy ứng dụng liên tục giữa khung chat và phần mềm tạo đơn ➔ Dễ sót tin nhắn của khách.
  2. ⚠️ **Dễ bị lệch tồn kho**: Bán được trên Facebook nhưng không kịp giảm số lượng trên Shopee ➔ Dẫn đến hết hàng mà sàn vẫn hiện còn.
  3. 📉 **Khó tính lợi nhuận thực tế**: Không biết chính xác lời bao nhiêu sau khi trừ cước ship GHN và 6.5% phí sàn Shopee.
- **Giải pháp đề xuất**: Hợp nhất Chat Messenger, Đơn hàng, VietQR PayOS, GHN Express, Shopee Open API và Analytics BI về 1 nền tảng duy nhất.

---

## 🖼 SLIDE 3: KIẾN TRÚC HỆ THỐNG & CƠ SỞ DỮ LIỆU
- **Phần mềm hiệu năng cao**: Xây dựng trên Node.js & TypeScript. Phân chia rõ ràng các module nghiệp vụ giúp hệ thống chạy mượt và dễ nâng cấp.
- **Lưu trữ & Xử lý ngầm**: Cơ sở dữ liệu đám mây PostgreSQL (Supabase Cloud) lưu an toàn. Kết hợp hàng đợi Redis & BullMQ giúp tiếp nhận tin nhắn chat mượt mà, không bị nghẽn.
- **Kết nối 4 dịch vụ nổi tiếng**: Facebook Messenger (Chat Engine), VietQR PayOS (Thanh toán QR), Giao Hàng Nhanh (GHN Express), Shopee Open API (Đồng bộ kho).

---

## 🖼 SLIDE 4: TÍNH NĂNG 1 — CHÁT MESSENGER & TẠO ĐƠN TRỰC TIẾP ⭐
- Trò chuyện với khách hàng: Nhận và gửi tin nhắn Facebook Messenger ngay trên màn hình hệ thống.
- **Tiện ích ⚡ Tạo Đơn Nhanh 1-Click (Quick Order Drawer)**:
  1. Nhân viên nhấn nút tạo đơn góc phải khung chat mà không cần chuyển trang.
  2. Tự động gọi API Giao Hàng Nhanh (GHN) tính cước chính xác theo địa chỉ khách.
  3. Tự động sinh mã QR PayOS và gửi ngay ảnh mã QR + Link thanh toán vào khung chat cho khách.

---

## 🖼 SLIDE 5: TÍNH NĂNG 2 — LUỒNG TỰ ĐỘNG CHÉO LIÊN HOÀN 6 BƯỚC ⭐ [CỐT LÕI HỆ THỐNG]
- **Tự động thực hiện 6 bước liên hoàn trong 1 giây ngay khi khách quét QR PayOS thanh toán thành công**:
  1. 🟢 Tự động chuyển trạng thái đơn hàng thành **ĐÃ THANH TOÁN** (PAID).
  2. 📦 Tự động trừ số lượng tồn kho sản phẩm gốc trong cơ sở dữ liệu.
  3. 🛍️ Tự động giảm số lượng tồn kho tương ứng trên gian hàng sàn Shopee.
  4. 🚚 Tự động đẩy đơn sang Giao Hàng Nhanh (GHN) để lấy mã vận đơn lấy hàng.
  5. 💬 Tự động nhắn tin gửi mã vận đơn GHN cho khách qua Facebook Messenger.
  6. ⚡ Tự động cập nhật màu trạng thái đơn hàng trên màn hình Dashboard ngay tức thì.

---

## 🖼 SLIDE 6: TÍNH NĂNG 3 — QUẢN TRỊ BÁO CÁO BI & KHO HÀNG ⭐ [ĐÁNH GIÁ CAO]
- **Báo cáo Lợi Nhuận Ròng thực tế**:
  - Công thức tính chuẩn xác: *Doanh Thu − Phí Ship GHN − Phí Sàn Shopee (6.5%) − Giá Vốn = Lợi Nhuận Ròng*.
  - Tự động đưa ra lời khuyên (Auto Insight): Cho chủ shop biết kênh bán nào đang hoạt động có lời tốt hơn.
- **Dự báo tồn kho thông minh (WMA 30 ngày)**:
  - Phân tích sức bán 30 ngày gần nhất để dự báo ngày sản phẩm sẽ bị hết hàng.
  - Cảnh báo tồn kho 3 mức: 🔴 Sắp hết hàng (≤5 sp) | 🟡 Tồn kho ít | 🟣 Tồn quá lâu.
  - Điểm đặt hàng lại (Reorder Point): Tự động tính chính xác số lượng hàng cần nhập thêm trước khi bị cháy hàng.

---

## 🖼 SLIDE 7: TỔNG KẾT CÁC KẾT QUẢ THỰC TẾ ĐÃ ĐẠT ĐƯỢC ⭐
- 🎯 **1. Hoàn thành 100% mục tiêu đề ra**: Xây dựng thành công phần mềm bán hàng đa kênh hợp nhất Facebook & Shopee chạy mượt mà.
- ⚡ **2. Tự động hóa hoàn toàn luồng xử lý**: Rút ngắn thời gian chốt đơn ➔ Tự động nhận tiền VietQR ➔ Tự động trừ kho Shopee & đẩy vận đơn GHN.
- 📊 **3. Hỗ trợ quản trị kinh doanh hiệu quả**: Giúp chủ shop nắm rõ Lợi nhuận ròng thực tế và chủ động nhập hàng trước khi bị hết kho.
- 🧪 **4. Kiểm thử kỹ lưỡng & sẵn sàng triển khai**: Chạy đúng tất cả các kịch bản nghiệp vụ thực tế, bảo mật an toàn và đã đóng gói sẵn sàng dùng.
- **Trân trọng cảm ơn Quý Thầy Cô & Hội đồng — Em xin sẵn sàng nhận câu hỏi Q&A!**
