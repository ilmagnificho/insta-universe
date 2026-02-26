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
  const [message, setMessage] = useState('Instagram에 연결하고 있어요...');
  const [subMessage, setSubMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const fill = fillRef.current;

    function animateProgress(targetPct: number, durationSec: number) {
      if (!fill) return;
      fill.offsetHeight;
      fill.style.transition = `width ${durationSec}s ease-in-out`;
      fill.style.width = `${targetPct}%`;
    }

    async function tryRealScraping() {
      try {
        // Single endpoint: Apify scrape + categorization (no Supabase needed)
        animateProgress(40, 90);
        setMessage('인스타그램 게시물을 수집하고 있어요...');
        setSubMessage('공개 게시물을 분석 중 (1~2분 소요)');

        const res = await fetch('/api/quick-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || `서버 오류 (${res.status})`);
        }

        const { data } = await res.json();

        // Success - store and navigate
        setMessage('우주가 완성되었어요!');
        setSubMessage(`${data.posts.length}개의 별을 발견했어요`);
        animateProgress(100, 0.5);

        storeMockData(data);
        setTimeout(() => {
          router.replace(`/reveal?username=${encodeURIComponent(username)}`);
        }, 1000);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('Real scraping failed:', errorMsg);

        // Fall back to demo data
        setSubMessage(`실제 데이터 로드 실패: ${errorMsg}`);
        setTimeout(() => {
          setMessage('샘플 데이터로 미리보기를 준비하고 있어요...');
          setSubMessage('');
          fallbackToMock();
        }, 2000);
      }
    }

    function fallbackToMock() {
      animateProgress(100, 3);
      const msgs = [
        'AI가 감정 패턴을 분석하고 있어요...',
        '당신만의 우주를 만들고 있어요...',
      ];
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < msgs.length) setMessage(msgs[idx]);
        idx++;
      }, 1200);

      setTimeout(() => {
        clearInterval(interval);
        const data = generateMockResult(username);
        storeMockData(data);
        router.replace(`/reveal?username=${encodeURIComponent(username)}`);
      }, 3500);
    }

    tryRealScraping();
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
          style={{ width: 200, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.06)' }}>
          <div ref={fillRef} className="h-full" style={{
            width: 0, borderRadius: 1,
            background: 'linear-gradient(90deg, rgba(210,160,200,.5), rgba(124,156,201,.5))',
          }} />
        </div>

        <p className="font-light text-center px-8" style={{
          fontSize: '0.95rem',
          color: 'rgba(248,244,255,.55)',
          transition: 'opacity .3s',
          maxWidth: 320,
          lineHeight: 1.6,
        }}>
          {message}
        </p>

        {subMessage && (
          <p className="mt-2 font-light text-center px-8" style={{
            fontSize: '0.75rem',
            color: 'rgba(248,244,255,.3)',
            maxWidth: 320,
          }}>
            {subMessage}
          </p>
        )}
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
