'use client';

import { useEffect, useState, useRef } from 'react';

interface ToastData {
  label: string;
  text: string;
}

interface Props {
  items: ToastData[];
  active: boolean;
  onShareClick: () => void;
}

export default function InsightToast({ items, active, onShareClick }: Props) {
  const [visibleToasts, setVisibleToasts] = useState<(ToastData & { id: number; show: boolean })[]>([]);
  const [showShare, setShowShare] = useState(false);
  const idCounter = useRef(0);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    let idx = 0;
    let mounted = true;

    function showNext() {
      if (!mounted) return;

      if (idx >= items.length) {
        // Show share toast at the end
        setTimeout(() => {
          if (mounted) setShowShare(true);
        }, 500);
        return;
      }

      const item = items[idx];
      const id = idCounter.current++;

      setVisibleToasts(prev => [...prev, { ...item, id, show: false }]);

      // Animate in
      setTimeout(() => {
        if (!mounted) return;
        setVisibleToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
      }, 50);

      idx++;

      // Show next after delay, remove old ones
      setTimeout(() => {
        if (!mounted) return;
        // Remove oldest if there are multiple
        setVisibleToasts(prev => {
          if (prev.length > 1) {
            const [oldest, ...rest] = prev;
            // Fade out oldest
            setTimeout(() => {
              if (mounted) setVisibleToasts(r => r.filter(t => t.id !== oldest.id));
            }, 400);
            return [{ ...oldest, show: false }, ...rest];
          }
          return prev;
        });
        showNext();
      }, 4000);
    }

    const timeout = setTimeout(showNext, 1500);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [active, items]);

  return (
    <div className="toast-stack">
      {visibleToasts.map(toast => (
        <div key={toast.id} className={`toast-item ${toast.show ? 'show' : ''}`}>
          <p className="font-brand italic mb-0.5" style={{ fontSize: '.5rem', color: 'rgba(155,124,201,.3)', letterSpacing: '.04em' }}>
            {toast.label}
          </p>
          <p className="font-light" style={{ fontSize: '.7rem', color: 'rgba(240,237,246,.42)', lineHeight: 1.55 }}>
            {toast.text}
          </p>
        </div>
      ))}
      {showShare && (
        <div
          className="toast-item show cursor-pointer"
          onClick={onShareClick}
        >
          <p className="text-center" style={{ fontSize: '.7rem', fontWeight: 300, color: 'rgba(155,124,201,.35)' }}>
            내 우주 카드 저장/공유
          </p>
        </div>
      )}
    </div>
  );
}
