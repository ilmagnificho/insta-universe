// ===== Category =====
export interface Category {
  name: string;
  r: number;
  g: number;
  b: number;
  hex: string;
}

export const CATEGORIES: Category[] = [
  { name: '여행', r: 100, g: 180, b: 240, hex: '#64b4f0' },
  { name: '음식', r: 240, g: 190, b: 120, hex: '#f0be78' },
  { name: '일상', r: 180, g: 140, b: 230, hex: '#b48ce6' },
  { name: '패션', r: 235, g: 130, b: 175, hex: '#eb82af' },
  { name: '운동', r: 100, g: 220, b: 180, hex: '#64dcb4' },
  { name: '카페', r: 130, g: 170, b: 235, hex: '#82aaeb' },
  { name: '야경', r: 160, g: 120, b: 235, hex: '#a078eb' },
  { name: '반려동물', r: 235, g: 180, b: 130, hex: '#ebb482' },
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
