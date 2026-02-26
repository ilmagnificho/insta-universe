'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadMockData, FREE_INSIGHTS, PERSONALITY_KEYWORDS, EMOTION_TEASERS } from '@/lib/mock-data';
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
      vig.addColorStop(1, 'rgba(12,8,24,.5)');
      cx!.fillStyle = vig;
      cx!.fillRect(0, 0, cw, ch);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [posts]);

  return <canvas ref={canvasRef} />;
}

// ===== Animated Counter =====
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const dur = 1200;
    const t0 = Date.now();
    const step = () => {
      const elapsed = Date.now() - t0;
      const p = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      start = Math.round(target * eased);
      setVal(start);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ===== Time Distribution Bar =====
function TimeDistBar({ posts }: { posts: PostData[] }) {
  const dist = useMemo(() => {
    const bins = { dawn: 0, morning: 0, afternoon: 0, evening: 0 };
    posts.forEach(p => {
      if (p.hour < 6) bins.dawn++;
      else if (p.hour < 12) bins.morning++;
      else if (p.hour < 18) bins.afternoon++;
      else bins.evening++;
    });
    const total = posts.length;
    return [
      { label: '새벽', pct: Math.round(bins.dawn / total * 100), color: '#6366f1' },
      { label: '오전', pct: Math.round(bins.morning / total * 100), color: '#f59e0b' },
      { label: '오후', pct: Math.round(bins.afternoon / total * 100), color: '#ec4899' },
      { label: '저녁', pct: Math.round(bins.evening / total * 100), color: '#8b5cf6' },
    ];
  }, [posts]);

  const [animate, setAnimate] = useState(false);
  useEffect(() => { setTimeout(() => setAnimate(true), 500); }, []);

  return (
    <div className="flex gap-1 w-full" style={{ height: 64 }}>
      {dist.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t-sm" style={{
            height: animate ? `${Math.max(d.pct * 0.55, 4)}px` : '2px',
            background: `linear-gradient(to top, ${d.color}40, ${d.color}90)`,
            transition: `height 1s ${i * 0.15}s cubic-bezier(.16,1,.3,1)`,
          }} />
          <span style={{ fontSize: '.6rem', fontWeight: 300, color: 'rgba(248,244,255,.3)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Personality Keyword Pills =====
function PersonalityPills({ keywords, delay = 0 }: { keywords: string[]; delay?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), delay); }, [delay]);

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {keywords.map((kw, i) => (
        <span
          key={i}
          className="rounded-full"
          style={{
            fontSize: '.75rem',
            fontWeight: 300,
            padding: '5px 14px',
            background: 'rgba(210,160,200,.06)',
            border: '1px solid rgba(210,160,200,.1)',
            color: 'rgba(248,244,255,.55)',
            opacity: show ? 1 : 0,
            transform: show ? 'scale(1)' : 'scale(0.8)',
            transition: `all .6s ${i * 0.12 + 0.1}s cubic-bezier(.16,1,.3,1)`,
          }}
        >
          {kw}
        </span>
      ))}
    </div>
  );
}

