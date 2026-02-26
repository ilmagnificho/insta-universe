'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ===== Animated Star Field =====
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = innerWidth;
    let h = innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Stars with depth layers
    interface Star { x: number; y: number; r: number; a: number; sp: number; ph: number; layer: number }
    const stars: Star[] = [];
    for (let i = 0; i < 300; i++) {
      const layer = Math.random() < 0.15 ? 2 : Math.random() < 0.4 ? 1 : 0;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: layer === 2 ? Math.random() * 1.2 + 0.4 : layer === 1 ? Math.random() * 0.6 + 0.2 : Math.random() * 0.3 + 0.05,
        a: layer === 2 ? Math.random() * 0.5 + 0.3 : layer === 1 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.15 + 0.02,
        sp: Math.random() * 0.008 + 0.001,
        ph: Math.random() * Math.PI * 2,
        layer,
      });
    }

    // Shooting stars
    interface ShootingStar { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
    const shootingStars: ShootingStar[] = [];
    let lastShoot = 0;

    let animId: number;
    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      ctx!.clearRect(0, 0, w, h);

      // Background stars
      stars.forEach(s => {
        const tw = 0.3 + 0.7 * Math.sin(t * s.sp + s.ph);
        const alpha = s.a * tw;

        if (s.layer === 2) {
          const g = ctx!.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
          g.addColorStop(0, `rgba(210,180,240,${alpha * 0.5})`);
          g.addColorStop(1, 'transparent');
          ctx!.fillStyle = g;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.fillStyle = `rgba(220,210,240,${alpha})`;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Shooting stars
      if (t - lastShoot > 4000 + Math.random() * 6000) {
        lastShoot = t;
        const startX = Math.random() * w * 0.6 + w * 0.2;
        const angle = Math.PI * 0.2 + Math.random() * 0.3;
        shootingStars.push({
          x: startX, y: 0,
          vx: Math.cos(angle) * 4, vy: Math.sin(angle) * 4,
          life: 1, maxLife: 40 + Math.random() * 30,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        const progress = ss.life / ss.maxLife;
        if (progress > 1) { shootingStars.splice(i, 1); continue; }

        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const tailLen = 30;
        const g = ctx!.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * tailLen, ss.y - ss.vy * tailLen
        );
        g.addColorStop(0, `rgba(255,255,255,${alpha * 0.7})`);
        g.addColorStop(1, 'transparent');
        ctx!.strokeStyle = g;
        ctx!.lineWidth = 0.8;
        ctx!.beginPath();
        ctx!.moveTo(ss.x, ss.y);
        ctx!.lineTo(ss.x - ss.vx * tailLen, ss.y - ss.vy * tailLen);
        ctx!.stroke();
      }
    }

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0" style={{ zIndex: 0 }} />;
}

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    let cleaned = username.trim().replace(/^@/, '');
    if (!cleaned) {
      setError('인스타그램 아이디를 입력해주세요');
      return;
    }
    // Extract username from Instagram URL if provided
    const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/);
    if (urlMatch) {
      cleaned = urlMatch[1];
    }
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleaned)) {
      setError('올바른 인스타그램 아이디를 입력해주세요');
      return;
    }
    router.push(`/loading?username=${encodeURIComponent(cleaned)}`);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a1038, #0c0818 75%)' }}>

      {/* Animated star field */}
      <StarField />

      {/* Nebula glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute rounded-full"
          style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(210,140,200,.12), transparent 65%)',
            top: '-5%', left: '-20%',
            filter: 'blur(80px)',
            animation: 'orbFloat 20s ease-in-out infinite',
          }}
        />
        <div className="absolute rounded-full"
          style={{
            width: 450, height: 450,
            background: 'radial-gradient(circle, rgba(100,140,255,.08), transparent 65%)',
            bottom: '0%', right: '-15%',
            filter: 'blur(80px)',
            animation: 'orbFloat 15s 5s ease-in-out infinite reverse',
          }}
        />
        <div className="absolute rounded-full"
          style={{
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(168,128,240,.06), transparent 60%)',
            top: '40%', left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            animation: 'orbFloat 18s 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full" style={{ maxWidth: 400 }}>

        {/* Logo / Title */}
        <div className="text-center mb-2" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s .1s cubic-bezier(.16,1,.3,1)',
        }}>
          <p className="font-brand italic mb-1" style={{
            fontSize: '.7rem',
            letterSpacing: '.25em',
            textTransform: 'uppercase',
            color: 'rgba(210,160,200,.35)',
          }}>
            discover your
          </p>
          <h1 className="font-brand font-light italic" style={{
            fontSize: 'clamp(2.4rem, 9vw, 3.6rem)',
            color: 'rgba(248, 244, 255, .92)',
            letterSpacing: '.06em',
            textShadow: '0 0 60px rgba(210,160,200,.15)',
          }}>
            Insta Universe
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-2 mb-10 font-light text-center" style={{
          fontSize: '0.92rem',
          color: 'rgba(248, 244, 255, .45)',
          letterSpacing: '.02em',
          lineHeight: 1.7,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 1s .3s cubic-bezier(.16,1,.3,1)',
        }}>
          내 인스타그램 속 숨겨진 우주를<br />AI가 발견해 드려요
        </p>

        {/* Input section */}
        <div className="w-full flex flex-col gap-3" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 1s .5s cubic-bezier(.16,1,.3,1)',
        }}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-brand"
              style={{
                fontSize: '1rem',
                color: focused ? 'rgba(210,160,200,.5)' : 'rgba(248, 244, 255, .2)',
                transition: 'color .3s',
              }}>
              @
            </span>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="아이디 또는 프로필 URL"
              autoComplete="off"
              spellCheck={false}
              className="w-full py-4 pl-10 pr-4 rounded-2xl outline-none font-light"
              style={{
                background: focused ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)',
                border: focused ? '1px solid rgba(210,160,200,.3)' : '1px solid rgba(255,255,255,.07)',
                boxShadow: focused ? '0 0 40px rgba(210,160,200,.06), inset 0 0 20px rgba(210,160,200,.02)' : 'none',
                fontSize: '1rem',
                color: '#f8f4ff',
                WebkitAppearance: 'none',
                transition: 'all .3s',
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>

          {error && (
            <p className="text-center" style={{ fontSize: '.85rem', color: 'rgba(255,120,120,.75)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="relative py-4 rounded-2xl font-light cursor-pointer overflow-hidden active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(210,160,200,.2), rgba(120,140,220,.18))',
              border: '1px solid rgba(210,160,200,.18)',
              boxShadow: '0 4px 30px rgba(210,160,200,.08)',
              fontSize: '1rem',
              color: 'rgba(248,244,255,.88)',
              letterSpacing: '.04em',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all .3s',
            }}
          >
            <span className="relative z-10">나의 우주 탐험하기</span>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.04), transparent)',
              animation: 'shimmer 3s infinite',
            }} />
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 flex flex-col gap-2 w-full" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 1s .7s cubic-bezier(.16,1,.3,1)',
        }}>
          {[
            { icon: '✦', text: '게시물을 AI가 분석하여 성격 유형 도출' },
            { icon: '◎', text: '나만의 우주 시각화 — 행성으로 탐험' },
            { icon: '⟡', text: '숨겨진 감정 패턴과 관계 성향 분석' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl" style={{
              padding: '10px 14px',
              background: 'rgba(255,255,255,.015)',
              border: '1px solid rgba(255,255,255,.03)',
            }}>
              <span style={{
                fontSize: '.7rem',
                color: 'rgba(210,160,200,.4)',
                flexShrink: 0,
              }}>{f.icon}</span>
              <span className="font-light" style={{
                fontSize: '.8rem',
                color: 'rgba(248,244,255,.4)',
              }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <p className="mt-6 text-center" style={{
          fontSize: '.75rem',
          fontWeight: 300,
          color: 'rgba(248,244,255,.22)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s 1s',
        }}>
          공개 계정만 분석 가능 · 데이터는 저장되지 않아요
        </p>
      </div>
    </div>
  );
}
