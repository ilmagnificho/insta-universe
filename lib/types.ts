// Instagram post data from Apify
export interface InstagramPost {
  id: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  timestamp: string;
  type: "Image" | "Video" | "Sidecar";
  url: string;
  displayUrl?: string;
}

// Category colors for the universe visualization
export const CATEGORY_COLORS: Record<string, string> = {
  여행: "#4fc3f7",
  음식: "#ff8a65",
  일상: "#aed581",
  패션: "#f48fb1",
  운동: "#ffb74d",
  예술: "#ce93d8",
  음악: "#4dd0e1",
  자연: "#81c784",
};

export const CATEGORY_LIST = Object.keys(CATEGORY_COLORS);

// Claude AI analysis result
export interface AnalysisResult {
  categories: CategoryGroup[];
  postAnalysis: PostAnalysis[];
  relationships: Relationship[];
  summary: string;
}

export interface CategoryGroup {
  name: string;
  color: string;
  postIds: string[];
}

export interface PostAnalysis {
  postId: string;
  keywords: string[];
  category: string;
  sentiment: number; // 0-1
}

export interface Relationship {
  source: string;
  target: string;
  strength: number; // 0-1
  reason: string;
}

// Universe visualization data
export interface UniverseData {
  stars: Star[];
  connections: Connection[];
  clusters: Cluster[];
  summary: string;
  username: string;
}

export interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  category: string;
  keywords: string[];
  caption: string;
  likesCount: number;
  timestamp: string;
  url: string;
}

export interface Connection {
  source: string;
  target: string;
  strength: number;
}

export interface Cluster {
  name: string;
  color: string;
  centerX: number;
  centerY: number;
  radius: number;
  starCount: number;
}

// Payment
export interface PaymentRequest {
  orderId: string;
  username: string;
  amount: number;
  abGroup: "demo" | "real";
}

// Database rows
export interface UniverseResultRow {
  id: string;
  username: string;
  payment_order_id: string;
  raw_posts: InstagramPost[];
  analysis: AnalysisResult;
  universe_data: UniverseData;
  created_at: string;
  expires_at: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  username: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  payment_key: string | null;
  ab_group: string | null;
  created_at: string;
  confirmed_at: string | null;
}
