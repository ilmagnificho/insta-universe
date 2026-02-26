'use client';

import { useEffect, useState } from 'react';

interface Props {
  onPayment: () => void;
  starCount: number;
  offsetBottom?: number;
}

export default function FloatingCTA({ onPayment, starCount, offsetBottom = 16 }: Props) {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Hide temporarily on touch interaction
  useEffect(() => {
    if (!visible) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const handleInteraction = () => {
      setHiding(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setHiding(false), 2000);
    };
    addEventListener('touchstart', handleInteraction, { passive: true });
    return () => {
      removeEventListener('touchstart', handleInteraction);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed left-4 right-4 z-[105]"
      style={{
        bottom: offsetBottom,
        opacity: hiding ? 0 : 1,
        transform: hiding ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity .4s, transform .4s, bottom .3s',
      }}
    >
      <button
        onClick={onPayment}
        className="mx-auto block w-full cursor-pointer rounded-2xl active:scale-[.98]"
        style={{
          maxWidth: 340,
          padding: '14px 20px',
          background: 'rgba(18,12,30,.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(210,160,200,.08)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <p style={{
          fontSize: '.92rem', fontWeight: 400,
          color: 'rgba(248,244,255,.8)',
          marginBottom: 2,
        }}>
          AI가 발견한 비밀 열기
        </p>
        <p style={{
          fontSize: '.75rem', fontWeight: 300,
          color: 'rgba(210,160,200,.55)',
        }}>
          4,900원
        </p>
      </button>
    </div>
  );
}
