"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = username.trim().replace(/^@/, "");
    if (!cleaned) {
      setError("인스타그램 아이디를 입력해주세요");
      return;
    }
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
      setError("올바른 인스타그램 아이디를 입력해주세요");
      return;
    }
    router.push(`/preview?username=${encodeURIComponent(cleaned)}`);
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      {/* Background decorative stars */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-white"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.4,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 5}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo / Title */}
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#7c5bf5] via-[#a78bfa] to-[#4fc3f7] bg-clip-text text-transparent">
              Insta Universe
            </span>
          </h1>
          <p className="text-lg text-white/60">
            내 인스타그램으로 우주를 만든다
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="인스타그램 아이디 입력"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-10 pr-4 text-center text-lg text-white placeholder-white/30 outline-none transition-all focus:border-[#7c5bf5]/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#7c5bf5]/20"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-[#7c5bf5] to-[#6d4de8] py-4 text-lg font-semibold text-white shadow-lg shadow-[#7c5bf5]/25 transition-all hover:shadow-xl hover:shadow-[#7c5bf5]/30 active:scale-[0.98]"
          >
            우주 만들기
          </button>
        </form>

        {/* Description */}
        <div className="mt-12 space-y-3 text-sm text-white/40">
          <p>공개 계정의 게시물을 AI로 분석하여</p>
          <p>나만의 우주 비주얼을 만들어 드립니다</p>
        </div>
      </div>
    </main>
  );
}
