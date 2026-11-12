import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Bài tập của tôi | IELTS Master",
  description: "Danh sách bài tập và trạng thái nộp bài của học viên.",
};

/**
 * Applies the OS colour preference before first paint, so the shadcn `.dark`
 * block is active without a flash of the light theme and without shipping a
 * theme-switching dependency.
 */
const THEME_SCRIPT = `if(window.matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
