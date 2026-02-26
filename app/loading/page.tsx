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
  const [message, setMessage] = useState('세션을 준비하고 있어요...');
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
        // 1. Create dev session (works when DEV_SKIP_PAYMENT=true)
        animateProgress(15, 0.8);

        const startRes = await fetch('/api/dev/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (!startRes.ok) throw new Error('Dev mode unavailable');
        const { orderId } = await startRes.json();

        // 2. Scrape Instagram posts
        setMessage('인스타그램 게시물을 수집하고 있어요...');
        animateProgress(50, 60);

        const scrapeRes = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, orderId }),
        });

        if (!scrapeRes.ok) {
          const err = await scrapeRes.json();
          throw new Error(err.error || 'Scraping failed');
        }

        const scrapeData = await scrapeRes.json();

        // 3. Analyze with AI
        setMessage(`${scrapeData.postCount}개의 게시물을 AI가 분석하고 있어요...`);
        animateProgress(85, 30);

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });

        if (!analyzeRes.ok) throw new Error('Analysis failed');
        const { resultId } = await analyzeRes.json();

        // 4. Done
        setMessage('우주가 완성되었어요!');
        animateProgress(100, 0.5);
        setTimeout(() => router.replace(`/result/${resultId}`), 800);
      } catch {
        // Fall back to mock data
        fallbackToMock();
      }
    }

    function fallbackToMock() {
      const msgs = [
        '게시물을 수집하고 있어요...',
        'AI가 감정 패턴을 분석하고 있어요...',
        '당신만의 우주를 만들고 있어요...',
      ];
      setMessage(msgs[0]);
      animateProgress(100, 4);
      let idx = 0;

      const interval = setInterval(() => {
        idx++;
        if (idx < msgs.length) setMessage(msgs[idx]);
      }, 1300);

      setTimeout(() => {
        clearInterval(interval);
        const data = generateMockResult(username);
        storeMockData(data);
        router.replace(`/reveal?username=${encodeURIComponent(username)}`);
      }, 4200);
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
