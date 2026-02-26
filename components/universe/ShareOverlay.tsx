'use client';

import { useState } from 'react';
import type { UniverseType } from '@/lib/types';

interface Props {
  open: boolean;
  onClose: () => void;
  userType: UniverseType;
  topLikes: number;
  categoryCount: number;
  streakDays: number;
}

export default function ShareOverlay({ open, onClose, userType, topLikes, categoryCount, streakDays }: Props) {
  const [voyagerUsername, setVoyagerUsername] = useState('');

  const stats = [
    { n: topLikes, l: '가장 빛나는 별 ♥' },
    { n: userType.rare, l: '유형 희소성' },
    { n: `${categoryCount}가지`, l: '우주 다채로움' },
    { n: `${streakDays}일`, l: '기록한 날들' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(location.href);
    alert('링크가 복사되었습니다');
  };

  const handleSaveCard = () => {
    alert('카드 이미지 저장 기능은 곧 추가됩니다');
  };

  const handleVoyager = () => {
    if (!voyagerUsername.trim()) return;
    const cleaned = voyagerUsername.trim().replace(/^@/, '');
    window.location.href = `/?username=${encodeURIComponent(cleaned)}`;
  };

  return (
    <div className={`share-overlay ${open ? 'show' : ''}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="share-card">
        <p className="font-brand italic" style={{
          fontSize: '.72rem', letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'rgba(155,124,201,.4)', marginBottom: 12,
        }}>
          my universe
        </p>

        <p className="font-brand italic font-normal" style={{ fontSize: '1.4rem', color: 'rgba(240,237,246,.85)', marginBottom: 4 }}>
          {userType.type}
        </p>

        <p style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(155,124,201,.45)', marginBottom: 18 }}>
          {userType.rare} 유형
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-lg" style={{ padding: '8px 6px', background: 'rgba(255,255,255,.025)' }}>
              <div className="font-brand" style={{ fontSize: '1rem', color: 'rgba(240,237,246,.6)' }}>{s.n}</div>
              <div style={{ fontSize: '.68rem', fontWeight: 300, color: 'rgba(240,237,246,.3)' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mb-3" style={{ fontSize: '.82rem', fontWeight: 300, color: 'rgba(240,237,246,.5)', lineHeight: 1.7 }}>
          {userType.insight}
        </p>

        <p className="font-brand italic mb-4" style={{ fontSize: '.62rem', color: 'rgba(240,237,246,.12)', letterSpacing: '.1em' }}>
          insta-universe.com
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSaveCard}
            className="rounded-xl cursor-pointer active:scale-[.98]"
            style={{
              padding: 12, fontSize: '.88rem', fontWeight: 300,
              background: 'rgba(155,124,201,.12)', color: 'rgba(240,237,246,.7)',
              border: '1px solid rgba(155,124,201,.12)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            카드 이미지 저장
          </button>
          <button
            onClick={handleCopyLink}
            className="rounded-xl cursor-pointer active:scale-[.98]"
            style={{
              padding: 12, fontSize: '.88rem', fontWeight: 300,
              background: 'transparent', color: 'rgba(240,237,246,.4)',
              border: '1px solid rgba(255,255,255,.06)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            링크 복사
          </button>
        </div>

        {/* Voyager section */}
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <p className="mb-2" style={{ fontSize: '.78rem', fontWeight: 300, color: 'rgba(240,237,246,.4)' }}>
            궁금한 사람의 우주도 볼 수 있어요
          </p>
          <div className="flex gap-1.5">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ fontSize: '.88rem', color: 'rgba(240,237,246,.2)' }}>@</span>
              <input
                value={voyagerUsername}
                onChange={e => setVoyagerUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVoyager()}
                placeholder="아이디"
                className="w-full rounded-lg outline-none"
                style={{
                  padding: '9px 9px 9px 24px',
                  background: 'rgba(255,255,255,.03)',
                  border: '1px solid rgba(255,255,255,.06)',
                  fontSize: '.82rem', fontWeight: 300, color: '#f0edf6',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <button
              onClick={handleVoyager}
              className="rounded-lg cursor-pointer"
              style={{
                padding: '9px 14px',
                background: 'rgba(155,124,201,.1)',
                border: '1px solid rgba(155,124,201,.1)',
                fontSize: '.78rem', color: 'rgba(240,237,246,.55)',
                whiteSpace: 'nowrap',
              }}
            >
              분석
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
