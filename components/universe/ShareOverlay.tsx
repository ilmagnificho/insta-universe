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
          fontSize: '.52rem', letterSpacing: '.18em', textTransform: 'uppercase',
          color: 'rgba(155,124,201,.25)', marginBottom: 10,
        }}>
          my universe
        </p>

        <p className="font-brand italic font-normal" style={{ fontSize: '1.2rem', color: 'rgba(240,237,246,.65)', marginBottom: 2 }}>
          {userType.type}
        </p>

        <p style={{ fontSize: '.54rem', fontWeight: 200, color: 'rgba(155,124,201,.22)', marginBottom: 14 }}>
          {userType.rare} 유형
        </p>

        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {stats.map((s, i) => (
            <div key={i} className="rounded-md" style={{ padding: 6, background: 'rgba(255,255,255,.012)' }}>
              <div className="font-brand" style={{ fontSize: '.85rem', color: 'rgba(240,237,246,.45)' }}>{s.n}</div>
              <div style={{ fontSize: '.46rem', fontWeight: 200, color: 'rgba(240,237,246,.12)' }}>{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mb-2.5" style={{ fontSize: '.62rem', fontWeight: 200, color: 'rgba(240,237,246,.28)', lineHeight: 1.6 }}>
          {userType.insight}
        </p>

        <p className="font-brand italic mb-3.5" style={{ fontSize: '.48rem', color: 'rgba(240,237,246,.06)', letterSpacing: '.1em' }}>
          insta-universe.com
        </p>

        <div className="flex flex-col gap-1.5">
          <button
            onClick={handleSaveCard}
            className="rounded-lg cursor-pointer active:scale-[.98]"
            style={{
              padding: 10, fontSize: '.7rem', fontWeight: 300,
              background: 'rgba(155,124,201,.07)', color: 'rgba(240,237,246,.5)',
              border: '1px solid rgba(155,124,201,.06)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            카드 이미지 저장
          </button>
          <button
            onClick={handleCopyLink}
            className="rounded-lg cursor-pointer active:scale-[.98]"
            style={{
              padding: 10, fontSize: '.7rem', fontWeight: 300,
              background: 'transparent', color: 'rgba(240,237,246,.2)',
              border: '1px solid rgba(255,255,255,.025)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            링크 복사
          </button>
        </div>

        {/* Voyager section */}
        <div className="mt-2.5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,.02)' }}>
          <p className="mb-1.5" style={{ fontSize: '.6rem', fontWeight: 200, color: 'rgba(240,237,246,.25)' }}>
            궁금한 사람의 우주도 볼 수 있어요
          </p>
          <div className="flex gap-1">
            <div className="flex-1 relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2" style={{ fontSize: '.7rem', color: 'rgba(240,237,246,.1)' }}>@</span>
              <input
                value={voyagerUsername}
                onChange={e => setVoyagerUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVoyager()}
                placeholder="아이디"
                className="w-full rounded-md outline-none"
                style={{
                  padding: '7px 7px 7px 20px',
                  background: 'rgba(255,255,255,.015)',
                  border: '1px solid rgba(255,255,255,.025)',
                  fontSize: '.68rem', fontWeight: 300, color: '#f0edf6',
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <button
              onClick={handleVoyager}
              className="rounded-md cursor-pointer"
              style={{
                padding: '7px 10px',
                background: 'rgba(155,124,201,.06)',
                border: '1px solid rgba(155,124,201,.05)',
                fontSize: '.6rem', color: 'rgba(240,237,246,.35)',
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
