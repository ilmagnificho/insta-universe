import { CATEGORIES, type PostData, type UniverseType, type CrossInsight, type MockResult, type Category } from './types';

// ===== Post Templates (50) =====
const POST_TEMPLATES: { cap: string; cat: string; hour: number }[] = [
  { cap: '오늘도 좋은 하루였다 #daily #mood', cat: '일상', hour: 21 },
  { cap: '제주도 바다. 여기 오길 잘했다 #jeju #travel', cat: '여행', hour: 15 },
  { cap: '조용한 카페 찾았다 #cafe #coffee #alone', cat: '카페', hour: 14 },
  { cap: 'OOTD 오늘은 좀 차려입었다 #fashion #ootd', cat: '패션', hour: 12 },
  { cap: '헬스 3개월차 #fitness #gym', cat: '운동', hour: 7 },
  { cap: '파스타 맛집 발견 #food #pasta', cat: '음식', hour: 19 },
  { cap: '한강 야경 #nightview #seoul', cat: '야경', hour: 22 },
  { cap: '뭉이 산책 #puppy #walk', cat: '반려동물', hour: 17 },
  { cap: '도쿄 골목 탐방 #tokyo #japan', cat: '여행', hour: 16 },
  { cap: '주말 브런치 #brunch #weekend', cat: '음식', hour: 11 },
  { cap: '새 운동화 도착 #sneakers', cat: '패션', hour: 20 },
  { cap: '퇴근 산책 #daily #walk', cat: '일상', hour: 19 },
  { cap: '교토 단풍 #kyoto #autumn', cat: '여행', hour: 14 },
  { cap: '홈트 완료 #homeworkout', cat: '운동', hour: 6 },
  { cap: '빈티지 쇼핑 #vintage', cat: '패션', hour: 15 },
  { cap: '라떼아트 #latte #cafe', cat: '카페', hour: 10 },
  { cap: '남산 야경 #namsan #night', cat: '야경', hour: 23 },
  { cap: '냥이 낮잠 #cat #cute', cat: '반려동물', hour: 14 },
  { cap: '발리 선셋 #bali #sunset', cat: '여행', hour: 18 },
  { cap: '집밥 #cooking #homemade', cat: '음식', hour: 20 },
  { cap: '가을코디 #fall #fashion', cat: '패션', hour: 13 },
  { cap: '필라테스 50회 #pilates', cat: '운동', hour: 8 },
  { cap: '성수 맛집 #seongsu #food', cat: '음식', hour: 13 },
  { cap: '해운대 새벽 #busan #alone', cat: '여행', hour: 5 },
  { cap: '뭉이 근황 #dog', cat: '반려동물', hour: 16 },
  { cap: '오사카 먹방 #osaka #food', cat: '여행', hour: 12 },
  { cap: '아아 중독 #americano', cat: '카페', hour: 9 },
  { cap: '한강 러닝 5km #running', cat: '운동', hour: 7 },
  { cap: '봄 나들이 #spring', cat: '일상', hour: 14 },
  { cap: '카페 투어 #weekend #cafe', cat: '카페', hour: 15 },
  { cap: '일출 #sunrise', cat: '야경', hour: 5 },
  { cap: '데일리룩 #dailylook', cat: '패션', hour: 12 },
  { cap: '수영 1km #swimming', cat: '운동', hour: 18 },
  { cap: '을지로 감성 #euljiro', cat: '일상', hour: 17 },
  { cap: '노을 #sunset #sky', cat: '야경', hour: 18 },
  { cap: '뭉이 산책 #dog #walk', cat: '반려동물', hour: 16 },
  { cap: '방콕 #bangkok #thai', cat: '여행', hour: 21 },
  { cap: '디저트 #dessert #sweet', cat: '음식', hour: 15 },
  { cap: '요가 30분 #yoga', cat: '운동', hour: 6 },
  { cap: '홍대 #hongdae #art', cat: '일상', hour: 16 },
  { cap: '별밤 #stars #camping', cat: '야경', hour: 23 },
  { cap: '언박싱 #unboxing', cat: '일상', hour: 20 },
  { cap: '크로스핏 WOD #crossfit', cat: '운동', hour: 19 },
  { cap: '연남동 #yeonnam', cat: '일상', hour: 15 },
  { cap: '벚꽃 #cherry #spring', cat: '일상', hour: 13 },
  { cap: '식물 키우기 #plants', cat: '일상', hour: 10 },
  { cap: '싱가포르 #singapore', cat: '여행', hour: 20 },
  { cap: '떡볶이 #food', cat: '음식', hour: 21 },
  { cap: '운동 인증 #workout', cat: '운동', hour: 20 },
  { cap: '루프탑 바 #rooftop', cat: '야경', hour: 22 },
];

