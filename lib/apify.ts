import { ApifyClient } from "apify-client";
import type { InstagramPost } from "./types";

const MAX_POSTS = 50;
const TIMEOUT_SECS = 300;

// Supported actor IDs - try in order
const ACTOR_IDS = [
  "apify/instagram-post-scraper",
  "apify/instagram-scraper",
];

export interface ScrapeResult {
  success: boolean;
  posts: InstagramPost[];
  error?: string;
  errorDetail?: string; // human-readable detail for debugging
}

/**
 * Check if Apify API token is configured.
 */
export function isApifyConfigured(): boolean {
  return !!process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.length > 10;
}

export async function scrapeInstagramPosts(
  username: string,
  maxPosts: number = MAX_POSTS
): Promise<ScrapeResult> {
  // 1. Check token FIRST
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token.length < 10) {
    console.error("[Apify] APIFY_API_TOKEN is missing or invalid in .env.local");
    return {
      success: false,
      posts: [],
      error: "NO_API_TOKEN",
      errorDetail: "APIFY_API_TOKEN이 .env.local에 설정되지 않았습니다. Apify 콘솔에서 API 토큰을 복사하여 .env.local 파일에 추가해주세요.",
    };
  }

  const client = new ApifyClient({ token });

  // 2. Clean username
  let cleanUsername = username.trim().replace(/^@/, '');
  const urlMatch = cleanUsername.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/
  );
  if (urlMatch) {
    cleanUsername = urlMatch[1];
  }

  console.log(`[Apify] Scraping @${cleanUsername} (token: ${token.substring(0, 6)}...)`);

  // 3. Try each actor
  let lastError = "";
  for (const actorId of ACTOR_IDS) {
    try {
      console.log(`[Apify] Trying actor: ${actorId}`);

      const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
      const input: Record<string, unknown> = {
        directUrls: [profileUrl],
        resultsLimit: maxPosts,
      };

      // Some actors use "username" field as array, some as string
      if (actorId === "apify/instagram-post-scraper") {
        input.username = [cleanUsername];
      } else {
        input.usernames = [cleanUsername];
      }

      const run = await client.actor(actorId).call(input, {
        timeout: TIMEOUT_SECS,
        waitSecs: TIMEOUT_SECS,
      });

      console.log(`[Apify] Run completed: ${run.id}, status: ${run.status}, datasetId: ${run.defaultDatasetId}`);

      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log(`[Apify] Got ${items?.length || 0} items from dataset`);

      if (!items || items.length === 0) {
        lastError = "NO_POSTS";
        continue; // try next actor
      }

      const posts: InstagramPost[] = items.map((item: Record<string, unknown>) => ({
        id: (item.id as string) || (item.shortCode as string) || String(Math.random()),
        caption: (item.caption as string) || "",
        hashtags: extractHashtags((item.caption as string) || ""),
        likesCount: (item.likesCount as number) || 0,
        timestamp: (item.timestamp as string) || new Date().toISOString(),
        type: ((item.type as string) || "Image") as InstagramPost["type"],
        url: (item.url as string) || `https://www.instagram.com/p/${item.shortCode}/`,
        displayUrl: (item.displayUrl as string) || undefined,
      }));

      if (posts.length < 5) {
        return {
          success: false,
          posts,
          error: "INSUFFICIENT_POSTS",
          errorDetail: `${posts.length}개 게시물만 수집됨 (최소 5개 필요)`,
        };
      }

      console.log(`[Apify] Success! ${posts.length} posts scraped for @${cleanUsername}`);
      return { success: true, posts };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Apify] Actor ${actorId} failed:`, message);
      lastError = message;

      if (message.includes("private") || message.includes("Private")) {
        return {
          success: false,
          posts: [],
          error: "PRIVATE_ACCOUNT",
          errorDetail: "비공개 계정입니다",
        };
      }
      if (message.includes("not found") || message.includes("Not Found") || message.includes("404")) {
        return {
          success: false,
          posts: [],
          error: "ACCOUNT_NOT_FOUND",
          errorDetail: `@${cleanUsername} 계정을 찾을 수 없습니다`,
        };
      }

      // Try next actor
      continue;
    }
  }

  return {
    success: false,
    posts: [],
    error: "SCRAPE_FAILED",
    errorDetail: `모든 스크래퍼 시도 실패: ${lastError}`,
  };
}

function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\wㄱ-ㅎㅏ-ㅣ가-힣]+/g);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}
