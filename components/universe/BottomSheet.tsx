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

  // Close on Escape key
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

// ===== Pre-built bottom sheet content components =====

export function StarSheetContent({
  post,
  insight,
}: {
  post: { caption: string; likes: number; date: string; hour: number; tags: string[]; cat: { name: string; hex: string } };
  insight: string;
}) {
  const timeLabel = post.hour < 6 ? '새벽' : post.hour < 12 ? '오전' : post.hour < 18 ? '오후' : '저녁';
  const dateStr = new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <p style={{ fontSize: '.54rem', fontWeight: 200, color: 'rgba(240,237,246,.15)' }}>
        {dateStr} {timeLabel}
      </p>
      <p className="font-light leading-relaxed my-1.5" style={{ fontSize: '.78rem', color: 'rgba(240,237,246,.45)' }}>
        {post.caption}
      </p>
      <div className="flex flex-wrap gap-0.5 mb-2">
        {post.tags.map((tag, i) => (
          <span key={i} className="rounded-lg" style={{
            fontSize: '.52rem', fontWeight: 200, padding: '2px 7px',
            background: 'rgba(155,124,201,.03)', color: 'rgba(155,124,201,.3)',
          }}>
            {tag}
          </span>
        ))}
      </div>
      <p style={{ fontSize: '.62rem', fontWeight: 200, color: 'rgba(240,237,246,.18)', marginBottom: 14 }}>
        <span style={{ color: post.cat.hex }}>&#9829;</span> {post.likes.toLocaleString()}
      </p>
      <div style={{ height: 1, background: 'rgba(255,255,255,.025)', marginBottom: 14 }} />
      <div className="rounded-xl" style={{
        padding: '14px 16px',
        background: 'rgba(155,124,201,.02)',
        borderLeft: '1.5px solid rgba(155,124,201,.08)',
      }}>
        <p className="font-brand italic mb-1.5" style={{ fontSize: '.52rem', color: 'rgba(155,124,201,.3)', letterSpacing: '.06em' }}>
          AI가 읽은 이 순간
        </p>
        <p className="font-light leading-relaxed" style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.44)' }}
          dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>') }}
        />
      </div>
    </>
  );
}

export function ClusterSheetContent({
  name,
  hex,
  count,
  pct,
  avgLikes,
  topLikes,
  insight,
}: {
  name: string;
  hex: string;
  count: number;
  pct: number;
  avgLikes: number;
  topLikes: number;
  insight: string;
}) {
  return (
    <>
      <p className="font-brand italic font-normal mb-0.5" style={{ fontSize: '1.1rem', color: hex }}>
        {name}
      </p>
      <p className="mb-3" style={{ fontSize: '.58rem', fontWeight: 200, color: 'rgba(240,237,246,.15)' }}>
        {count}개 게시물 - {pct}%
      </p>
      <div className="grid grid-cols-3 gap-1.5 mb-3.5">
        {[
          { n: avgLikes, l: '평균 ♥' },
          { n: topLikes, l: '최고 ♥' },
          { n: `${pct}%`, l: '비중' },
        ].map((s, i) => (
          <div key={i} className="rounded-lg text-center" style={{
            padding: 7, background: 'rgba(255,255,255,.01)', border: '1px solid rgba(255,255,255,.02)',
          }}>
            <div className="font-brand" style={{ fontSize: '.9rem', color: 'rgba(240,237,246,.4)' }}>{s.n}</div>
            <div style={{ fontSize: '.46rem', fontWeight: 200, color: 'rgba(240,237,246,.12)' }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,.025)', marginBottom: 14 }} />
      <div className="rounded-xl" style={{
        padding: '14px 16px',
        background: 'rgba(155,124,201,.02)',
        borderLeft: '1.5px solid rgba(155,124,201,.08)',
      }}>
        <p className="font-brand italic mb-1.5" style={{ fontSize: '.52rem', color: 'rgba(155,124,201,.3)', letterSpacing: '.06em' }}>
          AI 인사이트
        </p>
        <p className="font-light leading-relaxed" style={{ fontSize: '.74rem', color: 'rgba(240,237,246,.44)' }}>
          {insight}
        </p>
      </div>
    </>
  );
}
