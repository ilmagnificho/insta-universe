"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function FailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const message = searchParams.get("message") || "결제가 취소되었거나 실패했습니다";
  const username = searchParams.get("username") || "";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-5xl">😢</div>
      <h1 className="mb-4 text-2xl font-bold text-white">
        결제에 실패했습니다
      </h1>
      <p className="mb-2 text-white/50">{message}</p>
      {code && <p className="mb-6 text-xs text-white/30">오류 코드: {code}</p>}

      <div className="flex gap-3">
        {username && (
          <a
            href={`/preview?username=${encodeURIComponent(username)}`}
            className="rounded-2xl bg-[#7c5bf5] px-8 py-3 font-medium text-white transition-all hover:bg-[#6d4de8]"
          >
            다시 시도하기
          </a>
        )}
        <a
          href="/"
          className="rounded-2xl border border-white/10 bg-white/5 px-8 py-3 font-medium text-white/70 transition-all hover:bg-white/10"
        >
          홈으로
        </a>
      </div>
    </main>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-white/50">
          로딩 중...
        </div>
      }
    >
      <FailContent />
    </Suspense>
  );
}
