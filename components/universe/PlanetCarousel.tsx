'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import type { PostData, UniverseStar, ClusterCenter, Category } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

interface PlanetData {
  name: string;
  cat: Category;
  count: number;
  pct: number;
  posts: PostData[];
}

interface Props {
  posts: PostData[];
  username: string;
  onStarTap?: (star: UniverseStar) => void;
  onClusterTap?: (cluster: ClusterCenter, stars: UniverseStar[]) => void;
}

export default function PlanetCarousel({ posts, username, onStarTap, onClusterTap }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const planets = useMemo(() => {
    const groups: Record<string, PostData[]> = {};
    posts.forEach(p => {
      if (!groups[p.cat.name]) groups[p.cat.name] = [];
      groups[p.cat.name].push(p);
    });
    return Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([name, catPosts]) => {
        const cat = CATEGORIES.find(c => c.name === name) || CATEGORIES[2];
        return { name, cat, count: catPosts.length, pct: Math.round(catPosts.length / posts.length * 100), posts: catPosts };
      });
  }, [posts]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    setActiveIndex(Math.min(Math.max(0, idx), planets.length - 1));
  }, [planets.length]);

  const makeUniverseStar = useCallback((post: PostData): UniverseStar => ({
    x: 0, y: 0, size: 2 + (post.likes / 800) * 4, post, ts: 0.01, to: 0, fa: 0,
  }), []);

  const handleStarTap = useCallback((post: PostData) => {
    onStarTap?.(makeUniverseStar(post));
  }, [onStarTap, makeUniverseStar]);

  const handlePlanetTap = useCallback((planet: PlanetData) => {
    const cluster: ClusterCenter = { x: 0, y: 0, name: planet.name, cat: planet.cat, count: planet.count, pct: planet.pct };
    onClusterTap?.(cluster, planet.posts.map(p => makeUniverseStar(p)));
  }, [onClusterTap, makeUniverseStar]);

  const scrollToIndex = useCallback((i: number) => {
    scrollRef.current?.scrollTo({ left: i * (scrollRef.current?.clientWidth || 0), behavior: 'smooth' });
  }, []);

  return (
    <div className="fixed inset-0" style={{ background: '#0c0818' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[102]" style={{
        background: 'linear-gradient(to bottom, rgba(12,8,24,.95) 50%, transparent)',
        padding: '14px 20px 28px',
      }}>
        <span className="font-brand italic" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.4)' }}>
          <b className="not-italic font-normal" style={{ color: 'rgba(248,244,255,.6)' }}>@{username}</b>의 우주
        </span>
        <div className="flex gap-1.5 mt-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {planets.map((p, i) => (
            <button key={p.name} onClick={() => scrollToIndex(i)}
              className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              style={{
                fontSize: '.72rem', fontWeight: 300, padding: '5px 11px', borderRadius: 20, whiteSpace: 'nowrap',
                color: i === activeIndex ? 'rgba(248,244,255,.7)' : 'rgba(248,244,255,.35)',
                border: i === activeIndex ? `1px solid ${p.cat.hex}30` : '1px solid rgba(210,160,200,.06)',
                background: i === activeIndex ? `${p.cat.hex}12` : 'rgba(210,160,200,.03)',
                transition: 'all .3s', WebkitTapHighlightColor: 'transparent',
              }}>
              <span className="rounded-full flex-shrink-0" style={{
                width: 6, height: 6, background: p.cat.hex,
                boxShadow: i === activeIndex ? `0 0 6px ${p.cat.hex}60` : 'none',
              }} />
              {p.name} {p.pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div ref={scrollRef} className="flex overflow-x-auto h-full"
        style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        onScroll={handleScroll}>
        {planets.map((planet) => (
          <PlanetSlide key={planet.name} planet={planet}
            onStarTap={handleStarTap} onPlanetTap={() => handlePlanetTap(planet)} />
        ))}
      </div>

      {/* Dots */}
      <div className="fixed left-0 right-0 z-[101] flex justify-center gap-2" style={{ bottom: 80 }}>
        {planets.map((p, i) => (
          <button key={p.name} className="rounded-full cursor-pointer" onClick={() => scrollToIndex(i)}
            style={{
              width: i === activeIndex ? 20 : 6, height: 6,
              background: i === activeIndex ? p.cat.hex : 'rgba(248,244,255,.15)',
              boxShadow: i === activeIndex ? `0 0 8px ${p.cat.hex}50` : 'none',
              border: 'none', padding: 0, transition: 'all .4s cubic-bezier(.16,1,.3,1)',
              WebkitTapHighlightColor: 'transparent',
            }} />
        ))}
      </div>

      <div className="fixed left-0 right-0 z-[100] text-center pointer-events-none" style={{ bottom: 62 }}>
        <p style={{ fontSize: '.68rem', fontWeight: 300, color: 'rgba(248,244,255,.15)' }}>← 스와이프하여 행성 탐험 →</p>
      </div>
    </div>
  );
}

