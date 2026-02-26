'use client';

import { useEffect, useRef, useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  loadMockData, STAR_INSIGHTS, CLUSTER_INSIGHTS, CROSS_INSIGHTS,
  DEEP_PERSONALITY, ACHIEVEMENT_BADGES, MONTHLY_INSIGHTS, PERSONALITY_KEYWORDS,
  getUniqueStarInsight, STABILITY_PATTERNS, RELATIONSHIP_TRAITS, HEALING_CONDITIONS,
} from '@/lib/mock-data';
import type { MockResult, UniverseStar, ClusterCenter } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import PlanetCarousel from '@/components/universe/PlanetCarousel';
import BottomSheet, { StarSheetContent, ClusterSheetContent } from '@/components/universe/BottomSheet';
import InsightToast from '@/components/universe/InsightToast';
import ShareOverlay from '@/components/universe/ShareOverlay';
import FloatingCTA from '@/components/universe/FloatingCTA';

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
      cx!.fillStyle = 'rgba(12,8,24,0.03)';
      cx!.fillRect(0, 0, w, h);

      const cg = cx!.createRadialGradient(mx, my, 0, mx, my, 80);
      cg.addColorStop(0, 'rgba(210,160,200,.06)');
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

        const g = cx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * p.life * 8);
        g.addColorStop(0, `rgba(${p.cr},${p.cg},${p.cb},${p.life * 0.4})`);
        g.addColorStop(0.4, `rgba(${p.cr},${p.cg},${p.cb},${p.life * 0.1})`);
        g.addColorStop(1, 'transparent');
        cx!.fillStyle = g;
        cx!.beginPath();
        cx!.arc(p.x, p.y, p.r * p.life * 8, 0, Math.PI * 2);
        cx!.fill();

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
    <div className="fixed inset-0 z-[210] flex items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #14102a, #0c0818)' }}>
      <canvas ref={canvasRef} className="fixed inset-0" />
      <p className="relative z-10 font-brand italic font-light text-center transition-opacity duration-500"
        style={{
          fontSize: '1.15rem',
          color: 'rgba(248,244,255,.7)',
          opacity: textVisible ? 1 : 0,
        }}>
        {text}
      </p>
    </div>
  );
}

