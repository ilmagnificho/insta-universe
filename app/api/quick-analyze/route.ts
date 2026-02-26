import { NextRequest, NextResponse } from "next/server";
import { scrapeInstagramPosts, isApifyConfigured } from "@/lib/apify";
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

    // Check Apify configuration first
    if (!isApifyConfigured()) {
      return NextResponse.json(
        {
          error: "API_NOT_CONFIGURED",
          message: "Apify API 토큰이 설정되지 않았습니다",
          detail: ".env.local 파일에 APIFY_API_TOKEN을 추가해주세요. Apify 콘솔 → Settings → Integrations에서 API token을 복사할 수 있습니다.",
        },
        { status: 503 }
      );
    }

    // 1. Scrape Instagram via Apify
    const result = await scrapeInstagramPosts(username);

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        NO_API_TOKEN: "Apify API 토큰이 설정되지 않았습니다. .env.local에 APIFY_API_TOKEN을 추가해주세요.",
        PRIVATE_ACCOUNT: "비공개 계정입니다. 공개 계정만 분석 가능해요.",
        ACCOUNT_NOT_FOUND: "계정을 찾을 수 없습니다.",
        INSUFFICIENT_POSTS: "게시물이 5개 미만이에요.",
        NO_POSTS: "게시물을 찾을 수 없습니다.",
        SCRAPE_FAILED: "Instagram 연결에 실패했습니다. 잠시 후 다시 시도해주세요.",
      };
      return NextResponse.json(
        {
          error: errorMessages[result.error || "SCRAPE_FAILED"],
          errorCode: result.error,
          detail: result.errorDetail,
        },
        { status: result.error === "NO_API_TOKEN" ? 503 : 422 }
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

// Robust keyword-based categorization with weighted scoring
function categorizePost(caption: string, hashtags: string[]) {
  const captionLower = caption.toLowerCase();
  const hashText = hashtags.join(" ").toLowerCase();

  // Expanded keyword rules: [category, caption_keywords, hashtag_keywords]
  // Hashtag matches are weighted 3x because they're explicit signals
  const rules: [string, string[], string[]][] = [
    ["여행", [
      "여행", "해외여행", "국내여행", "공항", "비행기", "항공", "호텔", "리조트", "숙소", "관광",
      "투어", "배낭여행", "자유여행", "유럽", "일본", "동남아", "미국", "제주", "제주도", "부산",
      "강릉", "속초", "경주", "해변", "바다", "섬", "하이킹", "트레킹", "관광통역", "가이드",
      "travel", "trip", "vacation", "journey", "backpack", "tourist", "sightseeing", "wanderlust",
      "explore", "adventure", "flight", "airport", "hotel", "resort", "beach", "island",
    ], [
      "여행", "여행스타그램", "여행에미치다", "해외여행", "국내여행", "제주여행", "부산여행",
      "travel", "travelgram", "travelphotography", "wanderlust", "instatravel",
      "travelblogger", "travelstagram", "vacation", "trip", "backpacking",
    ]],
    ["음식", [
      "음식", "맛집", "밥", "점심", "저녁", "디저트", "브런치", "맛있", "먹방", "요리",
      "레시피", "한식", "양식", "중식", "일식", "분식", "치킨", "피자", "파스타", "스시",
      "라멘", "삼겹살", "고기", "소고기", "돼지고기", "회", "초밥", "떡볶이", "김밥",
      "food", "eat", "yummy", "delicious", "recipe", "cooking", "foodie", "restaurant",
      "dinner", "lunch", "breakfast", "brunch", "dessert", "cake", "pizza", "pasta", "sushi",
    ], [
      "맛집", "먹스타그램", "맛스타그램", "음식", "음식스타그램", "푸드", "푸드스타그램",
      "맛집투어", "먹방", "요리", "디저트", "브런치", "카페맛집",
      "food", "foodie", "foodporn", "foodstagram", "instafood", "yummy", "delicious",
    ]],
    ["패션", [
      "패션", "코디", "옷", "착샷", "빈티지", "쇼핑", "패셔니스타", "스타일", "뷰티",
      "메이크업", "화장품", "향수", "네일", "헤어", "악세사리", "주얼리", "가방", "신발",
      "스니커즈", "원피스", "자켓", "코트", "니트",
      "fashion", "style", "outfit", "styling", "beauty", "makeup", "cosmetics",
      "skincare", "shopping", "vintage", "streetwear", "sneakers", "lookbook",
    ], [
      "패션", "코디", "데일리룩", "오오티디", "룩북", "패셔니스타", "스타일",
      "ootd", "dailylook", "fashion", "style", "outfitoftheday", "fashionista",
      "streetstyle", "lookbook", "fashionstyle", "instafashion",
    ]],
    ["운동", [
      "운동", "헬스", "피트니스", "요가", "필라테스", "수영", "러닝", "마라톤", "크로스핏",
      "근력", "다이어트", "건강", "등산", "자전거", "골프", "테니스", "축구", "농구",
      "배드민턴", "클라이밍", "근육", "프로틴", "벌크업",
      "fitness", "gym", "workout", "exercise", "running", "yoga", "pilates",
      "swimming", "crossfit", "training", "marathon", "cycling", "golf", "tennis",
      "muscle", "health",
    ], [
      "운동", "운동스타그램", "헬스", "헬스타그램", "피트니스", "요가", "필라테스",
      "러닝", "마라톤", "골프", "등산", "다이어트",
      "fitness", "gym", "workout", "fitnessmotivation", "gymlife", "fitlife",
      "healthylifestyle", "running", "yoga", "crossfit",
    ]],
    ["카페", [
      "카페", "커피", "라떼", "아메리카노", "핸드드립", "에스프레소", "카푸치노", "바리스타",
      "베이커리", "빵", "브런치카페", "디저트카페", "카페거리",
      "cafe", "coffee", "latte", "espresso", "cappuccino", "barista", "coffeeshop",
    ], [
      "카페", "카페스타그램", "커피", "커피스타그램", "카페투어", "카페맛집",
      "아메리카노", "라떼", "핸드드립",
      "cafe", "coffee", "coffeetime", "coffeelover", "coffeeshop", "instacoffee",
    ]],
    ["야경", [
      "야경", "노을", "일출", "석양", "루프탑", "별빛", "밤하늘", "밤바다", "야간",
      "night", "nightview", "sunset", "sunrise",
    ], [
      "야경", "노을", "일출", "밤하늘", "야경스타그램",
      "sunset", "sunrise", "nightview", "nightsky",
    ]],
    ["반려동물", [
      "강아지", "고양이", "반려", "멍멍", "야옹", "댕댕", "냥이", "뭉이", "산책",
      "진돗개", "시바", "말티즈", "푸들", "골든리트리버", "코기", "랙돌", "브숏",
      "펫", "애완", "사료", "간식", "동물병원", "입양",
      "dog", "cat", "puppy", "kitten", "pet", "doglover", "catlover",
    ], [
      "강아지", "고양이", "반려동물", "반려견", "반려묘", "댕댕이", "냥이",
      "펫스타그램", "멍스타그램", "냥스타그램", "강아지스타그램",
      "dog", "cat", "pet", "puppy", "dogstagram", "catstagram", "dogsofinstagram",
      "catsofinstagram", "petlover", "doglover", "catlover",
    ]],
    ["일상", [
      "일상", "셀카", "주말", "하루", "오늘", "데일리", "소통", "일기", "기분", "생각",
      "daily", "selfie", "weekend", "mood", "vibes", "life", "today", "love", "happy",
    ], [
      "일상", "데일리", "소통", "셀카", "셀스타그램", "일상스타그램", "좋아요",
      "daily", "selfie", "instadaily", "lifestyle", "dailylife",
    ]],
  ];

  // Emoji-based hints (strong signals)
  const emojiMap: [string, string[]][] = [
    ["반려동물", ["🐕", "🐶", "🐩", "🦮", "🐕‍🦺", "🐈", "🐱", "🐾", "🐰", "🐹", "🐠", "🦜"]],
    ["음식", ["🍔", "🍕", "🍣", "🍜", "🍝", "🍗", "🍰", "🍩", "🧁", "🍦", "🍽", "🥘", "🥗", "🌮", "🍱"]],
    ["여행", ["✈️", "🛫", "🏝", "🏖", "🗼", "🗽", "🏔", "⛰", "🧳", "🌍", "🌎", "🗺", "🚂", "🚢"]],
    ["운동", ["💪", "🏋️", "🏃", "🧘", "⛹️", "🏌️", "🏊", "🚴", "⚽", "🏀", "🎾", "⛳"]],
    ["카페", ["☕", "🍵", "🧋"]],
    ["패션", ["👗", "👠", "👜", "💄", "💅", "👒", "🧥", "👟", "🕶", "💍"]],
    ["야경", ["🌅", "🌄", "🌃", "🌉", "🌌"]],
  ];

  let bestCat = "일상";
  let bestScore = 0;

  for (const [catName, captionKeywords, hashKeywords] of rules) {
    let score = 0;

    // Caption keyword matches (weight: 1 each)
    for (const kw of captionKeywords) {
      if (captionLower.includes(kw)) score += 1;
    }

    // Hashtag matches (weight: 3 each - hashtags are explicit intent signals)
    for (const kw of hashKeywords) {
      if (hashText.includes(kw)) score += 3;
    }

    // Emoji matches (weight: 2 each)
    const emojiEntry = emojiMap.find(([name]) => name === catName);
    if (emojiEntry) {
      for (const emoji of emojiEntry[1]) {
        if (caption.includes(emoji)) score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCat = catName;
    }
  }

  // Require at least score 2 for confident non-일상 classification
  // A single ambiguous word match (score 1) is not enough
  if (bestScore < 2) bestCat = "일상";

  return CATEGORIES.find((c) => c.name === bestCat) || CATEGORIES[2];
}
