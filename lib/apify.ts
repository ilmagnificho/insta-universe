/**
 * Apify Instagram scraper - using REST API directly.
 * (apify-client npm package causes "dynamic import" errors on Vercel serverless)
 */
import type { InstagramPost } from "./types";

const APIFY_BASE = "https://api.apify.com/v2";
const MAX_POSTS = 50;
const WAIT_SECS = 300;

const ACTOR_IDS = [
  "apify~instagram-post-scraper",
  "apify~instagram-scraper",
];

export interface ScrapeResult {
  success: boolean;
  posts: InstagramPost[];
  error?: string;
  errorDetail?: string;
}

export function isApifyConfigured(): boolean {
  return !!process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.length > 10;
}

export async function scrapeInstagramPosts(
  username: string,
  maxPosts: number = MAX_POSTS
): Promise<ScrapeResult> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token.length < 10) {
    console.error("[Apify] APIFY_API_TOKEN is missing or invalid");
    return {
      success: false,
      posts: [],
      error: "NO_API_TOKEN",
      errorDetail: "APIFY_API_TOKEN이 설정되지 않았습니다.",
    };
  }

  // Clean username
  let cleanUsername = username.trim().replace(/^@/, "");
  const urlMatch = cleanUsername.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?/
  );
  if (urlMatch) cleanUsername = urlMatch[1];

  console.log(`[Apify] Scraping @${cleanUsername} (token: ${token.substring(0, 8)}...)`);

  let lastError = "";

  for (const actorId of ACTOR_IDS) {
    try {
      console.log(`[Apify] Trying actor: ${actorId}`);

      const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
      const input: Record<string, unknown> = {
        directUrls: [profileUrl],
        resultsLimit: maxPosts,
      };
      if (actorId.includes("instagram-post-scraper")) {
        input.username = [cleanUsername];
      } else {
        input.usernames = [cleanUsername];
      }

      // 1. Start the actor run
      const runRes = await fetch(
        `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&waitForFinish=${WAIT_SECS}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        }
      );

      if (!runRes.ok) {
        const errBody = await runRes.text();
        console.error(`[Apify] Run start failed (${runRes.status}):`, errBody);
        lastError = `Actor ${actorId}: HTTP ${runRes.status} - ${errBody.substring(0, 200)}`;
        continue;
      }

      const runData = await runRes.json();
      const run = runData.data;
      console.log(`[Apify] Run: id=${run.id}, status=${run.status}, dataset=${run.defaultDatasetId}`);

      // If run didn't finish yet (waitForFinish might not be enough), poll
      if (run.status !== "SUCCEEDED" && run.status !== "FAILED") {
        console.log(`[Apify] Run not finished yet (${run.status}), polling...`);
        const pollRes = await fetch(
          `${APIFY_BASE}/actor-runs/${run.id}?token=${token}&waitForFinish=${WAIT_SECS}`
        );
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          if (pollData.data.status === "FAILED") {
            lastError = `Actor run failed: ${pollData.data.statusMessage || "unknown"}`;
            console.error(`[Apify] Run failed:`, lastError);
            continue;
          }
        }
      }

      if (run.status === "FAILED") {
        lastError = `Actor run failed: ${run.statusMessage || "unknown"}`;
        console.error(`[Apify] Run failed:`, lastError);
        continue;
      }

      // 2. Get dataset items
      const datasetId = run.defaultDatasetId;
      const itemsRes = await fetch(
        `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json`
      );

      if (!itemsRes.ok) {
        lastError = `Dataset fetch failed: HTTP ${itemsRes.status}`;
        console.error(`[Apify]`, lastError);
        continue;
      }

      const items: Record<string, unknown>[] = await itemsRes.json();
      console.log(`[Apify] Got ${items.length} items from dataset`);

      if (!items || items.length === 0) {
        lastError = "NO_POSTS";
        continue;
      }

      const posts: InstagramPost[] = items.map((item) => ({
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

      console.log(`[Apify] Success! ${posts.length} posts for @${cleanUsername}`);
      return { success: true, posts };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Apify] Actor ${actorId} error:`, message);
      lastError = message;

      if (message.includes("private") || message.includes("Private")) {
        return { success: false, posts: [], error: "PRIVATE_ACCOUNT", errorDetail: "비공개 계정입니다" };
      }
      if (message.includes("not found") || message.includes("Not Found") || message.includes("404")) {
        return { success: false, posts: [], error: "ACCOUNT_NOT_FOUND", errorDetail: `@${cleanUsername} 계정을 찾을 수 없습니다` };
      }
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
