"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import LoadingAnimation from "@/components/LoadingAnimation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"confirming" | "scraping" | "analyzing" | "generating" | "done" | "error">("confirming");
  const [error, setError] = useState("");

  const paymentKey = searchParams.get("paymentKey") || "";
  const orderId = searchParams.get("orderId") || "";
  const amount = searchParams.get("amount") || "";
  const username = searchParams.get("username") || "";

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setError("결제 정보가 올바르지 않습니다");
      return;
    }

    let cancelled = false;

    async function processPayment() {
      try {
        // 1. Confirm payment
        setStatus("confirming");
        const confirmRes = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
          }),
        });

        if (!confirmRes.ok) {
          const err = await confirmRes.json();
          throw new Error(err.error || "결제 승인 실패");
        }

        if (cancelled) return;

        // 2. Scrape posts
        setStatus("scraping");
        const scrapeRes = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, orderId }),
        });

        if (!scrapeRes.ok) {
          const err = await scrapeRes.json();
          throw new Error(err.error || "데이터 수집 실패");
        }

        if (cancelled) return;

        // 3. Analyze with AI
        setStatus("analyzing");
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error || "AI 분석 실패");
        }

        const { resultId } = await analyzeRes.json();

        if (cancelled) return;

        // 4. Done — redirect to result
        setStatus("done");
        router.push(`/result/${resultId}`);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
        );
      }
    }

    processPayment();
    return () => {
      cancelled = true;
    };
  }, [paymentKey, orderId, amount, username, router]);

  const messages: Record<string, string> = {
    confirming: "결제를 확인하고 있어요...",
    scraping: "인스타그램 게시물을 수집하고 있어요...",
    analyzing: "AI가 게시물을 분석하고 있어요...",
    generating: "우주를 생성하고 있어요...",
    done: "완성! 우주로 이동합니다...",
  };

  if (status === "error") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">
          오류가 발생했습니다
        </h1>
        <p className="mb-6 text-white/50">{error}</p>
        <a
          href={`/preview?username=${encodeURIComponent(username)}`}
          className="rounded-2xl bg-[#7c5bf5] px-8 py-3 font-medium text-white transition-all hover:bg-[#6d4de8]"
        >
          다시 시도하기
        </a>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <LoadingAnimation message={messages[status] || "처리 중..."} />
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-white/50">
          로딩 중...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
