import type {
  InstagramPost,
  AnalysisResult,
  UniverseData,
  Star,
  Connection,
  Cluster,
} from "./types";
import { CATEGORY_COLORS } from "./types";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const PADDING = 80;

export function generateUniverseData(
  posts: InstagramPost[],
  analysis: AnalysisResult,
  username: string
): UniverseData {
  // Build lookup maps
  const postAnalysisMap = new Map(
    analysis.postAnalysis.map((pa) => [pa.postId, pa])
  );

  // Calculate cluster centers using golden angle for even distribution
  const clusterCenters = calculateClusterCenters(analysis.categories);

  // Generate stars
  const maxLikes = Math.max(...posts.map((p) => p.likesCount), 1);
  const stars: Star[] = posts.map((post) => {
    const pa = postAnalysisMap.get(post.id);
    const category = pa?.category || "일상";
    const center = clusterCenters.get(category) || {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    };

    // Position within cluster with some randomness
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100 + 20;
    const x = Math.max(
      PADDING,
      Math.min(CANVAS_WIDTH - PADDING, center.x + Math.cos(angle) * distance)
    );
    const y = Math.max(
      PADDING,
      Math.min(CANVAS_HEIGHT - PADDING, center.y + Math.sin(angle) * distance)
    );

    // Star size: 3-20 based on likes
    const size = 3 + (post.likesCount / maxLikes) * 17;

    return {
      id: post.id,
      x,
      y,
      size,
      color: CATEGORY_COLORS[category] || "#888888",
      category,
      keywords: pa?.keywords || post.hashtags.slice(0, 3),
      caption: post.caption,
      likesCount: post.likesCount,
      timestamp: post.timestamp,
      url: post.url,
    };
  });

  // Generate connections from relationships
  const connections: Connection[] = analysis.relationships
    .filter((rel) => rel.strength > 0.3)
    .slice(0, 80)
    .map((rel) => ({
      source: rel.source,
      target: rel.target,
      strength: rel.strength,
    }));

  // Generate clusters
  const clusters: Cluster[] = analysis.categories.map((cat) => {
    const center = clusterCenters.get(cat.name) || {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    };
    const clusterStars = stars.filter((s) => s.category === cat.name);
    const radius = Math.max(
      60,
      clusterStars.length * 8
    );

    return {
      name: cat.name,
      color: cat.color,
      centerX: center.x,
      centerY: center.y,
      radius,
      starCount: clusterStars.length,
    };
  });

  return {
    stars,
    connections,
    clusters,
    summary: analysis.summary,
    username,
  };
}

function calculateClusterCenters(
  categories: AnalysisResult["categories"]
): Map<string, { x: number; y: number }> {
  const centers = new Map<string, { x: number; y: number }>();
  const count = categories.length;
  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const orbitalRadius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.3;

  // Golden angle distribution for aesthetically pleasing placement
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  categories.forEach((cat, i) => {
    const angle = i * goldenAngle;
    const r = orbitalRadius * (0.6 + (i / count) * 0.4);
    centers.set(cat.name, {
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
    });
  });

  return centers;
}

// Generate demo universe data with fake posts
export function generateDemoUniverseData(): UniverseData {
  const demoCategories = ["여행", "음식", "일상", "패션"];
  const demoStars: Star[] = [];

  const centerX = CANVAS_WIDTH / 2;
  const centerY = CANVAS_HEIGHT / 2;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  const clusterCenters = demoCategories.map((cat, i) => {
    const angle = i * goldenAngle;
    const r = 200;
    return {
      name: cat,
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r,
    };
  });

  for (let i = 0; i < 30; i++) {
    const catIndex = i % demoCategories.length;
    const category = demoCategories[catIndex];
    const center = clusterCenters[catIndex];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 80 + 20;

    demoStars.push({
      id: `demo-${i}`,
      x: center.x + Math.cos(angle) * dist,
      y: center.y + Math.sin(angle) * dist,
      size: 4 + Math.random() * 14,
      color: CATEGORY_COLORS[category] || "#888888",
      category,
      keywords: ["데모", "샘플"],
      caption: "데모 게시물입니다",
      likesCount: Math.floor(Math.random() * 500),
      timestamp: new Date().toISOString(),
      url: "#",
    });
  }

  const demoConnections: Connection[] = [];
  for (let i = 0; i < 20; i++) {
    const a = Math.floor(Math.random() * demoStars.length);
    let b = Math.floor(Math.random() * demoStars.length);
    if (a === b) b = (b + 1) % demoStars.length;
    demoConnections.push({
      source: demoStars[a].id,
      target: demoStars[b].id,
      strength: 0.3 + Math.random() * 0.5,
    });
  }

  const demoClusters: Cluster[] = clusterCenters.map((c) => ({
    name: c.name,
    color: CATEGORY_COLORS[c.name] || "#888888",
    centerX: c.x,
    centerY: c.y,
    radius: 100,
    starCount: Math.ceil(30 / demoCategories.length),
  }));

  return {
    stars: demoStars,
    connections: demoConnections,
    clusters: demoClusters,
    summary: "이것은 예시 우주입니다. 결제 후 실제 데이터로 우주를 만들어 드려요!",
    username: "demo",
  };
}
