import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bài tập của tôi | IELTS Master",
  description: "Danh sách bài tập và trạng thái nộp bài của học viên.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
