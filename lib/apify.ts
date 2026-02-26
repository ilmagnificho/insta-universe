import { ApifyClient } from "apify-client";
import type { InstagramPost } from "./types";

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const ACTOR_ID = "apify/instagram-post-scraper";
const MAX_POSTS = 50;
const TIMEOUT_SECS = 300;

export interface ScrapeResult {
  success: boolean;
  posts: InstagramPost[];
  error?: string;
}

export async function scrapeInstagramPosts(
  username: string,
  maxPosts: number = MAX_POSTS
): Promise<ScrapeResult> {
  try {
    const run = await client.actor(ACTOR_ID).call(
      {
        username: [username],
        resultsLimit: maxPosts,
      },
      {
        timeout: TIMEOUT_SECS,
        waitSecs: TIMEOUT_SECS,
      }
    );

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      return {
        success: false,
        posts: [],
        error: "NO_POSTS",
      };
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
      };
    }

    return { success: true, posts };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("private") || message.includes("Private")) {
      return { success: false, posts: [], error: "PRIVATE_ACCOUNT" };
    }
    if (message.includes("not found") || message.includes("Not Found")) {
      return { success: false, posts: [], error: "ACCOUNT_NOT_FOUND" };
    }

    return { success: false, posts: [], error: "SCRAPE_FAILED" };
  }
}

function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[\wㄱ-ㅎㅏ-ㅣ가-힣]+/g);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
}
