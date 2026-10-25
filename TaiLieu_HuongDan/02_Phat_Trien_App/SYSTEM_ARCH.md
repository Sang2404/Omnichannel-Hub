# 🏗️ SYSTEM_ARCH.md - Omnichannel Social Commerce Hub

Tài liệu này ghi nhận cấu trúc thư mục hiện tại và tiến độ hoàn thành các module. Được cập nhật liên tục trước mỗi Sprint và khi bắt đầu một module mới.

---

## 📂 Cấu trúc thư mục hiện tại (Hiện trạng: Hoàn thành Frontend Phase 1)

```
omnichannel-hub/ (e:\School\TotNghiep)
├── backend/ (các file nguồn tại root)
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (Supabase PostgreSQL Cloud)
│   │   └── seed.ts                    # Script seed dữ liệu mẫu
│   └── src/
│       ├── app.ts                     # Cấu hình Express app
│       ├── server.ts                  # Entrypoint khởi tạo HTTP & Socket.io & Workers
│       ├── config/                    # database, env, redis, socket
│       ├── modules/                   # auth, product, customer, chat, order, analytics
│       ├── integrations/              # facebook, payos, ghn, shopee
│       ├── workers/                   # facebook-message.worker.ts
│       └── routes/                    # Central route aggregator
│
├── frontend/                          # [MỚI] Giao diện ReactJS (Vite + TS + Tailwind)
│   ├── src/
│   │   ├── app/                       # Redux Store (store.ts)
│   │   ├── core/                      # Axios Client, Socket Client, AppRouter, RoleGuard
│   │   ├── features/
│   │   │   ├── auth/                  # LoginPage, authSlice, authApi
│   │   │   └── dashboard/             # DashboardPage (KPI Cards, Revenue Chart, Stock Alerts)
│   │   ├── shared/
│   │   │   ├── components/            # CommandPalette (Ctrl+K), NotificationCenter
│   │   │   └── layout/                # MainLayout, Header, Sidebar
│   │   ├── App.tsx                    # QueryClientProvider, Redux Provider, AppRouter
│   │   ├── index.css                  # Tailwind CSS Dark mode Slate Palette
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                 # Proxy /api & /socket.io -> localhost:3000
│
├── .env                               # Biến môi trường kết nối Supabase & Upstash
├── PROJECT_CONTEXT.md                 # Tài liệu mô tả toàn bộ dự án cho AI ngoài
└── SYSTEM_ARCH.md                     # [ĐÃ CẬP NHẬT] Bản đồ kiến trúc hệ thống
```

---

## 🚦 Tiến độ các Module

| Module | Trạng thái | Ghi chú |
|---|---|---|
| **Backend REST API & DB** | ✅ Hoàn thành | Node.js, Express, TypeScript, Prisma (Supabase), Redis (Upstash), Workers |
| **Backend Analytics BI** | ✅ Hoàn thành | KPI Overview, Revenue Trend, Channel Insights, Profit Breakdown, Forecast WMA |
| **Frontend Phase 1 (Core & Auth)**| ✅ Hoàn thành | ReactJS + Vite + Tailwind, Dark Mode Slate Palette, Auth Slice, JWT Axios Client, Router, Role Guard, Command Palette (Ctrl+K), Notification Center, Dashboard Page |
| **Frontend Phase 2 (Products)** | ✅ Hoàn thành | Danh sách sản phẩm, Modal thêm/sửa, Shopee Sync Badge |
| **Frontend Phase 3 (Orders)** | ✅ Hoàn thành | Danh sách đơn, Filter theo trạng thái, Modal VietQR PayOS, Tem vận đơn GHN, Activity Timeline, Xuất CSV |
| **Frontend Phase 4 (Omnichannel Chat)**| ✅ Hoàn thành | Khung nhắn tin Messenger & Quick Order Drawer |
| **Frontend Phase 5 (Analytics BI UI)** | ✅ Hoàn thành | KPI Cards, Recharts AreaChart/BarChart, Channel Comparison, Profit Breakdown, Top Products, Inventory Alerts + Shopee Sync, Chat Conversion Funnel — Tất cả kết nối dữ liệu thực từ API |
| **Frontend CRM Khách Hàng** | ✅ Hoàn thành | Danh sách khách hàng, Empty State, tìm kiếm, modal lịch sử đơn |
| **Swagger API Documentation** | ✅ Hoàn thành | swagger-ui-express tại /api-docs, 25+ endpoints OpenAPI 3.0 |
| **Docker Containerization** | ✅ Hoàn thành | Multi-stage Dockerfile, docker-compose.yml (App + Redis) |
| **Automated Testing** | ✅ Hoàn thành | Vitest, 21 test cases: WMA Algorithm + PayOS HMAC Webhook Signature |
| **Production Checklist** | ✅ Hoàn thành | Hướng dẫn chuyển đổi Facebook, Shopee, GHN, PayOS sang Production |

