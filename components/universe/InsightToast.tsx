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
  isPaid?: boolean;
}

export default function InsightToast({ items, active, onShareClick, isPaid = true }: Props) {
  if (!isPaid) return null;
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
        setTimeout(() => {
          if (mounted) setShowShare(true);
        }, 500);
        return;
      }

      const item = items[idx];
      const id = idCounter.current++;

      setVisibleToasts(prev => [...prev, { ...item, id, show: false }]);

      setTimeout(() => {
        if (!mounted) return;
        setVisibleToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
      }, 50);

      idx++;

      setTimeout(() => {
        if (!mounted) return;
        setVisibleToasts(prev => {
          if (prev.length > 1) {
            const [oldest, ...rest] = prev;
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
          <p className="font-brand italic mb-1" style={{ fontSize: '.75rem', color: 'rgba(210,160,200,.5)', letterSpacing: '.04em' }}>
            {toast.label}
          </p>
          <p className="font-light" style={{ fontSize: '.88rem', color: 'rgba(248,244,255,.6)', lineHeight: 1.6 }}>
            {toast.text}
          </p>
        </div>
      ))}
      {showShare && (
        <div className="toast-item show cursor-pointer" onClick={onShareClick}>
          <p className="text-center" style={{ fontSize: '.88rem', fontWeight: 300, color: 'rgba(210,160,200,.55)' }}>
            내 우주 카드 저장/공유
          </p>
        </div>
      )}
    </div>
  );
}
