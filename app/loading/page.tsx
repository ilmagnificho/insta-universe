'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateMockResult, storeMockData } from '@/lib/mock-data';

// ===== Constellation Canvas - stars appearing one by one =====
function ConstellationCanvas({ phase, starCount }: { phase: number; starCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h * 0.38;

    // Background stars (always present)
    interface BgStar { x: number; y: number; r: number; a: number; sp: number; ph: number }
    const bgStars: BgStar[] = [];
    for (let i = 0; i < 200; i++) {
      bgStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 0.6 + 0.1,
        a: Math.random() * 0.3 + 0.05,
        sp: Math.random() * 0.003 + 0.001,
        ph: Math.random() * Math.PI * 2,
      });
    }

    // Constellation stars (appear as scraping progresses)
    interface CStar {
      x: number; y: number; targetR: number; currentR: number;
      cr: number; cg: number; cb: number; born: number;
      orbitAngle: number; orbitR: number; orbitSpeed: number;
    }
    const cStars: CStar[] = [];
    const colors = [
      [130, 200, 255], [255, 200, 130], [200, 158, 240],
      [255, 142, 184], [120, 232, 196], [138, 180, 255],
      [168, 128, 240], [255, 184, 138],
    ];

    function addStar() {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 100;
      const c = colors[Math.floor(Math.random() * colors.length)];
      cStars.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.7,
        targetR: 1.5 + Math.random() * 3,
        currentR: 0,
        cr: c[0], cg: c[1], cb: c[2],
        born: performance.now(),
        orbitAngle: angle,
        orbitR: dist,
        orbitSpeed: (Math.random() - 0.5) * 0.0003,
      });
    }

    let lastStarCount = 0;
    let animId: number;

    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Add new stars based on phase progression
      const targetStars = phase >= 3 ? Math.min(starCount, 50) : phase * 5;
      while (cStars.length < targetStars && cStars.length < 50) {
        addStar();
      }

      // Background gradient
      const bg = ctx!.createRadialGradient(cx, cy, 0, cx, cy, w * 0.6);
      bg.addColorStop(0, 'rgba(26, 16, 56, 0.4)');
      bg.addColorStop(1, 'transparent');
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // Background stars
      bgStars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(200,190,230,${s.a * tw})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Central nebula glow (grows with phase)
      const nebulaSize = 60 + phase * 30;
      const nebulaAlpha = 0.05 + phase * 0.02;
      const ng = ctx!.createRadialGradient(cx, cy, 0, cx, cy, nebulaSize);
      ng.addColorStop(0, `rgba(210,160,200,${nebulaAlpha})`);
      ng.addColorStop(0.5, `rgba(130,160,220,${nebulaAlpha * 0.5})`);
      ng.addColorStop(1, 'transparent');
      ctx!.fillStyle = ng;
      ctx!.beginPath();
      ctx!.arc(cx, cy, nebulaSize, 0, Math.PI * 2);
      ctx!.fill();

      // Constellation stars
      cStars.forEach((s, i) => {
        const age = (t - s.born) / 1000;
        s.currentR = Math.min(s.targetR, s.targetR * Math.min(age * 2, 1));
        s.orbitAngle += s.orbitSpeed;
        const sx = cx + Math.cos(s.orbitAngle) * s.orbitR;
        const sy = cy + Math.sin(s.orbitAngle) * s.orbitR * 0.7;

        const tw = 0.6 + 0.4 * Math.sin(t * 0.003 + i * 1.5);
        const r = s.currentR;

        // Glow
        const g = ctx!.createRadialGradient(sx, sy, 0, sx, sy, r * 6);
        g.addColorStop(0, `rgba(${s.cr},${s.cg},${s.cb},${tw * 0.2})`);
        g.addColorStop(0.5, `rgba(${s.cr},${s.cg},${s.cb},${tw * 0.05})`);
        g.addColorStop(1, 'transparent');
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r * 6, 0, Math.PI * 2);
        ctx!.fill();

        // Core
        ctx!.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r * 0.5, 0, Math.PI * 2);
        ctx!.fill();

        // Connect nearby stars with constellation lines
        if (i > 0) {
          const prev = cStars[i - 1];
          const px = cx + Math.cos(prev.orbitAngle) * prev.orbitR;
          const py = cy + Math.sin(prev.orbitAngle) * prev.orbitR * 0.7;
          const dist = Math.hypot(sx - px, sy - py);
          if (dist < 120) {
            ctx!.strokeStyle = `rgba(${s.cr},${s.cg},${s.cb},${tw * 0.06})`;
            ctx!.lineWidth = 0.4;
            ctx!.beginPath();
            ctx!.moveTo(sx, sy);
            ctx!.lineTo(px, py);
            ctx!.stroke();
          }
        }
      });

      // Birth flash effect for new stars
      if (cStars.length > lastStarCount) {
        const newest = cStars[cStars.length - 1];
        const nx = cx + Math.cos(newest.orbitAngle) * newest.orbitR;
        const ny = cy + Math.sin(newest.orbitAngle) * newest.orbitR * 0.7;
        const fg = ctx!.createRadialGradient(nx, ny, 0, nx, ny, 30);
        fg.addColorStop(0, `rgba(255,255,255,0.3)`);
        fg.addColorStop(1, 'transparent');
        ctx!.fillStyle = fg;
        ctx!.beginPath();
        ctx!.arc(nx, ny, 30, 0, Math.PI * 2);
        ctx!.fill();
        lastStarCount = cStars.length;
      }
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [phase, starCount]);

  return <canvas ref={canvasRef} className="fixed inset-0" />;
}

