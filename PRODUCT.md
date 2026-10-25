# Product Truth

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Chủ shop và nhân viên vận hành bán hàng đa kênh tại Việt Nam, quản lý song song kênh mạng xã hội (Facebook Fanpage / Messenger) và sàn thương mại điện tử (Shopee Sandbox), kết nối cổng thanh toán tự động VietQR (PayOS) và dịch vụ giao vận Giao Hàng Nhanh (GHN).

## Product Purpose
Hệ thống OmniHub hợp nhất toàn bộ quy trình: tiếp nhận khách chat Messenger, tự động trích xuất thông tin đơn hàng bằng AI Parser, tạo mã thanh toán VietQR động, cấp mã vận đơn GHN tức thời, và đồng bộ tồn kho thời gian thực với Shopee Open API v2 chống bán vượt (overselling).

## Positioning
Nền tảng vận hành bán hàng đa kênh tự động hóa khép kín đầu-cuối (End-to-End E-Commerce Automation) với cơ chế khóa tồn kho nguyên tử (Atomic Isolation) và so sánh mô hình dự báo nhu cầu học thuật (SMA / WMA / EMA).

## Operating Context
- Môi trường: Bàn làm việc cửa hàng, laptop/PC quản lý kho và trả lời khách hàng tốc độ cao.
- Trọng tâm: Tốc độ xử lý, độ chính xác của tồn kho và dòng tiền thực tế (Cashflow).
- Không gian hiển thị: Desktop Dashboard (Operate mode), ưu tiên mật độ thông tin cao, dễ quét mắt, phản hồi tức thì.

## Capabilities and Constraints
- Cổng tích hợp: Meta Graph API (v21.0), PayOS VietQR, GHN Express API, Shopee Open API v2.
- Cơ sở dữ liệu: PostgreSQL (Supabase) + Prisma ORM + Upstash Redis cache.
- Ràng buộc: Chống bán vượt tồn kho mức cơ sở dữ liệu `WHERE "stock" >= $qty`.

## Brand Commitments
- Tên hệ thống: OmniHub (Hệ Thống Quản Lý Bán Hàng Đa Kênh).
- Phong cách giao diện: Impeccable Operate Mode — Restrained, High-Density, Data-First, Zero AI Gimmicks (không gradient tím AI, không lồng card trong card, không icon trong ô vuông).
