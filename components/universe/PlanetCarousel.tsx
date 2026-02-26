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
    <div className="fixed inset-0" style={{ background: '#08061a' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[102]" style={{
        background: 'linear-gradient(to bottom, rgba(8,6,26,.98) 40%, transparent)',
        padding: '14px 20px 32px',
      }}>
        <span className="font-brand italic" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.35)' }}>
          <b className="not-italic font-normal" style={{ color: 'rgba(248,244,255,.55)' }}>@{username}</b>의 우주
        </span>
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {planets.map((p, i) => (
            <button key={p.name} onClick={() => scrollToIndex(i)}
              className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              style={{
                fontSize: '.72rem', fontWeight: 300, padding: '5px 12px', borderRadius: 20, whiteSpace: 'nowrap',
                color: i === activeIndex ? 'rgba(248,244,255,.75)' : 'rgba(248,244,255,.3)',
                border: i === activeIndex ? `1px solid ${p.cat.hex}35` : '1px solid rgba(255,255,255,.04)',
                background: i === activeIndex ? `${p.cat.hex}10` : 'rgba(255,255,255,.02)',
                transition: 'all .3s', WebkitTapHighlightColor: 'transparent',
              }}>
              <span className="rounded-full flex-shrink-0" style={{
                width: 6, height: 6, background: p.cat.hex,
                boxShadow: i === activeIndex ? `0 0 8px ${p.cat.hex}70` : 'none',
                transition: 'box-shadow .3s',
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
              width: i === activeIndex ? 22 : 6, height: 6,
              background: i === activeIndex ? p.cat.hex : 'rgba(248,244,255,.12)',
              boxShadow: i === activeIndex ? `0 0 12px ${p.cat.hex}60` : 'none',
              border: 'none', padding: 0, transition: 'all .5s cubic-bezier(.16,1,.3,1)',
              WebkitTapHighlightColor: 'transparent',
            }} />
        ))}
      </div>

      <div className="fixed left-0 right-0 z-[100] text-center pointer-events-none" style={{ bottom: 62 }}>
        <p style={{ fontSize: '.68rem', fontWeight: 300, color: 'rgba(248,244,255,.12)' }}>
          ← 스와이프하여 행성 탐험 →
        </p>
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

  // Pre-compute star orbital data
  const starOrbits = useMemo(() => {
    return planet.posts.map((post, i) => {
      const seed = ((post.id * 9301 + 49297) % 233280) / 233280;
      const ring = i < 5 ? 0 : i < 14 ? 1 : 2;
      const countInRing = ring === 0 ? Math.min(5, planet.posts.length)
        : ring === 1 ? Math.min(9, Math.max(0, planet.posts.length - 5))
          : Math.max(0, planet.posts.length - 14);
      const idxInRing = ring === 0 ? i : ring === 1 ? i - 5 : i - 14;
      const baseAngle = countInRing > 0 ? (Math.PI * 2 / countInRing) * idxInRing : 0;

      return {
        post,
        angle0: baseAngle + (seed - 0.5) * 0.4,
        orbitMul: [1.45, 1.95, 2.55][ring] + seed * 0.15,
        speed: (0.12 + seed * 0.18) * (ring === 0 ? 1 : ring === 1 ? 0.65 : 0.4),
        size: Math.max(1.8, 2.5 + (post.likes / 500) * 3.5),
        seed,
        ring,
      };
    });
  }, [planet.posts]);

  // Floating particles (ambient dust)
  const particles = useMemo(() => {
    const result: { x: number; y: number; r: number; speed: number; phase: number; drift: number }[] = [];
    for (let i = 0; i < 40; i++) {
      result.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.0003 + 0.0001,
        phase: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.00015 + 0.00005,
      });
    }
    return result;
  }, []);

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
    const cy = h * 0.36;
    const planetR = Math.min(w * 0.18, 85);
    const { r: cr, g: cg, b: cb } = planet.cat;

    // Secondary color (shifted hue for iridescence)
    const cr2 = Math.min(255, cr + 60) % 256;
    const cg2 = Math.min(255, cg + 40) % 256;
    const cb2 = Math.min(255, cb + 80) % 256;

    // Background stars
    const bgStars: { x: number; y: number; r: number; a: number; sp: number; ph: number }[] = [];
    for (let i = 0; i < 160; i++) {
      bgStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 0.6 + 0.08, a: Math.random() * 0.2 + 0.02,
        sp: Math.random() * 0.003 + 0.0008, ph: Math.random() * Math.PI * 2,
      });
    }

    function draw(t: number) {
      animRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Background stars (twinkling)
      bgStars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(220,215,245,${s.a * tw})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Floating ambient particles
      particles.forEach(p => {
        const px = (p.x + Math.sin(t * p.drift + p.phase) * 0.03) * w;
        const py = (p.y + Math.cos(t * p.drift * 0.7 + p.phase) * 0.02) * h;
        const pAlpha = 0.04 + 0.03 * Math.sin(t * 0.001 + p.phase);
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${pAlpha})`;
        ctx!.beginPath();
        ctx!.arc(px, py, p.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      const pulse = 0.92 + 0.08 * Math.sin(t * 0.0008);
      const breathe = 0.95 + 0.05 * Math.sin(t * 0.0012 + 1);

      // Deep nebula glow (layered)
      const neb1 = ctx!.createRadialGradient(cx, cy, 0, cx, cy, planetR * 4 * pulse);
      neb1.addColorStop(0, `rgba(${cr},${cg},${cb},0.04)`);
      neb1.addColorStop(0.3, `rgba(${cr2},${cg2},${cb2},0.015)`);
      neb1.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.005)`);
      neb1.addColorStop(1, 'transparent');
      ctx!.fillStyle = neb1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 4 * pulse, 0, Math.PI * 2);
      ctx!.fill();

      // Atmospheric haze (offset)
      const neb2 = ctx!.createRadialGradient(cx - planetR * 0.5, cy + planetR * 0.3, 0, cx, cy, planetR * 3);
      neb2.addColorStop(0, `rgba(${cr2},${cg2},${cb2},0.025)`);
      neb2.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.008)`);
      neb2.addColorStop(1, 'transparent');
      ctx!.fillStyle = neb2;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 3, 0, Math.PI * 2);
      ctx!.fill();

      // Orbit rings (glass-like, with subtle glow)
      ctx!.save();
      ctx!.translate(cx, cy);
      const tilt = 0.55;
      [1.45, 1.95, 2.55].forEach((ringMul, ri) => {
        const ringR = planetR * ringMul;
        const ringAlpha = 0.035 - ri * 0.008;
        // Ring glow
        ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${ringAlpha * 1.5})`;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, ringR, ringR * tilt, 0, 0, Math.PI * 2);
        ctx!.stroke();
        // Thin inner line
        ctx!.strokeStyle = `rgba(255,255,255,${ringAlpha * 0.6})`;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, ringR, ringR * tilt, 0, 0, Math.PI * 2);
        ctx!.stroke();
      });
      ctx!.restore();

      // Stars behind planet
      const tSec = t / 1000;
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * tilt;
        const sy = Math.sin(angle);
        if (sy <= 0.1) return; // only behind
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        // Distance-based fade (further = dimmer)
        const depthAlpha = 0.08 + 0.07 * (1 - sy);
        drawGlassStar(ctx!, sx, starY, so.size * 0.55, cr, cg, cb, cr2, cg2, cb2, depthAlpha, t, so.seed);
      });

      // === Planet sphere (glassmorphism style) ===
      // Outer atmosphere ring
      const outerGlow = ctx!.createRadialGradient(cx, cy, planetR * 0.9, cx, cy, planetR * 1.4 * breathe);
      outerGlow.addColorStop(0, `rgba(${cr},${cg},${cb},0.08)`);
      outerGlow.addColorStop(0.5, `rgba(${cr2},${cg2},${cb2},0.03)`);
      outerGlow.addColorStop(1, 'transparent');
      ctx!.fillStyle = outerGlow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.4 * breathe, 0, Math.PI * 2);
      ctx!.fill();

      // Glass sphere body - layered gradients for depth
      // Base: deep, slightly transparent
      const baseGrad = ctx!.createRadialGradient(
        cx - planetR * 0.25, cy - planetR * 0.25, 0,
        cx, cy, planetR
      );
      baseGrad.addColorStop(0, `rgba(${Math.min(255, cr + 40)},${Math.min(255, cg + 40)},${Math.min(255, cb + 40)},0.35)`);
      baseGrad.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.22)`);
      baseGrad.addColorStop(0.7, `rgba(${Math.max(0, cr - 25)},${Math.max(0, cg - 25)},${Math.max(0, cb - 25)},0.14)`);
      baseGrad.addColorStop(1, `rgba(${Math.max(0, cr - 50)},${Math.max(0, cg - 50)},${Math.max(0, cb - 50)},0.05)`);
      ctx!.fillStyle = baseGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Inner light bands (rotating slowly for life)
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.clip();

      const bandAngle = t * 0.0002;
      for (let b = 0; b < 3; b++) {
        const bx = cx + Math.cos(bandAngle + b * 2.1) * planetR * 0.3;
        const by = cy + Math.sin(bandAngle + b * 2.1) * planetR * 0.2;
        const bandGrad = ctx!.createRadialGradient(bx, by, 0, bx, by, planetR * 0.7);
        bandGrad.addColorStop(0, `rgba(${cr2},${cg2},${cb2},0.06)`);
        bandGrad.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.02)`);
        bandGrad.addColorStop(1, 'transparent');
        ctx!.fillStyle = bandGrad;
        ctx!.beginPath();
        ctx!.arc(bx, by, planetR * 0.7, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();

      // Glass specular highlight (top-left, crisp)
      const specGrad = ctx!.createRadialGradient(
        cx - planetR * 0.32, cy - planetR * 0.32, 0,
        cx - planetR * 0.2, cy - planetR * 0.2, planetR * 0.65
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.22)');
      specGrad.addColorStop(0.3, 'rgba(255,255,255,0.08)');
      specGrad.addColorStop(0.6, 'rgba(255,255,255,0.02)');
      specGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = specGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Rim light (bottom-right, colored)
      const rimGrad = ctx!.createRadialGradient(
        cx + planetR * 0.35, cy + planetR * 0.25, planetR * 0.4,
        cx, cy, planetR * 1.08
      );
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(0.7, 'transparent');
      rimGrad.addColorStop(0.92, `rgba(${cr},${cg},${cb},0.12)`);
      rimGrad.addColorStop(1, `rgba(${cr2},${cg2},${cb2},0.2)`);
      ctx!.fillStyle = rimGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.08, 0, Math.PI * 2);
      ctx!.fill();

      // Glass edge border (subtle)
      ctx!.strokeStyle = `rgba(255,255,255,0.06)`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.stroke();

      // Post count
      ctx!.save();
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.font = `italic 300 ${Math.max(11, planetR * 0.22)}px "Cormorant Garamond"`;
      ctx!.fillStyle = `rgba(255,255,255,0.2)`;
      ctx!.fillText(`${planet.count}`, cx, cy);
      ctx!.restore();

      // Stars in front of planet
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * tilt;
        const sy = Math.sin(angle);
        if (sy > 0.1) return; // only in front
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        drawGlassStar(ctx!, sx, starY, so.size, cr, cg, cb, cr2, cg2, cb2, 0.75, t, so.seed);
      });

      // Floating sparkles near planet surface
      for (let i = 0; i < 6; i++) {
        const sparkAngle = t * 0.0005 + i * 1.047;
        const sparkDist = planetR * (1.1 + 0.1 * Math.sin(t * 0.002 + i));
        const sx = cx + Math.cos(sparkAngle) * sparkDist;
        const sy = cy + Math.sin(sparkAngle) * sparkDist * tilt;
        const sparkAlpha = 0.15 + 0.1 * Math.sin(t * 0.004 + i * 2);
        ctx!.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [planet, starOrbits, particles]);

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
    const cxp = w / 2;
    const cyp = h * 0.36;
    const planetR = Math.min(w * 0.18, 85);

    // Planet tap
    if (Math.hypot(mx - cxp, my - cyp) < planetR * 1.2) {
      onPlanetTap();
      return;
    }

    // Star tap
    const tSec = performance.now() / 1000;
    const tilt = 0.55;
    let closest: PostData | null = null;
    let minD = 35;
    starOrbits.forEach(so => {
      const angle = so.angle0 + tSec * so.speed;
      const orbitRx = planetR * so.orbitMul;
      const orbitRy = orbitRx * tilt;
      const sx = cxp + Math.cos(angle) * orbitRx;
      const sy = cyp + Math.sin(angle) * orbitRy;
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
        <h2 className="font-brand italic font-normal mb-1.5" style={{
          fontSize: '1.9rem',
          color: `rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.9)`,
          textShadow: `0 0 40px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.25), 0 0 80px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.08)`,
        }}>{planet.name}</h2>
        <p style={{ fontSize: '.85rem', fontWeight: 300, color: 'rgba(248,244,255,.4)', letterSpacing: '.02em' }}>
          {planet.count}개의 별 · 우주의 {planet.pct}%
        </p>
      </div>

      {/* Hint card (glassmorphism) */}
      <div className="absolute z-10 left-5 right-5" style={{ bottom: '11%' }}>
        <div className="mx-auto rounded-2xl text-center" style={{
          maxWidth: 340, padding: '12px 18px',
          background: 'rgba(255,255,255,.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <p className="font-light" style={{ fontSize: '.78rem', color: 'rgba(248,244,255,.3)', lineHeight: 1.5 }}>
            별을 터치하면 AI 인사이트 · 행성을 터치하면 카테고리 분석
          </p>
        </div>
      </div>
    </div>
  );
}

// Draw a premium glassmorphism-style star with layered glow, iridescence and twinkle
function drawGlassStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  cr: number, cg: number, cb: number,
  cr2: number, cg2: number, cb2: number,
  baseAlpha: number, t: number, seed: number,
) {
  // Smooth twinkle
  const tw = 0.5 + 0.5 * Math.sin(t * 0.0025 + seed * 20);
  const alpha = baseAlpha * (0.5 + 0.5 * tw);

  // Outer nebula glow (soft, wide)
  const outerR = size * 6;
  const g1 = ctx.createRadialGradient(x, y, 0, x, y, outerR);
  g1.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.15})`);
  g1.addColorStop(0.4, `rgba(${cr2},${cg2},${cb2},${alpha * 0.05})`);
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(x, y, outerR, 0, Math.PI * 2);
  ctx.fill();

  // Mid glow (iridescent shift)
  const midR = size * 2.5;
  const g2 = ctx.createRadialGradient(x, y, 0, x, y, midR);
  g2.addColorStop(0, `rgba(${cr2},${cg2},${cb2},${alpha * 0.35})`);
  g2.addColorStop(0.5, `rgba(${cr},${cg},${cb},${alpha * 0.12})`);
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(x, y, midR, 0, Math.PI * 2);
  ctx.fill();

  // Core (white-hot center)
  const coreR = size * 0.6;
  const g3 = ctx.createRadialGradient(x, y, 0, x, y, coreR);
  g3.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
  g3.addColorStop(0.4, `rgba(255,250,255,${alpha * 0.4})`);
  g3.addColorStop(1, `rgba(${cr},${cg},${cb},${alpha * 0.1})`);
  ctx.fillStyle = g3;
  ctx.beginPath();
  ctx.arc(x, y, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Cross-flare for brighter stars
  if (size > 3.5 && alpha > 0.3) {
    const flareLen = size * 3;
    const flareAlpha = alpha * 0.15;
    ctx.strokeStyle = `rgba(255,255,255,${flareAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - flareLen, y);
    ctx.lineTo(x + flareLen, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y - flareLen * 0.7);
    ctx.lineTo(x, y + flareLen * 0.7);
    ctx.stroke();
  }
}
