'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    const cleaned = username.trim().replace(/^@/, '');
    if (!cleaned) {
      setError('인스타그램 아이디를 입력해주세요');
      return;
    }
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
      setError('올바른 인스타그램 아이디를 입력해주세요');
      return;
    }
    router.push(`/loading?username=${encodeURIComponent(cleaned)}`);
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 35%, #0e1030, #06081a 75%)' }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            background: 'radial-gradient(circle, #9b7cc9, transparent)',
            top: '8%', left: '-10%',
            filter: 'blur(90px)', opacity: 0.1,
            animation: 'orbFloat 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 240, height: 240,
            background: 'radial-gradient(circle, #7c9cc9, transparent)',
            bottom: '12%', right: '-8%',
            filter: 'blur(90px)', opacity: 0.1,
            animation: 'orbFloat 12s 3s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full">
        <h1
          className="font-brand font-light italic tracking-widest"
          style={{
            fontSize: 'clamp(1.8rem, 6.5vw, 3rem)',
            color: 'rgba(240, 237, 246, .75)',
            animation: 'fadeUp .9s .1s both',
          }}
        >
          Insta Universe
        </h1>

        <p
          className="font-extralight text-xs mt-2"
          style={{
            color: 'rgba(240, 237, 246, .28)',
            letterSpacing: '.02em',
            animation: 'fadeUp .9s .3s both',
          }}
        >
          내 인스타그램이 우주가 됩니다
        </p>

        <div
          className="mt-9 w-full flex flex-col gap-2.5"
          style={{ maxWidth: 300, animation: 'fadeUp .9s .5s both' }}
        >
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 font-brand"
              style={{ fontSize: '.95rem', color: 'rgba(240, 237, 246, .12)' }}
            >
              @
            </span>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="인스타그램 아이디"
              autoComplete="off"
              spellCheck={false}
              className="w-full py-3.5 pl-8 pr-3.5 rounded-[10px] outline-none transition-all font-light"
              style={{
                background: 'rgba(255,255,255,.018)',
                border: '1px solid rgba(255,255,255,.04)',
                fontSize: '.84rem',
                color: '#f0edf6',
                WebkitAppearance: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(155,124,201,.2)';
                e.target.style.boxShadow = '0 0 30px rgba(155,124,201,.04)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,.04)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <p className="text-center" style={{ fontSize: '.7rem', color: 'rgba(255,120,120,.6)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="py-3.5 rounded-[10px] font-light cursor-pointer transition-all active:scale-[0.98]"
            style={{
              background: 'rgba(155,124,201,.07)',
              border: '1px solid rgba(155,124,201,.08)',
              fontSize: '.82rem',
              color: 'rgba(240,237,246,.55)',
              letterSpacing: '.02em',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            나의 우주 만들기
          </button>
        </div>

        <p
          className="mt-3 text-center leading-relaxed"
          style={{
            fontSize: '.58rem',
            fontWeight: 200,
            color: 'rgba(240,237,246,.12)',
            animation: 'fadeUp .9s .6s both',
          }}
        >
          공개 계정의 게시물을 AI가 분석하여<br />나만의 우주를 만들어 드려요
        </p>
      </div>
    </div>
  );
}
