'use client';

import { useEffect, useCallback } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ open, onClose, children }: Props) {
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

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
      <div className={`bs-overlay ${open ? 'open' : ''}`} onClick={handleBackdropClick} />
      <div className={`bs-container ${open ? 'open' : ''}`}>
        <div className="bs-inner">
          <div className="bs-handle" />
          {children}
        </div>
      </div>
    </>
  );
}

// ===== Star detail sheet - enriched =====
export function StarSheetContent({
  post,
  insight,
  bonusInsight,
  starRank,
}: {
  post: { caption: string; likes: number; date: string; hour: number; tags: string[]; cat: { name: string; hex: string } };
  insight: string;
  bonusInsight?: string | null;
  starRank?: 'brightest' | 'bright';
}) {
  const timeLabel = post.hour < 6 ? '새벽' : post.hour < 12 ? '오전' : post.hour < 18 ? '오후' : '저녁';
  const dateStr = new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {/* Star rank badge */}
      {starRank && (
        <div className="flex items-center gap-1.5 mb-3 rounded-full" style={{
          display: 'inline-flex',
          padding: '3px 10px',
          background: starRank === 'brightest' ? 'rgba(245,158,11,.08)' : 'rgba(155,124,201,.06)',
          border: `1px solid ${starRank === 'brightest' ? 'rgba(245,158,11,.15)' : 'rgba(155,124,201,.1)'}`,
        }}>
          <span style={{ fontSize: '.7rem' }}>{starRank === 'brightest' ? '✨' : '💫'}</span>
          <span style={{
            fontSize: '.72rem', fontWeight: 300,
            color: starRank === 'brightest' ? 'rgba(245,158,11,.6)' : 'rgba(155,124,201,.5)',
          }}>
            {starRank === 'brightest' ? '가장 빛나는 별' : '밝은 별'}
          </span>
        </div>
      )}

      <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(240,237,246,.35)' }}>
        {dateStr} {timeLabel}
      </p>
      <p className="font-light leading-relaxed my-2" style={{ fontSize: '.95rem', color: 'rgba(240,237,246,.7)' }}>
        {post.caption}
      </p>
      <div className="flex flex-wrap gap-1 mb-2.5">
        {post.tags.map((tag, i) => (
          <span key={i} className="rounded-lg" style={{
            fontSize: '.72rem', fontWeight: 300, padding: '3px 9px',
            background: 'rgba(155,124,201,.06)', color: 'rgba(155,124,201,.5)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Category + likes row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full" style={{ width: 6, height: 6, background: post.cat.hex }} />
          <span style={{ fontSize: '.78rem', fontWeight: 300, color: post.cat.hex + '99' }}>{post.cat.name}</span>
        </div>
        <p style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.35)' }}>
          <span style={{ color: post.cat.hex }}>&#9829;</span> {post.likes.toLocaleString()}
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', marginBottom: 16 }} />

      {/* AI Insight */}
      <div className="rounded-xl" style={{
        padding: '16px 18px',
        background: 'rgba(155,124,201,.04)',
        borderLeft: '2px solid rgba(155,124,201,.15)',
      }}>
        <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(155,124,201,.5)', letterSpacing: '.06em' }}>
          AI가 읽은 이 순간
        </p>
        <p className="font-light leading-relaxed" style={{ fontSize: '.9rem', color: 'rgba(240,237,246,.65)', lineHeight: 1.8 }}
          dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }}
        />
      </div>

      {/* Bonus deep insight for popular posts */}
      {bonusInsight && (
        <div className="rounded-xl mt-3" style={{
          padding: '16px 18px',
          background: 'linear-gradient(165deg, rgba(100,180,240,.03), rgba(155,124,201,.04))',
          borderLeft: '2px solid rgba(100,180,240,.12)',
        }}>
          <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(100,180,240,.5)', letterSpacing: '.06em' }}>
            더 깊은 이야기
          </p>
          <p className="font-light leading-relaxed" style={{ fontSize: '.88rem', color: 'rgba(240,237,246,.55)', lineHeight: 1.8 }}>
            {bonusInsight}
          </p>
        </div>
      )}

      {/* Time context */}
      <div className="mt-3 rounded-lg" style={{
        padding: '10px 14px',
        background: 'rgba(255,255,255,.015)',
      }}>
        <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(240,237,246,.3)', lineHeight: 1.6 }}>
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
  );
}

// ===== Cluster detail sheet - enriched =====
export function ClusterSheetContent({
  name,
  hex,
  count,
  pct,
  avgLikes,
  topLikes,
  insight,
  crossInsight,
  timeNote,
}: {
  name: string;
  hex: string;
  count: number;
  pct: number;
  avgLikes: number;
  topLikes: number;
  insight: string;
  crossInsight?: string;
  timeNote?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-1">
        <span className="rounded-full" style={{
          width: 10, height: 10, background: hex,
          boxShadow: `0 0 10px ${hex}60`,
        }} />
        <p className="font-brand italic font-normal" style={{ fontSize: '1.3rem', color: hex }}>
          {name}
        </p>
      </div>
      <p className="mb-3.5" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.35)' }}>
        {count}개 게시물 · 전체의 {pct}%
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { n: avgLikes, l: '평균 ♥' },
          { n: topLikes, l: '최고 ♥' },
          { n: `${pct}%`, l: '비중' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg text-center" style={{
            padding: '10px 6px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)',
          }}>
            <div className="font-brand" style={{ fontSize: '1.05rem', color: 'rgba(240,237,246,.6)' }}>{s.n}</div>
            <div style={{ fontSize: '.68rem', fontWeight: 300, color: 'rgba(240,237,246,.3)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', marginBottom: 16 }} />

      {/* Primary AI insight */}
      <div className="rounded-xl" style={{
        padding: '16px 18px',
        background: 'rgba(155,124,201,.04)',
        borderLeft: '2px solid rgba(155,124,201,.15)',
      }}>
        <p className="font-brand italic mb-2" style={{ fontSize: '.78rem', color: 'rgba(155,124,201,.5)', letterSpacing: '.06em' }}>
          AI 인사이트
        </p>
        <p className="font-light leading-relaxed" style={{ fontSize: '.9rem', color: 'rgba(240,237,246,.65)', lineHeight: 1.8 }}>
          {insight}
        </p>
      </div>

      {/* Time pattern for this cluster */}
      {timeNote && (
        <div className="rounded-xl mt-3" style={{
          padding: '14px 16px',
          background: 'rgba(255,255,255,.015)',
          borderLeft: '2px solid rgba(139,92,246,.1)',
        }}>
          <p className="font-brand italic mb-1.5" style={{ fontSize: '.72rem', color: 'rgba(139,92,246,.45)', letterSpacing: '.04em' }}>
            시간 패턴
          </p>
          <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(240,237,246,.5)', lineHeight: 1.7 }}>
            {timeNote}
          </p>
        </div>
      )}

      {/* Cross-category connection */}
      {crossInsight && (
        <div className="rounded-xl mt-3" style={{
          padding: '14px 16px',
          background: 'linear-gradient(165deg, rgba(100,180,240,.03), rgba(155,124,201,.03))',
          borderLeft: '2px solid rgba(100,180,240,.1)',
        }}>
          <p className="font-brand italic mb-1.5" style={{ fontSize: '.72rem', color: 'rgba(100,180,240,.45)', letterSpacing: '.04em' }}>
            교차 패턴
          </p>
          <p className="font-light" style={{ fontSize: '.85rem', color: 'rgba(240,237,246,.5)', lineHeight: 1.7 }}>
            {crossInsight}
          </p>
        </div>
      )}
    </>
  );
}
