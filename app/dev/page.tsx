"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "starting" | "scraping" | "analyzing" | "done" | "error";

const STATUS_MESSAGES: Record<Status, string> = {
  idle: "",
  starting: "테스트 세션 생성 중...",
  scraping: "인스타그램 게시물 수집 중... (1~2분 소요)",
  analyzing: "AI 분석 중...",
  done: "완료! 결과 페이지로 이동합니다...",
  error: "",
};

export default function DevTestPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleTest = async () => {
    if (!username.trim() || status !== "idle") return;
    const cleanUsername = username.replace("@", "").trim();

    setError("");
    setLog([]);

    try {
      // 1. Create dev session
      setStatus("starting");
      addLog("테스트 결제 레코드 생성 중...");
      const startRes = await fetch("/api/dev/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername }),
      });

      if (!startRes.ok) {
        const err = await startRes.json();
        throw new Error(err.error || "세션 생성 실패");
      }

      const { orderId } = await startRes.json();
      addLog(`orderId: ${orderId}`);

      // 2. Scrape
      setStatus("scraping");
      addLog("Apify 크롤링 시작...");
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: cleanUsername, orderId }),
      });

      if (!scrapeRes.ok) {
        const err = await scrapeRes.json();
        throw new Error(err.error || "크롤링 실패");
      }

      const scrapeData = await scrapeRes.json();
      addLog(`게시물 ${scrapeData.postCount}개 수집 완료`);

      // 3. Analyze
      setStatus("analyzing");
      addLog("Claude AI 분석 시작...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "분석 실패");
      }

      const { resultId } = await analyzeRes.json();
      addLog(`분석 완료! resultId: ${resultId}`);

      // 4. Done
      setStatus("done");
      setTimeout(() => router.push(`/result/${resultId}`), 1000);
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(msg);
      addLog(`오류: ${msg}`);
    }
  };

  const isRunning = !["idle", "error"].includes(status);

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-2 inline-block rounded bg-yellow-500/20 px-2 py-1 text-xs font-medium text-yellow-400">
          DEV MODE
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">
          결제 없이 테스트
        </h1>
        <p className="mb-8 text-sm text-white/50">
          Apify 크롤링 + Claude AI 분석을 결제 없이 실행합니다
        </p>

        {/* Input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="인스타그램 아이디 (공개 계정)"
            disabled={isRunning}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-[#7c5bf5] focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => e.key === "Enter" && handleTest()}
          />
          <button
            onClick={handleTest}
            disabled={isRunning || !username.trim()}
            className="rounded-xl bg-[#7c5bf5] px-6 py-3 font-medium text-white transition-all hover:bg-[#6d4de8] disabled:opacity-50"
          >
            {isRunning ? "실행 중..." : "테스트"}
          </button>
        </div>

        {/* Status */}
        {status !== "idle" && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
            {status === "error" ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#7c5bf5]" />
                <span className="text-white">{STATUS_MESSAGES[status]}</span>
              </div>
            )}
          </div>
        )}

        {/* Error retry */}
        {status === "error" && (
          <button
            onClick={() => setStatus("idle")}
            className="mb-4 text-sm text-[#7c5bf5] hover:underline"
          >
            다시 시도
          </button>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="mb-2 text-xs font-medium text-white/40">LOG</div>
            <div className="space-y-1 font-mono text-xs text-white/60">
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