// ===== Star Insights (per category) =====
export const STAR_INSIGHTS: Record<string, string[]> = {
  '여행': [
    '이 사진을 올릴 때, 보여주고 싶었던 건 풍경이 아니었을 거예요.\n\n"나 지금 여기 있어"라는 자유로움.\n그때, 무언가에서 벗어나고 싶었나요?',
    '새벽에 찍은 여행 사진.\n\n남들이 자는 시간에 혼자 나온 거죠?\n외로운 게 아니라, 혼자가 편한 거예요.',
    '낯선 골목 사진이네요.\n\n유명한 곳보다 아무도 모르는 곳을 좋아하는 타입.\n그게 당신의 매력이에요.',
  ],
  '음식': [
    '누군가와 함께였을 것 같아요.\n\n혼자 먹을 때는 사진을 안 찍는 타입이죠?\n이 순간이 맛 때문만은 아니었을 거예요.',
    '집밥 사진이네요.\n\n스스로를 돌보고 있다는 뜻이에요.\n최근에 자기 자신에게 신경 쓰기 시작한 것 같아요.',
    '늦은 시간 음식 사진.\n\n야식은 보통 감정적일 때 찾게 되죠.\n그날 하루가 좀 힘들었을 수도 있어요.',
  ],
  '일상': [
    '이 순간을 굳이 기록한 이유가 있을 거예요.\n\n그날, 괜히 기분이 좋았나요?',
    '저녁에 올린 사진.\n\n"오늘도 괜찮았다"고 스스로에게 말해주는 거죠.\n그 습관, 당신을 지켜주고 있어요.',
    '산책 사진이 많네요.\n\n걸으면서 생각을 정리하는 타입이죠?\n걷다 보면 답이 나올 거예요.',
  ],
  '패션': [
    '"오늘은 좀 차려입었다"는 건,\n자기 자신한테 "오늘의 나, 괜찮다"라고\n말하는 거예요.',
    '거울 사진이 많네요.\n\n"이게 나다"라는 확신을 찾는 과정이에요.\n지금의 당신, 충분히 멋있어요.',
    '기분이 안 좋은 날일수록 더 신경 쓰는 타입.\n맞죠?',
  ],
  '운동': [
    '새벽 운동 인증.\n\n지금 무언가를 바꾸고 싶다는 의지가 있다는 뜻이에요.\n최근에 마음먹은 일이 있죠?',
    '자기와의 약속을 남에게 보여줌으로써 지키려는 거예요.\n\n혼자서는 작심삼일인 거, 알고 있죠?\n그래도 계속하고 있잖아요.',
    '운동 빈도가 최근 늘었어요.\n\n몸을 움직여야 마음이 정리되는 사람.\n요즘 풀어야 할 감정이 좀 있나요?',
  ],
  '카페': [
    '혼자 간 카페죠?\n\n사람들 속에 있으면서도 혼자이고 싶은 마음.\n그 시간이 당신에게 숨 쉴 수 있는 순간이에요.',
    '카페를 자주 바꾸는 편이네요.\n\n같은 곳에 안주하는 게 불편한 사람.\n관계에서도 그런 편 아닌가요?',
    '아메리카노를 자주 마시네요.\n\n단순하고 깔끔한 걸 좋아하는 성향.\n복잡한 거 싫어하죠?',
  ],
  '야경': [
    '이 시간에 밖에 있었다는 건,\n집에 가고 싶지 않았거나\n혼자만의 시간이 필요했던 거예요.',
    '노을 사진.\n\n하루가 끝나는 순간을 붙잡고 싶었던 거죠?\n요즘 하루하루가 좀 아깝지 않나요?',
    '밤에 더 많은 감정이 올라오는 사람.\n\n밤이 되면 생각이 많아지죠?\n그게 당신의 깊이예요.',
  ],
  '반려동물': [
    '이 친구가 얼마나 큰 존재인지, 느껴져요.\n\n요즘 사람보다 이 친구한테 더 마음이 가죠?',
    '잠자는 모습을 찍었네요.\n\n평화로운 순간에 마음이 가는 사람.\n일상이 좀 정신없나요?',
    '이 친구 덕분에 밖에 나오게 되죠?\n\n이 친구가 당신의 세상을 넓혀주고 있다는 거,\n알고 있나요?',
  ],
};

