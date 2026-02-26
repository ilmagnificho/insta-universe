import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { scrapeInstagramPosts } from "@/lib/apify";

const ERROR_MESSAGES: Record<string, string> = {
  PRIVATE_ACCOUNT: "공개 계정만 지원합니다",
  ACCOUNT_NOT_FOUND: "계정을 찾을 수 없습니다",
  INSUFFICIENT_POSTS: "분석에 충분한 게시물이 없습니다 (최소 5개)",
  NO_POSTS: "게시물을 찾을 수 없습니다",
  SCRAPE_FAILED: "일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요",
};

export async function POST(req: NextRequest) {
  try {
    const { username, orderId } = await req.json();

    if (!username || !orderId) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다" },
        { status: 400 }
      );
    }

    // Verify payment is confirmed (skip in dev mode)
    const supabase = createServerClient();
    const devMode = process.env.DEV_SKIP_PAYMENT === "true";

    if (!devMode) {
      const { data: payment } = await supabase
        .from("payments")
        .select("status")
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

    // Scrape Instagram posts
    let result = await scrapeInstagramPosts(username);

    // Auto-retry once on failure
    if (!result.success && result.error === "SCRAPE_FAILED") {
      result = await scrapeInstagramPosts(username);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: ERROR_MESSAGES[result.error || "SCRAPE_FAILED"] },
        { status: 422 }
      );
    }

    // Save raw posts to a temporary record
    const { error: upsertError } = await supabase
      .from("universe_results")
      .upsert(
        {
          username,
          payment_order_id: orderId,
          raw_posts: result.posts,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        { onConflict: "payment_order_id" }
      );

    if (upsertError) {
      console.error("Save posts error:", upsertError);
      return NextResponse.json(
        { error: "데이터 저장에 실패했습니다" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      postCount: result.posts.length,
    });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
