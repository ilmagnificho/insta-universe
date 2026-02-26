"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useState } from "react";
import DemoUniverse from "@/components/DemoUniverse";

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get("username") || "";
  const [loading, setLoading] = useState(false);

  const handlePayment = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/payment/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error("결제 요청 실패");

      const { orderId, clientKey, amount } = await res.json();

      // Load Toss SDK and open payment widget
      const tossClientKey =
        clientKey || process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!tossClientKey) {
        throw new Error("결제 설정 오류");
      }

      // Dynamic import of Toss SDK
      const { loadTossPayments } = await import(
        "@tosspayments/tosspayments-sdk"
      );
      const tossPayments = await loadTossPayments(tossClientKey);
      const payment = tossPayments.payment({ customerKey: orderId });

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId,
        orderName: `${username}의 인스타 우주`,
        successUrl: `${window.location.origin}/payment/success?username=${encodeURIComponent(username)}`,
        failUrl: `${window.location.origin}/payment/fail?username=${encodeURIComponent(username)}`,
      });
    } catch (err) {
      console.error("Payment error:", err);
      alert("결제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [username, loading]);

  if (!username) {
    router.push("/");
    return null;
  }

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">
            @{username}의 우주 미리보기
          </h1>
          <p className="text-sm text-white/50">
            실제 데이터로 만든 우주는 더 아름답습니다
          </p>
        </div>

        {/* Demo Universe */}
        <div className="mb-8">
          <DemoUniverse blurred />
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7c5bf5] to-[#6d4de8] px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-[#7c5bf5]/25 transition-all hover:shadow-xl hover:shadow-[#7c5bf5]/30 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                처리 중...
              </>
            ) : (
              <>내 우주 만들기 - 4,900원</>
            )}
          </button>
          <p className="mt-3 text-xs text-white/30">
            결제 후 1-2분 내에 우주가 생성됩니다
          </p>
        </div>
      </div>
    </main>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-white/50">
          로딩 중...
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
