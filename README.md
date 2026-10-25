# 🛒 HỆ THỐNG QUẢN LÝ BÁN HÀNG ĐA KÊNH (OMNICHANNEL SOCIAL COMMERCE HUB)
**BÁO CÁO T TỐT NGHIỆP — VIỆN CÔNG NGHỆ SỐ — TRƯỜNG ĐẠI HỌC THỦ DẦU MỘT**

- **Sinh viên thực hiện**: Huỳnh Văn Sang — **MSSV**: 2224802010365 — **Lớp**: D22CNTT05
- **Giảng viên hướng dẫn**: ThS. Nguyễn Trung Vũ

---

## 📌 HƯỚNG DẪN TRA CỨU TÀI LIỆU KHI QUAY LẠI LÀM (DIRECTORY GUIDE)

Để workspace gọn gàng và giúp bạn dễ dàng biết cần làm gì khi quay lại dự án sau thời gian dài, toàn bộ tài liệu Hướng dẫn đã được sắp xếp vào thư mục **[`TaiLieu_HuongDan/`](file:///e:/School/TotNghiep/TaiLieu_HuongDan)** theo 2 nhóm chính:

```
e:\School\TotNghiep/
├── TaiLieu_HuongDan/
│   ├── 01_Duyet_De_Cuong/              # 📌 DÀNH CHO DUYỆT ĐỀ CƯƠNG & BẢO VỆ
│   │   ├── DE_CUONG_DE_TAI.md          # Nội dung Đề cương chi tiết
│   │   ├── SLIDE_DUYET_DE_CUONG.md      # Nội dung 7 Slides & Lời thoại thuyết trình
│   │   ├── KICH_BAN_THUYET_TRINH_DUYET_DE_CUONG.md # Kịch bản nói (5-7 phút) + Q&A
│   │   ├── PROMPT_TAO_SLIDE_AI.md      # Prompt AI sinh slide
│   │   └── SLIDE_PLAN.md               # Kế hoạch thiết kế slide
│   │
│   └── 02_Phat_Trien_App/              # 💻 DÀNH CHO DEVELOPER / AI CODE TIẾP
│       ├── ⭐ KE_HOACH_PHAT_TRIEN_TIEP_THEO.md # [MỞ FILE NÀY ĐẦU TIÊN KHI CODE TIẾP]
│       ├── PROJECT_CONTEXT.md          # Bối cảnh hệ thống, Prisma Schema, Danh sách API
│       ├── SYSTEM_ARCH.md              # Sơ đồ kiến trúc & Tiến độ module
│       ├── KE_HOACH_KET_NOI_FANPAGE_FB.md # Luồng thiết kế kết nối Fanpage Facebook
│       ├── DEMO_SCRIPT.md              # Kịch bản demo chạy thử nghiệm
│       └── PRODUCTION_CHECKLIST.md     # Danh sách kiểm thử trước khi triển khai
│
├── TaiLieu_BaoCao/                     # 📄 TỆP XUẤT FILE NỘP (WORD, POWERPOINT, PDF)
│   ├── 5_HuynhVanSang_Final.docx       # File Đề cương Word bản mới nhất chuẩn hóa
│   ├── 5_HuynhVanSang_Slide_DuyetDeCuong.pptx # File Slide PowerPoint (.pptx)
│   └── Báo Cáo Duyệt Đề Cương...pdf    # Bản PDF xuất báo cáo
│
├── src/                                # ⚙️ BACKEND NODE.JS + EXPRESS + TYPESCRIPT (100% DONE)
└── generate_slide.py                   # Script tự động tạo Slide PowerPoint
```

---

## 🎯 BẮT ĐẦU TỪ ĐÂU KHI QUAY LẠI DỰ ÁN?

### 1. Nếu bạn cần Chuẩn bị Thuyết trình / Duyệt Đề cương:
1. Mở file Kịch bản nói: [`TaiLieu_HuongDan/01_Duyet_De_Cuong/KICH_BAN_THUYET_TRINH_DUYET_DE_CUONG.md`](file:///e:/School/TotNghiep/TaiLieu_HuongDan/01_Duyet_De_Cuong/KICH_BAN_THUYET_TRINH_DUYET_DE_CUONG.md)
2. Mở file PowerPoint thuyết trình: [`TaiLieu_BaoCao/5_HuynhVanSang_Slide_DuyetDeCuong.pptx`](file:///e:/School/TotNghiep/TaiLieu_BaoCao/5_HuynhVanSang_Slide_DuyetDeCuong.pptx)
3. Nộp file Đề cương Word: [`TaiLieu_BaoCao/5_HuynhVanSang_Final.docx`](file:///e:/School/TotNghiep/TaiLieu_BaoCao/5_HuynhVanSang_Final.docx)

### 2. Nếu bạn quay lại Bắt đầu Lập trình tiếp phần Frontend (ReactJS):
👉 **Mở duy nhất file này**: [`TaiLieu_HuongDan/02_Phat_Trien_App/KE_HOACH_PHAT_TRIEN_TIEP_THEO.md`](file:///e:/School/TotNghiep/TaiLieu_HuongDan/02_Phat_Trien_App/KE_HOACH_PHAT_TRIEN_TIEP_THEO.md)
* File chứa sẵn toàn bộ prompt, lệnh khởi tạo Vite ReactJS, danh sách 5 trang UI cần làm và quy trình test 6 bước liên hoàn.

---

## 🛠️ LỆNH KHỞI CHẠY BACKEND ĐÃ CÓ SẴN (PORT 3000)

```bash
# Chạy Backend ở chế độ Development
npm run dev

# Kiểm tra TypeScript type compile
npx tsc --noEmit
```
