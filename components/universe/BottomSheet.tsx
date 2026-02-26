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

// ===== Star detail sheet =====
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
      <p style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.35)', marginBottom: 16 }}>
        <span style={{ color: post.cat.hex }}>&#9829;</span> {post.likes.toLocaleString()}
      </p>
      <div style={{ height: 1, background: 'rgba(255,255,255,.05)', marginBottom: 16 }} />
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
    </>
  );
}

// ===== Cluster detail sheet =====
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
      <p className="font-brand italic font-normal mb-1" style={{ fontSize: '1.3rem', color: hex }}>
        {name}
      </p>
      <p className="mb-3.5" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.35)' }}>
        {count}개 게시물 · 전체의 {pct}%
      </p>
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
    </>
  );
}