// ===== Universe DNA Panel =====
function UniverseDNA({
  data, open, onClose,
}: {
  data: MockResult;
  open: boolean;
  onClose: () => void;
}) {
  const groups = useMemo(() => {
    const g: Record<string, number> = {};
    data.posts.forEach(p => { g[p.cat.name] = (g[p.cat.name] || 0) + 1; });
    return Object.entries(g)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: Math.round(count / data.posts.length * 100),
        cat: CATEGORIES.find(c => c.name === name) || CATEGORIES[2],
      }));
  }, [data]);

  // Time distribution
  const timeDist = useMemo(() => {
    const bins = { dawn: 0, morning: 0, afternoon: 0, evening: 0 };
    data.posts.forEach(p => {
      if (p.hour < 6) bins.dawn++;
      else if (p.hour < 12) bins.morning++;
      else if (p.hour < 18) bins.afternoon++;
      else bins.evening++;
    });
    const total = data.posts.length;
    return [
      { label: '새벽', pct: Math.round(bins.dawn / total * 100), emoji: '🌃', color: '#6366f1' },
      { label: '오전', pct: Math.round(bins.morning / total * 100), emoji: '🌅', color: '#f59e0b' },
      { label: '오후', pct: Math.round(bins.afternoon / total * 100), emoji: '☀️', color: '#ec4899' },
      { label: '저녁', pct: Math.round(bins.evening / total * 100), emoji: '🌙', color: '#8b5cf6' },
    ];
  }, [data]);

  // Achievements
  const badges = useMemo(() => {
    const evPct = Math.round(data.posts.filter(p => p.hour >= 19).length / data.posts.length * 100);
    const mornPct = Math.round(data.posts.filter(p => p.hour >= 6 && p.hour < 12).length / data.posts.length * 100);
    const earned: typeof ACHIEVEMENT_BADGES = [];

    ACHIEVEMENT_BADGES.forEach(b => {
      if (b.condition === 'evening70' && evPct >= 70) earned.push(b);
      if (b.condition === 'morning40' && mornPct >= 40) earned.push(b);
      if (b.condition === 'category7' && data.categoryCount >= 7) earned.push(b);
      if (b.condition === 'likes500' && data.topLikes >= 500) earned.push(b);
      if (b.condition === 'streak60' && data.streakDays >= 60) earned.push(b);
      if (b.condition === 'topcat50') {
        const topPct = Math.round(groups[0].count / data.posts.length * 100);
        if (topPct >= 50) earned.push(b);
      }
    });

    return earned;
  }, [data, groups]);

  // Cross insights
  const crossInsights = useMemo(() => {
    const catNames = groups.map(g => g.name);
    return CROSS_INSIGHTS.filter(ci =>
      catNames.includes(ci.cats[0]) && catNames.includes(ci.cats[1])
    ).slice(0, 3);
  }, [groups]);

  // Deep personality
  const personality = useMemo(() => {
    const kws = PERSONALITY_KEYWORDS[data.topCategory] || PERSONALITY_KEYWORDS['일상'];
    const deep = DEEP_PERSONALITY[data.topCategory] || DEEP_PERSONALITY['일상'];
    return { keywords: kws, insights: deep };
  }, [data]);

  // Monthly insight
  const monthlyInsight = useMemo(() => {
    return MONTHLY_INSIGHTS[Math.floor(Math.random() * MONTHLY_INSIGHTS.length)];
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto" style={{
      background: 'rgba(12,8,24,.97)',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div className="mx-auto" style={{ maxWidth: 380, padding: '20px 22px 80px' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="cursor-pointer mb-4"
          style={{
            fontSize: '.85rem', fontWeight: 300, color: 'rgba(248,244,255,.35)',
            background: 'none', border: 'none', padding: '8px 0',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          &larr; 우주로 돌아가기
        </button>

        {/* Header */}
        <p className="font-brand italic" style={{
          fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'rgba(210,160,200,.4)', marginBottom: 8,
        }}>
          universe dna
        </p>
        <h2 className="font-brand italic font-normal mb-1" style={{
          fontSize: '1.6rem', color: 'rgba(248,244,255,.85)',
        }}>
          {data.userType.type}
        </h2>
        <p className="mb-5" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(210,160,200,.45)' }}>
          {data.userType.rare} 유형
        </p>

        {/* Personality Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {personality.keywords.map((kw, i) => (
            <span key={i} className="rounded-full" style={{
              fontSize: '.75rem', fontWeight: 300, padding: '5px 14px',
              background: 'rgba(210,160,200,.06)', border: '1px solid rgba(210,160,200,.1)',
              color: 'rgba(248,244,255,.55)',
            }}>
              {kw}
            </span>
          ))}
        </div>

        {/* ===== Category Breakdown ===== */}
        <div className="rounded-2xl mb-5" style={{
          padding: '20px', background: 'rgba(255,255,255,.012)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <p className="font-brand italic mb-4" style={{
            fontSize: '.82rem', color: 'rgba(210,160,200,.5)', letterSpacing: '.06em',
          }}>
            우주 구성
          </p>
          <div className="flex flex-col gap-3">
            {groups.map((g, i) => (
              <div key={g.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full" style={{
                      width: 7, height: 7, background: g.cat.hex,
                      boxShadow: `0 0 6px ${g.cat.hex}60`,
                    }} />
                    <span style={{ fontSize: '.85rem', fontWeight: 300, color: 'rgba(248,244,255,.65)' }}>
                      {g.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
                    {g.pct}% · {g.count}개
                  </span>
                </div>
                <div className="w-full rounded-full" style={{ height: 3, background: 'rgba(255,255,255,.04)' }}>
                  <div className="rounded-full" style={{
                    width: `${g.pct}%`, height: '100%',
                    background: `linear-gradient(to right, ${g.cat.hex}60, ${g.cat.hex})`,
                    transition: 'width 1s ease-out',
                  }} />
                </div>
                {i === 0 && (
                  <p className="mt-2 font-light" style={{
                    fontSize: '.8rem', color: 'rgba(248,244,255,.4)', lineHeight: 1.6,
                  }}>
                    {CLUSTER_INSIGHTS[g.name] || ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== Time Pattern Analysis ===== */}
        <div className="rounded-2xl mb-5" style={{
          padding: '20px', background: 'rgba(255,255,255,.012)',
          border: '1px solid rgba(255,255,255,.05)',
        }}>
          <p className="font-brand italic mb-4" style={{
            fontSize: '.82rem', color: 'rgba(210,160,200,.5)', letterSpacing: '.06em',
          }}>
            시간 패턴 분석
          </p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {timeDist.map((t, i) => (
              <div key={i} className="text-center rounded-lg" style={{
                padding: '12px 4px',
                background: t.pct === Math.max(...timeDist.map(d => d.pct)) ? `${t.color}12` : 'rgba(255,255,255,.015)',
                border: t.pct === Math.max(...timeDist.map(d => d.pct)) ? `1px solid ${t.color}25` : '1px solid rgba(255,255,255,.04)',
              }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 2 }}>{t.emoji}</div>
                <div className="font-brand" style={{ fontSize: '1rem', color: t.color }}>{t.pct}%</div>
                <div style={{ fontSize: '.62rem', fontWeight: 300, color: 'rgba(248,244,255,.35)' }}>{t.label}</div>
              </div>
            ))}
          </div>
          <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.5)', lineHeight: 1.7 }}>
            {monthlyInsight}
          </p>
        </div>

        {/* ===== Cross-Category Insights ===== */}
        {crossInsights.length > 0 && (
          <div className="rounded-2xl mb-5" style={{
            padding: '20px',
            background: 'linear-gradient(165deg, rgba(130,200,255,.03), rgba(210,160,200,.04))',
            border: '1px solid rgba(130,200,255,.08)',
          }}>
            <p className="font-brand italic mb-4" style={{
              fontSize: '.82rem', color: 'rgba(130,200,255,.5)', letterSpacing: '.06em',
            }}>
              교차 패턴 발견
            </p>
            <div className="flex flex-col gap-4">
              {crossInsights.map((ci, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-2">
                    {ci.cats.map((cat, j) => {
                      const c = CATEGORIES.find(cc => cc.name === cat);
                      return (
                        <span key={j} className="flex items-center gap-1 rounded-full" style={{
                          fontSize: '.72rem', fontWeight: 300, padding: '3px 10px',
                          background: `${c?.hex || '#b48ce6'}10`, color: `${c?.hex || '#b48ce6'}99`,
                          border: `1px solid ${c?.hex || '#b48ce6'}20`,
                        }}>
                          <span className="rounded-full" style={{ width: 5, height: 5, background: c?.hex || '#b48ce6' }} />
                          {cat}
                        </span>
                      );
                    })}
                  </div>
                  <p className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.7 }}>
                    {ci.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Deep Personality ===== */}
        <div className="rounded-2xl mb-5" style={{
          padding: '20px',
          background: 'linear-gradient(165deg, rgba(210,160,200,.06), rgba(130,200,255,.03))',
          border: '1px solid rgba(210,160,200,.1)',
        }}>
          <p className="font-brand italic mb-4" style={{
            fontSize: '.82rem', color: 'rgba(210,160,200,.6)', letterSpacing: '.06em',
          }}>
            AI 성격 심층 분석
          </p>
          <p className="font-light leading-relaxed mb-4" style={{
            fontSize: '.95rem', color: 'rgba(248,244,255,.72)', lineHeight: 1.9,
          }}>
            {data.userType.insight}
          </p>
          <div className="flex flex-col gap-3">
            {personality.insights.map((insight, i) => (
              <div key={i} className="rounded-xl" style={{
                padding: '14px 16px',
                background: 'rgba(210,160,200,.03)',
                borderLeft: `2px solid rgba(210,160,200,${0.2 - i * 0.05})`,
              }}>
                <p className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.62)', lineHeight: 1.7 }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Stability Pattern (안정감의 패턴) ===== */}
        {(() => {
          const dates = data.posts.map(p => new Date(p.date).getTime()).sort();
          const gaps = dates.slice(1).map((d, i) => d - dates[i]);
          const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length / 86400000 : 3;
          const recentHalf = data.posts.slice(0, Math.floor(data.posts.length / 2)).length;
          const olderHalf = data.posts.slice(Math.floor(data.posts.length / 2)).length;
          const patternKey = avgGap < 6 ? 'regular' : recentHalf > olderHalf * 1.3 ? 'increasing' : recentHalf < olderHalf * 0.7 ? 'declining' : 'burst';
          const pattern = STABILITY_PATTERNS[patternKey];
          return (
            <div className="rounded-2xl mb-5" style={{
              padding: '20px',
              background: 'linear-gradient(165deg, rgba(120,232,196,.04), rgba(210,160,200,.04))',
              border: '1px solid rgba(120,232,196,.1)',
            }}>
              <p className="font-brand italic mb-3" style={{
                fontSize: '.82rem', color: 'rgba(120,232,196,.55)', letterSpacing: '.06em',
              }}>
                안정감의 패턴
              </p>
              <p className="font-brand italic font-normal mb-2" style={{
                fontSize: '1.15rem', color: 'rgba(248,244,255,.78)',
              }}>
                {pattern.title}
              </p>
              <p className="font-light mb-3" style={{
                fontSize: '.88rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.75,
              }}>
                {pattern.description}
              </p>
              <div className="rounded-xl" style={{
                padding: '12px 16px',
                background: 'rgba(120,232,196,.04)',
                borderLeft: '2px solid rgba(120,232,196,.15)',
              }}>
                <p className="font-light" style={{ fontSize: '.82rem', color: 'rgba(120,232,196,.5)', lineHeight: 1.6 }}>
                  {pattern.advice}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ===== Relationship Traits (관계에서 드러나는 진짜 성향) ===== */}
        <div className="rounded-2xl mb-5" style={{
          padding: '20px',
          background: 'linear-gradient(165deg, rgba(255,142,184,.04), rgba(210,160,200,.04))',
          border: '1px solid rgba(255,142,184,.1)',
        }}>
          <p className="font-brand italic mb-4" style={{
            fontSize: '.82rem', color: 'rgba(255,142,184,.55)', letterSpacing: '.06em',
          }}>
            관계에서 드러나는 진짜 성향
          </p>
          <div className="flex flex-col gap-3">
            {(RELATIONSHIP_TRAITS[data.topCategory] || RELATIONSHIP_TRAITS['일상']).map((trait, i) => (
              <div key={i} className="rounded-xl" style={{
                padding: '14px 16px',
                background: 'rgba(255,142,184,.03)',
                borderLeft: `2px solid rgba(255,142,184,${0.18 - i * 0.04})`,
              }}>
                <p className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.6)', lineHeight: 1.7 }}>
                  {trait}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Healing Energy Conditions (치유 에너지의 조건) ===== */}
        {(() => {
          const healing = HEALING_CONDITIONS[data.topCategory] || HEALING_CONDITIONS['일상'];
          return (
            <div className="rounded-2xl mb-5" style={{
              padding: '20px',
              background: 'linear-gradient(165deg, rgba(130,200,255,.04), rgba(168,128,240,.04))',
              border: '1px solid rgba(130,200,255,.1)',
            }}>
              <p className="font-brand italic mb-3" style={{
                fontSize: '.82rem', color: 'rgba(130,200,255,.55)', letterSpacing: '.06em',
              }}>
                치유 에너지의 조건
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full" style={{
                  padding: '4px 12px', fontSize: '.75rem', fontWeight: 300,
                  background: 'rgba(130,200,255,.08)', color: 'rgba(130,200,255,.6)',
                  border: '1px solid rgba(130,200,255,.12)',
                }}>
                  {healing.energy}
                </span>
              </div>
              <p className="font-light mb-3" style={{
                fontSize: '.88rem', color: 'rgba(248,244,255,.6)', lineHeight: 1.75,
              }}>
                {healing.condition}
              </p>
              <div className="rounded-xl" style={{
                padding: '12px 16px',
                background: 'rgba(130,200,255,.04)',
                borderLeft: '2px solid rgba(130,200,255,.15)',
              }}>
                <p className="font-brand italic mb-1" style={{ fontSize: '.72rem', color: 'rgba(130,200,255,.45)' }}>
                  추천
                </p>
                <p className="font-light" style={{ fontSize: '.82rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.6 }}>
                  {healing.recommendation}
                </p>
              </div>
            </div>
          );
        })()}

        {/* ===== Achievement Badges ===== */}
        {badges.length > 0 && (
          <div className="rounded-2xl mb-5" style={{
            padding: '20px', background: 'rgba(210,160,200,.03)',
            border: '1px solid rgba(210,160,200,.06)',
          }}>
            <p className="font-brand italic mb-4" style={{
              fontSize: '.82rem', color: 'rgba(210,160,200,.55)', letterSpacing: '.06em',
            }}>
              획득한 우주 뱃지
            </p>
            <div className="flex flex-col gap-2.5">
              {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl" style={{
                  padding: '14px 16px',
                  background: 'rgba(210,160,200,.03)',
                  border: '1px solid rgba(210,160,200,.08)',
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{b.icon}</span>
                  <div>
                    <p style={{ fontSize: '.88rem', fontWeight: 400, color: 'rgba(248,244,255,.72)' }}>{b.title}</p>
                    <p style={{ fontSize: '.75rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Summary Message ===== */}
        <div className="rounded-2xl text-center" style={{
          padding: '28px 20px',
          background: 'linear-gradient(170deg, rgba(210,160,200,.05), rgba(130,200,255,.04))',
          border: '1px solid rgba(210,160,200,.1)',
        }}>
          <p className="font-brand italic font-normal mb-3" style={{
            fontSize: '1.15rem', color: 'rgba(248,244,255,.75)',
          }}>
            당신의 우주는 계속 확장 중이에요
          </p>
          <p className="font-light" style={{
            fontSize: '.88rem', color: 'rgba(248,244,255,.5)', lineHeight: 1.7,
          }}>
            {data.posts.length}개의 별이 말하는 건 결국 하나예요.<br />
            <span style={{ color: 'rgba(210,160,200,.65)' }}>당신은 꽤 괜찮은 사람이라는 것.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ===== Star Exploration Tracker =====
function ExploreProgress({
  tapped,
  total,
  onDNAClick,
  dnaLabel,
}: {
  tapped: number;
  total: number;
  onDNAClick: () => void;
  dnaLabel?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (tapped >= 1) setShow(true);
  }, [tapped]);

  if (!show) return null;

  const pct = Math.min(Math.round(tapped / total * 100), 100);
  const showDNA = tapped >= 3;

  return (
    <div className="fixed left-4 right-4 z-[104]" style={{ bottom: 16 }}>
      <div className="mx-auto rounded-2xl" style={{
        maxWidth: 340,
        padding: '12px 16px',
        background: 'rgba(12,14,32,.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,.06)',
      }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: '.75rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
            탐험한 별 {tapped}/{total}
          </span>
          <span className="font-brand" style={{ fontSize: '.82rem', color: 'rgba(210,160,200,.5)' }}>
            {pct}%
          </span>
        </div>
        <div className="w-full rounded-full mb-2" style={{ height: 2.5, background: 'rgba(255,255,255,.06)' }}>
          <div className="rounded-full" style={{
            width: `${pct}%`, height: '100%',
            background: 'linear-gradient(to right, rgba(210,160,200,.4), rgba(210,160,200,.7))',
            transition: 'width .6s ease-out',
          }} />
        </div>
        {showDNA && (
          <button
            onClick={onDNAClick}
            className="w-full text-center cursor-pointer rounded-lg mt-1 active:scale-[.98]"
            style={{
              padding: '9px',
              fontSize: '.82rem', fontWeight: 300,
              color: dnaLabel ? 'rgba(248,244,255,.7)' : 'rgba(210,160,200,.6)',
              background: dnaLabel ? 'linear-gradient(135deg, rgba(210,160,200,.12), rgba(120,140,220,.1))' : 'rgba(210,160,200,.06)',
              border: dnaLabel ? '1px solid rgba(210,160,200,.15)' : '1px solid rgba(210,160,200,.1)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {dnaLabel || '우주 DNA 리포트 보기'}
          </button>
        )}
      </div>
    </div>
  );
}

// ===== Main Universe Page =====
function UniverseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'demo';
  const isPaid = searchParams.get('paid') === 'true';

  const [data, setData] = useState<MockResult | null>(null);
  const [phase, setPhase] = useState<'unlock' | 'explore'>(isPaid ? 'unlock' : 'explore');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastsActive, setToastsActive] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDNA, setShowDNA] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Star exploration tracking
  const [tappedStars, setTappedStars] = useState<Set<number>>(new Set());

  // Bottom sheet state
  const [bsOpen, setBsOpen] = useState(false);
  const [bsContent, setBsContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const stored = loadMockData();
    if (stored) setData(stored);
  }, []);

  // Free mode: trigger onboarding directly (no unlock animation)
  useEffect(() => {
    if (!isPaid && data) {
      setTimeout(() => setShowOnboarding(true), 700);
    }
  }, [isPaid, data]);

  // Handle free → paid transition (client-side navigation may not remount)
  const prevIsPaid = useRef(isPaid);
  useEffect(() => {
    if (isPaid && !prevIsPaid.current) {
      setPhase('unlock');
    }
    prevIsPaid.current = isPaid;
  }, [isPaid]);

  const handlePayment = useCallback(() => {
    setBsOpen(false);       // Close bottom sheet immediately
    setIsTransitioning(true);
    setPhase('unlock');
    router.push(`/universe/demo?username=${encodeURIComponent(username)}&paid=true`);
  }, [router, username]);

  const handleUnlockComplete = useCallback(() => {
    setBsOpen(false);       // Ensure bottom sheet is closed
    setIsTransitioning(false);
    setPhase('explore');
    setTimeout(() => setShowOnboarding(true), 700);
  }, []);

  const handleDismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    if (isPaid) setToastsActive(true);
  }, [isPaid]);

  // Star tap handler - enriched with unique per-star insights
  const handleStarTap = useCallback((star: UniverseStar) => {
    // Track tapped stars
    setTappedStars(prev => {
      const next = new Set(prev);
      next.add(star.post.id);
      return next;
    });

    // Get unique insight for this specific star (caption-aware to prevent mismatches)
    const insight = getUniqueStarInsight(star.post.id, star.post.cat.name, star.post.hour, star.post.likes, star.post.caption);

    // Deep insight for popular posts
    const deepInsights = DEEP_PERSONALITY[star.post.cat.name] || [];
    const bonusInsight = star.post.likes > 400 && deepInsights.length > 0
      ? deepInsights[star.post.id % deepInsights.length]
      : null;

    setBsContent(
      <StarSheetContent
        post={{
          caption: star.post.caption,
          likes: star.post.likes,
          date: star.post.date,
          hour: star.post.hour,
          tags: star.post.tags,
          cat: { name: star.post.cat.name, hex: star.post.cat.hex, r: star.post.cat.r, g: star.post.cat.g, b: star.post.cat.b },
          displayUrl: star.post.displayUrl,
          postUrl: star.post.postUrl,
        }}
        insight={insight}
        bonusInsight={bonusInsight}
        starRank={star.post.likes > 600 ? 'brightest' : star.post.likes > 300 ? 'bright' : undefined}
        isPaid={isPaid}
        onPayment={handlePayment}
      />
    );
    setBsOpen(true);
  }, [isPaid, handlePayment]);

  // Cluster tap handler - enriched
  const handleClusterTap = useCallback((cluster: ClusterCenter, stars: UniverseStar[]) => {
    const avgLikes = Math.round(stars.reduce((sum, s) => sum + s.post.likes, 0) / cluster.count);
    const topLikes = Math.max(...stars.map(s => s.post.likes));
    const insight = CLUSTER_INSIGHTS[cluster.name] || '';

    // Find cross insights involving this cluster
    const catNames = stars.map(s => s.post.cat.name);
    const crossInsight = CROSS_INSIGHTS.find(ci =>
      ci.cats.includes(cluster.name)
    );

    // Time pattern for this cluster
    const evPosts = stars.filter(s => s.post.hour >= 19).length;
    const evPct = Math.round(evPosts / cluster.count * 100);
    const timeNote = evPct > 60
      ? `이 카테고리 게시물의 ${evPct}%가 저녁 이후에 집중. 감성이 깊어지는 시간에 더 활발해져요.`
      : evPct < 30
        ? `주로 낮 시간에 기록하는 카테고리. 활동적이고 의식적인 기록이에요.`
        : `하루 전반에 걸쳐 고르게 분포. 일상적으로 자연스럽게 녹아있는 관심사.`;

    setBsContent(
      <ClusterSheetContent
        name={cluster.name}
        hex={cluster.cat.hex}
        count={cluster.count}
        pct={cluster.pct}
        avgLikes={avgLikes}
        topLikes={topLikes}
        insight={insight}
        crossInsight={crossInsight?.text}
        timeNote={timeNote}
        isPaid={isPaid}
        onPayment={handlePayment}
      />
    );
    setBsOpen(true);
  }, [isPaid, handlePayment]);

  // Toast items - more and richer
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

    // Personality keyword
    const keywords = PERSONALITY_KEYWORDS[data.topCategory] || PERSONALITY_KEYWORDS['일상'];
    const keywordText = `AI가 분석한 당신: "${keywords.slice(0, 2).join('" "')}"`;

    // Top post insight
    const topPost = posts.reduce((a, b) => a.likes > b.likes ? a : b, posts[0]);
    const topPostText = `가장 빛나는 별: ♥ ${topPost.likes}. "${topPost.caption.substring(0, 25)}..."`;

    return [
      { label: '성격 분석', text: keywordText },
      { label: '시간 패턴', text: `게시물의 ${evPct}%가 저녁 이후. 하루의 끝에서 감성이 피어나는 사람.` },
      { label: '교차 패턴', text: crossText },
      { label: '빛나는 별', text: topPostText },
      { label: '우주 구성', text: `${data.categoryCount}가지 색깔의 우주. 다양한 면을 가진 사람이라는 뜻.` },
    ];
  }, [data]);

  if (!data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c0818' }}>
        <p style={{ fontSize: '.74rem', color: 'rgba(248,244,255,.2)', fontWeight: 200 }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0" style={{ background: '#0c0818' }}>
      {/* Unlock animation phase (paid only) */}
      {phase === 'unlock' && isPaid && <UnlockAnimation onComplete={handleUnlockComplete} />}

      {/* Planet carousel (always mounted, visible when exploring) */}
      <div style={{ opacity: phase === 'explore' ? 1 : 0, transition: 'opacity 1s' }}>
        <PlanetCarousel
          posts={data.posts}
          username={username}
          onStarTap={handleStarTap}
          onClusterTap={handleClusterTap}
        />
      </div>

      {/* Onboarding overlay */}
      <div className={`onboarding ${showOnboarding ? 'show' : ''}`} onClick={handleDismissOnboarding}>
        <div className="onboarding-card">
          <p className="font-light leading-relaxed mb-2" style={{ fontSize: '.95rem', color: 'rgba(248,244,255,.75)' }}>
            별 하나가 게시물 하나예요
          </p>
          <p className="font-light leading-relaxed mb-3" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.5)' }}>
            터치해서 AI가 읽은 순간을 확인해보세요
          </p>
          <p style={{ fontSize: '.72rem', fontWeight: 300, color: 'rgba(248,244,255,.3)' }}>
            아무 곳이나 터치하면 넘어가요
          </p>
        </div>
      </div>

      {/* Navigation buttons */}
      {phase === 'explore' && !showDNA && (
        <div className="fixed z-[106] flex items-center gap-2" style={{ top: 54, right: 16 }}>
          <button
            onClick={() => router.push('/')}
            className="cursor-pointer active:scale-95"
            style={{
              padding: '7px 14px',
              fontSize: '.72rem', fontWeight: 300,
              color: 'rgba(248,244,255,.35)',
              background: 'rgba(18,12,30,.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            &larr; 홈
          </button>
          <button
            onClick={() => setShowShare(true)}
            className="cursor-pointer active:scale-95"
            style={{
              padding: '7px 14px',
              fontSize: '.72rem', fontWeight: 300,
              color: 'rgba(248,244,255,.35)',
              background: 'rgba(18,12,30,.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.06)',
              borderRadius: 16,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            공유
          </button>
        </div>
      )}

      {/* Insight toasts (paid only, hidden when bottom sheet or DNA open) */}
      {phase === 'explore' && !showDNA && !bsOpen && (
        <InsightToast
          items={toastItems}
          active={toastsActive}
          onShareClick={() => setShowShare(true)}
          isPaid={isPaid}
        />
      )}

      {/* Star exploration progress - only when no other bottom overlay */}
      {phase === 'explore' && !bsOpen && !showDNA && !isTransitioning && !toastsActive && tappedStars.size > 0 && (
        <ExploreProgress
          tapped={tappedStars.size}
          total={data.posts.length}
          onDNAClick={isPaid ? () => setShowDNA(true) : handlePayment}
          dnaLabel={isPaid ? undefined : 'AI 분석 잠금 해제 — ₩4,900'}
        />
      )}

      {/* Floating payment CTA (free mode only, hidden when other overlays active) */}
      {!isPaid && !isTransitioning && !toastsActive && (
        <FloatingCTA
          visible={phase === 'explore' && !bsOpen}
          onPay={handlePayment}
          offsetBottom={tappedStars.size > 0 ? 100 : 16}
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
        isPaid={isPaid}
      />

      {/* Universe DNA Panel (paid only) */}
      {isPaid && (
        <UniverseDNA
          data={data}
          open={showDNA}
          onClose={() => setShowDNA(false)}
        />
      )}
    </div>
  );
}

export default function UniversePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c0818' }}>
          <p style={{ fontSize: '.74rem', color: 'rgba(248,244,255,.2)', fontWeight: 200 }}>로딩 중...</p>
        </div>
      }
    >
      <UniverseContent />
    </Suspense>
  );
}
