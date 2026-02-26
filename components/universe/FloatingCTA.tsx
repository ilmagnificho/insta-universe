'use client';

import { useEffect, useState } from 'react';

interface Props {
  visible: boolean;
  onPay: () => void;
  offsetBottom?: number;
}

export default function FloatingCTA({ visible: parentVisible, onPay, offsetBottom = 16 }: Props) {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (!parentVisible) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, [parentVisible]);

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
        onClick={onPay}
        className="mx-auto block w-full cursor-pointer active:scale-[.98]"
        style={{
          maxWidth: 360,
          padding: '14px 18px',
          borderRadius: 14,
          background: 'rgba(12,8,24,.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(210,160,200,.08)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <p style={{
          fontSize: '.82rem', fontWeight: 400,
          color: 'rgba(248,244,255,.6)',
          marginBottom: 2,
        }}>
          AI가 발견한 비밀 열기
        </p>
        <p style={{
          fontSize: '.68rem', fontWeight: 300,
          color: 'rgba(210,160,200,.3)',
        }}>
          4,900원
        </p>
      </button>
    </div>
  );
}
