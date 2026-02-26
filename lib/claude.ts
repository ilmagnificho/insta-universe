import Anthropic from "@anthropic-ai/sdk";
import type { InstagramPost, AnalysisResult } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-haiku-4-5-20241022";

export async function analyzeInstagramPosts(
  posts: InstagramPost[]
): Promise<AnalysisResult> {
  const postsData = posts.map((post) => ({
    id: post.id,
    caption: post.caption.slice(0, 200),
    hashtags: post.hashtags,
    likesCount: post.likesCount,
    timestamp: post.timestamp,
  }));

  const prompt = `당신은 인스타그램 게시물 분석 전문가입니다.
아래 인스타그램 게시물 데이터를 분석하여 JSON 형식으로 결과를 반환하세요.

분석 대상 게시물:
${JSON.stringify(postsData, null, 2)}

다음을 분석하세요:
1. 해시태그와 캡션을 기반으로 각 게시물을 카테고리로 분류 (최대 8개 카테고리: 여행, 음식, 일상, 패션, 운동, 예술, 음악, 자연 중 해당되는 것)
2. 각 게시물의 주요 키워드 1-3개 추출
3. 게시물 간 유사도/관계 판단 (같은 카테고리, 연속된 이벤트 등)
4. 전체 계정 한 줄 요약 (한국어)

반드시 아래 JSON 형식만 출력하세요. 다른 텍스트 없이 JSON만:
{
  "categories": [
    { "name": "카테고리명", "postIds": ["id1", "id2"] }
  ],
  "postAnalysis": [
    { "postId": "id", "keywords": ["키워드1"], "category": "카테고리명", "sentiment": 0.8 }
  ],
  "relationships": [
    { "source": "id1", "target": "id2", "strength": 0.7, "reason": "같은 여행 시리즈" }
  ],
  "summary": "한 줄 요약"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

    // Add colors to categories
    const categoryColors: Record<string, string> = {
      여행: "#4fc3f7",
      음식: "#ff8a65",
      일상: "#aed581",
      패션: "#f48fb1",
      운동: "#ffb74d",
      예술: "#ce93d8",
      음악: "#4dd0e1",
      자연: "#81c784",
    };

    result.categories = result.categories.map((cat) => ({
      ...cat,
      color: categoryColors[cat.name] || "#888888",
    }));

    return result;
  } catch {
    // Fallback: simple hashtag-based classification
    return fallbackAnalysis(posts);
  }
}

function fallbackAnalysis(posts: InstagramPost[]): AnalysisResult {
  const categoryKeywords: Record<string, string[]> = {
    여행: ["travel", "trip", "여행", "vacation", "tourist", "해외"],
    음식: ["food", "eat", "맛집", "먹스타그램", "cafe", "커피", "맛스타그램"],
    일상: ["daily", "일상", "selfie", "셀카", "ootd"],
    패션: ["fashion", "style", "패션", "코디", "outfit"],
    운동: ["fitness", "gym", "운동", "workout", "헬스"],
    예술: ["art", "design", "그림", "전시", "아트"],
    음악: ["music", "concert", "음악", "공연", "노래"],
    자연: ["nature", "landscape", "풍경", "자연", "산", "바다"],
  };

  const categoryColors: Record<string, string> = {
    여행: "#4fc3f7",
    음식: "#ff8a65",
    일상: "#aed581",
    패션: "#f48fb1",
    운동: "#ffb74d",
    예술: "#ce93d8",
    음악: "#4dd0e1",
    자연: "#81c784",
  };

  const postCategories: Record<string, string> = {};
  const categoryPosts: Record<string, string[]> = {};

  for (const post of posts) {
    const text = `${post.caption} ${post.hashtags.join(" ")}`.toLowerCase();
    let bestCategory = "일상";
    let bestScore = 0;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const score = keywords.filter((kw) => text.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }

    postCategories[post.id] = bestCategory;
    if (!categoryPosts[bestCategory]) categoryPosts[bestCategory] = [];
    categoryPosts[bestCategory].push(post.id);
  }

  const categories = Object.entries(categoryPosts).map(([name, postIds]) => ({
    name,
    color: categoryColors[name] || "#888888",
    postIds,
  }));

  const postAnalysis = posts.map((post) => ({
    postId: post.id,
    keywords: post.hashtags.slice(0, 3),
    category: postCategories[post.id],
    sentiment: 0.7,
  }));

  const relationships: AnalysisResult["relationships"] = [];
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      if (postCategories[posts[i].id] === postCategories[posts[j].id]) {
        relationships.push({
          source: posts[i].id,
          target: posts[j].id,
          strength: 0.5,
          reason: `같은 ${postCategories[posts[i].id]} 카테고리`,
        });
      }
    }
  }

  return {
    categories,
    postAnalysis,
    relationships: relationships.slice(0, 100),
    summary: `다양한 주제의 게시물을 공유하는 계정`,
  };
}
