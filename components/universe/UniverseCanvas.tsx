'use client';

import { useEffect, useRef, useCallback } from 'react';
import type {
  PostData, Category, UniverseStar, ClusterCenter,
  Nebula, DustParticle, StreamParticle, ConstellationEdge,
} from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

interface Props {
  posts: PostData[];
  username: string;
  onStarTap?: (star: UniverseStar) => void;
  onClusterTap?: (cluster: ClusterCenter, stars: UniverseStar[]) => void;
  initialZoomStar?: boolean;
}

export default function UniverseCanvas({ posts, username, onStarTap, onClusterTap, initialZoomStar = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    stars: UniverseStar[];
    clusters: ClusterCenter[];
    nebulae: Nebula[];
    dust: DustParticle[];
    streams: StreamParticle[];
    edges: ConstellationEdge[];
    brightestStar: UniverseStar | null;
    cam: { x: number; y: number; zoom: number; tx: number; ty: number; tz: number };
    interaction: { isDragging: boolean; lastPt: { x: number; y: number } | null; tapStart: { x: number; y: number; t: number } | null; tapMoved: boolean; pinchDist: number };
    animId: number;
  }>({
    stars: [], clusters: [], nebulae: [], dust: [], streams: [], edges: [],
    brightestStar: null,
    cam: { x: 0, y: 0, zoom: 1, tx: 0, ty: 0, tz: 1 },
    interaction: { isDragging: false, lastPt: null, tapStart: null, tapMoved: false, pinchDist: 0 },
    animId: 0,
  });

  const onStarTapRef = useRef(onStarTap);
  const onClusterTapRef = useRef(onClusterTap);
  onStarTapRef.current = onStarTap;
  onClusterTapRef.current = onClusterTap;

  const sizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // Initialize universe data from posts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || posts.length === 0) return;

    const ctxOrNull = canvas.getContext('2d');
    if (!ctxOrNull) return;
    const ctx = ctxOrNull;

    sizeCanvas(canvas);
    const s = stateRef.current;
    const W = () => innerWidth;
    const H = () => innerHeight;

    // Group posts by category
    const groups: Record<string, PostData[]> = {};
    posts.forEach(p => {
      if (!groups[p.cat.name]) groups[p.cat.name] = [];
      groups[p.cat.name].push(p);
    });

    const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
    const angleStep = (Math.PI * 2) / groupKeys.length;
    const baseR = Math.min(W(), H()) * 0.26;

    // Build clusters
    s.clusters = [];
    s.stars = [];

    groupKeys.forEach((key, gi) => {
      const ang = angleStep * gi - Math.PI / 2;
      const gx = Math.cos(ang) * baseR;
      const gy = Math.sin(ang) * baseR;
      const cat = CATEGORIES.find(c => c.name === key) || CATEGORIES[2];

      s.clusters.push({
        x: gx, y: gy, name: key, cat,
        count: groups[key].length,
        pct: Math.round(groups[key].length / posts.length * 100),
      });

      groups[key].forEach((post, pi) => {
        const spread = Math.min(W(), H()) * 0.055 + groups[key].length * 2;
        const sa = (Math.PI * 2 / groups[key].length) * pi + Math.random() * 0.6;
        const sr = Math.random() * spread + 4;
        const size = 1.8 + (post.likes / 820) * 4;

        s.stars.push({
          x: gx + Math.cos(sa) * sr,
          y: gy + Math.sin(sa) * sr,
          size,
          post,
          ts: Math.random() * 0.015 + 0.005,
          to: Math.random() * Math.PI * 2,
          fa: Math.random() * Math.PI,
        });
      });
    });

    // Brightest star
    s.brightestStar = s.stars.reduce((a, b) => a.post.likes > b.post.likes ? a : b, s.stars[0]);

    // Nebulae
    s.nebulae = [];
    s.clusters.forEach(cc => {
      // Large primary nebula
      s.nebulae.push({ x: cc.x, y: cc.y, r: 80 + cc.count * 3, c: cc.cat, a: 0.04 + cc.count * 0.002 });
      // Surrounding wisps
      for (let i = 0; i < 6; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 60;
        s.nebulae.push({
          x: cc.x + Math.cos(ang) * dist,
          y: cc.y + Math.sin(ang) * dist,
          r: 25 + Math.random() * 50,
          c: cc.cat,
          a: Math.random() * 0.025 + 0.008,
        });
      }
    });

    // Inter-cluster color bridges
    for (let i = 0; i < s.clusters.length; i++) {
      const j = (i + 1) % s.clusters.length;
      const ci = s.clusters[i];
      const cj = s.clusters[j];
      for (let step = 0; step < 3; step++) {
        const t = (step + 1) / 4;
        s.nebulae.push({
          x: ci.x + (cj.x - ci.x) * t + (Math.random() - 0.5) * 40,
          y: ci.y + (cj.y - ci.y) * t + (Math.random() - 0.5) * 40,
          r: 15 + Math.random() * 25,
          c: {
            r: Math.round(ci.cat.r + (cj.cat.r - ci.cat.r) * t),
            g: Math.round(ci.cat.g + (cj.cat.g - ci.cat.g) * t),
            b: Math.round(ci.cat.b + (cj.cat.b - ci.cat.b) * t),
          },
          a: Math.random() * 0.012 + 0.004,
        });
      }
    }

    // Dust particles
    s.dust = [];
    for (let i = 0; i < 500; i++) {
      s.dust.push({
        x: (Math.random() - 0.5) * W() * 2.5,
        y: (Math.random() - 0.5) * H() * 2.5,
        r: Math.random() * 0.2 + 0.04,
        a: Math.random() * 0.08 + 0.01,
        cr: 170 + Math.random() * 70,
        cg: 160 + Math.random() * 60,
        cb: 200 + Math.random() * 50,
        sp: Math.random() * 0.008 + 0.002,
        ph: Math.random() * Math.PI * 2,
      });
    }

    // Streams between clusters
    s.streams = [];
    for (let i = 0; i < s.clusters.length; i++) {
      const j = (i + 1) % s.clusters.length;
      const ci = s.clusters[i];
      const cj = s.clusters[j];
      const pts = 20;
      for (let p = 0; p < pts; p++) {
        const t = p / pts;
        const mx = ci.x + (cj.x - ci.x) * t;
        const my = ci.y + (cj.y - ci.y) * t;
        const perp = Math.sin(t * Math.PI) * 25;
        const ang = Math.atan2(cj.y - ci.y, cj.x - ci.x) + Math.PI / 2;
        s.streams.push({
          x: mx + Math.cos(ang) * perp + (Math.random() - 0.5) * 15,
          y: my + Math.sin(ang) * perp + (Math.random() - 0.5) * 15,
          r: Math.random() * 0.3 + 0.1,
          c: {
            r: Math.round(ci.cat.r + (cj.cat.r - ci.cat.r) * t),
            g: Math.round(ci.cat.g + (cj.cat.g - ci.cat.g) * t),
            b: Math.round(ci.cat.b + (cj.cat.b - ci.cat.b) * t),
          },
          sp: Math.random() * 0.01 + 0.003,
          ph: Math.random() * Math.PI * 2,
          a: Math.random() * 0.06 + 0.02,
        });
      }
    }

    // Constellation edges (lines between same-category stars)
    s.edges = [];
    for (let i = 0; i < s.stars.length; i++) {
      let closest: number | null = null;
      let minDist = 55;
      for (let j = 0; j < s.stars.length; j++) {
        if (i === j || s.stars[i].post.cat.name !== s.stars[j].post.cat.name) continue;
        const d = Math.hypot(s.stars[i].x - s.stars[j].x, s.stars[i].y - s.stars[j].y);
        if (d < minDist) { minDist = d; closest = j; }
      }
      if (closest !== null && !s.edges.find(e => (e.a === i && e.b === closest) || (e.a === closest && e.b === i))) {
        s.edges.push({ a: i, b: closest, c: s.stars[i].post.cat });
      }
    }

    // Camera: start zoomed on brightest star, then zoom out
    if (initialZoomStar && s.brightestStar) {
      s.cam.tx = -s.brightestStar.x * 0.3;
      s.cam.ty = -s.brightestStar.y * 0.3;
      s.cam.tz = 1.6;
      s.cam.x = s.cam.tx;
      s.cam.y = s.cam.ty;
      s.cam.zoom = s.cam.tz;

      setTimeout(() => {
        s.cam.tx = 0; s.cam.ty = 0; s.cam.tz = 1;
      }, 3500);
    }

    // ===== Render loop =====
    function draw(t: number) {
      s.animId = requestAnimationFrame(draw);
      const w = W();
      const h = H();
      const cam = s.cam;

      cam.x += (cam.tx - cam.x) * 0.04;
      cam.y += (cam.ty - cam.y) * 0.04;
      cam.zoom += (cam.tz - cam.zoom) * 0.04;

      ctx.clearRect(0, 0, w, h);

      // Deep background gradients
      const bg1 = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, w * 0.6);
      bg1.addColorStop(0, 'rgba(15,12,40,.4)');
      bg1.addColorStop(1, 'transparent');
      ctx.fillStyle = bg1;
      ctx.fillRect(0, 0, w, h);

      const bg2 = ctx.createRadialGradient(w * 0.7, h * 0.7, 0, w * 0.7, h * 0.7, w * 0.5);
      bg2.addColorStop(0, 'rgba(10,20,40,.3)');
      bg2.addColorStop(1, 'transparent');
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(cam.x, cam.y);

      // Nebulae
      s.nebulae.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.c.r},${n.c.g},${n.c.b},${n.a})`);
        g.addColorStop(0.4, `rgba(${n.c.r},${n.c.g},${n.c.b},${n.a * 0.4})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Streams
      s.streams.forEach(st => {
        const a = st.a * (0.3 + 0.7 * Math.sin(t * st.sp + st.ph));
        ctx.fillStyle = `rgba(${st.c.r},${st.c.g},${st.c.b},${a})`;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Dust
      s.dust.forEach(d => {
        const a = d.a * (0.3 + 0.7 * Math.sin(t * d.sp + d.ph));
        ctx.fillStyle = `rgba(${d.cr},${d.cg},${d.cb},${a})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Constellation lines
      s.edges.forEach(e => {
        const a = s.stars[e.a];
        const b = s.stars[e.b];
        const tw = 0.3 + 0.15 * Math.sin(t * 0.004);
        ctx.strokeStyle = `rgba(${e.c.r},${e.c.g},${e.c.b},${tw * 0.07})`;
        ctx.lineWidth = 0.35;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // Stars - 4-layer glow
      const bStar = s.brightestStar;
      s.stars.forEach(star => {
        const tw = 0.5 + 0.5 * Math.sin(t * star.ts + star.to);
        const isBr = star === bStar;
        const r = star.size * (isBr ? 1.15 : 1);
        const al = isBr ? 0.9 : 0.35 + 0.65 * tw;
        const c = star.post.cat;

        // Wide color halo
        const g0 = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 5);
        g0.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${al * 0.06})`);
        g0.addColorStop(1, 'transparent');
        ctx.fillStyle = g0;
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        // Color glow
        const g1 = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 2.2);
        g1.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${al * 0.2})`);
        g1.addColorStop(1, 'transparent');
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        const g2 = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r * 0.5);
        g2.addColorStop(0, `rgba(255,255,255,${al * 0.85})`);
        g2.addColorStop(0.5, `rgba(${Math.min(255, c.r + 60)},${Math.min(255, c.g + 60)},${Math.min(255, c.b + 60)},${al * 0.3})`);
        g2.addColorStop(1, 'transparent');
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, r * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Diffraction spikes
        if (r > 2.5 || isBr) {
          const fl = r * (isBr ? 4 : 2.5) * tw;
          ctx.strokeStyle = `rgba(${Math.min(255, c.r + 30)},${Math.min(255, c.g + 30)},${Math.min(255, c.b + 30)},${al * 0.04 * tw})`;
          ctx.lineWidth = 0.2;
          for (let i = 0; i < 2; i++) {
            const a2 = star.fa + (Math.PI / 2) * i;
            ctx.beginPath();
            ctx.moveTo(star.x - Math.cos(a2) * fl, star.y - Math.sin(a2) * fl);
            ctx.lineTo(star.x + Math.cos(a2) * fl, star.y + Math.sin(a2) * fl);
            ctx.stroke();
          }
        }
      });

      // Cluster labels
      s.clusters.forEach(cc => {
        ctx.save();
        ctx.textAlign = 'center';
        const fs = Math.max(9, 11 / cam.zoom);
        ctx.font = `italic 400 ${fs}px "Cormorant Garamond"`;
        ctx.fillStyle = `rgba(${cc.cat.r},${cc.cat.g},${cc.cat.b},.25)`;
        ctx.fillText(cc.name, cc.x, cc.y - Math.max(20, 32 / cam.zoom));
        const fs2 = Math.max(6, 7 / cam.zoom);
        ctx.font = `200 ${fs2}px "Noto Sans KR"`;
        ctx.fillStyle = 'rgba(240,237,246,.08)';
        ctx.fillText(cc.count + '개', cc.x, cc.y - Math.max(9, 17 / cam.zoom));
        ctx.restore();
      });

      ctx.restore();

      // Vignette
      const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.7);
      vig.addColorStop(0, 'transparent');
      vig.addColorStop(1, 'rgba(6,8,26,.4)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    s.animId = requestAnimationFrame(draw);

    // ===== Interaction handlers =====
    const handlePointerDown = (e: PointerEvent) => {
      s.interaction.tapStart = { x: e.clientX, y: e.clientY, t: Date.now() };
      s.interaction.tapMoved = false;
      s.interaction.isDragging = true;
      s.interaction.lastPt = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!s.interaction.isDragging || !s.interaction.lastPt) return;
      const dx = e.clientX - s.interaction.lastPt.x;
      const dy = e.clientY - s.interaction.lastPt.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) s.interaction.tapMoved = true;
      s.cam.tx += dx / s.cam.zoom;
      s.cam.ty += dy / s.cam.zoom;
      s.interaction.lastPt = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      s.interaction.isDragging = false;
      s.interaction.lastPt = null;
      if (!s.interaction.tapMoved && s.interaction.tapStart && Date.now() - s.interaction.tapStart.t < 300) {
        handleTap(e.clientX, e.clientY);
      }
      s.interaction.tapStart = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.cam.tz = Math.max(0.25, Math.min(4, s.cam.tz * (e.deltaY > 0 ? 0.94 : 1.06)));
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        s.interaction.pinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const nd = Math.sqrt(dx * dx + dy * dy);
        s.cam.tz = Math.max(0.25, Math.min(4, s.cam.tz * (nd / s.interaction.pinchDist)));
        s.interaction.pinchDist = nd;
      }
    };

    function handleTap(mx: number, my: number) {
      const cam = s.cam;
      const rx = (mx - W() / 2) / cam.zoom - cam.x;
      const ry = (my - H() / 2) / cam.zoom - cam.y;

      // Check stars first
      let closestStar: UniverseStar | null = null;
      let minDist = 24 / cam.zoom;
      s.stars.forEach(star => {
        const d = Math.hypot(star.x - rx, star.y - ry);
        if (d < minDist) { minDist = d; closestStar = star; }
      });
      if (closestStar) {
        onStarTapRef.current?.(closestStar);
        return;
      }

      // Check clusters
      s.clusters.forEach(cc => {
        if (Math.hypot(cc.x - rx, cc.y - ry) < 50 / cam.zoom) {
          zoomToCluster(cc.name);
        }
      });
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    const handleResize = () => sizeCanvas(canvas);
    addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(s.animId);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      removeEventListener('resize', handleResize);
    };
  }, [posts, username, sizeCanvas, initialZoomStar]);

  // Zoom to a specific cluster by name
  const zoomToCluster = useCallback((name: string) => {
    const s = stateRef.current;
    const cc = s.clusters.find(c => c.name === name);
    if (!cc) return;

    s.cam.tx = -cc.x;
    s.cam.ty = -cc.y;
    s.cam.tz = 2.2;

    const clusterStars = s.stars.filter(star => star.post.cat.name === name);
    onClusterTapRef.current?.(cc, clusterStars);
  }, []);

  // Expose zoomToCluster via a ref-based approach
  const zoomToClusterRef = useRef(zoomToCluster);
  zoomToClusterRef.current = zoomToCluster;

  // Reset camera
  const resetCamera = useCallback(() => {
    const s = stateRef.current;
    s.cam.tx = 0;
    s.cam.ty = 0;
    s.cam.tz = 1;
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 touch-none"
        style={{ zIndex: 79 }}
      />
      {/* Category pills at top */}
      <div className="fixed top-0 left-0 right-0 z-[102] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(6,8,26,.92) 40%, transparent)', padding: '10px 14px 20px' }}>
        <div className="pointer-events-none" style={{ marginBottom: 5 }}>
          <span className="font-brand italic" style={{ fontSize: '.7rem', color: 'rgba(240,237,246,.2)' }}>
            <b className="not-italic font-normal" style={{ color: 'rgba(240,237,246,.35)' }}>@{username}</b>의 우주
          </span>
        </div>
        <div className="flex gap-1 overflow-x-auto pointer-events-auto" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          {stateRef.current.clusters.map(cc => (
            <button
              key={cc.name}
              onClick={() => zoomToClusterRef.current(cc.name)}
              className="flex items-center gap-1 flex-shrink-0 cursor-pointer active:bg-white/[.03]"
              style={{
                fontSize: '.54rem', fontWeight: 200, color: 'rgba(240,237,246,.22)',
                padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,.02)', background: 'rgba(255,255,255,.008)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span className="rounded-full flex-shrink-0" style={{ width: 5, height: 5, background: cc.cat.hex }} />
              {cc.name} {cc.pct}%
            </button>
          ))}
          <button
            onClick={resetCamera}
            className="flex-shrink-0 cursor-pointer active:bg-white/[.03]"
            style={{
              fontSize: '.54rem', fontWeight: 200, color: 'rgba(240,237,246,.22)',
              padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap',
              border: '1px solid rgba(255,255,255,.02)', background: 'rgba(255,255,255,.008)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            전체
          </button>
        </div>
      </div>
    </>
  );
}
