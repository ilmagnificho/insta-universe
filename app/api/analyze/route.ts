import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { analyzeInstagramPosts } from "@/lib/claude";
import { generateUniverseData } from "@/lib/universe";
import type { InstagramPost } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId가 필요합니다" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const devMode = process.env.DEV_SKIP_PAYMENT === "true";

    // Verify payment is confirmed (skip in dev mode)
    if (!devMode) {
      const { data: payment } = await supabase
        .from("payments")
        .select("status, username")
        .eq("order_id", orderId)
        .eq("status", "confirmed")
        .single();

      if (!payment) {
        return NextResponse.json(
          { error: "결제가 확인되지 않았습니다" },
          { status: 403 }
        );
      }
    }

    // Get raw posts
    const { data: result } = await supabase
      .from("universe_results")
      .select("id, raw_posts, username")
      .eq("payment_order_id", orderId)
      .single();

    if (!result || !result.raw_posts) {
      return NextResponse.json(
        { error: "수집된 게시물이 없습니다. 먼저 스크래핑을 실행해주세요." },
        { status: 400 }
      );
    }

    const posts = result.raw_posts as InstagramPost[];

    // AI analysis
    const analysis = await analyzeInstagramPosts(posts);

    // Generate universe visualization data
    const universeData = generateUniverseData(
      posts,
      analysis,
      result.username
    );

    // Save analysis + universe data
    const { error: updateError } = await supabase
      .from("universe_results")
      .update({
        analysis,
        universe_data: universeData,
      })
      .eq("id", result.id);

    if (updateError) {
      console.error("Save analysis error:", updateError);
      return NextResponse.json(
        { error: "분석 결과 저장에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resultId: result.id,
    });
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "AI 분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
