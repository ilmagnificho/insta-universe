import { NextRequest } from "next/server";

/**
 * Image proxy for Instagram CDN images.
 * Instagram blocks hotlinking from external origins, so we fetch server-side and serve.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new Response("Missing url param", { status: 400 });
  }

  // Only allow Instagram/Facebook CDN domains
  try {
    const parsed = new URL(url);
    const allowed = [
      "instagram.com",
      "cdninstagram.com",
      "fbcdn.net",
      "fbcdn.com",
    ];
    if (!allowed.some((d) => parsed.hostname.endsWith(d))) {
      return new Response("Domain not allowed", { status: 403 });
    }
  } catch {
    return new Response("Invalid URL", { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: "https://www.instagram.com/",
      },
    });

    if (!res.ok) {
      return new Response("Image fetch failed", { status: 502 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const body = await res.arrayBuffer();

    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("Proxy error", { status: 502 });
  }
}
