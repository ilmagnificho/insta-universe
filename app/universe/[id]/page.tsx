'use client';

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadMockData, STAR_INSIGHTS, CLUSTER_INSIGHTS, CROSS_INSIGHTS } from '@/lib/mock-data';
import type { MockResult, UniverseStar, ClusterCenter } from '@/lib/types';
import UniverseCanvas from '@/components/universe/UniverseCanvas';
import BottomSheet, { StarSheetContent, ClusterSheetContent } from '@/components/universe/BottomSheet';
import InsightToast from '@/components/universe/InsightToast';
import ShareOverlay from '@/components/universe/ShareOverlay';

// ===== Unlock Animation =====
function UnlockAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('결제가 완료되었어요');
  const [textVisible, setTextVisible] = useState(true);

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
    const cx = canvas.getContext('2d');
    if (!cx) return;
    cx.scale(dpr, dpr);

    const mx = w / 2;
    const my = h / 2;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; cr: number; cg: number; cb: number;
      life: number; dec: number;
    }[] = [];

    // Many more particles, brighter, larger
    for (let i = 0; i < 150; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 1.2 + 0.2;
      particles.push({
        x: mx + (Math.random() - .5) * 30,
        y: my + (Math.random() - .5) * 30,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: Math.random() * 2 + 0.5,
        cr: 130 + Math.random() * 80,
        cg: 100 + Math.random() * 80,
        cb: 170 + Math.random() * 60,
        life: 1, dec: Math.random() * 0.004 + 0.001,
      });
    }

    let animId: number;
    function draw() {
      cx!.fillStyle = 'rgba(6,8,26,0.03)';
      cx!.fillRect(0, 0, w, h);

      // Central glow
      const cg = cx!.createRadialGradient(mx, my, 0, mx, my, 80);
      cg.addColorStop(0, 'rgba(155,124,201,.06)');
      cg.addColorStop(1, 'transparent');
      cx!.fillStyle = cg;
      cx!.beginPath();
      cx!.arc(mx, my, 80, 0, Math.PI * 2);
      cx!.fill();

      let alive = false;
      particles.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.dec;

        // Larger, brighter glow
        const g = cx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * p.life * 8);
        g.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},${p.life * 0.4})`);
        g.addColorStop(0.4, `rgba(${p.cr},${p.cg},${p.cb},${p.life * 0.1})`);
        g.addColorStop(1, 'transparent');
        cx!.fillStyle = g;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.r * p.life * 8, 0, Math.PI * 2);
        cx!.fill();

        // White core
        cx!.fillStyle = `rgba(255,255,255,${p.life * 0.6})`;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.r * p.life * 0.4, 0, Math.PI * 2);
        cx!.fill();
      });

      if (alive) animId = requestAnimationFrame(draw);
    }
    animId = requestAnimationFrame(draw);

    const textTimeout = setTimeout(() => setText('우주의 잠금을 해제하고 있어요...'), 1200);
    const fadeTimeout = setTimeout(() => setTextVisible(false), 2200);
    const completeTimeout = setTimeout(() => onComplete(), 2800);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(textTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #0c0e28, #06081a)' }}>
      <canvas ref={canvasRef} className="fixed inset-0" />
      <p className="relative z-10 font-brand italic font-light text-center transition-opacity duration-500"
        style={{
          fontSize: '1.15rem',
          color: 'rgba(240,237,246,.7)',
          opacity: textVisible ? 1 : 0,
        }}>
        {text}
      </p>
    </div>
  );
}

// ===== Main Universe Page =====
function UniverseContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';

  const [data, setData] = useState<MockResult | null>(null);
  const [phase, setPhase] = useState<'unlock' | 'explore'>('unlock');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastsActive, setToastsActive] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Bottom sheet state
  const [bsOpen, setBsOpen] = useState(false);
  const [bsContent, setBsContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const stored = loadMockData();
    if (stored) setData(stored);
  }, []);

  const handleUnlockComplete = useCallback(() => {
    setPhase('explore');
    setTimeout(() => setShowOnboarding(true), 700);
  }, []);

  const handleDismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setToastsActive(true);
  }, []);

  // Star tap handler
  const handleStarTap = useCallback((star: UniverseStar) => {
    const catInsights = STAR_INSIGHTS[star.post.cat.name] || [''];
    const insight = catInsights[Math.floor(Math.random() * catInsights.length)];

    setBsContent(
      <StarSheetContent
        post={{
          caption: star.post.caption,
          likes: star.post.likes,
          date: star.post.date,
          hour: star.post.hour,
          tags: star.post.tags,
          cat: { name: star.post.cat.name, hex: star.post.cat.hex },
        }}
        insight={insight}
      />
    );
    setBsOpen(true);
  }, []);

  // Cluster tap handler
  const handleClusterTap = useCallback((cluster: ClusterCenter, stars: UniverseStar[]) => {
    const avgLikes = Math.round(stars.reduce((sum, s) => sum + s.post.likes, 0) / cluster.count);
    const topLikes = Math.max(...stars.map(s => s.post.likes));
    const insight = CLUSTER_INSIGHTS[cluster.name] || '';

    setBsContent(
      <ClusterSheetContent
        name={cluster.name}
        hex={cluster.cat.hex}
        count={cluster.count}
        pct={cluster.pct}
        avgLikes={avgLikes}
        topLikes={topLikes}
        insight={insight}
      />
    );
    setBsOpen(true);
  }, []);

  // Toast items
  const toastItems = useMemo(() => {
    if (!data) return [];
    const posts = data.posts;
    const groups: Record<string, number> = {};
    posts.forEach(p => { groups[p.cat.name] = (groups[p.cat.name] || 0) + 1; });
    const sortedCats = Object.keys(groups).sort((a, b) => groups[b] - groups[a]);

    const evPosts = posts.filter(p => p.hour >= 19).length;
    const evPct = Math.round(evPosts / posts.length * 100);

    // Find matching cross insight
    let crossText = '두 가지 이상의 관심사가 서로 연결되어 있어요.';
    for (const ci of CROSS_INSIGHTS) {
      if (sortedCats.includes(ci.cats[0]) && sortedCats.includes(ci.cats[1])) {
        crossText = ci.text;
        break;
      }
    }

    return [
      { label: '시간 패턴', text: `게시물의 ${evPct}%가 저녁 이후. 하루의 끝에서 감성이 피어나는 사람.` },
      { label: '교차 패턴', text: crossText },
      { label: '우주 구성', text: `${data.categoryCount}가지 색깔의 우주. 다양한 면을 가진 사람이라는 뜻.` },
    ];
  }, [data]);

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
        <p style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)', fontWeight: 200 }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ background: '#06081a' }}>
      {/* Unlock animation phase */}
      {phase === 'unlock' && <UnlockAnimation onComplete={handleUnlockComplete} />}

      {/* Universe canvas (always mounted, visible when exploring) */}
      <div style={{ opacity: phase === 'explore' ? 1 : 0, transition: 'opacity 1s' }}>
        <UniverseCanvas
          posts={data.posts}
          username={username}
          onStarTap={handleStarTap}
          onClusterTap={handleClusterTap}
          initialZoomStar={true}
        />
      </div>

      {/* Onboarding overlay */}
      <div className={`onboarding ${showOnboarding ? 'show' : ''}`} onClick={handleDismissOnboarding}>
        <div className="onboarding-card">
          <p className="font-light leading-relaxed mb-2" style={{ fontSize: '.95rem', color: 'rgba(240,237,246,.75)' }}>
            별 하나가 게시물 하나예요
          </p>
          <p className="font-light leading-relaxed mb-3" style={{ fontSize: '.85rem', color: 'rgba(240,237,246,.5)' }}>
            터치해서 AI가 읽은 순간을 확인해보세요
          </p>
          <p style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(240,237,246,.3)' }}>
            아무 곳이나 터치하면 넘어가요
          </p>
        </div>
      </div>

      {/* Insight toasts */}
      {phase === 'explore' && (
        <InsightToast
          items={toastItems}
          active={toastsActive}
          onShareClick={() => setShowShare(true)}
        />
      )}

      {/* Bottom sheet */}
      <BottomSheet open={bsOpen} onClose={() => setBsOpen(false)}>
        {bsContent}
      </BottomSheet>

      {/* Share overlay */}
      <ShareOverlay
        open={showShare}
        onClose={() => setShowShare(false)}
        userType={data.userType}
        topLikes={data.topLikes}
        categoryCount={data.categoryCount}
        streakDays={data.streakDays}
      />
    </div>
  );
}

export default function UniversePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#06081a' }}>
          <p style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.2)', fontWeight: 200 }}>로딩 중...</p>
        </div>
      }
    >
      <UniverseContent />
    </Suspense>
  );
}
