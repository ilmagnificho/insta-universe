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
  const [errorState, setErrorState] = useState<{ error: string; detail?: string; code?: string } | null>(null);
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

          // API not configured - show setup instructions
          if (res.status === 503 || errData.errorCode === 'NO_API_TOKEN' || errData.error === 'API_NOT_CONFIGURED') {
            animateProgress(0, 0.3);
            setErrorState({
              error: 'Apify API 토큰이 설정되지 않았습니다',
              detail: errData.detail || '.env.local 파일에 APIFY_API_TOKEN을 추가해주세요.',
              code: 'NO_API_TOKEN',
            });
            return;
          }

          // Other scrape errors
          animateProgress(0, 0.3);
          setErrorState({
            error: errData.error || `서버 오류 (${res.status})`,
            detail: errData.detail,
            code: errData.errorCode,
          });
          return;
        }

        const { data } = await res.json();

        // Success!
        setMessage('우주가 완성되었어요!');
        setSubMessage(`${data.posts.length}개의 별을 발견했어요`);
        animateProgress(100, 0.5);

        storeMockData(data);
        setTimeout(() => {
          router.replace(`/reveal?username=${encodeURIComponent(username)}`);
        }, 1000);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('Scraping failed:', errorMsg);
        animateProgress(0, 0.3);
        setErrorState({
          error: '서버에 연결할 수 없습니다',
          detail: errorMsg,
        });
      }
    }

    tryRealScraping();
  }, [username, router]);

  const handleDemoMode = () => {
    const data = generateMockResult(username);
    storeMockData(data);
    router.replace(`/reveal?username=${encodeURIComponent(username)}`);
  };

  const handleRetry = () => {
    setErrorState(null);
    setMessage('다시 시도하고 있어요...');
    setSubMessage('');
    started.current = false;
    // Force re-run
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1038, #0c0818 70%)' }}>

      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-0 left-0 z-20 cursor-pointer"
        style={{
          padding: '16px 20px',
          fontSize: '.85rem', fontWeight: 300, color: 'rgba(248,244,255,.35)',
          background: 'none', border: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        &larr; 돌아가기
      </button>

      {/* Ambient glow */}
      <div className="absolute rounded-full"
        style={{
          width: 300, height: 300,
          background: errorState
            ? 'radial-gradient(circle, rgba(255,120,120,.1), transparent 70%)'
            : 'radial-gradient(circle, rgba(210,160,200,.15), transparent 70%)',
          filter: 'blur(60px)',
          animation: errorState ? 'none' : 'pulse 3s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 flex flex-col items-center" style={{ maxWidth: 340, width: '100%', padding: '0 24px' }}>
        <p className="font-brand italic mb-6"
          style={{ fontSize: '1.1rem', color: 'rgba(248,244,255,.5)', letterSpacing: '.06em' }}>
          @{username}
        </p>

        {/* Error state */}
        {errorState ? (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="w-full rounded-2xl" style={{
              padding: '20px',
              background: 'rgba(255,120,120,.04)',
              border: '1px solid rgba(255,120,120,.12)',
            }}>
              <p className="font-light text-center mb-2" style={{
                fontSize: '.95rem', color: 'rgba(255,150,150,.85)', lineHeight: 1.6,
              }}>
                {errorState.error}
              </p>
              {errorState.detail && (
                <p className="font-light text-center" style={{
                  fontSize: '.78rem', color: 'rgba(248,244,255,.35)', lineHeight: 1.6,
                }}>
                  {errorState.detail}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl cursor-pointer active:scale-[.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(210,160,200,.15), rgba(120,140,220,.12))',
                  border: '1px solid rgba(210,160,200,.15)',
                  fontSize: '.9rem', fontWeight: 300, color: 'rgba(248,244,255,.75)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                다시 시도
              </button>

              <button
                onClick={handleDemoMode}
                className="w-full py-3 rounded-xl cursor-pointer active:scale-[.98]"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.06)',
                  fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                샘플 데이터로 미리보기
              </button>
            </div>

            {errorState.code === 'NO_API_TOKEN' && (
              <div className="w-full rounded-xl" style={{
                padding: '16px',
                background: 'rgba(255,255,255,.02)',
                border: '1px solid rgba(255,255,255,.05)',
              }}>
                <p className="font-brand italic mb-2" style={{
                  fontSize: '.75rem', color: 'rgba(210,160,200,.5)', letterSpacing: '.04em',
                }}>
                  설정 방법
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    '1. apify.com 에서 회원가입',
                    '2. Settings → Integrations → API token 복사',
                    '3. .env.local 파일에 APIFY_API_TOKEN=토큰값 추가',
                    '4. 서버 재시작 (npm run dev)',
                  ].map((step, i) => (
                    <p key={i} style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(248,244,255,.3)', lineHeight: 1.5 }}>
                      {step}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Normal loading state
          <>
            <div className="overflow-hidden mb-6 w-full"
              style={{ maxWidth: 200, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.06)' }}>
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
          </>
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
