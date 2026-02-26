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
    <div className="fixed inset-0" style={{ background: '#05031a' }}>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[102]" style={{
        background: 'linear-gradient(to bottom, rgba(5,3,26,.98) 40%, transparent)',
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

      {/* Swipe arrows - animated */}
      {planets.length > 1 && (
        <div className="fixed left-0 right-0 z-[100] flex items-center justify-center gap-3 pointer-events-none" style={{ bottom: 58 }}>
          {activeIndex > 0 && (
            <span style={{
              fontSize: '1rem', color: 'rgba(248,244,255,.2)',
              animation: 'swipeHintLeft 1.5s ease-in-out infinite',
            }}>&#8249;</span>
          )}
          <span style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(248,244,255,.25)' }}>
            스와이프하여 {planets.length}개 행성 탐험
          </span>
          {activeIndex < planets.length - 1 && (
            <span style={{
              fontSize: '1rem', color: 'rgba(248,244,255,.2)',
              animation: 'swipeHintRight 1.5s ease-in-out infinite',
            }}>&#8250;</span>
          )}
        </div>
      )}
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
        orbitMul: [1.55, 2.1, 2.75][ring] + seed * 0.15,
        speed: (0.1 + seed * 0.15) * (ring === 0 ? 1 : ring === 1 ? 0.6 : 0.35),
        size: Math.max(2, 3 + (post.likes / 500) * 4),
        seed,
        ring,
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
    const cy = h * 0.36;
    const planetR = Math.min(w * 0.2, 95);
    const { r: cr, g: cg, b: cb } = planet.cat;

    // Complementary colors for richness
    const cr2 = Math.min(255, cr + 70);
    const cg2 = Math.min(255, cg + 50);
    const cb2 = Math.min(255, cb + 90);
    const crD = Math.max(0, cr - 40);
    const cgD = Math.max(0, cg - 40);
    const cbD = Math.max(0, cb - 40);

    // Background stars - 3 layers
    const bgStars: { x: number; y: number; r: number; a: number; sp: number; ph: number; hue: number }[] = [];
    for (let i = 0; i < 220; i++) {
      const layer = Math.random() < 0.08 ? 2 : Math.random() < 0.3 ? 1 : 0;
      bgStars.push({
        x: Math.random() * w, y: Math.random() * h,
        r: layer === 2 ? Math.random() * 1.3 + 0.5 : layer === 1 ? Math.random() * 0.7 + 0.15 : Math.random() * 0.35 + 0.05,
        a: layer === 2 ? Math.random() * 0.5 + 0.35 : layer === 1 ? Math.random() * 0.3 + 0.08 : Math.random() * 0.15 + 0.02,
        sp: Math.random() * 0.004 + 0.0005, ph: Math.random() * Math.PI * 2,
        hue: Math.random(),
      });
    }

    // Ambient nebula clouds
    const nebulae: { x: number; y: number; rx: number; ry: number; cr: number; cg: number; cb: number; a: number; rot: number }[] = [];
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 / 5) * i + Math.random() * 0.5;
      const dist = planetR * 2 + Math.random() * planetR * 2;
      nebulae.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist * 0.6,
        rx: 80 + Math.random() * 120,
        ry: 50 + Math.random() * 80,
        cr: cr + (Math.random() - 0.5) * 60,
        cg: cg + (Math.random() - 0.5) * 60,
        cb: cb + (Math.random() - 0.5) * 60,
        a: 0.015 + Math.random() * 0.02,
        rot: Math.random() * Math.PI,
      });
    }

    function draw(t: number) {
      animRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Background stars with color temperature
      bgStars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        const sa = s.a * tw;
        // Color temperature: warm-white to blue-white
        const sr = s.hue < 0.3 ? 255 : s.hue < 0.6 ? 230 : 200;
        const sg = s.hue < 0.3 ? 220 : s.hue < 0.6 ? 225 : 210;
        const sb = s.hue < 0.3 ? 200 : s.hue < 0.6 ? 245 : 255;

        if (s.r > 0.8) {
          // Bright stars get a soft glow
          const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
          g.addColorStop(0, `rgba(${sr},${sg},${sb},${sa * 0.25})`);
          g.addColorStop(0.5, `rgba(${sr},${sg},${sb},${sa * 0.06})`);
          g.addColorStop(1, 'transparent');
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 6, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.fillStyle = `rgba(${sr},${sg},${sb},${sa})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Ambient nebula clouds (slowly drifting)
      nebulae.forEach(n => {
        ctx!.save();
        ctx!.translate(n.x, n.y);
        ctx!.rotate(n.rot + t * 0.00003);
        const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, n.rx);
        const pulse = 0.8 + 0.2 * Math.sin(t * 0.0004 + n.rot);
        g.addColorStop(0, `rgba(${Math.min(255, n.cr)},${Math.min(255, n.cg)},${Math.min(255, n.cb)},${n.a * pulse})`);
        g.addColorStop(0.4, `rgba(${Math.min(255, n.cr)},${Math.min(255, n.cg)},${Math.min(255, n.cb)},${n.a * 0.3 * pulse})`);
        g.addColorStop(1, 'transparent');
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, n.rx, n.ry, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      });

      const pulse = 0.92 + 0.08 * Math.sin(t * 0.0008);
      const breathe = 0.95 + 0.05 * Math.sin(t * 0.0012 + 1);
      const tilt = 0.55;

      // === OUTER ATMOSPHERE (multi-layer) ===
      // Layer 1: vast cosmic aura
      const aura = ctx!.createRadialGradient(cx, cy, planetR * 0.5, cx, cy, planetR * 5 * pulse);
      aura.addColorStop(0, `rgba(${cr},${cg},${cb},0.03)`);
      aura.addColorStop(0.2, `rgba(${cr2},${cg2},${cb2},0.015)`);
      aura.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.005)`);
      aura.addColorStop(1, 'transparent');
      ctx!.fillStyle = aura;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 5 * pulse, 0, Math.PI * 2);
      ctx!.fill();

      // Layer 2: Warm atmospheric glow (offset for asymmetry)
      const atmo = ctx!.createRadialGradient(cx - planetR * 0.3, cy - planetR * 0.2, 0, cx, cy, planetR * 2.5 * breathe);
      atmo.addColorStop(0, `rgba(${cr2},${cg2},${cb2},0.06)`);
      atmo.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.035)`);
      atmo.addColorStop(0.6, `rgba(${crD},${cgD},${cbD},0.012)`);
      atmo.addColorStop(1, 'transparent');
      ctx!.fillStyle = atmo;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 2.5 * breathe, 0, Math.PI * 2);
      ctx!.fill();

      // Layer 3: inner halo (sharp)
      const halo = ctx!.createRadialGradient(cx, cy, planetR * 0.85, cx, cy, planetR * 1.6);
      halo.addColorStop(0, `rgba(${cr},${cg},${cb},0.12)`);
      halo.addColorStop(0.4, `rgba(${cr2},${cg2},${cb2},0.05)`);
      halo.addColorStop(1, 'transparent');
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.6, 0, Math.PI * 2);
      ctx!.fill();

      // === ORBIT RINGS ===
      ctx!.save();
      ctx!.translate(cx, cy);
      [1.55, 2.1, 2.75].forEach((ringMul, ri) => {
        const ringR = planetR * ringMul;
        const baseA = 0.06 - ri * 0.012;
        // Outer glow ring
        ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${baseA * 0.8})`;
        ctx!.lineWidth = 2.5;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, ringR, ringR * tilt, 0, 0, Math.PI * 2);
        ctx!.stroke();
        // Bright inner line
        ctx!.strokeStyle = `rgba(255,255,255,${baseA * 0.35})`;
        ctx!.lineWidth = 0.6;
        ctx!.beginPath();
        ctx!.ellipse(0, 0, ringR, ringR * tilt, 0, 0, Math.PI * 2);
        ctx!.stroke();
      });
      ctx!.restore();

      // === STARS BEHIND PLANET ===
      const tSec = t / 1000;
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * tilt;
        const sy = Math.sin(angle);
        if (sy <= 0.1) return;
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        const depthFade = 0.15 + 0.1 * (1 - sy);
        drawPremiumStar(ctx!, sx, starY, so.size * 0.5, cr, cg, cb, cr2, cg2, cb2, depthFade, t, so.seed);
      });

      // === PLANET SPHERE (premium multi-layer rendering) ===
      ctx!.save();

      // Shadow/terminator effect (lit from top-left)
      const shadowGrad = ctx!.createRadialGradient(
        cx - planetR * 0.45, cy - planetR * 0.4, planetR * 0.1,
        cx + planetR * 0.2, cy + planetR * 0.2, planetR * 1.2
      );
      shadowGrad.addColorStop(0, `rgba(${Math.min(255, cr + 80)},${Math.min(255, cg + 80)},${Math.min(255, cb + 80)},0.45)`);
      shadowGrad.addColorStop(0.25, `rgba(${cr},${cg},${cb},0.35)`);
      shadowGrad.addColorStop(0.55, `rgba(${crD},${cgD},${cbD},0.22)`);
      shadowGrad.addColorStop(0.8, `rgba(${Math.max(0, cr - 70)},${Math.max(0, cg - 70)},${Math.max(0, cb - 70)},0.12)`);
      shadowGrad.addColorStop(1, `rgba(10,5,30,0.06)`);
      ctx!.fillStyle = shadowGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Surface texture bands (clipped, slowly rotating)
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.clip();

      // Band 1-5: surface "cloud" formations
      const bandT = t * 0.00015;
      for (let b = 0; b < 5; b++) {
        const bAngle = bandT + b * 1.257;
        const bDist = planetR * (0.15 + b * 0.12);
        const bx = cx + Math.cos(bAngle) * bDist;
        const by = cy + Math.sin(bAngle * 0.7) * bDist * 0.4;
        const bandR = planetR * (0.35 + Math.sin(b * 1.5) * 0.15);
        const bandA = 0.08 + Math.sin(t * 0.0003 + b * 2) * 0.03;

        const bg = ctx!.createRadialGradient(bx, by, 0, bx, by, bandR);
        bg.addColorStop(0, `rgba(${cr2},${cg2},${cb2},${bandA})`);
        bg.addColorStop(0.4, `rgba(${cr},${cg},${cb},${bandA * 0.4})`);
        bg.addColorStop(1, 'transparent');
        ctx!.fillStyle = bg;
        ctx!.beginPath();
        ctx!.arc(bx, by, bandR, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Horizontal atmospheric bands (like gas giant)
      for (let b = 0; b < 4; b++) {
        const bandY = cy - planetR * 0.5 + (planetR / 3) * b;
        const bandH = planetR * 0.12;
        const bandAlpha = 0.04 + Math.sin(t * 0.0002 + b) * 0.015;
        ctx!.fillStyle = `rgba(${cr2},${cg2},${cb2},${bandAlpha})`;
        ctx!.fillRect(cx - planetR, bandY, planetR * 2, bandH);
      }
      ctx!.restore();

      // Specular highlight (crisp, top-left)
      const specGrad = ctx!.createRadialGradient(
        cx - planetR * 0.35, cy - planetR * 0.35, 0,
        cx - planetR * 0.15, cy - planetR * 0.15, planetR * 0.7
      );
      specGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
      specGrad.addColorStop(0.15, 'rgba(255,255,255,0.18)');
      specGrad.addColorStop(0.35, 'rgba(255,255,255,0.06)');
      specGrad.addColorStop(0.6, 'rgba(255,255,255,0.01)');
      specGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = specGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Rim light (bottom-right edge, colored + bright)
      const rimGrad = ctx!.createRadialGradient(
        cx + planetR * 0.4, cy + planetR * 0.3, planetR * 0.3,
        cx, cy, planetR * 1.05
      );
      rimGrad.addColorStop(0, 'transparent');
      rimGrad.addColorStop(0.65, 'transparent');
      rimGrad.addColorStop(0.88, `rgba(${cr},${cg},${cb},0.2)`);
      rimGrad.addColorStop(0.95, `rgba(${cr2},${cg2},${cb2},0.35)`);
      rimGrad.addColorStop(1, `rgba(255,255,255,0.12)`);
      ctx!.fillStyle = rimGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.05, 0, Math.PI * 2);
      ctx!.fill();

      // Fresnel edge glow (entire circumference)
      const fresnelGrad = ctx!.createRadialGradient(cx, cy, planetR * 0.75, cx, cy, planetR * 1.08);
      fresnelGrad.addColorStop(0, 'transparent');
      fresnelGrad.addColorStop(0.6, 'transparent');
      fresnelGrad.addColorStop(0.85, `rgba(${cr},${cg},${cb},0.08)`);
      fresnelGrad.addColorStop(1, `rgba(${cr2},${cg2},${cb2},0.18)`);
      ctx!.fillStyle = fresnelGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.08, 0, Math.PI * 2);
      ctx!.fill();

      // Glass border
      ctx!.strokeStyle = `rgba(255,255,255,0.08)`;
      ctx!.lineWidth = 0.8;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.stroke();

      // Post count in center (subtle)
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.font = `italic 300 ${Math.max(12, planetR * 0.22)}px "Cormorant Garamond"`;
      ctx!.fillStyle = `rgba(255,255,255,0.22)`;
      ctx!.fillText(`${planet.count}`, cx, cy);

      ctx!.restore();

      // === STARS IN FRONT OF PLANET ===
      starOrbits.forEach(so => {
        const angle = so.angle0 + tSec * so.speed;
        const orbitRx = planetR * so.orbitMul;
        const orbitRy = orbitRx * tilt;
        const sy = Math.sin(angle);
        if (sy > 0.1) return;
        const sx = cx + Math.cos(angle) * orbitRx;
        const starY = cy + sy * orbitRy;
        drawPremiumStar(ctx!, sx, starY, so.size, cr, cg, cb, cr2, cg2, cb2, 0.85, t, so.seed);
      });

      // === FLOATING SPARKLES around planet ===
      for (let i = 0; i < 8; i++) {
        const sparkAngle = t * 0.0004 + i * 0.785;
        const sparkDist = planetR * (1.12 + 0.15 * Math.sin(t * 0.0015 + i * 1.2));
        const sx = cx + Math.cos(sparkAngle) * sparkDist;
        const sy = cy + Math.sin(sparkAngle) * sparkDist * tilt;
        const sparkAlpha = 0.25 + 0.15 * Math.sin(t * 0.005 + i * 2.5);
        const sparkSize = 0.6 + 0.3 * Math.sin(t * 0.003 + i);

        // Sparkle glow
        const sg = ctx!.createRadialGradient(sx, sy, 0, sx, sy, sparkSize * 6);
        sg.addColorStop(0, `rgba(${cr2},${cg2},${cb2},${sparkAlpha * 0.3})`);
        sg.addColorStop(1, 'transparent');
        ctx!.fillStyle = sg;
        ctx!.beginPath();
        ctx!.arc(sx, sy, sparkSize * 6, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(255,255,255,${sparkAlpha})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, sparkSize, 0, Math.PI * 2);
        ctx!.fill();
      }

      // === VIGNETTE ===
      const vig = ctx!.createRadialGradient(cx, cy, w * 0.15, cx, h * 0.5, w * 0.7);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(5,3,26,.45)');
      ctx!.fillStyle = vig;
      ctx!.fillRect(0, 0, w, h);
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
    const cxp = w / 2;
    const cyp = h * 0.36;
    const planetR = Math.min(w * 0.2, 95);

    if (Math.hypot(mx - cxp, my - cyp) < planetR * 1.2) {
      onPlanetTap();
      return;
    }

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
          color: `rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.95)`,
          textShadow: `0 0 40px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.35), 0 0 80px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.12)`,
        }}>{planet.name}</h2>
        <p style={{ fontSize: '.85rem', fontWeight: 300, color: 'rgba(248,244,255,.45)', letterSpacing: '.02em' }}>
          {planet.count}개의 별 · 우주의 {planet.pct}%
        </p>
      </div>

      {/* Hint card - more visible with pulsing glow */}
      <div className="absolute z-10 left-5 right-5" style={{ bottom: '11%' }}>
        <div className="mx-auto rounded-2xl text-center" style={{
          maxWidth: 340, padding: '14px 18px',
          background: 'rgba(18,12,30,.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(210,160,200,.12)',
          boxShadow: '0 0 20px rgba(210,160,200,.06)',
        }}>
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full" style={{
                width: 6, height: 6,
                background: 'rgba(255,255,255,.5)',
                boxShadow: '0 0 8px rgba(255,255,255,.3)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '.75rem', fontWeight: 300, color: 'rgba(248,244,255,.5)' }}>
                별 터치 = AI 인사이트
              </span>
            </div>
            <span style={{ fontSize: '.6rem', color: 'rgba(248,244,255,.15)' }}>|</span>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full" style={{
                width: 10, height: 10,
                background: `rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},.4)`,
                boxShadow: `0 0 8px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},.3)`,
                animation: 'pulse 2s ease-in-out infinite .5s',
              }} />
              <span style={{ fontSize: '.75rem', fontWeight: 300, color: 'rgba(248,244,255,.5)' }}>
                행성 터치 = 분석
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Premium star rendering with multi-layer glow =====
function drawPremiumStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  cr: number, cg: number, cb: number,
  cr2: number, cg2: number, cb2: number,
  baseAlpha: number, t: number, seed: number,
) {
  // Organic twinkle with multiple frequencies
  const tw1 = Math.sin(t * 0.0025 + seed * 20);
  const tw2 = Math.sin(t * 0.004 + seed * 13);
  const tw = 0.5 + 0.3 * tw1 + 0.2 * tw2;
  const alpha = baseAlpha * (0.4 + 0.6 * tw);

  // Layer 1: Wide nebula halo
  const outerR = size * 8;
  const g1 = ctx.createRadialGradient(x, y, 0, x, y, outerR);
  g1.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * 0.12})`);
  g1.addColorStop(0.25, `rgba(${cr2},${cg2},${cb2},${alpha * 0.05})`);
  g1.addColorStop(0.6, `rgba(${cr},${cg},${cb},${alpha * 0.015})`);
  g1.addColorStop(1, 'transparent');
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(x, y, outerR, 0, Math.PI * 2);
  ctx.fill();

  // Layer 2: Color glow (iridescent shift)
  const midR = size * 3;
  const g2 = ctx.createRadialGradient(x, y, 0, x, y, midR);
  g2.addColorStop(0, `rgba(${cr2},${cg2},${cb2},${alpha * 0.45})`);
  g2.addColorStop(0.35, `rgba(${cr},${cg},${cb},${alpha * 0.2})`);
  g2.addColorStop(0.7, `rgba(${cr},${cg},${cb},${alpha * 0.05})`);
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(x, y, midR, 0, Math.PI * 2);
  ctx.fill();

  // Layer 3: Bright core
  const coreR = size * 0.8;
  const g3 = ctx.createRadialGradient(x, y, 0, x, y, coreR);
  g3.addColorStop(0, `rgba(255,255,255,${alpha * 0.95})`);
  g3.addColorStop(0.3, `rgba(255,252,255,${alpha * 0.55})`);
  g3.addColorStop(0.7, `rgba(${Math.min(255, cr + 80)},${Math.min(255, cg + 80)},${Math.min(255, cb + 80)},${alpha * 0.2})`);
  g3.addColorStop(1, `rgba(${cr},${cg},${cb},${alpha * 0.05})`);
  ctx.fillStyle = g3;
  ctx.beginPath();
  ctx.arc(x, y, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Layer 4: Cross-flare for bright stars
  if (size > 3 && alpha > 0.25) {
    const flareLen = size * 4 * tw;
    const fa = alpha * 0.12 * tw;
    ctx.strokeStyle = `rgba(255,255,255,${fa})`;
    ctx.lineWidth = 0.6;
    // Horizontal
    ctx.beginPath();
    ctx.moveTo(x - flareLen, y);
    ctx.lineTo(x + flareLen, y);
    ctx.stroke();
    // Vertical (slightly shorter)
    ctx.beginPath();
    ctx.moveTo(x, y - flareLen * 0.75);
    ctx.lineTo(x, y + flareLen * 0.75);
    ctx.stroke();

    // Diagonal flares for really bright stars
    if (size > 4.5) {
      const dLen = flareLen * 0.5;
      const da = fa * 0.5;
      ctx.strokeStyle = `rgba(${cr2},${cg2},${cb2},${da})`;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(x - dLen * 0.7, y - dLen * 0.7);
      ctx.lineTo(x + dLen * 0.7, y + dLen * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + dLen * 0.7, y - dLen * 0.7);
      ctx.lineTo(x - dLen * 0.7, y + dLen * 0.7);
      ctx.stroke();
    }
  }
}
