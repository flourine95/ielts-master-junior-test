# Bài test Junior Full-Stack Developer — IELTS Master

Ứng dụng nhỏ hiển thị danh sách bài tập của học viên **S01**, kèm trạng thái nộp bài
được tính theo một thời điểm giả lập cố định.

- Giao diện: <http://localhost:3000/>
- API: <http://localhost:3000/api/assignments>

## Tech stack

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js 16 (App Router) | Đề cho phép Next.js; server component cho phép lọc dữ liệu ở server mà không cần thêm tiến trình API riêng |
| Ngôn ngữ | TypeScript (strict) | Kiểu dữ liệu cho trạng thái giúp loại bỏ cả một lớp lỗi |
| Giao diện | Tailwind CSS v4 | Responsive nhanh, không kéo theo thư viện UI nặng |
| Test | Vitest | Khởi động nhanh, không cần biến đổi JSX cho các test logic thuần |
| Runtime | Node.js ≥ 20.9 | Theo yêu cầu của Next.js 16 |

Không dùng database, không dùng auth thật, không gọi dịch vụ ngoài — dữ liệu là fixture
trong bộ nhớ theo đúng đề bài.

## Cách chạy

```bash
npm install
npm run dev        # http://localhost:3000
```

Bản production:

```bash
npm run build
npm start
```

## Cách kiểm tra

```bash
npm test           # 17 test: logic trạng thái + lọc S01
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Kết quả test thực tế:

```
$ npm test

 RUN  v5.1.0 D:/Projects/ielts-master-junior-test

 Test Files  2 passed (2)
      Tests  17 passed (17)
   Duration  189ms
```

Hai nhóm test bắt buộc theo đề:

| File | Nội dung |
|---|---|
| `tests/status.test.ts` | 4 trường hợp bắt buộc + biên (nộp đúng hạn, `now` đúng hạn, lệch 1 ms, so sánh khác offset, chặn timestamp thiếu offset) |
| `tests/assignment-service.test.ts` | Lọc đúng S01 (A01–A04), khẳng định B01 không xuất hiện trong cả mảng lẫn JSON, S02 chỉ thấy B01, học viên lạ nhận mảng rỗng |

Kiểm tra API bằng tay:

```bash
curl http://localhost:3000/api/assignments
# S01: A01..A04, không có B01

curl "http://localhost:3000/api/assignments?studentId=S02"
# vẫn trả A01..A04 — tham số bị bỏ qua hoàn toàn

curl -H "Cookie: ielts_session=demo-s02" http://localhost:3000/api/assignments
# chỉ B01
```

## Kết quả đạt được

Thời điểm giả lập: **11/11/2026 09:00 (GMT+7)**.

| ID | Bài | Hạn nộp | Đã nộp | Trạng thái hiển thị |
|---|---|---|---|---|
| A01 | Foundation U1 – Reading | 13/11/2026 23:59 | — | Chưa nộp |
| A02 | Foundation U2 – Listening | 09/11/2026 23:59 | — | Quá hạn |
| A03 | Foundation U3 – Writing | 10/11/2026 23:59 | 10/11/2026 20:00 | Đã nộp |
| A04 | Foundation U4 – Speaking | 08/11/2026 23:59 | 10/11/2026 12:00 | Đã nộp + Nộp trễ |
| B01 | Foundation U1 – Reading | 13/11/2026 23:59 | — | **không xuất hiện** (thuộc S02) |

Ảnh giao diện: [`docs/screenshot-desktop.png`](docs/screenshot-desktop.png),
[`docs/screenshot-mobile.png`](docs/screenshot-mobile.png).

## Cấu trúc

```
src/
  app/
    api/assignments/route.ts   GET — trả dữ liệu của người đang đăng nhập
    page.tsx                   Server component: bảng (≥sm) + card (<sm)
    status-cell.tsx            Badge trạng thái
    globals.css                Token màu, sáng/tối
  lib/
    instant.ts                 Parse/format timestamp có offset, luôn theo GMT+7
    now.ts                     SIMULATED_NOW = 2026-11-11T09:00:00+07:00
    types.ts                   Assignment, AssignmentView, SubmissionState
    assignments.ts             Fixture A01–A04 + B01
    status.ts                  getStatus() — logic thuần, nhận `now` làm tham số
    assignment-service.ts      Nơi duy nhất lọc theo studentId
    session.ts                 Mock auth: đọc cookie, tra registry ở server
tests/
  status.test.ts               Logic trạng thái
  assignment-service.test.ts   Cô lập dữ liệu S01
```

## Cách tránh lộ dữ liệu S02

1. **Không có `studentId` nào đến từ client.** Route handler và page đều không đọc
   query string, body hay path param. `?studentId=S02` bị bỏ qua hoàn toàn.
2. **Định danh lấy từ session phía server** (`src/lib/session.ts`): cookie
   `ielts_session` được tra trong registry chỉ server biết. Giá trị lạ
   (`demo-s99`) rơi về tài khoản mặc định, không tạo được học viên mới.
3. **Lọc ở đúng một chỗ** — `getAssignmentsForStudent()`. Không component nào tự
   `filter()` trên toàn bộ fixture, nên không có đường vòng thứ hai.
4. **Response không chứa `studentId`.** `AssignmentView` là kiểu riêng, không mang
   trường định danh, nên payload không thể bị dùng lại để hỏi học viên khác.
5. **Có test khẳng định** `B01` vắng mặt trong cả danh sách lẫn chuỗi JSON, nên nếu
   ai đó sửa hỏng bước lọc thì test đỏ ngay.
6. Response đặt `Cache-Control: no-store` để dữ liệu của một học viên không nằm
   trong cache dùng chung.

## Quy ước & giả định

- **Mốc thời gian**: `SIMULATED_NOW_ISO` là hằng số trong `src/lib/now.ts`. Không có
  `new Date()` trong logic trạng thái; `now` được truyền vào `getStatus()`.
- **So sánh**: mọi timestamp được đổi sang epoch ms qua `parseInstant()`. Hàm này
  **ném lỗi** nếu thiếu offset, thay vì để runtime tự đoán múi giờ máy chủ.
- **Biên**: nộp đúng thời điểm hạn → tính là đúng hạn; `now` đúng thời điểm hạn →
  chưa quá hạn (dùng `>`, không dùng `>=`).
- **Đã nộp thì không bao giờ là "Quá hạn"**: nộp trễ hiển thị `Đã nộp` cộng badge
  `Nộp trễ`.
- **Định dạng ngày**: `dd/mm/yyyy hh:mm` theo GMT+7, dùng `Intl.DateTimeFormat` với
  `timeZone: "Asia/Ho_Chi_Minh"`, nên kết quả không phụ thuộc múi giờ máy chạy.
- **Auth là giả lập**: mặc định đăng nhập S01. Đặt cookie `ielts_session=demo-s02`
  để xem dữ liệu S02 — dùng để chứng minh việc lọc chạy đúng, không phải tính năng
  đăng nhập.

## Phần chưa làm

- Không có đăng nhập thật, không có JWT/session ký, không có phân quyền theo vai trò.
- Không có database; dữ liệu là fixture trong bộ nhớ, khởi động lại là reset.
- Không có chức năng nộp bài — chỉ đọc và hiển thị.
- Không có test E2E/trình duyệt tự động; phần UI được kiểm tra thủ công bằng ảnh chụp
  ở hai kích thước màn hình.
- Chưa có i18n; nhãn tiếng Việt viết trực tiếp trong code.
