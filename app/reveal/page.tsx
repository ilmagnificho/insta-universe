'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadMockData, FREE_INSIGHTS } from '@/lib/mock-data';
import type { MockResult, PostData } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

function MiniCanvas({ posts }: { posts: PostData[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const cw = parent.clientWidth;
    const ch = parent.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const cx = canvas.getContext('2d');
    if (!cx) return;
    cx.scale(dpr, dpr);

    // Group posts
    const groups: Record<string, PostData[]> = {};
    posts.forEach(p => {
      if (!groups[p.cat.name]) groups[p.cat.name] = [];
      groups[p.cat.name].push(p);
    });

    const gk = Object.keys(groups);
    const angleStep = (Math.PI * 2) / gk.length;

    interface MiniStar {
      x: number; y: number; s: number;
      c: { r: number; g: number; b: number };
      ph: number; sp: number;
    }

    const pts: MiniStar[] = [];
    gk.forEach((k, gi) => {
      const ang = angleStep * gi;
      const gR = Math.min(cw, ch) * 0.2;
      const gx = cw / 2 + Math.cos(ang) * gR;
      const gy = ch / 2 + Math.sin(ang) * gR;
      const cat = CATEGORIES.find(c => c.name === k) || CATEGORIES[2];

      groups[k].forEach((_, pi) => {
        const sa = (Math.PI * 2 / groups[k].length) * pi;
        const sr = Math.random() * 20 + 4;
        pts.push({
          x: gx + Math.cos(sa) * sr,
          y: gy + Math.sin(sa) * sr,
          s: 0.5 + (Math.random() * 1.5),
          c: cat,
          ph: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.015 + 0.006,
        });
      });
    });

    let animId: number;
    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      cx!.clearRect(0, 0, cw, ch);

      pts.forEach(p => {
        const tw = 0.4 + 0.6 * Math.sin(t * p.sp + p.ph);
        const g = cx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 4);
        g.addColorStop(0, `rgba(${p.c.r},${p.c.g},${p.c.b},${tw * 0.12})`);
        g.addColorStop(1, 'transparent');
        cx!.fillStyle = g;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2);
        cx!.fill();

        cx!.fillStyle = `rgba(255,255,255,${tw * 0.5})`;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.s * 0.35, 0, Math.PI * 2);
        cx!.fill();
      });
    }
    animId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animId);
  }, [posts]);

  return <canvas ref={canvasRef} />;
}

function RevealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const [data, setData] = useState<MockResult | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = loadMockData();
    if (stored) {
      setData(stored);
    }
    // Trigger entrance animation
    setTimeout(() => setVisible(true), 200);
  }, []);

  const handlePay = () => {
    // Simulate payment → go to universe
    router.push(`/universe/demo?username=${encodeURIComponent(username)}`);
  };

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
        <p style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)', fontWeight: 200 }}>로딩 중...</p>
      </div>
    );
  }

  const freeInsight = FREE_INSIGHTS[data.topCategory] || FREE_INSIGHTS['일상'];

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto flex justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #0e1030, #06081a 70%)',
        WebkitOverflowScrolling: 'touch',
        padding: '36px 0 44px',
      }}
    >
      <div
        className="flex flex-col items-center text-center flex-shrink-0"
        style={{
          width: 'calc(100% - 44px)',
          maxWidth: 340,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity .9s .2s, transform .9s .2s',
        }}
      >
        {/* Universe type label */}
        <p className="font-brand italic mb-4" style={{
          fontSize: '.58rem', letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'rgba(155,124,201,.3)',
        }}>
          your universe type
        </p>

        <p className="font-brand italic font-normal mb-1" style={{
          fontSize: 'clamp(1.5rem, 5vw, 1.9rem)', color: 'rgba(240,237,246,.7)',
        }}>
          {data.userType.type}
        </p>

        <p className="mb-4" style={{ fontSize: '.6rem', fontWeight: 200, color: 'rgba(155,124,201,.3)' }}>
          {data.userType.rare} 유형
        </p>

        <p className="mb-5.5" style={{
          fontWeight: 200, fontSize: '.74rem', color: 'rgba(240,237,246,.32)', lineHeight: 1.8,
        }}>
          {data.userType.description}
        </p>

        {/* Free insight */}
        <div className="w-full rounded-[14px] text-left mb-4.5" style={{
          padding: '20px 18px',
          background: 'rgba(155,124,201,.025)',
          border: '1px solid rgba(155,124,201,.05)',
        }}>
          <p className="font-brand italic mb-2.5" style={{
            fontSize: '.58rem', color: 'rgba(155,124,201,.35)', letterSpacing: '.08em',
          }}>
            AI가 발견한 첫 번째 비밀
          </p>
          <p className="font-light leading-relaxed" style={{ fontSize: '.8rem', color: 'rgba(240,237,246,.48)' }}
            dangerouslySetInnerHTML={{ __html: freeInsight.replace(/\n/g, '<br/>') }}
          />
          <p className="mt-2.5 pt-2.5" style={{
            fontSize: '.56rem', fontWeight: 200, color: 'rgba(240,237,246,.12)',
            borderTop: '1px dashed rgba(255,255,255,.03)',
          }}>
            이 외에도 시간대, 카테고리 교차 분석이 완료되었습니다
          </p>
        </div>

        {/* Blurred preview canvas */}
        <div className="w-full rounded-xl overflow-hidden relative mb-4" style={{ aspectRatio: '1.1' }}>
          <MiniCanvas posts={data.posts} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{
            backdropFilter: 'blur(4px)', background: 'rgba(6,8,26,.15)',
          }}>
            <p className="font-brand italic" style={{ fontSize: '.8rem', color: 'rgba(240,237,246,.4)' }}>
              당신의 우주가 완성되었어요
            </p>
            <p style={{ fontSize: '.54rem', fontWeight: 200, color: 'rgba(240,237,246,.15)' }}>
              별 하나하나에 담긴 AI의 감정 분석
            </p>
          </div>
        </div>

        {/* Locked insights */}
        <div className="w-full flex flex-col gap-1.5 mb-4.5">
          {data.userType.locked.map((lock, i) => (
            <div key={i} className="flex items-center gap-2.5 text-left rounded-[9px]" style={{
              padding: '11px 14px',
              background: 'rgba(255,255,255,.008)',
              border: '1px solid rgba(255,255,255,.025)',
            }}>
              <span className="rounded-full flex-shrink-0" style={{
                width: 6, height: 6, background: 'rgba(155,124,201,.15)',
              }} />
              <span className="font-light" style={{ fontSize: '.68rem', color: 'rgba(240,237,246,.3)' }}>
                {lock}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handlePay}
          className="w-full rounded-[10px] cursor-pointer transition-all active:scale-[.98]"
          style={{
            padding: 14,
            border: '1px solid rgba(155,124,201,.1)',
            background: 'rgba(155,124,201,.05)',
            color: 'rgba(240,237,246,.6)',
            fontSize: '.8rem', fontWeight: 300,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          우주 잠금 해제 - 4,900원
        </button>

        <p className="mt-1.5" style={{ fontSize: '.52rem', fontWeight: 200, color: 'rgba(240,237,246,.1)' }}>
          결제 시뮬레이션 (바로 넘어갑니다)
        </p>
      </div>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
          <p style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)', fontWeight: 200 }}>로딩 중...</p>
        </div>
      }
    >
      <RevealContent />
    </Suspense>
  );
}
