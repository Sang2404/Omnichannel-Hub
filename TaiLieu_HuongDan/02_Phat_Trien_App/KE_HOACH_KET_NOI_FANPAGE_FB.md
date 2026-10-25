# Kế hoạch triển khai: Luồng Kết nối Fanpage Facebook chính thức cho Chủ shop (Facebook OAuth & Fanpage Connection)

## Tổng quan (Overview)
Hiện tại, hệ thống đang dùng biến môi trường tĩnh (`FACEBOOK_PAGE_ACCESS_TOKEN`) để nhắn tin qua Facebook Messenger. Để tăng tính thực tế và chứng minh hệ thống kết nối với Fanpage thật từ Meta, khi **Chủ kinh doanh (Admin)** đăng ký/đăng nhập vào hệ thống, ứng dụng sẽ cung cấp luồng **"Kết nối Fanpage Facebook"** (Login with Facebook OAuth).

Luồng này cho phép Chủ shop:
1. Đăng nhập tài khoản Facebook cá nhân via Facebook OAuth SDK.
2. Cấp quyền truy cập quản lý Fanpage (`pages_show_list`, `pages_messaging`).
3. Lấy danh sách các Fanpage thật mà Chủ shop sở hữu từ Meta Graph API (`GET /me/accounts`).
4. Chọn Fanpage kết nối ➔ Lưu `fbPageId`, `fbPageName`, `fbPageAccessToken` vào Database và hiển thị trạng thái **"Đã kết nối Fanpage Facebook chính thức"** (Meta Verified Badge).

---

## Các thành phần cần triển khai (Dành cho kế hoạch sau này)

### 1. Database & Backend Configuration

#### [DATABASE SCHEMA] `prisma/schema.prisma`
- Bổ sung các trường kết nối Fanpage cho model `User` (hoặc `StoreChannel`):
  - `fbPageId`: String? (ID của Fanpage Facebook đã kết nối)
  - `fbPageName`: String? (Tên của Fanpage Facebook)
  - `fbPageAccessToken`: String? (Token truy cập riêng của Fanpage)
  - `fbConnectedAt`: DateTime? (Thời điểm kết nối thành công)

#### [BACKEND CONTROLLER] `src/modules/auth/facebook-auth.controller.ts`
- `POST /api/auth/facebook/connect`: Tiếp nhận User Access Token từ Facebook SDK/OAuth, gọi Meta Graph API `GET /me/accounts` để lấy danh sách các Fanpage khả dụng.
- `POST /api/auth/facebook/select-page`: Lưu `fbPageId`, `fbPageName`, `fbPageAccessToken` của Fanpage được chọn vào tài khoản Chủ shop.
- `GET /api/auth/facebook/status`: Kiểm tra trạng thái kết nối Fanpage của shop.
- `POST /api/auth/facebook/disconnect`: Hủy kết nối Fanpage.

#### [FACEBOOK INTEGRATION] `src/integrations/facebook/facebook.service.ts`
- Cập nhật `FacebookService` nhận `pageAccessToken` theo từng Shop/Chủ shop từ Database thay vì dùng token tĩnh trong `.env`.

---

### 2. Frontend ReactJS (Giao diện Quản trị)

#### [FRONTEND COMPONENT] `frontend/src/features/settings/FacebookConnectCard.tsx`
- Hiển thị Card kết nối Fanpage Facebook tại trang **Cài đặt Kênh Bán / Dashboard**.
- Trạng thái chưa kết nối: Nút bấm **"Kết nối Fanpage Facebook ngay"** với biểu tượng Facebook.
- Modal chọn Fanpage: Sau khi đăng nhập Facebook, danh sách các Fanpage thật của người dùng được hiển thị với Avatar, Tên Trang và ID Trang để lựa chọn.
- Trạng thái đã kết nối: Hiển thị Thẻ xác thực **"Đã kết nối: [Tên Fanpage]"**, kèm nút "Đổi Fanpage" hoặc "Hủy kết nối".

---

## Kịch bản Kiểm thử & Demo thực tế

1. Đăng ký tài khoản Admin/Chủ shop mới trên Web.
2. Vào phần Cài đặt Kênh bán ➔ Nhấp vào **"Kết nối Fanpage Facebook"**.
3. Thực hiện xác thực ➔ Kiểm tra danh sách Fanpage thực tế được tải về từ Meta Graph API.
4. Chọn Fanpage ➔ Kiểm tra DB đã lưu `fbPageId`, `fbPageName`, `fbPageAccessToken` và UI cập nhật trạng thái **"Đã kết nối Fanpage Facebook thành công"**.
5. Thử nghiệm gửi tin nhắn nhắn chốt đơn Messenger với `Page Access Token` mới được cấp của Fanpage đó.
