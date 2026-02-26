import { createServerClient } from "@/lib/supabase";
import type { UniverseData } from "@/lib/types";
import type { Metadata } from "next";
import ResultView from "./ResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = createServerClient();
  const { data } = await supabase
    .from("universe_results")
    .select("username")
    .eq("id", id)
    .single();

  const username = data?.username || "사용자";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://insta-universe.vercel.app";

  return {
    title: `${username}의 인스타 우주 - Insta Universe`,
    description: "내 인스타그램으로 만든 나만의 우주를 확인해보세요",
    openGraph: {
      title: `${username}의 인스타 우주`,
      description: "내 인스타그램으로 만든 나만의 우주를 확인해보세요",
      images: [`${baseUrl}/api/share?id=${id}`],
      type: "website",
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("universe_results")
    .select("username, universe_data")
    .eq("id", id)
    .single();

  if (error || !data) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">
          우주를 찾을 수 없습니다
        </h1>
        <p className="mb-6 text-white/50">
          존재하지 않거나 만료된 우주입니다
        </p>
        <a
          href="/"
          className="rounded-2xl bg-[#7c5bf5] px-8 py-3 font-medium text-white transition-all hover:bg-[#6d4de8]"
        >
          나도 만들어보기
        </a>
      </main>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://insta-universe.vercel.app";
  const shareUrl = `${baseUrl}/result/${id}`;

  return (
    <ResultView
      username={data.username}
      universeData={data.universe_data as UniverseData}
      shareUrl={shareUrl}
    />
  );
}
