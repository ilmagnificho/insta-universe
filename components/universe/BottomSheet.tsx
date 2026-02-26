'use client';

import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: Props) {
  const [allowClose, setAllowClose] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setAllowClose(true), 150);
      return () => clearTimeout(timer);
    } else {
      setAllowClose(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener('keydown', handleKey);
    return () => removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={() => allowClose && onClose()}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .3s',
          zIndex: 199,
          WebkitTapHighlightColor: 'transparent',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform .4s cubic-bezier(.32, 1, .23, 1)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(18, 12, 30, .97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderTop: '1px solid rgba(210, 160, 200, .1)',
            borderRadius: '18px 18px 0 0',
            padding: '8px 22px 38px',
            maxHeight: '62vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div
            style={{
              width: 36,
              height: 3.5,
              background: 'rgba(210, 160, 200, .2)',
              borderRadius: 2,
              margin: '0 auto 18px',
            }}
          />
          {children}
        </div>
      </div>
    </>
  );
}

// ===== Locked insight section (free mode) =====
function LockedInsightSection({ label, blurText, onPayment }: { label: string; blurText: string; onPayment: () => void }) {
  return (
    <div className="rounded-xl relative overflow-hidden" style={{
      padding: '16px 18px',
      background: 'linear-gradient(165deg, rgba(210,160,200,.06), rgba(180,140,220,.03))',
      borderLeft: '2px solid rgba(210,160,200,.1)',
      minHeight: 90,
    }}>
      <p className="font-brand italic mb-2" style={{
        fontSize: '.78rem', color: 'rgba(210,160,200,.6)', letterSpacing: '.06em',
      }}>
        {label}
      </p>
      <p className="font-light" style={{
        fontSize: '.9rem', color: 'rgba(248,244,255,.72)', lineHeight: 1.8,
        filter: 'blur(5px)', WebkitFilter: 'blur(5px)',
        userSelect: 'none', WebkitUserSelect: 'none',
      }}>
        {blurText}
      </p>
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: '75%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(18,12,30,.7) 40%, rgba(18,12,30,.95) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        padding: '0 18px 14px',
      }}>
        <button
          onClick={onPayment}
          className="cursor-pointer rounded-lg active:scale-[.98] w-full"
          style={{
            padding: '10px',
            fontSize: '.82rem', fontWeight: 300,
            color: 'rgba(210,160,200,.7)',
            background: 'rgba(210,160,200,.08)',
            border: '1px solid rgba(210,160,200,.12)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          잠금 해제하기
        </button>
      </div>
    </div>
  );
}

// ===== Star detail sheet =====
export function StarSheetContent({
  post,
  insight,
  bonusInsight,
  starRank,
  isPaid = true,
  onPayment,
}: {
  post: {
    caption: string; likes: number; date: string; hour: number; tags: string[];
    cat: { name: string; hex: string; r: number; g: number; b: number };
    displayUrl?: string; postUrl?: string;
  };
  insight: string;
  bonusInsight?: string | null;
  starRank?: 'brightest' | 'bright';
  isPaid?: boolean;
  onPayment?: () => void;
}) {
  const timeLabel = post.hour < 6 ? '새벽' : post.hour < 12 ? '오전' : post.hour < 18 ? '오후' : '저녁';
  const dateStr = new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Post image */}
      {post.displayUrl ? (
        <div style={{
          width: '100%', aspectRatio: '1', borderRadius: 10,
          overflow: 'hidden', marginBottom: 14,
          background: `linear-gradient(135deg, rgba(${post.cat.r},${post.cat.g},${post.cat.b},.15), rgba(${post.cat.r},${post.cat.g},${post.cat.b},.05))`,
        }}>
          <img
            src={post.displayUrl} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', height: 80, borderRadius: 10, marginBottom: 14,
          background: `linear-gradient(135deg, rgba(${post.cat.r},${post.cat.g},${post.cat.b},.12), rgba(${post.cat.r},${post.cat.g},${post.cat.b},.04))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '.65rem', color: `rgba(${post.cat.r},${post.cat.g},${post.cat.b},.35)` }}>
            {post.cat.name}
          </span>
        </div>
      )}

      {starRank && (
        <div className="flex items-center gap-1.5 mb-3 rounded-full" style={{
          display: 'inline-flex', padding: '3px 10px',
          background: starRank === 'brightest' ? 'rgba(255,200,130,.08)' : 'rgba(210,160,200,.06)',
          border: `1px solid ${starRank === 'brightest' ? 'rgba(255,200,130,.15)' : 'rgba(210,160,200,.1)'}`,
        }}>
          <span style={{ fontSize: '.7rem' }}>{starRank === 'brightest' ? '✨' : '💫'}</span>
          <span style={{
            fontSize: '.72rem', fontWeight: 300,
            color: starRank === 'brightest' ? 'rgba(255,200,130,.7)' : 'rgba(210,160,200,.6)',
          }}>
            {starRank === 'brightest' ? '가장 빛나는 별' : '밝은 별'}
          </span>
        </div>
      )}

      <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
        {dateStr} {timeLabel}
      </p>
      <p className="font-light leading-relaxed my-2" style={{ fontSize: '.95rem', color: 'rgba(248,244,255,.78)' }}>
        {post.caption}
      </p>
      <div className="flex flex-wrap gap-1 mb-2.5">
        {post.tags.map((tag, i) => (
          <span key={i} className="rounded-lg" style={{
            fontSize: '.72rem', fontWeight: 300, padding: '3px 9px',
            background: 'rgba(210,160,200,.06)', color: 'rgba(210,160,200,.55)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full" style={{ width: 6, height: 6, background: post.cat.hex }} />
          <span style={{ fontSize: '.78rem', fontWeight: 300, color: post.cat.hex + 'bb' }}>{post.cat.name}</span>
        </div>
        <p style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
          <span style={{ color: post.cat.hex }}>&#9829;</span> {post.likes.toLocaleString()}
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(210,160,200,.06)', marginBottom: 16 }} />

      {isPaid ? (
        <>
          <div className="rounded-xl" style={{
            padding: '16px 18px',
            background: 'linear-gradient(165deg, rgba(210,160,200,.06), rgba(180,140,220,.03))',
            borderLeft: '2px solid rgba(210,160,200,.2)',
          }}>
            <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(210,160,200,.6)', letterSpacing: '.06em' }}>
              AI가 읽은 이 순간
            </p>
            <p className="font-light leading-relaxed" style={{ fontSize: '.9rem', color: 'rgba(248,244,255,.72)', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }}
            />
          </div>

          {bonusInsight && (
            <div className="rounded-xl mt-3" style={{
              padding: '16px 18px',
              background: 'linear-gradient(165deg, rgba(130,200,255,.04), rgba(210,160,200,.05))',
              borderLeft: '2px solid rgba(130,200,255,.15)',
            }}>
              <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(130,200,255,.55)', letterSpacing: '.06em' }}>
                더 깊은 이야기
              </p>
              <p className="font-light leading-relaxed" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.6)', lineHeight: 1.8 }}>
                {bonusInsight}
              </p>
            </div>
          )}

          <div className="mt-3 rounded-lg" style={{ padding: '10px 14px', background: 'rgba(210,160,200,.03)' }}>
            <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(248,244,255,.38)', lineHeight: 1.6 }}>
              {post.hour >= 22 || post.hour < 5
                ? '늦은 밤에 기록한 순간. 혼자만의 시간에 더 솔직해지는 사람.'
                : post.hour >= 19
                  ? '하루의 끝자락. 오늘을 정리하고 싶었던 순간.'
                  : post.hour < 9
                    ? '아침에 기록한 순간. 하루를 능동적으로 시작하는 사람.'
                    : '낮 시간의 기록. 일상 속 빛나는 순간을 놓치지 않는 사람.'
              }
            </p>
          </div>
        </>
      ) : (
        <>
          <LockedInsightSection
            label="AI가 읽은 이 순간"
            blurText="이 게시물에서 당신의 무의식적 감정 패턴이 드러나요. 특히 이 시간대에 기록한 것은 의미가 깊어요."
            onPayment={onPayment!}
          />
          <div className="mt-3">
            <LockedInsightSection
              label="더 깊은 이야기"
              blurText="당신이 이 카테고리에 끌리는 이유는 단순하지 않아요. 내면의 욕구가 반영되어 있어요."
              onPayment={onPayment!}
            />
          </div>
        </>
      )}

      {/* Original post link */}
      {post.postUrl && (
        <a
          href={post.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3 text-center rounded-lg"
          style={{
            padding: '10px',
            fontSize: '.78rem', fontWeight: 300,
            color: 'rgba(248,244,255,.35)',
            background: 'rgba(255,255,255,.02)',
            border: '1px solid rgba(255,255,255,.04)',
          }}
        >
          원본 보기 ↗
        </a>
      )}
    </>
  );
}

// ===== Cluster detail sheet =====
export function ClusterSheetContent({
  name, hex, count, pct, avgLikes, topLikes, insight, crossInsight, timeNote,
  isPaid = true, onPayment,
}: {
  name: string; hex: string; count: number; pct: number;
  avgLikes: number; topLikes: number; insight: string;
  crossInsight?: string; timeNote?: string;
  isPaid?: boolean; onPayment?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <span className="rounded-full" style={{ width: 10, height: 10, background: hex, boxShadow: `0 0 10px ${hex}60` }} />
        <p className="font-brand italic font-normal" style={{ fontSize: '1.3rem', color: hex }}>{name}</p>
      </div>
      <p className="mb-3.5" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(248,244,255,.4)' }}>
        {count}개 게시물 · 전체의 {pct}%
      </p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[{ n: avgLikes, l: '평균 ♥' }, { n: topLikes, l: '최고 ♥' }, { n: `${pct}%`, l: '비중' }].map((s, i) => (
          <div key={i} className="rounded-lg text-center" style={{ padding: '10px 6px', background: 'rgba(210,160,200,.03)', border: '1px solid rgba(210,160,200,.06)' }}>
            <div className="font-brand" style={{ fontSize: '1.05rem', color: 'rgba(248,244,255,.65)' }}>{s.n}</div>
            <div style={{ fontSize: '.68rem', fontWeight: 300, color: 'rgba(248,244,255,.35)' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(210,160,200,.06)', marginBottom: 16 }} />

      {isPaid ? (
        <>
          <div className="rounded-xl" style={{ padding: '16px 18px', background: 'linear-gradient(165deg, rgba(210,160,200,.06), rgba(180,140,220,.03))', borderLeft: '2px solid rgba(210,160,200,.2)' }}>
            <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(210,160,200,.6)', letterSpacing: '.06em' }}>AI 인사이트</p>
            <p className="font-light leading-relaxed" style={{ fontSize: '.9rem', color: 'rgba(248,244,255,.7)', lineHeight: 1.8 }}>{insight}</p>
          </div>
          {timeNote && (
            <div className="rounded-xl mt-3" style={{ padding: '14px 16px', background: 'rgba(210,160,200,.03)', borderLeft: '2px solid rgba(168,128,240,.12)' }}>
              <p className="font-brand italic mb-1.5" style={{ fontSize: '.72rem', color: 'rgba(168,128,240,.5)', letterSpacing: '.04em' }}>시간 패턴</p>
              <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.7 }}>{timeNote}</p>
            </div>
          )}
          {crossInsight && (
            <div className="rounded-xl mt-3" style={{ padding: '14px 16px', background: 'linear-gradient(165deg, rgba(130,200,255,.04), rgba(210,160,200,.04))', borderLeft: '2px solid rgba(130,200,255,.12)' }}>
              <p className="font-brand italic mb-1.5" style={{ fontSize: '.72rem', color: 'rgba(130,200,255,.5)', letterSpacing: '.04em' }}>교차 패턴</p>
              <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(248,244,255,.55)', lineHeight: 1.7 }}>{crossInsight}</p>
            </div>
          )}
        </>
      ) : (
        <LockedInsightSection
          label="AI 인사이트"
          blurText="이 카테고리에 대한 당신의 관심은 표면적인 것 이상이에요. 깊은 내면의 욕구와 연결되어 있어요."
          onPayment={onPayment!}
        />
      )}
    </>
  );
}