// ===== Each planet slide (full-screen) =====
function PlanetSlide({ planet, onStarTap, onPlanetTap }: {
  planet: PlanetData;
  onStarTap: (post: PostData) => void;
  onPlanetTap: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // Pre-compute star orbital data (deterministic from post.id)
  const starOrbits = useMemo(() => {
    return planet.posts.map((post, i) => {
      const seed = ((post.id * 9301 + 49297) % 233280) / 233280;
      const ring = i < 5 ? 0 : i < 12 ? 1 : 2;
      const countInRing = ring === 0 ? Math.min(5, planet.posts.length)
        : ring === 1 ? Math.min(7, Math.max(0, planet.posts.length - 5))
          : Math.max(0, planet.posts.length - 12);
      const idxInRing = ring === 0 ? i : ring === 1 ? i - 5 : i - 12;
      const baseAngle = countInRing > 0 ? (Math.PI * 2 / countInRing) * idxInRing : 0;

      return {
        post,
        angle0: baseAngle + (seed - 0.5) * 0.3,
        orbitMul: [1.35, 1.75, 2.2][ring] + seed * 0.12,
        speed: (0.15 + seed * 0.25) * (ring === 0 ? 1 : ring === 1 ? 0.7 : 0.5),
        size: Math.max(1.5, 2 + (post.likes / 600) * 3),
        seed,
      };
    });
  }, [planet.posts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h * 0.38;
    const planetR = Math.min(w * 0.17, 80);
    const { r: cr, g: cg, b: cb } = planet.cat;

    // Background stars (static, rendered once)
    const bgStars: { x: number; y: number; r: number; a: number; sp: number; ph: number }[] = [];
    for (let i = 0; i < 120; i++) {
      bgStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 0.5 + 0.06, a: Math.random() * 0.25 + 0.03,
        sp: Math.random() * 0.004 + 0.001, ph: Math.random() * Math.PI * 2,
      });
    }

    function draw(t: number) {
      animRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Background stars (twinkling)
      bgStars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(200,190,240,${s.a * tw})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Planet atmosphere glow (pulsing)
      const pulse = 0.9 + 0.1 * Math.sin(t * 0.001);
      const atm = ctx!.createRadialGradient(cx, cy, planetR * 0.5, cx, cy, planetR * 2.8 * pulse);
      atm.addColorStop(0, `rgba(${cr},${cg},${cb},0.06)`);
      atm.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.02)`);
      atm.addColorStop(1, 'transparent');
      ctx!.fillStyle = atm;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 2.8 * pulse, 0, Math.PI * 2);
      ctx!.fill();

      // Orbit rings (subtle, rotating slowly)
      ctx!.save();
      ctx!.translate(cx, cy);
      const tilt = 0.6; // ellipse tilt ratio
      [1.35, 1.75, 2.2].forEach((ringMul, ri) => {
        const ringR = planetR * ringMul;
        ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 - ri * 0.01})`;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, ringR, ringR * tilt, 0, 0, Math.PI * 2);
        ctx!.stroke();
      });
      ctx!.restore();

      // Stars behind planet (draw first)
      const tSec = t / 1000;
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * 0.6;
        const sy = Math.sin(angle);
        if (sy <= 0.15) return; // only behind
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        drawStar(ctx!, sx, starY, so.size * 0.6, cr, cg, cb, 0.12, t, so.seed);
      });

      // Planet sphere
      // Main body
      const pg = ctx!.createRadialGradient(cx - planetR * 0.3, cy - planetR * 0.3, 0, cx, cy, planetR);
      pg.addColorStop(0, `rgba(${Math.min(255, cr + 50)},${Math.min(255, cg + 50)},${Math.min(255, cb + 50)},0.5)`);
      pg.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.35)`);
      pg.addColorStop(0.75, `rgba(${Math.max(0, cr - 30)},${Math.max(0, cg - 30)},${Math.max(0, cb - 30)},0.2)`);
      pg.addColorStop(1, `rgba(${Math.max(0, cr - 60)},${Math.max(0, cg - 60)},${Math.max(0, cb - 60)},0.08)`);
      ctx!.fillStyle = pg;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Specular highlight
      const hl = ctx!.createRadialGradient(cx - planetR * 0.3, cy - planetR * 0.3, 0, cx - planetR * 0.3, cy - planetR * 0.3, planetR * 0.6);
      hl.addColorStop(0, 'rgba(255,255,255,0.15)');
      hl.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      hl.addColorStop(1, 'transparent');
      ctx!.fillStyle = hl;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Edge glow (rim lighting)
      const rim = ctx!.createRadialGradient(cx + planetR * 0.2, cy + planetR * 0.1, planetR * 0.6, cx, cy, planetR * 1.05);
      rim.addColorStop(0, 'transparent');
      rim.addColorStop(0.85, 'transparent');
      rim.addColorStop(1, `rgba(${cr},${cg},${cb},0.15)`);
      ctx!.fillStyle = rim;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.05, 0, Math.PI * 2);
      ctx!.fill();

      // Post count in center
      ctx!.save();
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.font = `italic 300 ${Math.max(11, planetR * 0.22)}px "Cormorant Garamond"`;
      ctx!.fillStyle = 'rgba(255,255,255,0.18)';
      ctx!.fillText(`${planet.count}`, cx, cy);
      ctx!.restore();

      // Stars in front of planet (draw on top)
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * 0.6;
        const sy = Math.sin(angle);
        if (sy > 0.15) return; // only in front
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        drawStar(ctx!, sx, starY, so.size, cr, cg, cb, 0.7, t, so.seed);
      });
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [planet, starOrbits]);

  // Tap handling
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null);

  const handleDown = useCallback((e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  const handleUp = useCallback((e: React.PointerEvent) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const dt = Date.now() - pointerStart.current.t;
    pointerStart.current = null;
    if (Math.hypot(dx, dy) > 15 || dt > 400) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h * 0.38;
    const planetR = Math.min(w * 0.17, 80);

    // Planet tap
    if (Math.hypot(mx - cx, my - cy) < planetR * 1.2) {
      onPlanetTap();
      return;
    }

    // Star tap
    const tSec = performance.now() / 1000;
    let closest: PostData | null = null;
    let minD = 30;
    starOrbits.forEach(so => {
      const angle = so.angle0 + tSec * so.speed;
      const orbitRx = planetR * so.orbitMul;
      const orbitRy = orbitRx * 0.6;
      const sx = cx + Math.cos(angle) * orbitRx;
      const sy = cy + Math.sin(angle) * orbitRy;
      const d = Math.hypot(mx - sx, my - sy);
      if (d < minD) { minD = d; closest = so.post; }
    });
    if (closest) onStarTap(closest);
  }, [starOrbits, onStarTap, onPlanetTap]);

  return (
    <div className="flex-shrink-0 w-screen h-screen relative" style={{ scrollSnapAlign: 'center' }}>
      <div className="absolute inset-0" style={{ top: 80 }}>
        <canvas ref={canvasRef} className="touch-none" style={{ cursor: 'pointer' }}
          onPointerDown={handleDown} onPointerUp={handleUp} />
      </div>

      {/* Planet info */}
      <div className="absolute z-10 text-center left-0 right-0" style={{ bottom: '22%' }}>
        <h2 className="font-brand italic font-normal mb-1" style={{
          fontSize: '1.8rem',
          color: `rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.85)`,
          textShadow: `0 0 30px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.2)`,
        }}>{planet.name}</h2>
        <p style={{ fontSize: '.88rem', fontWeight: 300, color: 'rgba(248,244,255,.45)' }}>
          {planet.count}개의 별 · 우주의 {planet.pct}%
        </p>
      </div>

      {/* Hint card */}
      <div className="absolute z-10 left-5 right-5" style={{ bottom: '11%' }}>
        <div className="mx-auto rounded-2xl text-center" style={{
          maxWidth: 340, padding: '12px 18px',
          background: 'rgba(12,14,32,.8)', backdropFilter: 'blur(12px)',
          border: `1px solid rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.06)`,
        }}>
          <p className="font-light" style={{ fontSize: '.78rem', color: 'rgba(248,244,255,.35)', lineHeight: 1.5 }}>
            별을 터치하면 AI 인사이트 · 행성을 터치하면 카테고리 분석
          </p>
        </div>
      </div>
    </div>
  );
}

// Draw a single star with glow + twinkle
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  cr: number, cg: number, cb: number,
  baseAlpha: number, t: number, seed: number,
) {
  const tw = 0.5 + 0.5 * Math.sin(t * 0.003 + seed * 20);
  const alpha = baseAlpha * (0.4 + 0.6 * tw);

  // Outer glow
  const g = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
  g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.3})`);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, size * 4, 0, Math.PI * 2);
  ctx.fill();

  // Inner glow
  const g2 = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
  g2.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.5})`);
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Bright core
  ctx.fillStyle = `rgba(255,255,255,${alpha * 0.85})`;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
}
