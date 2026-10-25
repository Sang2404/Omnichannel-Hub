---
name: OmniHub Design System
description: Impeccable Operate-mode design language for high-density enterprise omnichannel commerce.
colors:
  primary: "#2563eb"
  primary-hover: "#1d4ed8"
  neutral-bg: "#f8fafc"
  neutral-card: "#ffffff"
  neutral-border: "#e2e8f0"
  neutral-border-subtle: "#f1f5f9"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#64748b"
  status-success: "#059669"
  status-success-bg: "#ecfdf5"
  status-warning: "#d97706"
  status-warning-bg: "#fffbeb"
  status-danger: "#dc2626"
  status-danger-bg: "#fef2f2"
typography:
  family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
---

# Design System (Impeccable Operate Mode)

## Overview
Giao diện OmniHub được thiết kế theo triết lý **Operate Mode** của Impeccable (tương tự chuẩn mực thiết kế của Stripe, Linear, GitHub Enterprise):
1. **The Product Slop Test**: Loại bỏ hoàn toàn các "tells" nhận diện của AI (gradient tím-xanh neon, icon tròn trong ô vuông phía trên tiêu đề, lồng thẻ trong thẻ vô tội vạ).
2. **Restrained Color Palette**: Màu nền trung tính sáng chuẩn mực (`#f8fafc` và `#ffffff`), đường viền ngăn cách sắc nét (`#e2e8f0`), điểm nhấn màu chỉ xuất hiện tại các vị trí ngữ nghĩa (Emerald cho Hoàn tất, Amber cho Chờ duyệt, Blue cho Tương tác).
3. **Tabular Numerals**: Mọi dữ liệu số tiền (VND), phần trăm, mã đơn, mã vận đơn GHN đều dùng font số thẳng hàng (`tabular-nums font-mono`) giúp quét nhanh chính xác.
4. **Information Density**: Mật độ thông tin cao, ưu tiên hàng dữ liệu dạng danh sách / bảng trực tiếp thay vì các khối hộp rỗng tuếch.

## Do's and Don'ts

### Do's:
- Sử dụng dải số liệu hợp nhất có đường chia dọc (`divide-x divide-slate-200`) cho khu vực KPI.
- Sử dụng bảng/danh sách chia ngăn rõ ràng (`divide-y divide-slate-100`) cho hàng đợi công việc (Operations Queue).
- Đảm bảo tỷ lệ tương phản chuẩn WCAG AA (≥ 4.5:1).

### Don'ts:
- Không dùng dải chuyển màu tím AI (`from-indigo-500`, `from-purple-500`).
- Không đặt icon trong ô vuông bo góc phía trên tiêu đề mục.
- Không lồng card bên trong card.
- Không dùng chữ xám mờ trên nền có màu.
