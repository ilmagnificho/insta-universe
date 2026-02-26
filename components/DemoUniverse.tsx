"use client";

import { useMemo } from "react";
import UniverseCanvas from "./UniverseCanvas";
import { generateDemoUniverseData } from "@/lib/universe";

interface DemoUniverseProps {
  blurred?: boolean;
}

export default function DemoUniverse({ blurred = true }: DemoUniverseProps) {
  const demoData = useMemo(() => generateDemoUniverseData(), []);

  return (
    <div className="relative">
      <UniverseCanvas data={demoData} blurred={blurred} />
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-black/60 px-8 py-6 text-center backdrop-blur-sm">
            <p className="mb-2 text-lg font-semibold text-white">
              이건 예시 우주예요
            </p>
            <p className="text-sm text-white/60">
              결제하면 내 실제 인스타 데이터로
              <br />
              우주를 만들어 드려요
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
