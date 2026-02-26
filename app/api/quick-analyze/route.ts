import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagramPosts } from "@/lib/apify";
import { CATEGORIES } from "@/lib/types";
import type { InstagramPost } from "@/lib/types";

/**
 * Simplified endpoint: Apify scrape + categorization in one call.
 * No Supabase required. Returns data in MockResult-compatible format.
 */
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "username이 필요합니다" }, { status: 400 });
    }

    // 1. Scrape Instagram via Apify
    const result = await scrapeInstagramPosts(username);

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        PRIVATE_ACCOUNT: "비공개 계정입니다. 공개 계정만 분석 가능해요.",
        ACCOUNT_NOT_FOUND: "계정을 찾을 수 없습니다.",
        INSUFFICIENT_POSTS: "게시물이 5개 미만이에요.",
        NO_POSTS: "게시물을 찾을 수 없습니다.",
        SCRAPE_FAILED: "Instagram 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
      return NextResponse.json(
        { error: errorMessages[result.error || "SCRAPE_FAILED"] },
        { status: 422 }
      );
    }

    // 2. Categorize posts locally (fast, no Claude needed for basic categorization)
    const posts = result.posts.map((post, i) => convertToPostData(post, i));

    // 3. Build MockResult-compatible response
    const catCounts: Record<string, number> = {};
    posts.forEach((p) => {
      catCounts[p.cat.name] = (catCounts[p.cat.name] || 0) + 1;
    });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];
    const categoryCount = Object.keys(catCounts).length;
    const topLikes = Math.max(...posts.map((p) => p.likes));

    // Calculate streak days from post timestamps
    const sortedDates = posts
      .map((p) => new Date(p.date).getTime())
      .sort((a, b) => b - a);
    const streakDays =
      sortedDates.length > 1
        ? Math.round((sortedDates[0] - sortedDates[sortedDates.length - 1]) / 86400000)
        : 30;

    const userTypes = [
      { type: "Dreamy Explorer", rare: "상위 8%", description: "일상 속 아름다움을 포착하는 당신의 우주는 부드러운 빛으로 가득해요.", insight: "카페에서 창밖을 보며 사진 찍는 타입. 여행지에서는 의외로 활발해지는 당신.", locked: [] },
      { type: "Trend Curator", rare: "상위 12%", description: "시대의 흐름을 자신만의 방식으로 재해석하는 당신은 주변의 영감.", insight: "당신의 피드를 몰래 참고하는 사람이 분명 있어요.", locked: [] },
      { type: "Harmony Keeper", rare: "상위 15%", description: "따뜻한 시선으로 세상을 바라보며 소소한 일상에서 빛을 찾는 사람.", insight: "주변 사람들이 당신에게 마음을 터놓는 이유가 있어요.", locked: [] },
      { type: "Creative Dreamer", rare: "상위 6%", description: "에너지 넘치는 피드에서 느껴지는 당신만의 창의력이 빛나고 있어요.", insight: "가만히 있으면 불안한 타입. 그런데 가끔은 멈춰도 괜찮다는 거, 알고 있나요?", locked: [] },
    ];

    // Pick user type based on top category
    const typeIndex =
      topCategory === "여행" ? 0 : topCategory === "패션" ? 1 : topCategory === "일상" ? 2 : 3;

    return NextResponse.json({
      success: true,
      data: {
        username,
        posts,
        userType: userTypes[typeIndex % userTypes.length],
        topCategory,
        categoryCount,
        topLikes,
        streakDays,
      },
    });
  } catch (err) {
    console.error("Quick analyze error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// Convert InstagramPost to PostData format
function convertToPostData(post: InstagramPost, index: number) {
  const caption = post.caption || "";
  const cat = categorizePost(caption, post.hashtags);
  const date = post.timestamp || new Date().toISOString();
  const hour = new Date(date).getHours();

  return {
    id: index,
    caption,
    cat,
    likes: post.likesCount || 0,
    date,
    hour,
    tags: post.hashtags || [],
    displayUrl: post.displayUrl,
    postUrl: post.url,
  };
}

// Simple keyword-based categorization
function categorizePost(caption: string, hashtags: string[]) {
  const text = `${caption} ${hashtags.join(" ")}`.toLowerCase();

  const rules: [string, string[]][] = [
    ["여행", ["travel", "trip", "여행", "vacation", "해외", "공항", "비행", "tourist", "journey", "backpack"]],
    ["음식", ["food", "eat", "맛집", "먹스타그램", "맛스타그램", "yummy", "delicious", "recipe", "cooking", "밥", "디저트", "브런치"]],
    ["패션", ["fashion", "style", "패션", "코디", "outfit", "ootd", "dailylook", "옷", "착샷", "빈티지"]],
    ["운동", ["fitness", "gym", "운동", "workout", "헬스", "running", "yoga", "pilates", "swimming", "crossfit"]],
    ["카페", ["cafe", "coffee", "카페", "커피", "라떼", "아메리카노", "핸드드립"]],
    ["야경", ["night", "야경", "sunset", "sunrise", "노을", "일출", "밤", "루프탑", "별"]],
    ["반려동물", ["pet", "dog", "cat", "반려", "강아지", "고양이", "멍멍", "냥", "puppy", "뭉이"]],
    ["일상", ["daily", "일상", "selfie", "셀카", "주말", "weekend", "하루", "오늘", "mood"]],
  ];

  let bestCat = "일상";
  let bestScore = 0;

  for (const [catName, keywords] of rules) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCat = catName;
    }
  }

  return CATEGORIES.find((c) => c.name === bestCat) || CATEGORIES[2];
}
