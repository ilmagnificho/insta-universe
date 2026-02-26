'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadMockData, FREE_INSIGHTS } from '@/lib/mock-data';
import type { MockResult, PostData } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

// ===== Rich Mini Universe Preview =====
function MiniUniverse({ posts }: { posts: PostData[] }) {
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

    // Group posts by category
    const groups: Record<string, PostData[]> = {};
    posts.forEach(p => {
      if (!groups[p.cat.name]) groups[p.cat.name] = [];
      groups[p.cat.name].push(p);
    });

    const gk = Object.keys(groups);
    const angleStep = (Math.PI * 2) / gk.length;
    const gR = Math.min(cw, ch) * 0.22;

    interface MiniStar {
      x: number; y: number; s: number;
      c: { r: number; g: number; b: number };
      ph: number; sp: number;
    }
    interface MiniNebula {
      x: number; y: number; r: number;
      c: { r: number; g: number; b: number }; a: number;
    }
    interface MiniEdge {
      x1: number; y1: number; x2: number; y2: number;
      c: { r: number; g: number; b: number };
    }

    const stars: MiniStar[] = [];
    const nebulae: MiniNebula[] = [];
    const edges: MiniEdge[] = [];

    gk.forEach((k, gi) => {
      const ang = angleStep * gi - Math.PI / 2;
      const gx = cw / 2 + Math.cos(ang) * gR;
      const gy = ch / 2 + Math.sin(ang) * gR;
      const cat = CATEGORIES.find(c => c.name === k) || CATEGORIES[2];

      // Nebula glow per cluster
      nebulae.push({ x: gx, y: gy, r: 55 + groups[k].length * 2, c: cat, a: 0.08 });
      // Surrounding wisps
      for (let w = 0; w < 3; w++) {
        const wa = Math.random() * Math.PI * 2;
        nebulae.push({
          x: gx + Math.cos(wa) * 25,
          y: gy + Math.sin(wa) * 25,
          r: 20 + Math.random() * 30,
          c: cat, a: 0.04 + Math.random() * 0.03,
        });
      }

      const groupStars: MiniStar[] = [];
      groups[k].forEach((post, pi) => {
        const spread = 18 + groups[k].length * 1.5;
        const sa = (Math.PI * 2 / groups[k].length) * pi + Math.random() * 0.5;
        const sr = Math.random() * spread + 3;
        const star: MiniStar = {
          x: gx + Math.cos(sa) * sr,
          y: gy + Math.sin(sa) * sr,
          s: 1.2 + (post.likes / 800) * 2.5,
          c: cat, ph: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.012 + 0.005,
        };
        stars.push(star);
        groupStars.push(star);
      });

      // Constellation edges within cluster
      for (let i = 0; i < groupStars.length - 1; i++) {
        const a = groupStars[i];
        const b = groupStars[i + 1];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 40) {
          edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, c: cat });
        }
      }
    });

    // Dust
    const dust: { x: number; y: number; r: number; a: number; sp: number; ph: number }[] = [];
    for (let i = 0; i < 150; i++) {
      dust.push({
        x: Math.random() * cw, y: Math.random() * ch,
        r: Math.random() * 0.3 + 0.05,
        a: Math.random() * 0.12 + 0.03,
        sp: Math.random() * 0.008 + 0.003,
        ph: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      cx!.clearRect(0, 0, cw, ch);

      // Background gradient
      const bg = cx!.createRadialGradient(cw * .4, ch * .35, 0, cw * .5, ch * .5, cw * .6);
      bg.addColorStop(0, 'rgba(15,12,40,.5)');
      bg.addColorStop(1, 'transparent');
      cx!.fillStyle = bg;
      cx!.fillRect(0, 0, cw, ch);

      // Nebulae
      nebulae.forEach(n => {
        const g = cx!.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.c.r},${n.c.g},${n.c.b},${n.a})`);
        g.addColorStop(0.5, `rgba(${n.c.r},${n.c.g},${n.c.b},${n.a * 0.35})`);
        g.addColorStop(1, 'transparent');
        cx!.fillStyle = g;
        cx!.beginPath();
        cx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        cx!.fill();
      });

      // Dust
      dust.forEach(d => {
        const a = d.a * (0.4 + 0.6 * Math.sin(t * d.sp + d.ph));
        cx!.fillStyle = `rgba(200,190,230,${a})`;
        cx!.beginPath();
        cx!.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        cx!.fill();
      });

      // Constellation lines
      edges.forEach(e => {
        const tw = 0.25 + 0.15 * Math.sin(t * 0.003);
        cx!.strokeStyle = `rgba(${e.c.r},${e.c.g},${e.c.b},${tw * 0.15})`;
        cx!.lineWidth = 0.4;
        cx!.beginPath();
        cx!.moveTo(e.x1, e.y1);
        cx!.lineTo(e.x2, e.y2);
        cx!.stroke();
      });

      // Stars with glow
      stars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);

        // Color halo
        const g0 = cx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s * 5);
        g0.addColorStop(0, `rgba(${s.c.r},${s.c.g},${s.c.b},${tw * 0.12})`);
        g0.addColorStop(1, 'transparent');
        cx!.fillStyle = g0;
        cx!.beginPath();
        cx!.arc(s.x, s.y, s.s * 5, 0, Math.PI * 2);
        cx!.fill();

        // Inner glow
        const g1 = cx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.s * 2);
        g1.addColorStop(0, `rgba(${s.c.r},${s.c.g},${s.c.b},${tw * 0.35})`);
        g1.addColorStop(1, 'transparent');
        cx!.fillStyle = g1;
        cx!.beginPath();
        cx!.arc(s.x, s.y, s.s * 2, 0, Math.PI * 2);
        cx!.fill();

        // Core
        cx!.fillStyle = `rgba(255,255,255,${0.4 + tw * 0.5})`;
        cx!.beginPath();
        cx!.arc(s.x, s.y, s.s * 0.4, 0, Math.PI * 2);
        cx!.fill();
      });

      // Vignette
      const vig = cx!.createRadialGradient(cw / 2, ch / 2, cw * .2, cw / 2, ch / 2, cw * .6);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(6,8,26,.5)');
      cx!.fillStyle = vig;
      cx!.fillRect(0, 0, cw, ch);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [posts]);

  return <canvas ref={canvasRef} />;
}

// ===== Main Reveal Page =====
function RevealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const [data, setData] = useState<MockResult | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = loadMockData();
    if (stored) setData(stored);
    setTimeout(() => setVisible(true), 150);
  }, []);

  const handlePay = () => {
    router.push(`/universe/demo?username=${encodeURIComponent(username)}`);
  };

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
        <p style={{ fontSize: '0.95rem', color: 'rgba(240,237,246,.45)', fontWeight: 300 }}>로딩 중...</p>
      </div>
    );
  }

  const freeInsight = FREE_INSIGHTS[data.topCategory] || FREE_INSIGHTS['일상'];
  const starCount = data.posts.length;

  return (
    <div
      className="fixed inset-0 z-[120] overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #0e1030, #06081a 65%)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        className="mx-auto flex flex-col items-center text-center"
        style={{
          maxWidth: 380,
          padding: '48px 22px 60px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1s .15s, transform 1s .15s',
        }}
      >
        {/* Type label */}
        <p className="font-brand italic" style={{
          fontSize: '.78rem', letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'rgba(155,124,201,.45)',
        }}>
          your universe type
        </p>

        {/* Type name - the hero */}
        <h1 className="font-brand italic font-normal mt-3 mb-2" style={{
          fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
          color: 'rgba(240,237,246,.88)',
        }}>
          {data.userType.type}
        </h1>

        {/* Rarity badge */}
        <div className="flex items-center gap-1.5 mb-5" style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(155,124,201,.08)',
          border: '1px solid rgba(155,124,201,.12)',
        }}>
          <span className="inline-block rounded-full" style={{
            width: 5, height: 5,
            background: 'rgba(155,124,201,.6)',
            boxShadow: '0 0 6px rgba(155,124,201,.4)',
          }} />
          <span style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(155,124,201,.6)' }}>
            {data.userType.rare} 유형
          </span>
        </div>

        {/* Description */}
        <p className="font-light leading-relaxed mb-8" style={{
          fontSize: '0.95rem', color: 'rgba(240,237,246,.55)', lineHeight: 1.85,
        }}>
          {data.userType.description}
        </p>

        {/* Free Insight Card */}
        <div className="w-full rounded-2xl text-left mb-8" style={{
          padding: '22px 20px',
          background: 'linear-gradient(165deg, rgba(155,124,201,.06), rgba(100,140,220,.03))',
          border: '1px solid rgba(155,124,201,.1)',
        }}>
          <p className="font-brand italic mb-3" style={{
            fontSize: '.82rem', color: 'rgba(155,124,201,.55)', letterSpacing: '.06em',
          }}>
            AI가 발견한 첫 번째 비밀
          </p>
          <p className="font-light leading-relaxed" style={{
            fontSize: '0.95rem', color: 'rgba(240,237,246,.7)', lineHeight: 1.85,
          }}
            dangerouslySetInnerHTML={{ __html: freeInsight.replace(/\n/g, '<br/>') }}
          />
          <p className="mt-4 pt-3" style={{
            fontSize: '.78rem', fontWeight: 300, color: 'rgba(240,237,246,.3)',
            borderTop: '1px solid rgba(255,255,255,.04)',
          }}>
            이 외에도 시간대, 카테고리 교차 분석이 완료되었습니다
          </p>
        </div>

        {/* ===== Blurred Universe Preview ===== */}
        <div className="w-full rounded-2xl overflow-hidden relative mb-6" style={{
          aspectRatio: '1',
          background: '#06081a',
          border: '1px solid rgba(155,124,201,.06)',
        }}>
          <MiniUniverse posts={data.posts} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{
            backdropFilter: 'blur(3px)',
            background: 'radial-gradient(ellipse at center, rgba(6,8,26,.05), rgba(6,8,26,.3) 80%)',
          }}>
            <p className="font-brand italic font-normal" style={{
              fontSize: '1.15rem', color: 'rgba(240,237,246,.75)',
            }}>
              당신의 우주가 완성되었어요
            </p>
            <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(240,237,246,.4)' }}>
              {starCount}개의 별이 당신을 기다리고 있어요
            </p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6">
          {[
            { n: `${starCount}`, l: '분석된 게시물' },
            { n: `${data.categoryCount}`, l: '우주의 색깔' },
            { n: data.userType.rare, l: '희소성' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl text-center" style={{
              padding: '12px 6px',
              background: 'rgba(255,255,255,.015)',
              border: '1px solid rgba(255,255,255,.04)',
            }}>
              <div className="font-brand" style={{ fontSize: '1.1rem', color: 'rgba(240,237,246,.65)' }}>
                {s.n}
              </div>
              <div style={{ fontSize: '.7rem', fontWeight: 300, color: 'rgba(240,237,246,.3)' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Locked insights - creates FOMO */}
        <div className="w-full mb-7">
          <p className="text-left mb-3" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.4)' }}>
            잠금 해제 시 공개될 인사이트
          </p>
          <div className="flex flex-col gap-2">
            {data.userType.locked.map((lock, i) => (
              <div key={i} className="flex items-center gap-3 text-left rounded-xl" style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,.015)',
                border: '1px solid rgba(255,255,255,.05)',
              }}>
                <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔒</span>
                <span className="font-light" style={{ fontSize: '.88rem', color: 'rgba(240,237,246,.5)' }}>
                  {lock}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 text-left rounded-xl" style={{
              padding: '14px 16px',
              background: 'rgba(255,255,255,.015)',
              border: '1px solid rgba(255,255,255,.05)',
            }}>
              <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔒</span>
              <span className="font-light" style={{ fontSize: '.88rem', color: 'rgba(240,237,246,.5)' }}>
                인터랙티브 우주 탐색 + {starCount}개 별 인사이트
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button - The hero action */}
        <button
          onClick={handlePay}
          className="w-full rounded-xl cursor-pointer transition-all active:scale-[.98]"
          style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(155,124,201,.3), rgba(120,140,220,.25))',
            border: '1px solid rgba(155,124,201,.25)',
            boxShadow: '0 4px 30px rgba(155,124,201,.12)',
            color: 'rgba(240,237,246,.9)',
            fontSize: '1.05rem',
            fontWeight: 400,
            letterSpacing: '.02em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          우주 잠금 해제 — ₩4,900
        </button>

        <p className="mt-2.5" style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(240,237,246,.25)' }}>
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
          <p style={{ fontSize: '0.95rem', color: 'rgba(240,237,246,.45)', fontWeight: 300 }}>로딩 중...</p>
        </div>
      }
    >
      <RevealContent />
    </Suspense>
  );
}
