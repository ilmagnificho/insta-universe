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

  // Group posts by category
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
        return {
          name,
          cat,
          count: catPosts.length,
          pct: Math.round(catPosts.length / posts.length * 100),
          posts: catPosts,
        };
      });
  }, [posts]);

  // Handle scroll to detect active planet
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(Math.min(Math.max(0, index), planets.length - 1));
  }, [planets.length]);

  // Create UniverseStar from PostData for callback compatibility
  const makeUniverseStar = useCallback((post: PostData): UniverseStar => ({
    x: 0, y: 0,
    size: 2 + (post.likes / 800) * 4,
    post,
    ts: 0.01, to: 0, fa: 0,
  }), []);

  const handleStarTap = useCallback((post: PostData) => {
    onStarTap?.(makeUniverseStar(post));
  }, [onStarTap, makeUniverseStar]);

  const handlePlanetTap = useCallback((planet: PlanetData) => {
    const cluster: ClusterCenter = {
      x: 0, y: 0,
      name: planet.name,
      cat: planet.cat,
      count: planet.count,
      pct: planet.pct,
    };
    const stars = planet.posts.map(p => makeUniverseStar(p));
    onClusterTap?.(cluster, stars);
  }, [onClusterTap, makeUniverseStar]);

  const scrollToIndex = useCallback((i: number) => {
    scrollRef.current?.scrollTo({
      left: i * (scrollRef.current?.clientWidth || 0),
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="fixed inset-0" style={{ background: '#0c0818' }}>
      {/* Background stars */}
      <BackgroundStars />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-[102]"
        style={{
          background: 'linear-gradient(to bottom, rgba(12,8,24,.95) 50%, transparent)',
          padding: '14px 20px 28px',
        }}>
        <span className="font-brand italic" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.4)' }}>
          <b className="not-italic font-normal" style={{ color: 'rgba(248,244,255,.6)' }}>@{username}</b>의 우주
        </span>

        {/* Planet navigation pills */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {planets.map((planet, i) => (
            <button
              key={planet.name}
              onClick={() => scrollToIndex(i)}
              className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer active:bg-white/[.05]"
              style={{
                fontSize: '.72rem', fontWeight: 300,
                color: i === activeIndex ? 'rgba(248,244,255,.7)' : 'rgba(248,244,255,.35)',
                padding: '5px 11px', borderRadius: 20, whiteSpace: 'nowrap',
                border: i === activeIndex
                  ? `1px solid ${planet.cat.hex}30`
                  : '1px solid rgba(210,160,200,.06)',
                background: i === activeIndex
                  ? `${planet.cat.hex}12`
                  : 'rgba(210,160,200,.03)',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all .3s',
              }}
            >
              <span className="rounded-full flex-shrink-0" style={{
                width: 6, height: 6,
                background: planet.cat.hex,
                boxShadow: i === activeIndex ? `0 0 6px ${planet.cat.hex}60` : 'none',
              }} />
              {planet.name} {planet.pct}%
            </button>
          ))}
        </div>
      </div>

      {/* Planet carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto h-full"
        style={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={handleScroll}
      >
        {planets.map((planet, i) => (
          <PlanetSlide
            key={planet.name}
            planet={planet}
            index={i}
            total={planets.length}
            onStarTap={handleStarTap}
            onPlanetTap={() => handlePlanetTap(planet)}
          />
        ))}
      </div>

      {/* Page indicators */}
      <div className="fixed left-0 right-0 z-[101] flex justify-center gap-2"
        style={{ bottom: 100 }}>
        {planets.map((planet, i) => (
          <button
            key={planet.name}
            className="rounded-full cursor-pointer"
            onClick={() => scrollToIndex(i)}
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              background: i === activeIndex ? planet.cat.hex : 'rgba(248,244,255,.15)',
              boxShadow: i === activeIndex ? `0 0 8px ${planet.cat.hex}50` : 'none',
              border: 'none',
              padding: 0,
              transition: 'all .4s cubic-bezier(.16,1,.3,1)',
              WebkitTapHighlightColor: 'transparent',
            }}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <div className="fixed left-0 right-0 z-[100] text-center pointer-events-none"
        style={{ bottom: 78 }}>
        <p style={{
          fontSize: '.68rem', fontWeight: 300,
          color: 'rgba(248,244,255,.15)',
        }}>
          ← 스와이프하여 행성 탐험 →
        </p>
      </div>
    </div>
  );
}

// ===== Planet Slide =====
function PlanetSlide({ planet, index, total, onStarTap, onPlanetTap }: {
  planet: PlanetData;
  index: number;
  total: number;
  onStarTap: (post: PostData) => void;
  onPlanetTap: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // Compute stable star positions
  const starPositions = useMemo(() => {
    return planet.posts.map((post, i) => {
      const ring = i < 5 ? 0 : i < 12 ? 1 : 2;
      const ringCount = ring === 0 ? Math.min(5, planet.posts.length)
        : ring === 1 ? Math.min(7, planet.posts.length - 5)
          : planet.posts.length - 12;
      const indexInRing = ring === 0 ? i : ring === 1 ? i - 5 : i - 12;
      const baseAngle = (Math.PI * 2 / Math.max(1, ringCount)) * indexInRing;
      // Use post.id as seed for deterministic randomness
      const seed = ((post.id * 9301 + 49297) % 233280) / 233280;
      const angle = baseAngle + (seed - 0.5) * 0.4;
      const orbitBase = [1.4, 1.9, 2.4][ring];
      const orbitJitter = (seed * 0.15);
      const orbitRadius = orbitBase + orbitJitter;
      const size = 2 + (post.likes / 800) * 3.5;
      const speed = 0.0002 + seed * 0.0002;

      return { post, angle, orbitRadius, size, speed, seed };
    });
  }, [planet.posts]);

  // Canvas rendering for planet sphere + orbiting stars
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
    const cy = h * 0.40;
    const planetR = Math.min(w * 0.22, 100);
    const { r: cr, g: cg, b: cb } = planet.cat;

    function draw(t: number) {
      animRef.current = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Planet outer atmosphere glow
      const atm1 = ctx!.createRadialGradient(cx, cy, planetR * 0.6, cx, cy, planetR * 3);
      atm1.addColorStop(0, `rgba(${cr},${cg},${cb},0.05)`);
      atm1.addColorStop(0.6, `rgba(${cr},${cg},${cb},0.02)`);
      atm1.addColorStop(1, 'transparent');
      ctx!.fillStyle = atm1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 3, 0, Math.PI * 2);
      ctx!.fill();

      // Orbital rings (subtle)
      [1.4, 1.9, 2.4].forEach((ringR, ri) => {
        ctx!.strokeStyle = `rgba(${cr},${cg},${cb},${0.03 - ri * 0.008})`;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, planetR * ringR, planetR * ringR * 0.65, 0, 0, Math.PI * 2);
        ctx!.stroke();
      });

      // Orbiting stars
      starPositions.forEach(sp => {
        const angle = sp.angle + t * sp.speed;
        const orbitRx = planetR * sp.orbitRadius;
        const orbitRy = orbitRx * 0.65;
        const sx = cx + Math.cos(angle) * orbitRx;
        const sy = cy + Math.sin(angle) * orbitRy;

        // Behind planet check
        const behind = Math.sin(angle) > 0.2 && Math.abs(Math.cos(angle)) < 0.5;
        const baseAlpha = behind ? 0.12 : 0.65;

        // Star glow
        const sg = ctx!.createRadialGradient(sx, sy, 0, sx, sy, sp.size * 3.5);
        sg.addColorStop(0, `rgba(${cr},${cg},${cb},${baseAlpha * 0.35})`);
        sg.addColorStop(1, 'transparent');
        ctx!.fillStyle = sg;
        ctx!.beginPath();
        ctx!.arc(sx, sy, sp.size * 3.5, 0, Math.PI * 2);
        ctx!.fill();

        // Star core
        const tw = 0.5 + 0.5 * Math.sin(t * 0.003 + sp.seed * 10);
        ctx!.fillStyle = `rgba(255,255,255,${baseAlpha * (0.4 + 0.6 * tw)})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, sp.size * 0.6, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Planet sphere - outer glow
      const pg1 = ctx!.createRadialGradient(cx, cy, planetR * 0.7, cx, cy, planetR * 1.3);
      pg1.addColorStop(0, `rgba(${cr},${cg},${cb},0.12)`);
      pg1.addColorStop(1, 'transparent');
      ctx!.fillStyle = pg1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR * 1.3, 0, Math.PI * 2);
      ctx!.fill();

      // Planet sphere - main body
      const pg2 = ctx!.createRadialGradient(
        cx - planetR * 0.3, cy - planetR * 0.3, 0,
        cx, cy, planetR
      );
      pg2.addColorStop(0, `rgba(${Math.min(255, cr + 50)},${Math.min(255, cg + 50)},${Math.min(255, cb + 50)},0.45)`);
      pg2.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.35)`);
      pg2.addColorStop(0.7, `rgba(${Math.max(0, cr - 30)},${Math.max(0, cg - 30)},${Math.max(0, cb - 30)},0.25)`);
      pg2.addColorStop(1, `rgba(${Math.max(0, cr - 60)},${Math.max(0, cg - 60)},${Math.max(0, cb - 60)},0.12)`);
      ctx!.fillStyle = pg2;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Planet specular highlight
      const hl = ctx!.createRadialGradient(
        cx - planetR * 0.3, cy - planetR * 0.3, 0,
        cx - planetR * 0.3, cy - planetR * 0.3, planetR * 0.55
      );
      hl.addColorStop(0, 'rgba(255,255,255,0.12)');
      hl.addColorStop(0.5, 'rgba(255,255,255,0.03)');
      hl.addColorStop(1, 'transparent');
      ctx!.fillStyle = hl;
      ctx!.beginPath();
      ctx!.arc(cx, cy, planetR, 0, Math.PI * 2);
      ctx!.fill();

      // Planet count text
      ctx!.save();
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.font = `italic 300 ${Math.max(12, planetR * 0.22)}px "Cormorant Garamond"`;
      ctx!.fillStyle = `rgba(255,255,255,0.2)`;
      ctx!.fillText(`${planet.count}`, cx, cy);
      ctx!.restore();
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [planet, starPositions]);

  // Handle tap on canvas - detect star hits
  const handleCanvasTap = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h * 0.40;
    const planetR = Math.min(w * 0.22, 100);

    // Check planet tap
    const planetDist = Math.hypot(mx - cx, my - cy);
    if (planetDist < planetR * 1.1) {
      onPlanetTap();
      return;
    }

    // Check star taps (using current animation time for positions)
    const t = performance.now();
    let closestPost: PostData | null = null;
    let minDist = 35; // tap radius in pixels

    starPositions.forEach(sp => {
      const angle = sp.angle + t * sp.speed;
      const orbitRx = planetR * sp.orbitRadius;
      const orbitRy = orbitRx * 0.65;
      const sx = cx + Math.cos(angle) * orbitRx;
      const sy = cy + Math.sin(angle) * orbitRy;

      const d = Math.hypot(mx - sx, my - sy);
      if (d < minDist) {
        minDist = d;
        closestPost = sp.post;
      }
    });

    if (closestPost) {
      onStarTap(closestPost);
    }
  }, [starPositions, onStarTap, onPlanetTap]);

  // Track pointer for tap vs drag detection
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    const dt = Date.now() - pointerStart.current.t;
    pointerStart.current = null;

    // Only trigger tap if pointer didn't move much and was quick
    if (Math.hypot(dx, dy) < 15 && dt < 400) {
      handleCanvasTap(e);
    }
  }, [handleCanvasTap]);

  return (
    <div
      className="flex-shrink-0 w-screen h-screen relative"
      style={{ scrollSnapAlign: 'center' }}
    >
      {/* Canvas for planet + orbiting stars */}
      <div className="absolute inset-0" style={{ top: 80 }}>
        <canvas
          ref={canvasRef}
          className="touch-none"
          style={{ cursor: 'pointer' }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
      </div>

      {/* Planet info */}
      <div className="absolute z-10 text-center left-0 right-0" style={{ bottom: '25%' }}>
        <h2 className="font-brand italic font-normal mb-1" style={{
          fontSize: '1.8rem',
          color: `rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.85)`,
          textShadow: `0 0 30px rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.2)`,
        }}>
          {planet.name}
        </h2>
        <p style={{
          fontSize: '.88rem', fontWeight: 300,
          color: 'rgba(248,244,255,.45)',
        }}>
          {planet.count}개의 별 · 우주의 {planet.pct}%
        </p>
      </div>

      {/* Insight card */}
      <div className="absolute z-10 left-5 right-5" style={{ bottom: '13%' }}>
        <div className="mx-auto rounded-2xl text-center" style={{
          maxWidth: 340,
          padding: '14px 18px',
          background: 'rgba(12,14,32,.85)',
          backdropFilter: 'blur(12px)',
          border: `1px solid rgba(${planet.cat.r},${planet.cat.g},${planet.cat.b},0.08)`,
        }}>
          <p className="font-light" style={{
            fontSize: '.82rem',
            color: 'rgba(248,244,255,.45)',
            lineHeight: 1.6,
          }}>
            행성을 터치하면 카테고리 분석을,<br />
            별을 터치하면 게시물 인사이트를 볼 수 있어요
          </p>
        </div>
      </div>

      {/* Navigation arrows */}
      {index > 0 && (
        <div className="absolute left-3 z-10 pointer-events-none"
          style={{ top: '40%', transform: 'translateY(-50%)' }}>
          <span style={{ fontSize: '1rem', color: 'rgba(248,244,255,.1)' }}>‹</span>
        </div>
      )}
      {index < total - 1 && (
        <div className="absolute right-3 z-10 pointer-events-none"
          style={{ top: '40%', transform: 'translateY(-50%)' }}>
          <span style={{ fontSize: '1rem', color: 'rgba(248,244,255,.1)' }}>›</span>
        </div>
      )}
    </div>
  );
}

// ===== Background Stars =====
function BackgroundStars() {
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

    const stars: { x: number; y: number; r: number; a: number; sp: number; ph: number }[] = [];
    for (let i = 0; i < 180; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 0.6 + 0.08,
        a: Math.random() * 0.3 + 0.05,
        sp: Math.random() * 0.005 + 0.001,
        ph: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      stars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        ctx!.fillStyle = `rgba(200,190,240,${s.a * tw})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
}
