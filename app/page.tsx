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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(155,124,201,.35), transparent 70%)',
            top: '5%', left: '-15%',
            filter: 'blur(80px)',
            animation: 'orbFloat 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 350, height: 350,
            background: 'radial-gradient(circle, rgba(100,170,235,.25), transparent 70%)',
            bottom: '8%', right: '-12%',
            filter: 'blur(80px)',
            animation: 'orbFloat 12s 3s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full" style={{ maxWidth: 380 }}>
        <h1
          className="font-brand font-light italic"
          style={{
            fontSize: 'clamp(2.2rem, 8vw, 3.4rem)',
            color: 'rgba(240, 237, 246, .92)',
            letterSpacing: '.08em',
            animation: 'fadeUp .9s .1s both',
          }}
        >
          Insta Universe
        </h1>

        <p
          className="mt-3 font-light"
          style={{
            fontSize: '0.95rem',
            color: 'rgba(240, 237, 246, .5)',
            letterSpacing: '.03em',
            animation: 'fadeUp .9s .3s both',
          }}
        >
          내 인스타그램이 우주가 됩니다
        </p>

        <div
          className="mt-12 w-full flex flex-col gap-3"
          style={{ animation: 'fadeUp .9s .5s both' }}
        >
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-brand"
              style={{ fontSize: '1rem', color: 'rgba(240, 237, 246, .25)' }}
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
              className="w-full py-4 pl-10 pr-4 rounded-xl outline-none transition-all font-light"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                fontSize: '1rem',
                color: '#f0edf6',
                WebkitAppearance: 'none',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(155,124,201,.35)';
                e.target.style.boxShadow = '0 0 40px rgba(155,124,201,.08)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255,255,255,.08)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <p className="text-center" style={{ fontSize: '.85rem', color: 'rgba(255,120,120,.75)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="py-4 rounded-xl font-light cursor-pointer transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(155,124,201,.25), rgba(120,140,210,.2))',
              border: '1px solid rgba(155,124,201,.2)',
              fontSize: '1rem',
              color: 'rgba(240,237,246,.85)',
              letterSpacing: '.03em',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            나의 우주 만들기
          </button>
        </div>

        <p
          className="mt-8 text-center leading-relaxed"
          style={{
            fontSize: '.82rem',
            fontWeight: 300,
            color: 'rgba(240,237,246,.35)',
            animation: 'fadeUp .9s .6s both',
          }}
        >
          공개 계정의 게시물을 AI가 분석하여<br />나만의 우주를 만들어 드려요
        </p>
      </div>
    </div>
  );
}
