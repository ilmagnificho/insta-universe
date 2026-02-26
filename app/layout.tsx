import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Insta Universe - 내 인스타그램이 우주가 됩니다',
  description: '인스타그램 공개 계정의 게시물을 AI가 분석하여 나만의 우주로 시각화해주는 서비스',
  openGraph: {
    title: 'Insta Universe',
    description: '내 인스타그램이 우주가 됩니다',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
