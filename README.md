# Bài test Junior Full-Stack Developer — IELTS Master

Ứng dụng nhỏ hiển thị danh sách bài tập của học viên **S01**, kèm trạng thái nộp bài
được tính theo một thời điểm giả lập cố định.

- Giao diện: <http://localhost:3000/>
- API: <http://localhost:3000/api/assignments>

## Tech stack

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack) | Đề cho phép; server component lọc dữ liệu ở server, route handler cho API — một codebase, không cần service riêng |
| Ngôn ngữ | TypeScript strict | Kiểu trạng thái là union literal, sai nhánh là lỗi compile |
| UI | shadcn/ui (Radix, preset `nova`) | Component là mã nguồn trong repo, không phải dependency đóng; `Table`/`Card`/`Badge` có sẵn nên không phải tự dựng lại |
| Style | Tailwind CSS v4 | Token ngữ nghĩa (`bg-card`, `text-muted-foreground`) nên dark mode không cần class `dark:` thủ công |
| Validation | Zod 4 | Kiểm tra timestamp ở biên dữ liệu và biên API |
| Test | Vitest 5 | Test logic thuần, không cần JSDOM |

Không có database. Đề ghi rõ "Không cần xây database thật" và "Tự chuyển bảng thành
JSON/TypeScript", nên dữ liệu là fixture trong bộ nhớ. Lý do kỹ thuật: `next@16` yêu
cầu Node ≥ 20.9, còn `node:sqlite` chỉ hết experimental từ Node 22.13 — thêm DB nghĩa
là người chấm phải có Node mới hơn mức app cần, đổi lấy zero điểm ở thang chấm.

### Vì sao không Prisma / React Query

**Prisma** — một bảng, hai câu query, không migration, không quan hệ. Prisma thêm
generate step trong `postinstall`, engine binary, và một schema DSL thứ hai phải đồng
bộ với TypeScript; đổi lại không có gì để chứng minh ở đề này.

**React Query** — không có client-side fetching nào để quản lý. Trang là server
component đọc thẳng dữ liệu, API route là server-side; dữ liệu đã render xong trước
khi HTML tới browser. Nếu sau này thêm "nộp bài" với optimistic update hoặc polling,
`app/api/assignments` đã sẵn sàng làm endpoint cho nó.

**Zod** làm đúng một việc ở đây: chặn timestamp thiếu offset (lỗi múi giờ) và xác nhận
shape của response. Không dùng để validate form vì app không có form.

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

Không cần biến môi trường, không cần service ngoài, không có bước migrate/seed.

## Cách kiểm tra

```bash
npm test           # 22 test: logic trạng thái + lọc S01 + integrity của fixture
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Kết quả test thực tế:

```
$ npm test

 RUN  v5.1.0 D:/Projects/ielts-master-junior-test

 Test Files  2 passed (2)
      Tests  22 passed (22)
   Duration  383ms
```

| File | Nội dung |
|---|---|
| `tests/status.test.ts` | 4 trường hợp bắt buộc, biên (nộp đúng hạn, `now` đúng hạn, lệch 1 ms), so sánh khác offset, `instantSchema` chặn timestamp thiếu offset |
| `tests/assignment-service.test.ts` | Gọi đúng hàm mà page và API gọi: A01–A04, B01 vắng mặt trong cả mảng lẫn JSON, S02 chỉ thấy B01, học viên lạ nhận mảng rỗng, format GMT+7, đổi `now` thì chỉ trạng thái đổi, response khớp schema, fixture reject timestamp thiếu offset |

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
[`docs/screenshot-mobile.png`](docs/screenshot-mobile.png),
[`docs/screenshot-dark.png`](docs/screenshot-dark.png).

## Cấu trúc

```
src/
  app/
    api/assignments/route.ts   GET — validate payload bằng Zod rồi trả JSON
    page.tsx                   Server component: bảng (≥sm) + card (<sm)
    status-cell.tsx            Badge trạng thái
    globals.css                Token màu shadcn + --success/--warning
  components/ui/               shadcn: badge, card, table, empty, alert, separator
  lib/
    schema.ts                  Zod: instant, assignment, view, response
    assignments.ts             Fixture A01–A04 + B01, parse qua schema khi import
    status.ts                  getStatus() — thuần, nhận `now` làm tham số
    assignment-service.ts      Nơi duy nhất lọc theo studentId
    session.ts                 Mock auth: đọc cookie, tra registry ở server
    instant.ts                 Parse/format timestamp, luôn theo GMT+7
    now.ts                     SIMULATED_NOW = 2026-11-11T09:00:00+07:00
tests/
  status.test.ts               Logic trạng thái + biên
  assignment-service.test.ts   Cô lập dữ liệu + integrity của fixture
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
5. **Zod kiểm tra cả shape của response** trước khi trả về (`assignmentsResponseSchema.parse`),
   nên một sửa đổi vô tình làm rò `studentId` sẽ fail ở runtime và trong test.
6. **Có test khẳng định** `B01` vắng mặt trong cả danh sách lẫn chuỗi JSON, nên nếu ai
   đó sửa hỏng bước lọc thì test đỏ ngay.
7. Response đặt `Cache-Control: no-store` để dữ liệu của một học viên không nằm
   trong cache dùng chung.

## Quy ước & giả định

- **Mốc thời gian**: `SIMULATED_NOW_ISO` là hằng số trong `src/lib/now.ts`. Không có
  `new Date()` trong logic trạng thái; `now` được truyền vào `getStatus()`.
- **So sánh**: mọi timestamp đổi sang epoch ms qua `parseInstant()`. Chuỗi phải có
  offset tường minh — `instantSchema` (Zod) chặn cả ở biên fixture và biên API, nên
  không có chỗ nào để runtime tự đoán múi giờ máy chủ.
- **Biên**: nộp đúng thời điểm hạn → đúng hạn; `now` đúng thời điểm hạn → chưa quá
  hạn (dùng `>`, không dùng `>=`).
- **Đã nộp thì không bao giờ là "Quá hạn"**: nộp trễ hiển thị `Đã nộp` cộng badge
  `Nộp trễ`.
- **Định dạng ngày**: `dd/mm/yyyy hh:mm` theo GMT+7 qua `Intl.DateTimeFormat` với
  `timeZone: "Asia/Ho_Chi_Minh"`, nên không phụ thuộc múi giờ máy chạy.
- **Thứ tự danh sách**: giữ nguyên thứ tự bảng trong đề. Sắp theo hạn nộp sẽ đảo
  A01/A02 so với đề.
- **Auth là giả lập**: mặc định đăng nhập S01. Đặt cookie `ielts_session=demo-s02`
  để xem dữ liệu S02 — dùng để chứng minh việc lọc chạy đúng, không phải tính năng
  đăng nhập.

## Phần chưa làm

- Không có đăng nhập thật, không có JWT/session ký, không có phân quyền theo vai trò.
- Không có database — dữ liệu là fixture trong bộ nhớ, đúng như đề cho phép.
- Không có chức năng nộp bài — chỉ đọc và hiển thị.
- Không có test E2E/trình duyệt tự động; phần UI được kiểm tra thủ công bằng ảnh
  chụp ở desktop, mobile và dark mode.
- Chưa có i18n; nhãn tiếng Việt viết trực tiếp trong code.
