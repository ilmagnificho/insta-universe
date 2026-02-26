"use client";

import UniverseCanvas from "@/components/UniverseCanvas";
import ShareButtons from "@/components/ShareButtons";
import type { UniverseData } from "@/lib/types";

interface ResultViewProps {
  username: string;
  universeData: UniverseData;
  shareUrl: string;
}

export default function ResultView({
  username,
  universeData,
  shareUrl,
}: ResultViewProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">
            @{username}의 인스타 우주
          </h1>
          <p className="text-sm text-white/50">{universeData.summary}</p>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          {universeData.clusters.map((cluster) => (
            <div key={cluster.name} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: cluster.color }}
              />
              <span className="text-xs text-white/50">
                {cluster.name} ({cluster.starCount})
              </span>
            </div>
          ))}
        </div>

        {/* Universe */}
        <div className="mb-8">
          <UniverseCanvas data={universeData} />
        </div>

        {/* Share */}
        <div className="mb-8">
          <p className="mb-4 text-center text-sm text-white/40">
            친구에게 내 우주를 공유해보세요
          </p>
          <ShareButtons url={shareUrl} username={username} />
        </div>

        {/* CTA for viral */}
        <div className="text-center">
          <a
            href="/"
            className="inline-block rounded-2xl border border-white/10 bg-white/5 px-8 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10"
          >
            나도 만들어보기
          </a>
        </div>
      </div>
    </main>
  );
}
