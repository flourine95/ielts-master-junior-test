# Bài test Junior Full-Stack Developer, IELTS Master

Ứng dụng hiển thị danh sách bài tập của học viên S01. Trạng thái nộp bài tính theo
một mốc thời gian giả lập cố định, không dùng giờ thật.

- Giao diện: <http://localhost:3000/>
- API: <http://localhost:3000/api/assignments>

## Chạy

```bash
npm install
npm run dev        # http://localhost:3000
```

Bản production:

```bash
npm run build
npm start
```

Không cần biến môi trường, không cần service ngoài, không có bước migrate hay seed.
Node cần từ 22.12 trở lên (Vitest 5 không chạy trên Node 20). Mức này khai trong
`engines` và `.nvmrc`, nên `nvm use` là đủ.

`npm run build` có tải font từ Google Fonts lần đầu và cache vào `.next/`. Các lệnh
còn lại chạy offline sau `npm ci`.

## Kiểm tra

```bash
npm run verify     # lint + typecheck + test
```

Từng bước:

```bash
npm test           # 36 test
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --max-warnings=0
```

Kết quả trên máy tôi:

```
$ npm test

 RUN  v5.1.0 D:/Projects/ielts-master-junior-test

 Test Files  4 passed (4)
      Tests  36 passed (36)
   Duration  1.16s
```

Bốn file test chia theo tầng:

| File | Nội dung |
|---|---|
| `tests/status.test.ts` | Bốn trường hợp đề yêu cầu, cộng biên: nộp đúng hạn, `now` đúng hạn, lệch 1 ms, so sánh hai timestamp khác offset |
| `tests/assignment-service.test.ts` | Gọi đúng hàm mà page và API gọi. Có thêm ca `getAssignmentsForStudent("S02")` trả `["B01"]`, để chứng minh filter thật sự lọc chứ không trả rỗng |
| `tests/api-route.test.ts` | Gọi thẳng `GET()` của route handler, không mock. `?studentId=S02`, tên tham số khác, tham số lặp, cookie lạ, `__proto__`, `constructor` đều không đổi được học viên |
| `tests/assignment-filter.test.ts` | Bốn nút lọc chia đúng bốn dòng, không chồng không sót. A04 nộp trễ nằm trong "Đã nộp", khớp badge mà chính dòng đó hiển thị |

Kiểm tra API bằng tay:

```bash
curl http://localhost:3000/api/assignments
curl "http://localhost:3000/api/assignments?studentId=S02"
curl -H "Cookie: ielts_session=demo-s02" http://localhost:3000/api/assignments
```

Cả ba trả về A01 đến A04. S02 không xuất hiện trong bất kỳ response HTTP nào.

## Kết quả

Mốc giả lập: 11/11/2026 09:00 (GMT+7).

| ID | Bài | Hạn nộp | Đã nộp | Trạng thái |
|---|---|---|---|---|
| A01 | Foundation U1 – Reading | 13/11/2026 23:59 | – | Chưa nộp |
| A02 | Foundation U2 – Listening | 09/11/2026 23:59 | – | Quá hạn |
| A03 | Foundation U3 – Writing | 10/11/2026 23:59 | 10/11/2026 20:00 | Đã nộp |
| A04 | Foundation U4 – Speaking | 08/11/2026 23:59 | 10/11/2026 12:00 | Đã nộp + Nộp trễ |

B01 của S02 không có trong danh sách.

Ảnh giao diện: [desktop](docs/screenshot-desktop.png),
[mobile](docs/screenshot-mobile.png), [dark](docs/screenshot-dark.png).

Hai sơ đồ đọc được trong trình duyệt, có nút chạy thử luồng:

- [Đường đi của một request S01](.archify/architecture-s01-request-flow-20261112-124509/s01-request-flow.html)
- [Bốn trạng thái của một bài tập](.archify/lifecycle-status-20261112-124509/status-lifecycle.html)

## Không lộ dữ liệu S02

`getSession()` trong `src/lib/session.ts` trả hằng S01. Nó không đọc query, path,
body, header hay cookie. `?studentId=S02` không có tác dụng vì không có dòng code nào
đọc tham số đó, chứ không phải vì giá trị bị lọc bỏ.

Tôi có thử một bản có cookie `ielts_session` để chuyển được sang S02, và bỏ. Cookie
không ký thì ai đọc mã nguồn cũng đặt được, và người chấm sẽ nhận đúng payload của
S02 qua HTTP. Bộ lọc khi đó vẫn đúng, nhưng kết quả thì trái yêu cầu. S02 vì vậy chỉ
còn trong fixture và trong test của tầng service.

Ba lớp còn lại:

`getAssignmentsForStudent()` là chỗ duy nhất lọc theo `studentId`. Không component
nào tự `filter()` trên toàn bộ fixture, nên không có đường vòng thứ hai.

`AssignmentView` không có trường định danh, nên payload không dùng lại được để hỏi
học viên khác. Response được parse qua `assignmentsResponseSchema` trước khi trả.
Schema dùng `strictObject` chứ không phải `object`: mặc định của Zod là bỏ key lạ,
nên `studentId` lọt vào sẽ biến mất và trông như an toàn. Strict thì ném lỗi.

