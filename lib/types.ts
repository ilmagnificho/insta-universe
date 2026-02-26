// ===== Category =====
export interface Category {
  name: string;
  r: number;
  g: number;
  b: number;
  hex: string;
}

export const CATEGORIES: Category[] = [
  { name: '여행', r: 130, g: 200, b: 255, hex: '#82c8ff' },
  { name: '음식', r: 255, g: 200, b: 130, hex: '#ffc882' },
  { name: '일상', r: 200, g: 158, b: 240, hex: '#c89ef0' },
  { name: '패션', r: 255, g: 142, b: 184, hex: '#ff8eb8' },
  { name: '운동', r: 120, g: 232, b: 196, hex: '#78e8c4' },
  { name: '카페', r: 138, g: 180, b: 255, hex: '#8ab4ff' },
  { name: '야경', r: 168, g: 128, b: 240, hex: '#a880f0' },
  { name: '반려동물', r: 255, g: 184, b: 138, hex: '#ffb88a' },
];

// ===== Post Data =====
export interface PostData {
  id: number;
  caption: string;
  cat: Category;
  likes: number;
  date: string; // ISO string
  hour: number;
  tags: string[];
}

// ===== Universe Type =====
export interface UniverseType {
  type: string;
  rare: string;
  description: string;
  insight: string;
  locked: string[];
}

// ===== Mock Result (stored in sessionStorage) =====
export interface MockResult {
  username: string;
  posts: PostData[];
  userType: UniverseType;
  topCategory: string;
  categoryCount: number;
  topLikes: number;
  streakDays: number;
}

// ===== Canvas rendering types =====
export interface UniverseStar {
  x: number;
  y: number;
  size: number;
  post: PostData;
  ts: number; // twinkle speed
  to: number; // twinkle offset
  fa: number; // spike angle
}

export interface ClusterCenter {
  x: number;
  y: number;
  name: string;
  cat: Category;
  count: number;
  pct: number;
}

export interface Nebula {
  x: number;
  y: number;
  r: number;
  c: { r: number; g: number; b: number };
  a: number;
}

export interface DustParticle {
  x: number;
  y: number;
  r: number;
  a: number;
  cr: number;
  cg: number;
  cb: number;
  sp: number;
  ph: number;
}

export interface StreamParticle {
  x: number;
  y: number;
  r: number;
  c: { r: number; g: number; b: number };
  sp: number;
  ph: number;
  a: number;
}

export interface ConstellationEdge {
  a: number;
  b: number;
  c: Category;
}

export interface CrossInsight {
  cats: [string, string];
  text: string;
}

// ===== Backwards-compatible exports for existing API routes =====
export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.name, c.hex])
);
export const CATEGORY_LIST = Object.keys(CATEGORY_COLORS);

export interface AnalysisResult {
  categories: { name: string; color: string; postIds: string[] }[];
  postAnalysis: { postId: string; keywords: string[]; category: string; sentiment: number }[];
  relationships: { source: string; target: string; strength: number; reason: string }[];
  summary: string;
}

export interface UniverseData {
  stars: { id: string; x: number; y: number; size: number; color: string; category: string; keywords: string[]; caption: string; likesCount: number; timestamp: string; url: string }[];
  connections: { source: string; target: string; strength: number }[];
  clusters: { name: string; color: string; centerX: number; centerY: number; radius: number; starCount: number }[];
  summary: string;
  username: string;
}

// Legacy type aliases
export type Star = UniverseData['stars'][number];
export type Connection = UniverseData['connections'][number];
export type Cluster = UniverseData['clusters'][number];
export type CategoryGroup = AnalysisResult['categories'][number];
export type PostAnalysis = AnalysisResult['postAnalysis'][number];
export type Relationship = AnalysisResult['relationships'][number];

export interface PaymentRequest {
  orderId: string;
  username: string;
  amount: number;
}

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

// ===== API types (for later integration) =====
export interface InstagramPost {
  id: string;
  caption: string;
  hashtags: string[];
  likesCount: number;
  timestamp: string;
  type: string;
  url: string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  username: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  payment_key: string | null;
  created_at: string;
  confirmed_at: string | null;
}
