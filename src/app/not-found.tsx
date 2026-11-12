import Link from "next/link";
import { FileQuestionIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center px-4 py-16 sm:px-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>Không tìm thấy trang này</EmptyTitle>
          <EmptyDescription>
            Đường dẫn không tồn tại hoặc đã đổi. Danh sách bài tập vẫn ở trang chủ.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Về bài tập của tôi</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