// ===== Cluster Insights =====
export const CLUSTER_INSIGHTS: Record<string, string> = {
  '여행': '여행 게시물이 특정 시기에 몰려 있어요. 일상이 힘들어질 때마다 떠나는 경향이 있어요. 여행이 당신에게는 리셋 버튼인 거예요.',
  '음식': '맛집과 집밥이 번갈아 나타나요. 밖에서 자극을 받고, 집에서 안정을 찾는 사이클. 최근 집밥이 늘었다면, 마음이 좀 지쳤다는 신호예요.',
  '일상': '일상 기록 빈도가 일정해요. "오늘도 괜찮았다"를 확인하는 의식이에요.',
  '패션': '스타일이 시즌마다 진화하고 있어요. "되고 싶은 나"가 바뀌는 거예요. 지금은 어떤 사람이 되고 싶은 시기인가요?',
  '운동': '운동 빈도가 점점 높아지고 있어요. 몸을 움직여야 마음이 정리되는 사람이에요.',
  '카페': '혼자 간 곳과 누군가와 간 곳이 확연히 달라요. 결국 혼자만의 시간으로 돌아오는 사람.',
  '야경': '야경의 대부분이 평일 저녁. 퇴근 후 잠깐 멈추는 시간. 유일하게 온전히 자신에게 집중하는 순간이에요.',
  '반려동물': '이 친구에게 사람에게 못 하는 이야기를 하고 있을 수 있어요. 그것도 괜찮아요.',
};

// ===== Cross Category Insights =====
export const CROSS_INSIGHTS: CrossInsight[] = [
  { cats: ['여행', '카페'], text: '여행과 카페가 번갈아 나타나요. 떠나고 싶은 마음과 안주하고 싶은 마음 사이에서 균형을 찾고 있는 거예요.' },
  { cats: ['운동', '야경'], text: '낮에는 몸을 움직여서, 밤에는 멈춰서 감정을 정리하는 패턴. 당신만의 치유 루틴이에요.' },
  { cats: ['음식', '일상'], text: '뭘 먹었는지가 곧 그날의 기분. 좋은 날엔 맛집, 지친 날엔 집밥. 감정 일기나 다름없어요.' },
  { cats: ['패션', '카페'], text: '패션과 카페가 같은 날에 올라와요. "오늘은 나를 위한 날." 자기에게 투자할 줄 아는 사람.' },
];

// ===== Free Insights (by top category) =====
export const FREE_INSIGHTS: Record<string, string> = {
  '패션': '게시물의 상당수가 <b>패션</b> 카테고리네요.\n\n"오늘은 좀 차려입었다"는 건\n자기 자신한테 "오늘의 나, 괜찮다"라고\n말하는 거예요.',
  '여행': '가장 많은 게시물이 <b>여행</b>이에요.\n\n여행이 당신에게는 리셋 버튼.\n요즘, 리셋이 좀 필요하지 않나요?',
  '음식': '<b>음식</b> 게시물이 가장 많네요.\n\n맛집과 집밥이 번갈아 나타나요.\n집밥이 늘었다면, 마음이 좀 지쳤다는 신호.',
  '일상': '<b>일상</b>을 꾸준히 기록하고 있네요.\n\n"오늘도 괜찮았다"를 확인하는 의식.\n기록을 멈추는 날이 오면, 그때가 진짜 신경 써야 할 때.',
  '운동': '<b>운동</b> 게시물이 가장 많아요.\n\n체력 관리가 목적이 아닐 수 있어요.\n몸을 움직여야 마음이 정리되는 사람.',
  '카페': '<b>카페</b>를 가장 자주 기록하네요.\n\n혼자 간 곳과 누군가와 간 곳이 확연히 달라요.\n결국 혼자만의 시간으로 돌아오는 사람.',
  '야경': '<b>야경</b>이 가장 많아요.\n\n밤에 더 많은 감정이 올라오는 사람.\n밤이 되면 생각이 많아지죠?',
  '반려동물': '<b>반려동물</b>이 가장 많네요.\n\n이 친구에게 사람에게 못 하는 이야기를\n하고 있을 수 있어요.',
};

