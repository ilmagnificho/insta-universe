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

    // Animate progress bar
    const fill = fillRef.current;
    if (fill) {
      fill.offsetHeight; // force reflow
      fill.style.transition = 'width 4s ease-in-out';
      fill.style.width = '100%';
    }

    // Step messages
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

    // Generate mock data and navigate
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
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center" style={{ background: '#06081a' }}>
      <div
        className="overflow-hidden mb-4.5"
        style={{ width: 120, height: 1, background: 'rgba(255,255,255,.03)' }}
      >
        <div
          ref={fillRef}
          className="h-full"
          style={{
            width: 0,
            background: 'linear-gradient(90deg, rgba(155,124,201,.3), rgba(124,156,201,.3))',
          }}
        />
      </div>
      <p
        className="font-extralight text-center"
        style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)' }}
      >
        {message}
      </p>
    </div>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
          <p style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)', fontWeight: 200 }}>
            로딩 중...
          </p>
        </div>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
