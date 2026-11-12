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
JSON/TypeScript", nên dữ liệu là fixture trong bộ nhớ. Đổi lại, không có bước
migrate/seed, không có file DB phải copy, và toàn bộ luật trạng thái nằm trong một
hàm thuần đọc được bằng mắt.

`node:sqlite` từng được thử (nhánh `with-db`, đã xoá) rồi bỏ: nó thêm một tầng
runtime — và một yêu cầu Node mới hơn — mà không đổi một dòng logic trạng thái hay
một pixel giao diện nào.

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

Yêu cầu Node **22.12+ (hoặc 24, hoặc ≥26)** — mức thấp nhất mà Vitest 5 hỗ trợ,
khai báo ở `engines` và ghim ở `.nvmrc`:

```bash
nvm use            # đọc .nvmrc
```

## Cách kiểm tra

```bash
npm run verify     # lint + typecheck + toàn bộ test, một lệnh
```

Hoặc từng bước:

```bash
npm test           # 32 test: logic trạng thái, lọc S01, hợp đồng API
npm run typecheck  # tsc --noEmit
npm run lint       # eslint --max-warnings=0
```

Kết quả test thực tế:

```
$ npm test

 RUN  v5.1.0 D:/Projects/ielts-master-junior-test

 Test Files  3 passed (3)
      Tests  32 passed (32)
   Duration  464ms
```

Không có CI trên GitHub: tài khoản chủ repo đang bị khoá Actions vì billing, nên một
workflow sẽ đỏ ở mọi commit và gây hiểu nhầm là test hỏng. Thay vào đó `npm run verify`
gói đúng ba bước trên thành một lệnh.

Ngoại lệ duy nhất về mạng: `npm run build` tải font Geist qua `next/font/google`
và cache vào `.next/`. `npm run dev`, `lint`, `typecheck` và `test` không cần mạng
sau `npm ci`.

| File | Nội dung |
|---|---|
| `tests/status.test.ts` | 4 trường hợp bắt buộc, biên (nộp đúng hạn, `now` đúng hạn, lệch 1 ms), so sánh khác offset, `instantSchema` chặn timestamp thiếu offset |
| `tests/assignment-service.test.ts` | Gọi đúng hàm mà page và API gọi: A01–A04, B01 vắng mặt trong cả mảng lẫn JSON, S02 chỉ thấy B01, học viên lạ nhận mảng rỗng, format GMT+7, đổi `now` thì chỉ trạng thái đổi, response khớp schema, fixture reject timestamp thiếu offset |
| `tests/api-route.test.ts` | Gọi thẳng `GET()` của route handler, không mock: `?studentId=S02` (và các biến thể tên/tham số lặp) vẫn trả đúng A01–A04, cookie `demo-s02`/`__proto__`/`constructor` cũng không đổi được học viên, payload không chứa `studentId`/`B01`, header `no-store` |

Kiểm tra API bằng tay:

```bash
curl http://localhost:3000/api/assignments
# S01: A01..A04, không có B01

curl "http://localhost:3000/api/assignments?studentId=S02"
# vẫn trả A01..A04 — tham số bị bỏ qua hoàn toàn

curl -H "Cookie: ielts_session=demo-s02" http://localhost:3000/api/assignments
# vẫn trả A01..A04 — danh tính không đến từ cookie

curl -H "Cookie: ielts_session=__proto__" http://localhost:3000/api/assignments
# vẫn trả A01..A04, HTTP 200
```

Dữ liệu S02 chỉ xuất hiện trong test của tầng service
(`getAssignmentsForStudent("S02")` → `["B01"]`), nơi chứng minh bộ lọc không phải
no-op. Không có request HTTP nào chạm tới nó.

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
    page.tsx                   Server component: bảng (≥md) + card (<md)
    status-cell.tsx            Badge trạng thái
    globals.css                Token màu shadcn + --success/--warning/--destructive-surface
  components/ui/               shadcn: badge, card, table, empty, separator
  lib/
    schema.ts                  Zod: instant, assignment, view, response
    assignments.ts             Fixture A01–A04 + B01, parse qua schema khi import
    status.ts                  getStatus() — thuần, nhận `now` làm tham số
    assignment-service.ts      Nơi duy nhất lọc theo studentId
    session.ts                 Danh tính cố định S01, resolve ở server
    instant.ts                 Parse/format timestamp, luôn theo GMT+7
    now.ts                     SIMULATED_NOW = 2026-11-11T09:00:00+07:00
tests/
  status.test.ts               Logic trạng thái + biên
  assignment-service.test.ts   Cô lập dữ liệu + integrity của fixture
  api-route.test.ts            Hợp đồng HTTP: không đầu vào nào đổi được học viên