// ===== Universe Types =====
export const USER_TYPES: UniverseType[] = [
  {
    type: 'Dreamy Explorer',
    rare: '상위 8%',
    description: '일상 속 아름다움을 포착하는 당신의 우주는 부드러운 빛으로 가득해요.',
    insight: '카페에서 창밖을 보며 사진 찍는 타입. 여행지에서는 의외로 활발해지는 당신. 요즘, 그 시간이 좀 부족하지 않나요?',
    locked: ['숨겨진 감정 패턴 3가지', '게시물에 담긴 무의식적 습관', '가장 빛나는 순간의 비밀'],
  },
  {
    type: 'Trend Curator',
    rare: '상위 12%',
    description: '시대의 흐름을 자신만의 방식으로 재해석하는 당신은 주변의 영감.',
    insight: '당신의 피드를 몰래 참고하는 사람이 분명 있어요. 정작 당신은 모르고 있겠지만.',
    locked: ['트렌드 영향력 지수', '무의식적 비주얼 패턴', '피드가 전하는 숨겨진 메시지'],
  },
  {
    type: 'Harmony Keeper',
    rare: '상위 15%',
    description: '따뜻한 시선으로 세상을 바라보며 소소한 일상에서 빛을 찾는 사람.',
    insight: '주변 사람들이 당신에게 마음을 터놓는 이유가 있어요. 그런데 당신은 정작 자기 이야기는 누구에게 하고 있나요?',
    locked: ['안정감의 패턴', '관계에서 드러나는 진짜 성향', '치유 에너지의 조건'],
  },
  {
    type: 'Creative Dreamer',
    rare: '상위 6%',
    description: '에너지 넘치는 피드에서 느껴지는 당신만의 창의력이 빛나고 있어요.',
    insight: '가만히 있으면 불안한 타입. 그런데 가끔은 멈춰도 괜찮다는 거, 알고 있나요?',
    locked: ['창작 에너지 폭발 시간대', '무의식적 도전 패턴', '가장 빛날 때의 조건'],
  },
];

// ===== Data Generation =====
function findCategory(name: string): Category {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[2]; // default: 일상
}

export function generateMockPosts(count: number = 50): PostData[] {
  const now = Date.now();
  const posts: PostData[] = [];
  for (let i = 0; i < count; i++) {
    const tmpl = POST_TEMPLATES[i % POST_TEMPLATES.length];
    const cat = findCategory(tmpl.cat);
    posts.push({
      id: i,
      caption: tmpl.cap,
      cat,
      likes: Math.floor(Math.random() * 800 + 20),
      date: new Date(now - Math.floor(Math.random() * 365) * 864e5).toISOString(),
      hour: tmpl.hour,
      tags: tmpl.cap.match(/#\w+/g) || [],
    });
  }
  return posts;
}

export function generateMockResult(username: string): MockResult {
  const posts = generateMockPosts(50);
  const userType = USER_TYPES[Math.floor(Math.random() * USER_TYPES.length)];

  // Count categories
  const catCounts: Record<string, number> = {};
  posts.forEach(p => {
    catCounts[p.cat.name] = (catCounts[p.cat.name] || 0) + 1;
  });
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0];
  const categoryCount = Object.keys(catCounts).length;
  const topLikes = Math.max(...posts.map(p => p.likes));
  const streakDays = Math.floor(Math.random() * 60 + 30);

  return { username, posts, userType, topCategory, categoryCount, topLikes, streakDays };
}

// ===== Session Storage =====
const STORAGE_KEY = 'insta-universe-data';

export function storeMockData(data: MockResult): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage unavailable (SSR)
  }
}

export function loadMockData(): MockResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockResult;
  } catch {
    return null;
  }
}
