'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateMockResult, storeMockData } from '@/lib/mock-data';
import { Suspense } from 'react';

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const fillRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('게시물을 수집하고 있어요...');
  const generated = useRef(false);

  useEffect(() => {
    if (generated.current) return;
    generated.current = true;

    const fill = fillRef.current;
    if (fill) {
      fill.offsetHeight;
      fill.style.transition = 'width 4s ease-in-out';
      fill.style.width = '100%';
    }

    const msgs = [
      '게시물을 수집하고 있어요...',
      'AI가 감정 패턴을 분석하고 있어요...',
      '당신만의 우주를 만들고 있어요...',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < msgs.length) setMessage(msgs[idx]);
    }, 1300);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      const data = generateMockResult(username);
      storeMockData(data);
      router.replace(`/reveal?username=${encodeURIComponent(username)}`);
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [username, router]);

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1038, #0c0818 70%)' }}>

      {/* Ambient glow */}
      <div className="absolute rounded-full"
        style={{
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(210,160,200,.15), transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="font-brand italic mb-6"
          style={{ fontSize: '1.1rem', color: 'rgba(248,244,255,.5)', letterSpacing: '.06em' }}>
          @{username}
        </p>

        <div className="overflow-hidden mb-6"
          style={{ width: 160, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.06)' }}>
          <div ref={fillRef} className="h-full" style={{
            width: 0, borderRadius: 1,
            background: 'linear-gradient(90deg, rgba(210,160,200,.5), rgba(124,156,201,.5))',
          }} />
        </div>

        <p className="font-light text-center" style={{
          fontSize: '0.95rem',
          color: 'rgba(248,244,255,.55)',
          transition: 'opacity .3s',
        }}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c0818' }}>
          <p style={{ fontSize: '0.95rem', color: 'rgba(248,244,255,.45)', fontWeight: 300 }}>로딩 중...</p>
        </div>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
