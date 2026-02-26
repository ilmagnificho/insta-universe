import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Insta Universe - 내 인스타그램으로 우주를 만든다",
  description:
    "인스타그램 게시물을 AI로 분석해서 아름다운 우주/별자리 비주얼로 시각화해주는 서비스",
  openGraph: {
    title: "Insta Universe - 내 인스타그램으로 우주를 만든다",
    description:
      "인스타그램 게시물을 AI로 분석해서 아름다운 우주/별자리 비주얼로 시각화해주는 서비스",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