API đặt `Cache-Control: no-store`. Trang chủ là server component không đọc request,
nên Next prerender thành một HTML duy nhất. Nội dung đó giống nhau với mọi người vì
mọi người đều là S01.

## Cấu trúc

```
src/
  app/
    api/assignments/route.ts   GET, validate payload rồi trả JSON
    page.tsx                   Server component, resolve danh tính rồi truyền xuống
    assignment-list.tsx        Client: bốn nút lọc, bảng từ md, card dưới md
    status-cell.tsx            Badge trạng thái
    globals.css                Token shadcn + --success/--warning/--destructive-surface
  components/ui/               shadcn: badge, card, table, empty, separator
  lib/
    schema.ts                  Zod: instant, assignment, view, response
    assignments.ts             Fixture, parse qua schema khi import
    status.ts                  getStatus(), hàm thuần nhận now làm tham số
    assignment-service.ts      Chỗ duy nhất lọc theo studentId
    session.ts                 Trả hằng S01
    instant.ts                 Parse và format timestamp theo GMT+7
    now.ts                     SIMULATED_NOW = 2026-11-11T09:00:00+07:00
tests/
  status.test.ts
  assignment-service.test.ts
  api-route.test.ts
```

## Quyết định

Dữ liệu là fixture trong bộ nhớ. Đề ghi rõ không cần database và cho phép chuyển
bảng thành JSON/TypeScript, nên không có migrate, không có file DB phải copy, và luật
trạng thái nằm gọn trong một hàm đọc được bằng mắt. Tôi có thử `node:sqlite` ở một
nhánh riêng rồi bỏ: nó thêm một tầng runtime và đòi Node mới hơn, mà không đổi dòng
logic nào.

Không Prisma: một bảng, hai câu query, không migration, không quan hệ. Prisma thêm
bước generate trong `postinstall` và một schema DSL thứ hai phải đồng bộ với
TypeScript.

Không React Query: không có client-side fetching nào. Trang render xong trước khi
HTML tới browser. Nếu sau này thêm chức năng nộp bài, `app/api/assignments` đã là
endpoint sẵn cho nó.

Không có CI. Tài khoản GitHub của tôi đang bị khoá Actions vì billing, một workflow
sẽ đỏ ở mọi commit và báo sai là test hỏng. `npm run verify` gói đủ ba bước.

## Quy ước

Mốc thời gian là hằng `SIMULATED_NOW_ISO` trong `src/lib/now.ts`. Không có
`new Date()` trong logic trạng thái; `now` được truyền vào `getStatus()`.

Mọi timestamp đổi sang epoch ms qua `parseInstant()`. Chuỗi phải có offset tường
minh, `instantSchema` chặn ở cả biên fixture lẫn biên API, nên không chỗ nào để
runtime tự đoán múi giờ máy chủ.

Nộp đúng thời điểm hạn tính là đúng hạn. `now` đúng thời điểm hạn chưa tính là quá
hạn, vì so sánh dùng `>` chứ không dùng `>=`.

Đã nộp thì không bao giờ hiện "Quá hạn". Nộp trễ hiện "Đã nộp" kèm badge "Nộp trễ".

Ngày format `dd/mm/yyyy hh:mm` theo GMT+7 qua `Intl.DateTimeFormat` với
`timeZone: "Asia/Ho_Chi_Minh"`, không phụ thuộc múi giờ máy chạy.

Thứ tự danh sách giữ nguyên như bảng trong đề. Sắp theo hạn nộp sẽ đảo A01 với A02.

Font là Be Vietnam Pro, không phải Geist: nội dung tiếng Việt, và Geist vẽ dấu chồng
(ệ, ữ, ộ) bằng outline dự phòng nên chiều cao dấu không đều.

## Chưa làm

- Không có đăng nhập thật, không có JWT hay session ký, không phân quyền.
- Không có database.
- Không có chức năng nộp bài, chỉ đọc và hiển thị.
- Không có test E2E. Phần UI kiểm bằng ảnh chụp ở desktop, mobile và dark mode.
- Không xem được giao diện bằng tài khoản khác. S02 chỉ kiểm chứng ở tầng service.
- Chưa có i18n, nhãn tiếng Việt viết trực tiếp trong code.

## Tương phản màu

Đo theo công thức WCAG 2.1 trên token OKLCH, ngưỡng AA cho chữ thường là 4.5:1.

| Badge | Sáng | Tối |
|---|---|---|
| Chưa nộp | 4.57:1 | 8.89:1 |
| Quá hạn | 5.15:1 | 5.18:1 |
| Đã nộp, Nộp trễ | 4.65:1 | 7.85:1 |

Badge "Quá hạn" ban đầu dùng `bg-destructive/10` và đo được 4.11:1. Đổi sang token
`--destructive-surface` đục để màu nền không phụ thuộc màu bên dưới. Sau đó
`impeccable detect` vẫn báo 4.45:1 trên nền mới, nên hạ `--destructive` từ
`oklch(0.577 0.245 27.325)` xuống `oklch(0.55 0.235 27.325)`. Lần đo cuối: detector
không còn finding nào ở 1280x800 và 390x844.
