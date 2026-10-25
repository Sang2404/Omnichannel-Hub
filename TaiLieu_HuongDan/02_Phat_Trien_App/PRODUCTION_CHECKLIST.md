# 🚀 PRODUCTION CHECKLIST — Omnichannel Social Commerce Hub

Hướng dẫn chi tiết để chuyển hệ thống từ môi trường **Sandbox/Development** sang **Production** chính thức.

---

## ✅ 1. Facebook Messenger (Meta Graph API)

### Bước 1: Cấu hình Meta App
1. Truy cập [Meta for Developers Console](https://developers.facebook.com/)
2. Chọn App hiện tại hoặc tạo mới **→ App Type: Business**
3. Vào **Settings → Basic**: Lấy `APP_SECRET` → Cập nhật `FB_APP_SECRET` trong `.env`
4. Vào **Messenger → Settings → Access Tokens**: Sinh `Page Access Token` vĩnh viễn
5. Cập nhật `FB_PAGE_ACCESS_TOKEN` trong `.env`

### Bước 2: Cấu hình Webhook
1. Vào **Messenger → Settings → Webhooks** → Click "Add Callback URL"
2. Nhập URL callback: `https://YOUR-DOMAIN.com/api/webhooks/facebook`
3. Nhập Verify Token: Phải khớp với giá trị `FB_VERIFY_TOKEN` trong `.env`
4. Subscribe các event: `messages`, `messaging_postbacks`
5. Trong **Messenger → Settings → Subscriptions**, chọn Facebook Page cần kết nối

### Bước 3: Xin quyền Advanced Access (Bắt buộc cho Production)
- Vào **App Review → Permissions**: Xin quyền `pages_messaging` (Advanced)
- Submit kèm video demo luồng hoạt động của hệ thống

### Biến môi trường cần cập nhật:
```env
FB_PAGE_ACCESS_TOKEN=EAA...your_real_token...
FB_VERIFY_TOKEN=your_custom_verify_string
FB_APP_SECRET=your_real_app_secret
```

---

## ✅ 2. Shopee Open Platform (Open API v2)

### Bước 1: Đăng ký Partner Account
1. Truy cập [Shopee Open Platform](https://open.shopee.com/)
2. Đăng ký tài khoản **Partner Developer**
3. Tạo App mới, nhận được `Partner ID` và `Partner Key`

### Bước 2: Authorize Shop
1. Dùng flow OAuth2: Shop owner quét QR hoặc truy cập link Authorization
2. Hệ thống nhận được `Shop ID` + `Access Token` của shop

### Bước 3: Cấu hình hệ thống
- Chuyển `isMockMode()` trong `src/integrations/shopee/shopee.service.ts` thành luôn trả `false`
- Hoặc đơn giản thay thế `SHOPEE_PARTNER_KEY` bằng key thật (mock mode sẽ tự tắt)

### Biến môi trường cần cập nhật:
```env
SHOPEE_PARTNER_ID=1234567        # Partner ID thật từ Shopee Open Platform
SHOPEE_PARTNER_KEY=abc...xyz     # Partner Key thật (không chứa "placeholder")
SHOPEE_SHOP_ID=9876543           # Shop ID sau khi authorize
```

---

## ✅ 3. GHN Express (Giao Hàng Nhanh API)

### Bước 1: Tạo tài khoản GHN Business
1. Truy cập [GHN Business Dashboard](https://khachhang.ghn.vn/)
2. Đăng ký tài khoản doanh nghiệp, xác thực hồ sơ kinh doanh

### Bước 2: Lấy API Credentials
1. Vào **Settings → API Token**: Sao chép `Token` production
2. Vào **Settings → Shop**: Lấy `ShopId` của shop

### Bước 3: Chuyển Gateway URL
- Hiện tại đang dùng: `https://dev-online-gateway.ghn.vn/` (Sandbox)
- Chuyển sang: `https://online-gateway.ghn.vn/` (Production)
- Cập nhật trong file cấu hình GHN client tại `src/integrations/ghn/`

### Biến môi trường cần cập nhật:
```env
GHN_TOKEN=your_real_production_token
GHN_SHOP_ID=your_real_shop_id
GHN_API_URL=https://online-gateway.ghn.vn
```

---

## ✅ 4. PayOS (VietQR Payment Gateway)

### Bước 1: Đăng ký tài khoản PayOS Business
1. Truy cập [PayOS Dashboard](https://payos.vn/)
2. Đăng ký doanh nghiệp, liên kết tài khoản ngân hàng nhận tiền

### Bước 2: Lấy API Credentials
1. Vào **Settings → API Keys**: Lấy `Client ID`, `API Key`, `Checksum Key`
2. Cấu hình Webhook URL: `https://YOUR-DOMAIN.com/api/webhooks/payos`

### Biến môi trường cần cập nhật:
```env
PAYOS_CLIENT_ID=your_real_client_id      # Không chứa "placeholder"
PAYOS_API_KEY=your_real_api_key
PAYOS_CHECKSUM_KEY=your_real_checksum_key
```

---

## ✅ 5. Infrastructure & Deployment

### Database (Supabase PostgreSQL)
- [ ] Đảm bảo connection pooling đã bật (`?pgbouncer=true` trong `DATABASE_URL`)
- [ ] Chạy `npx prisma migrate deploy` trên production database
- [ ] Backup tự động đã được cấu hình trên Supabase Dashboard

### Redis (Upstash hoặc Local)
- [ ] Nếu dùng Upstash Cloud: Đảm bảo TLS connection (`rediss://`)
- [ ] Nếu dùng Docker local: Cấu hình `REDIS_URL=redis://redis:6379`

### SSL/HTTPS
- [ ] Cấu hình Reverse Proxy (Nginx / Caddy / Traefik) với SSL certificate
- [ ] Đảm bảo webhook URLs sử dụng `https://` (bắt buộc cho Facebook & PayOS)

### Docker Deployment
```bash
# Build và chạy toàn bộ hệ thống
docker compose up -d --build

# Kiểm tra health
curl http://localhost:3000/api/health

# Xem API Documentation
# Mở trình duyệt: http://localhost:3000/api-docs
```

---

## ✅ 6. Security Checklist

- [ ] Đổi JWT Secret (`JWT_SECRET`) thành chuỗi random dài ≥ 64 ký tự
- [ ] Đổi mật khẩu tài khoản Admin/Staff mặc định
- [ ] Cấu hình CORS chỉ cho phép domain frontend chính thức
- [ ] Bật rate limiting cho các webhook endpoints
- [ ] Kiểm tra tất cả `.env` variables không còn giá trị `placeholder`

---

## ✅ 7. Final Smoke Test

| Test Case | Expected Result |
|---|---|
| Login Admin tại `/login` | Redirect về Dashboard, hiển thị KPI cards |
| Truy cập `/analytics` (Admin) | Hiển thị biểu đồ BI với dữ liệu thực từ DB |
| Truy cập `/analytics` (Staff) | Bị chặn 403 Forbidden |
| Tạo đơn hàng tại `/orders` | Sinh mã VietQR PayOS, gửi qua Messenger |
| Khách quét QR thanh toán | Webhook PayOS → PAID → GHN → Nhắn mã vận đơn |
| Kiểm tra kho sau thanh toán | Stock giảm, Shopee stock đồng bộ |
| Swagger tại `/api-docs` | Hiển thị đầy đủ 25+ endpoints |