```

## Cách tránh lộ dữ liệu S02

1. **Không có `studentId` nào đến từ client.** Route handler và page đều không đọc
   query string, body hay path param. `?studentId=S02` bị bỏ qua hoàn toàn.
2. **Định danh chỉ tồn tại ở server** (`src/lib/session.ts`): `getSession()` trả
   hằng `S01`, không đọc cookie, header hay bất kỳ đầu vào nào của request. Đây là
   cách đọc chặt nhất của yêu cầu "không lấy studentId từ URL làm xác thực": không
   chỉ URL, mà *không đầu vào nào* chọn được học viên.
   **Vì sao không có nút "đăng nhập S02":** một demo account chọn bằng cookie
   không ký thì ai đọc mã nguồn cũng đặt được `ielts_session=demo-s02`, và người
   chấm sẽ thấy đúng thứ đề cấm — payload của S02 trả về qua HTTP. Bộ lọc vẫn đúng,
   nhưng kết quả thì sai. S02 vì thế chỉ còn trong fixture và trong test của tầng
   service, đủ để chứng minh `filter` không phải no-op.
   Trong sản phẩm thật, `getSession()` sẽ xác thực session/JWT đã ký và trả
   `subject`; các call site không đổi — đó là lý do nó là một hàm `async` duy nhất.
3. **Lọc ở đúng một chỗ** — `getAssignmentsForStudent()`. Không component nào tự
   `filter()` trên toàn bộ fixture, nên không có đường vòng thứ hai.
4. **Response không chứa `studentId`.** `AssignmentView` là kiểu riêng, không mang
   trường định danh, nên payload không thể bị dùng lại để hỏi học viên khác.
5. **Zod `strictObject` kiểm tra shape của response** trước khi trả về
   (`assignmentsResponseSchema.parse`). Dùng `strictObject` chứ không phải `object`
   là có chủ ý: mặc định của Zod là **bỏ** key lạ, nên một `studentId` vô tình lọt
   vào payload sẽ biến mất êm ái — trông như an toàn. Ở chế độ strict, cùng lỗi đó
   **ném exception**, nên nó lộ ra trong response và trong test
   (`tests/assignment-service.test.ts`, ca "rejects a leaked studentId").
6. **Có test khẳng định** `B01` vắng mặt trong cả danh sách lẫn chuỗi JSON, nên nếu ai
   đó sửa hỏng bước lọc thì test đỏ ngay.
7. **Không có cache dùng chung nào giữ được dữ liệu riêng:** API đặt
   `Cache-Control: no-store`; trang chủ là server component không đọc request nên
   Next prerender nó thành một HTML duy nhất — nội dung đó giống nhau cho mọi
   người, vì mọi người đều là S01.

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
- **Auth là giả lập**: `getSession()` luôn trả S01. Không có đăng nhập, không có
  cookie, không có tham số nào đổi được điều đó — xem mục "Cách tránh lộ dữ liệu
  S02".

## Phần chưa làm

- Không có đăng nhập thật, không có JWT/session ký, không có phân quyền theo vai trò.
- Không có database — dữ liệu là fixture trong bộ nhớ, đúng như đề cho phép.
- Không có chức năng nộp bài — chỉ đọc và hiển thị.
- Không có test E2E/trình duyệt tự động; phần UI được kiểm tra thủ công bằng ảnh
  chụp ở desktop, mobile và dark mode (`docs/screenshot-*.png`).
- Không có đăng nhập/đăng xuất: danh tính là hằng S01 ở server, nên không có
  cách nào xem giao diện bằng tài khoản khác — S02 chỉ kiểm chứng được ở tầng
  service.
- Tương phản màu được tính tay (xem bảng dưới), không có axe/Lighthouse trong CI.
- Chưa có i18n; nhãn tiếng Việt viết trực tiếp trong code.

## Tương phản màu

Đo bằng công thức WCAG 2.1 trên các token OKLCH trong `globals.css` (ngưỡng AA cho
chữ thường: 4.5:1).

| Badge | Sáng | Tối |
|---|---|---|
| Chưa nộp (warning trên warning-surface) | 4.57:1 | 8.89:1 |
| Quá hạn (destructive trên destructive-surface) | 4.62:1 | 5.18:1 |
| Đã nộp / Nộp trễ (success trên success-surface) | 4.65:1 | 7.85:1 |

Bản đầu dùng `bg-destructive/10` cho badge "Quá hạn", đo được 4.11:1 — dưới ngưỡng.
Đổi sang token `--destructive-surface` đục (không alpha) để màu nền không phụ thuộc
màu bên dưới nó.