// ===== Main Reveal Page =====
function RevealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const [data, setData] = useState<MockResult | null>(null);
  const [visible, setVisible] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadMockData();
    if (stored) setData(stored);
    setTimeout(() => setVisible(true), 150);
    setTimeout(() => setShowDetail(true), 800);
  }, []);

  const handlePay = () => {
    router.push(`/universe/demo?username=${encodeURIComponent(username)}`);
  };

  // Derived data
  const analysis = useMemo(() => {
    if (!data) return null;
    const posts = data.posts;
    const groups: Record<string, number> = {};
    posts.forEach(p => { groups[p.cat.name] = (groups[p.cat.name] || 0) + 1; });
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    const topPct = Math.round(sorted[0][1] / posts.length * 100);
    const secondCat = sorted.length > 1 ? sorted[1][0] : null;
    const secondPct = sorted.length > 1 ? Math.round(sorted[1][1] / posts.length * 100) : 0;

    // Time analysis
    const evPosts = posts.filter(p => p.hour >= 19).length;
    const evPct = Math.round(evPosts / posts.length * 100);
    const peakHour = (() => {
      const hourBins: number[] = Array(24).fill(0);
      posts.forEach(p => hourBins[p.hour]++);
      return hourBins.indexOf(Math.max(...hourBins));
    })();

    // Top liked post
    const topPost = posts.reduce((a, b) => a.likes > b.likes ? a : b, posts[0]);

    // Personality keywords
    const keywords = PERSONALITY_KEYWORDS[data.topCategory] || PERSONALITY_KEYWORDS['일상'];

    // Emotion teaser
    const emotionTeaser = EMOTION_TEASERS[data.topCategory] || EMOTION_TEASERS['일상'];

    return { sorted, topPct, secondCat, secondPct, evPct, peakHour, topPost, keywords, emotionTeaser };
  }, [data]);

  if (!data || !analysis) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c0818' }}>
        <p style={{ fontSize: '0.95rem', color: 'rgba(248,244,255,.45)', fontWeight: 300 }}>로딩 중...</p>
      </div>
    );
  }

  const freeInsight = FREE_INSIGHTS[data.topCategory] || FREE_INSIGHTS['일상'];
  const starCount = data.posts.length;
  const topCatColor = CATEGORIES.find(c => c.name === data.topCategory)?.hex || '#b48ce6';

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-[120] overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #1a1038, #0c0818 65%)',
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
          color: 'rgba(210,160,200,.45)',
        }}>
          your universe type
        </p>

        {/* Type name - the hero */}
        <h1 className="font-brand italic font-normal mt-3 mb-2" style={{
          fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
          color: 'rgba(248,244,255,.88)',
        }}>
          {data.userType.type}
        </h1>

        {/* Rarity badge */}
        <div className="flex items-center gap-1.5 mb-4" style={{
          padding: '4px 12px', borderRadius: 20,
          background: 'rgba(210,160,200,.08)',
          border: '1px solid rgba(210,160,200,.12)',
        }}>
          <span className="inline-block rounded-full" style={{
            width: 5, height: 5,
            background: 'rgba(210,160,200,.6)',
            boxShadow: '0 0 6px rgba(210,160,200,.4)',
          }} />
          <span style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(210,160,200,.6)' }}>
            {data.userType.rare} 유형
          </span>
        </div>

        {/* Personality Keywords */}
        <div className="mb-5">
          <PersonalityPills keywords={analysis.keywords} delay={600} />
        </div>

        {/* Description */}
        <p className="font-light leading-relaxed mb-7" style={{
          fontSize: '0.95rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.85,
        }}>
          {data.userType.description}
        </p>

        {/* ===== Top Category Spotlight ===== */}
        <div className="w-full rounded-2xl text-left mb-5" style={{
          padding: '20px 20px',
          background: `linear-gradient(165deg, ${topCatColor}08, ${topCatColor}03)`,
          border: `1px solid ${topCatColor}18`,
        }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full" style={{ width: 8, height: 8, background: topCatColor, boxShadow: `0 0 8px ${topCatColor}60` }} />
            <p style={{ fontSize: '.82rem', fontWeight: 400, color: topCatColor + 'cc' }}>
              가장 큰 별자리
            </p>
          </div>
          <p className="font-brand italic font-normal mb-1" style={{ fontSize: '1.3rem', color: 'rgba(248,244,255,.8)' }}>
            {data.topCategory}
          </p>
          <p className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.45)', lineHeight: 1.7 }}>
            우주의 <span style={{ color: topCatColor, fontWeight: 400 }}>{analysis.topPct}%</span>를 차지하고 있어요
            {analysis.secondCat && (
              <>, 뒤이어 <span style={{ color: 'rgba(248,244,255,.6)' }}>{analysis.secondCat}</span>이 {analysis.secondPct}%</>
            )}
          </p>
        </div>

        {/* ===== Free Insight Card ===== */}
        <div className="w-full rounded-2xl text-left mb-5" style={{
          padding: '22px 20px',
          background: 'linear-gradient(165deg, rgba(210,160,200,.06), rgba(100,140,220,.03))',
          border: '1px solid rgba(210,160,200,.1)',
        }}>
          <p className="font-brand italic mb-3" style={{
            fontSize: '.82rem', color: 'rgba(210,160,200,.55)', letterSpacing: '.06em',
          }}>
            AI가 발견한 첫 번째 비밀
          </p>
          <p className="font-light leading-relaxed" style={{
            fontSize: '0.95rem', color: 'rgba(248,244,255,.7)', lineHeight: 1.85,
          }}
            dangerouslySetInnerHTML={{ __html: freeInsight.replace(/\n/g, '<br/>') }}
          />
          <p className="mt-4 pt-3" style={{
            fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.3)',
            borderTop: '1px solid rgba(255,255,255,.04)',
          }}>
            이 외에도 시간대, 카테고리 교차 분석이 완료되었습니다
          </p>
        </div>

        {/* ===== Time Pattern Teaser ===== */}
        <div className="w-full rounded-2xl text-left mb-5" style={{
          padding: '20px 20px',
          background: 'rgba(255,255,255,.012)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <p className="font-brand italic mb-3" style={{
            fontSize: '.82rem', color: 'rgba(210,160,200,.45)', letterSpacing: '.06em',
          }}>
            활동 시간대 분포
          </p>
          <TimeDistBar posts={data.posts} />
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.04)' }}>
            <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.5)', lineHeight: 1.7 }}>
              게시물의 <span style={{ color: '#8b5cf6', fontWeight: 400 }}>{analysis.evPct}%</span>가 저녁 이후에 집중
            </p>
            <p className="mt-1 flex items-center gap-1.5" style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.3)' }}>
              <span style={{ opacity: 0.5 }}>🔒</span>
              이 패턴이 의미하는 것은...
            </p>
          </div>
        </div>

        {/* ===== Blurred Universe Preview ===== */}
        <div className="w-full rounded-2xl overflow-hidden relative mb-5" style={{
          aspectRatio: '1',
          background: '#0c0818',
          border: '1px solid rgba(210,160,200,.06)',
        }}>
          <MiniUniverse posts={data.posts} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(12,8,24,.3) 80%)',
          }}>
            <p className="font-brand italic font-normal" style={{
              fontSize: '1.15rem', color: 'rgba(248,244,255,.75)',
            }}>
              당신의 우주가 완성되었어요
            </p>
            <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.4)' }}>
              {starCount}개의 별이 당신을 기다리고 있어요
            </p>
          </div>
        </div>

        {/* ===== Stats summary ===== */}
        <div className="w-full grid grid-cols-4 gap-1.5 mb-5">
          {[
            { n: starCount, l: '게시물' },
            { n: data.categoryCount, l: '카테고리' },
            { n: data.topLikes, l: '최고 ♥' },
            { n: data.streakDays, l: '활동일' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl text-center" style={{
              padding: '12px 4px',
              background: 'rgba(255,255,255,.015)',
              border: '1px solid rgba(255,255,255,.04)',
            }}>
              <div className="font-brand" style={{ fontSize: '1rem', color: 'rgba(248,244,255,.65)' }}>
                {typeof s.n === 'number' ? <AnimatedNumber target={s.n} /> : s.n}
              </div>
              <div style={{ fontSize: '.62rem', fontWeight: 300, color: 'rgba(248,244,255,.3)' }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* ===== Best Moment Teaser ===== */}
        <div className="w-full rounded-2xl text-left mb-5" style={{
          padding: '18px 20px',
          background: 'rgba(255,255,255,.012)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.45)' }}>
              가장 빛났던 순간
            </p>
            <span style={{ fontSize: '.82rem', color: 'rgba(235,130,175,.5)' }}>
              &#9829; <AnimatedNumber target={analysis.topPost.likes} />
            </span>
          </div>
          <p className="font-light mb-2" style={{
            fontSize: '.9rem', color: 'rgba(248,244,255,.6)', lineHeight: 1.7,
          }}>
            &ldquo;{analysis.topPost.caption.substring(0, 30)}{analysis.topPost.caption.length > 30 ? '...' : ''}&rdquo;
          </p>
          <p className="flex items-center gap-1.5" style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.3)' }}>
            <span style={{ opacity: 0.5 }}>🔒</span>
            이 게시물이 빛난 이유 &middot; AI 분석
          </p>
        </div>

        {/* ===== Emotional Pattern Teaser ===== */}
        <div className="w-full rounded-2xl text-left mb-5" style={{
          padding: '18px 20px',
          background: 'linear-gradient(165deg, rgba(130,200,255,.03), rgba(210,160,200,.04))',
          border: '1px solid rgba(130,200,255,.08)',
        }}>
          <p className="font-brand italic mb-2" style={{
            fontSize: '.82rem', color: 'rgba(130,200,255,.5)', letterSpacing: '.06em',
          }}>
            감정 패턴 프리뷰
          </p>
          <p className="font-light" style={{
            fontSize: '.88rem', color: 'rgba(248,244,255,.5)', lineHeight: 1.7,
          }}>
            {analysis.emotionTeaser}
          </p>
          <p className="mt-2 flex items-center gap-1.5" style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.25)' }}>
            <span style={{ opacity: 0.5 }}>🔒</span>
            전체 감정 패턴 분석 보기
          </p>
        </div>

        {/* ===== Locked insights - creates FOMO ===== */}
        <div className="w-full mb-5">
          <p className="text-left mb-3" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
            잠금 해제 시 공개될 콘텐츠
          </p>
          <div className="flex flex-col gap-2">
            {data.userType.locked.map((lock, i) => (
              <div key={i} className="flex items-center gap-3 text-left rounded-xl" style={{
                padding: '14px 16px',
                background: 'rgba(255,255,255,.015)',
                border: '1px solid rgba(255,255,255,.05)',
              }}>
                <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔒</span>
                <span className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.5)' }}>
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
              <span className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.5)' }}>
                {starCount}개 별 하나하나의 AI 인사이트
              </span>
            </div>
            <div className="flex items-center gap-3 text-left rounded-xl" style={{
              padding: '14px 16px',
              background: 'rgba(210,160,200,.03)',
              border: '1px solid rgba(210,160,200,.08)',
            }}>
              <span style={{ fontSize: '1rem', opacity: 0.5 }}>🔒</span>
              <span className="font-light" style={{ fontSize: '.88rem', color: 'rgba(210,160,200,.5)' }}>
                우주 DNA 리포트 + 성격 심층 분석
              </span>
            </div>
          </div>
        </div>

        {/* ===== Social Proof ===== */}
        <div className="w-full text-center mb-6" style={{
          opacity: showDetail ? 1 : 0,
          transition: 'opacity .8s',
        }}>
          <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.25)' }}>
            지금까지 <span style={{ color: 'rgba(210,160,200,.5)' }}>2,847명</span>이 자신의 우주를 탐험했어요
          </p>
        </div>

        {/* CTA Button - The hero action */}
        <button
          onClick={handlePay}
          className="w-full rounded-xl cursor-pointer transition-all active:scale-[.98]"
          style={{
            padding: '18px',
            background: 'linear-gradient(135deg, rgba(210,160,200,.35), rgba(120,140,220,.3))',
            border: '1px solid rgba(210,160,200,.3)',
            boxShadow: '0 4px 30px rgba(210,160,200,.15), 0 0 60px rgba(210,160,200,.06)',
            color: 'rgba(248,244,255,.95)',
            fontSize: '1.08rem',
            fontWeight: 400,
            letterSpacing: '.02em',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          내 우주 보러가기
        </button>

        <p className="mt-2" style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(248,244,255,.25)' }}>
          AI 심층 분석은 별도 구매
        </p>
      </div>
    </div>
  );
}

export default function RevealPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c0818' }}>
          <p style={{ fontSize: '0.95rem', color: 'rgba(248,244,255,.45)', fontWeight: 300 }}>로딩 중...</p>
        </div>
      }
    >
      <RevealContent />
    </Suspense>
  );
}