// ===== Phase indicator =====
const PHASES = [
  { label: 'Instagram 연결', icon: '1' },
  { label: '게시물 수집', icon: '2' },
  { label: '별 생성', icon: '3' },
  { label: '우주 구축', icon: '4' },
];

function PhaseIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6" style={{ maxWidth: 280 }}>
      {PHASES.map((p, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="rounded-full flex items-center justify-center" style={{
              width: 24, height: 24,
              background: i <= current
                ? 'linear-gradient(135deg, rgba(210,160,200,.35), rgba(120,140,220,.3))'
                : 'rgba(255,255,255,.04)',
              border: i === current
                ? '1px solid rgba(210,160,200,.4)'
                : i < current
                  ? '1px solid rgba(210,160,200,.15)'
                  : '1px solid rgba(255,255,255,.06)',
              transition: 'all .5s',
              boxShadow: i === current ? '0 0 12px rgba(210,160,200,.25)' : 'none',
            }}>
              {i < current ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="rgba(210,160,200,.8)" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              ) : (
                <span style={{
                  fontSize: '.6rem', fontWeight: 400,
                  color: i === current ? 'rgba(210,160,200,.8)' : 'rgba(248,244,255,.2)',
                }}>
                  {p.icon}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '.58rem', fontWeight: 300,
              color: i <= current ? 'rgba(248,244,255,.45)' : 'rgba(248,244,255,.15)',
              whiteSpace: 'nowrap',
              transition: 'color .5s',
            }}>
              {p.label}
            </span>
          </div>
          {i < PHASES.length - 1 && (
            <div style={{
              width: '100%', height: 1, marginTop: -12,
              background: i < current
                ? 'linear-gradient(to right, rgba(210,160,200,.2), rgba(210,160,200,.1))'
                : 'rgba(255,255,255,.04)',
              transition: 'background .5s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ===== Rotating tips =====
const TIPS = [
  '인스타그램의 공개 게시물을 안전하게 수집하고 있어요',
  '게시물의 캡션과 해시태그를 분석하고 있어요',
  '비슷한 주제의 게시물들을 같은 별자리로 묶고 있어요',
  '당신만의 우주 색깔을 결정하고 있어요',
  '각 별에 AI 인사이트를 부여하고 있어요',
  '게시물의 시간대 패턴을 분석하고 있어요',
  '감정과 성격 키워드를 추출하고 있어요',
];

function RotatingTip() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(prev => (prev + 1) % TIPS.length);
        setFade(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p style={{
      fontSize: '.75rem', fontWeight: 300,
      color: 'rgba(248,244,255,.3)',
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 1.6,
      opacity: fade ? 1 : 0,
      transition: 'opacity .4s',
      minHeight: 36,
    }}>
      {TIPS[idx]}
    </p>
  );
}

// ===== Main Loading Content =====
function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const [phase, setPhase] = useState(0);
  const [message, setMessage] = useState('Instagram에 연결하고 있어요...');
  const [starCount, setStarCount] = useState(0);
  const [errorState, setErrorState] = useState<{ error: string; detail?: string; code?: string } | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function tryRealScraping() {
      try {
        // Phase 1: Connecting
        setPhase(0);
        setMessage('Instagram에 연결하고 있어요...');

        // Phase 2: Scraping
        setTimeout(() => {
          setPhase(1);
          setMessage('게시물을 수집하고 있어요...');
        }, 2000);

        // Simulate star count growth during scraping
        const starGrowth = setInterval(() => {
          setStarCount(prev => {
            if (prev < 25) return prev + 1;
            return prev;
          });
        }, 1500);

        const res = await fetch('/api/quick-analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        clearInterval(starGrowth);

        if (!res.ok) {
          const errData = await res.json();
          if (res.status === 503 || errData.errorCode === 'NO_API_TOKEN' || errData.error === 'API_NOT_CONFIGURED') {
            setErrorState({
              error: 'Apify API 토큰이 설정되지 않았습니다',
              detail: errData.detail || '.env.local 파일에 APIFY_API_TOKEN을 추가해주세요.',
              code: 'NO_API_TOKEN',
            });
            return;
          }
          setErrorState({
            error: errData.error || `서버 오류 (${res.status})`,
            detail: errData.detail,
            code: errData.errorCode,
          });
          return;
        }

        const { data } = await res.json();

        // Phase 3: Creating stars
        setPhase(2);
        setMessage('별을 생성하고 있어요...');
        setStarCount(data.posts.length);

        await new Promise(r => setTimeout(r, 1200));

        // Phase 4: Building universe
        setPhase(3);
        setMessage('우주가 완성되었어요!');

        await new Promise(r => setTimeout(r, 1000));

        storeMockData(data);
        router.replace(`/reveal?username=${encodeURIComponent(username)}`);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '알 수 없는 오류';
        console.error('Scraping failed:', errorMsg);
        setErrorState({
          error: '서버에 연결할 수 없습니다',
          detail: errorMsg,
        });
      }
    }

    tryRealScraping();
  }, [username, router]);

  const handleDemoMode = useCallback(() => {
    const data = generateMockResult(username);
    storeMockData(data);
    router.replace(`/reveal?username=${encodeURIComponent(username)}`);
  }, [username, router]);

  const handleRetry = useCallback(() => {
    setErrorState(null);
    setMessage('다시 시도하고 있어요...');
    setPhase(0);
    setStarCount(0);
    started.current = false;
    window.location.reload();
  }, []);

  return (
    <div className="fixed inset-0 z-[110] flex flex-col items-center"
      style={{ background: 'radial-gradient(ellipse at 50% 40%, #1a1038, #0c0818 70%)' }}>

      {/* Animated constellation canvas */}
      {!errorState && <ConstellationCanvas phase={phase} starCount={starCount} />}

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

      <div className="relative z-10 flex flex-col items-center" style={{ maxWidth: 360, width: '100%', padding: '0 24px', marginTop: '18vh' }}>
        {/* Username */}
        <p className="font-brand italic mb-8"
          style={{ fontSize: '1.2rem', color: 'rgba(248,244,255,.5)', letterSpacing: '.06em' }}>
          @{username}
        </p>

        {errorState ? (
          /* Error state */
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
            <div className="w-full flex flex-col gap-2.5">
              <button onClick={handleRetry}
                className="w-full py-3.5 rounded-xl cursor-pointer active:scale-[.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(210,160,200,.15), rgba(120,140,220,.12))',
                  border: '1px solid rgba(210,160,200,.15)',
                  fontSize: '.9rem', fontWeight: 300, color: 'rgba(248,244,255,.75)',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                다시 시도
              </button>
              <button onClick={handleDemoMode}
                className="w-full py-3 rounded-xl cursor-pointer active:scale-[.98]"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.06)',
                  fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)',
                  WebkitTapHighlightColor: 'transparent',
                }}>
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
          /* Normal loading state */
          <>
            {/* Phase indicator */}
            <div className="mb-6">
              <PhaseIndicator current={phase} />
            </div>

            {/* Star counter */}
            {starCount > 0 && (
              <div className="flex items-center gap-2 mb-4" style={{
                padding: '6px 16px', borderRadius: 20,
                background: 'rgba(210,160,200,.06)',
                border: '1px solid rgba(210,160,200,.1)',
              }}>
                <span className="rounded-full" style={{
                  width: 5, height: 5,
                  background: 'rgba(210,160,200,.6)',
                  boxShadow: '0 0 6px rgba(210,160,200,.4)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <span style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(210,160,200,.6)' }}>
                  {starCount}개의 별 발견
                </span>
              </div>
            )}

            {/* Main message */}
            <p className="font-light text-center mb-3" style={{
              fontSize: '0.95rem',
              color: 'rgba(248,244,255,.6)',
              maxWidth: 320,
              lineHeight: 1.6,
            }}>
              {message}
            </p>

            {/* Pulsing progress ring */}
            <div className="mb-5 relative" style={{ width: 44, height: 44 }}>
              <svg width="44" height="44" className="loading-spin" style={{ animation: 'spin 3s linear infinite' }}>
                <circle cx="22" cy="22" r="18" fill="none"
                  stroke="rgba(210,160,200,.08)" strokeWidth="1.5" />
                <circle cx="22" cy="22" r="18" fill="none"
                  stroke="rgba(210,160,200,.35)" strokeWidth="1.5"
                  strokeDasharray={`${(phase + 1) / 4 * 113} 113`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-brand" style={{
                  fontSize: '.72rem', color: 'rgba(210,160,200,.5)',
                }}>
                  {Math.round(((phase + 1) / 4) * 100)}%
                </span>
              </div>
            </div>

            {/* Rotating tips */}
            <RotatingTip />
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
