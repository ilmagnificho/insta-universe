import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import type { UniverseData } from "@/lib/types";

// Generate a simple OG image as SVG (converted to PNG would need a headless browser)
// For now, we return an SVG-based image that most platforms can preview
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new NextResponse("Missing id", { status: 400 });
  }

  const supabase = createServerClient();
  const { data } = await supabase
    .from("universe_results")
    .select("username, universe_data")
    .eq("id", id)
    .single();

  if (!data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const universe = data.universe_data as UniverseData;
  const username = data.username;

  // Generate OG image as SVG
  const width = 1200;
  const height = 630;
  const scaleX = width / 1000;
  const scaleY = height / 1000;

  const bgStars = Array.from({ length: 100 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  const starsSvg = universe.stars
    .slice(0, 40)
    .map(
      (star) =>
        `<circle cx="${star.x * scaleX}" cy="${star.y * scaleY * 0.63}" r="${star.size * scaleX}" fill="${star.color}" opacity="0.85"/>
         <circle cx="${star.x * scaleX}" cy="${star.y * scaleY * 0.63}" r="${(star.size + 4) * scaleX}" fill="${star.color}" opacity="0.15"/>`
    )
    .join("\n");

  const bgStarsSvg = bgStars
    .map(
      (s) =>
        `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="#fff" opacity="${s.opacity}"/>`
    )
    .join("\n");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#1a1a3a"/>
        <stop offset="100%" stop-color="#0a0a1a"/>
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    ${bgStarsSvg}
    ${starsSvg}
    <text x="${width / 2}" y="${height - 80}" text-anchor="middle" fill="#fff" font-size="28" font-weight="bold" font-family="sans-serif">@${username}의 인스타 우주</text>
    <text x="${width / 2}" y="${height - 45}" text-anchor="middle" fill="#888" font-size="16" font-family="sans-serif">Insta Universe</text>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
