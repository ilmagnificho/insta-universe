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

// ===== Star Insights (7 per category for unique per-star experiences) =====
export const STAR_INSIGHTS: Record<string, string[]> = {
  '여행': [
    '이 사진을 올릴 때, 보여주고 싶었던 건 풍경이 아니었을 거예요.\n\n"나 지금 여기 있어"라는 자유로움.\n그때, 무언가에서 벗어나고 싶었나요?',
    '새벽에 찍은 여행 사진.\n\n남들이 자는 시간에 혼자 나온 거죠?\n외로운 게 아니라, 혼자가 편한 거예요.',
    '낯선 골목 사진이네요.\n\n유명한 곳보다 아무도 모르는 곳을 좋아하는 타입.\n그게 당신의 매력이에요.',
    '관광지보다 로컬 맛집을 찾아다니는 스타일이죠?\n\n여행의 목적이 "보는 것"이 아니라 "느끼는 것"인 사람.',
    '귀국 직후에 이미 다음 여행을 검색하고 있지 않나요?\n\n떠나는 게 목적이 아니라, 돌아올 곳이 있다는 안도감.\n그게 당신에게 여행의 진짜 의미.',
    '여행 사진 중에 사람이 거의 없네요.\n\n풍경 뒤에 숨은 건 고독이 아니라\n"이 순간만큼은 온전히 나"라는 해방감.',
    '이 여행은 계획된 게 아니었을 수 있어요.\n\n충동적으로 떠났다면, 그때 현실에서 벗어나고 싶은 마음이 컸을 거예요.',
  ],
  '음식': [
    '누군가와 함께였을 것 같아요.\n\n혼자 먹을 때는 사진을 안 찍는 타입이죠?\n이 순간이 맛 때문만은 아니었을 거예요.',
    '집밥 사진이네요.\n\n스스로를 돌보고 있다는 뜻이에요.\n최근에 자기 자신에게 신경 쓰기 시작한 것 같아요.',
    '늦은 시간 음식 사진.\n\n야식은 보통 감정적일 때 찾게 되죠.\n그날 하루가 좀 힘들었을 수도 있어요.',
    '"맛있겠다"보다 "이 순간이 좋다"에 가까운 사진.\n\n음식이 아니라 그때의 분위기를 기록한 거예요.',
    '새로운 곳을 계속 찾아다니는 편이네요.\n\n탐색 자체를 즐기는 사람.\n맛 이상의 무언가를 찾고 있는 거예요.',
    '소박한 한 끼.\n\n"이 정도면 충분해"라는 마음.\n최근에 삶을 단순하게 만들고 싶어진 것 같아요.',
    '이 음식, 누군가 추천해준 거 아닌가요?\n\n좋은 걸 나누고 싶은 마음.\n당신은 받는 것보다 주는 게 편한 사람이에요.',
  ],
  '일상': [
    '이 순간을 굳이 기록한 이유가 있을 거예요.\n\n그날, 괜히 기분이 좋았나요?',
    '저녁에 올린 사진.\n\n"오늘도 괜찮았다"고 스스로에게 말해주는 거죠.\n그 습관, 당신을 지켜주고 있어요.',
    '산책 사진이 많네요.\n\n걸으면서 생각을 정리하는 타입이죠?\n걷다 보면 답이 나올 거예요.',
    '별것 아닌 순간인데 이상하게 예쁘게 찍혔죠?\n\n당신 눈에는 일상도 아름다워 보이는 거예요.\n그게 재능이에요.',
    '주말 오후의 여유.\n\n이런 시간이 있어야 월요일을 버틸 수 있다는 걸\n당신은 본능적으로 알고 있어요.',
    '계절이 바뀔 때마다 기록이 늘어나네요.\n\n변화에 민감한 사람.\n그래서 남들보다 먼저 봄을 느끼는 거예요.',
    '이 사진, 누군가에게 보내려고 찍은 것 같아요.\n\n"나 오늘 이랬어"라고 말하고 싶은 사람이 있는 거죠.',
  ],
  '패션': [
    '"오늘은 좀 차려입었다"는 건,\n자기 자신한테 "오늘의 나, 괜찮다"라고\n말하는 거예요.',
    '거울 사진이 많네요.\n\n"이게 나다"라는 확신을 찾는 과정이에요.\n지금의 당신, 충분히 멋있어요.',
    '기분이 안 좋은 날일수록 더 신경 쓰는 타입.\n맞죠?',
    '이 옷을 입었을 때 자신감이 올라갔을 거예요.\n\n옷은 갑옷 같은 거예요.\n오늘 하루를 버틸 수 있게 해주는 힘.',
    '새로운 스타일을 시도한 거네요.\n\n"변하고 싶다"는 마음이 옷에서부터 시작된 거예요.\n지금 인생의 전환점에 서 있을 수 있어요.',
    '편안한 차림의 사진.\n\n요즘 자연스러운 게 편해진 거죠?\n그건 자기 자신이 좀 더 편해졌다는 뜻이에요.',
    '이 사진의 색감, 당신이 좋아하는 색이죠?\n\n무의식적으로 끌리는 색은 지금 필요한 에너지를 반영해요.',
  ],
  '운동': [
    '새벽 운동 인증.\n\n지금 무언가를 바꾸고 싶다는 의지가 있다는 뜻이에요.\n최근에 마음먹은 일이 있죠?',
    '자기와의 약속을 남에게 보여줌으로써 지키려는 거예요.\n\n혼자서는 작심삼일인 거, 알고 있죠?\n그래도 계속하고 있잖아요.',
    '운동 빈도가 최근 늘었어요.\n\n몸을 움직여야 마음이 정리되는 사람.\n요즘 풀어야 할 감정이 좀 있나요?',
    '기록을 남기는 건 스스로에게 하는 약속.\n\n"내일도 오겠다"는 다짐.\n당신은 이미 충분히 잘하고 있어요.',
    '운동 후의 뿌듯함이 느껴지는 사진이네요.\n\n이 성취감이 하루를 지탱하는 힘이 되고 있어요.',
    '몸이 변하면 마음도 변해요.\n\n최근 3개월, 외면뿐 아니라 내면도 단단해지고 있을 거예요.',
    '꾸준함이 보이는 기록이에요.\n\n재능이 아니라 습관으로 만들어낸 결과.\n그게 당신의 진짜 강점이에요.',
  ],
  '카페': [
    '혼자 간 카페죠?\n\n사람들 속에 있으면서도 혼자이고 싶은 마음.\n그 시간이 당신에게 숨 쉴 수 있는 순간이에요.',
    '카페를 자주 바꾸는 편이네요.\n\n같은 곳에 안주하는 게 불편한 사람.\n관계에서도 그런 편 아닌가요?',
    '아메리카노를 자주 마시네요.\n\n단순하고 깔끔한 걸 좋아하는 성향.\n복잡한 거 싫어하죠?',
    '창가 자리를 좋아하는 것 같아요.\n\n밖을 바라보면서 생각 정리하는 시간.\n이 시간이 당신에게는 명상이에요.',
    '디저트 사진이 함께 있네요.\n\n자기에게 주는 작은 선물.\n"오늘 수고했어"를 디저트로 말하는 사람.',
    '조용한 분위기의 카페를 좋아하는 것 같아요.\n\n소음 속에서도 고요를 찾는 능력.\n그게 당신의 초능력이에요.',
    '비 오는 날 카페에 있었네요.\n\n비 소리를 들으며 멍 때리는 시간.\n이런 시간이 당신을 충전시켜요.',
  ],
  '야경': [
    '이 시간에 밖에 있었다는 건,\n집에 가고 싶지 않았거나\n혼자만의 시간이 필요했던 거예요.',
    '노을 사진.\n\n하루가 끝나는 순간을 붙잡고 싶었던 거죠?\n요즘 하루하루가 좀 아깝지 않나요?',
    '밤에 더 많은 감정이 올라오는 사람.\n\n밤이 되면 생각이 많아지죠?\n그게 당신의 깊이예요.',
    '도시 불빛이 아름다운 건,\n각각의 빛 뒤에 누군가의 하루가 있기 때문이에요.\n당신은 그걸 느끼는 사람.',
    '이 사진을 찍을 때, 음악을 듣고 있었을 것 같아요.\n\n감성이 극대화되는 밤.\n그 시간이 당신을 충전시키는 거예요.',
    '높은 곳에서 내려다보는 걸 좋아하는 것 같아요.\n\n거리를 두고 바라볼 때 비로소 보이는 것들.\n관계에서도 그런 편이에요.',
    '별이 보이는 밤이었네요.\n\n도시에서 별을 찾는 사람.\n작은 것에서 아름다움을 발견하는 능력.',
  ],
  '반려동물': [
    '이 친구가 얼마나 큰 존재인지, 느껴져요.\n\n요즘 사람보다 이 친구한테 더 마음이 가죠?',
    '잠자는 모습을 찍었네요.\n\n평화로운 순간에 마음이 가는 사람.\n일상이 좀 정신없나요?',
    '이 친구 덕분에 밖에 나오게 되죠?\n\n이 친구가 당신의 세상을 넓혀주고 있다는 거,\n알고 있나요?',
    '이 표정 좀 보세요.\n\n이 친구는 당신의 감정을 다 알고 있을 거예요.\n말 안 해도 알아주는 존재.',
    '함께 있는 시간이 길어질수록 닮아간다는 거 알죠?\n\n어쩌면 이 친구가 당신의 거울인지도 몰라요.',
    '이 친구를 위해 시간을 내고 있네요.\n\n돌봄을 통해 자기 자신도 돌보고 있는 거예요.\n사랑은 그렇게 순환하는 거예요.',
    '이 친구와 처음 만난 날이 기억나나요?\n\n그때부터 당신의 세계가 조금 더 따뜻해졌을 거예요.',
  ],
};

// ===== Per-Post Unique Insight Generator =====
export function getUniqueStarInsight(postId: number, catName: string, hour: number, _likes: number): string {
  const catInsights = STAR_INSIGHTS[catName] || STAR_INSIGHTS['일상'];
  const mainInsight = catInsights[postId % catInsights.length];
  const timeNote = hour < 6
    ? '\n\n새벽의 기록. 잠이 안 왔거나, 일찍 일어났거나. 어느 쪽이든, 그 시간의 당신은 가장 솔직한 상태였을 거예요.'
    : hour < 10
      ? '\n\n아침의 기록. 하루를 시작하는 에너지가 느껴져요.'
      : hour >= 22
        ? '\n\n밤늦은 기록. 하루의 끝에서 스스로와 대화하는 시간.'
        : '';
  return mainInsight + timeNote;
}

// ===== Stability Patterns (Premium: 안정감의 패턴) =====
export const STABILITY_PATTERNS: Record<string, { title: string; description: string; advice: string }> = {
  'regular': {
    title: '고요한 파도형',
    description: '게시물 간격이 3-5일로 일정해요. 자기 자신과 꾸준히 대화하고 있다는 증거.\n안정적인 기록 습관은 마음의 평화에서 나와요.',
    advice: '이 리듬을 지키세요. 당신의 안정감의 원천이에요.',
  },
  'burst': {
    title: '감정 폭발형',
    description: '특정 시기에 게시물이 몰려 있어요. 감정이 폭발하는 시기가 있고, 조용한 시기가 있는 패턴.\n당신은 감정의 파도를 있는 그대로 타는 사람.',
    advice: '폭발하는 시기의 기록을 나중에 다시 읽어보세요. 그때의 당신이 지금의 당신에게 말하는 것이 있을 거예요.',
  },
  'declining': {
    title: '내면 집중형',
    description: '최근 게시물 빈도가 줄고 있어요. 기록의 의지가 약해진 게 아니라, 지금 내면에 집중하고 있는 시기.',
    advice: '기록하지 않는 시간도 중요한 시간이에요. 다시 돌아올 때, 더 깊은 이야기를 할 수 있을 거예요.',
  },
  'increasing': {
    title: '표현 확장형',
    description: '최근 기록이 늘고 있어요. 표현하고 싶은 것들이 많아지는 시기.\n당신 안에 새로운 에너지가 흐르기 시작한 거예요.',
    advice: '이 흐름을 따라가세요. 지금이 당신의 황금기일 수 있어요.',
  },
};

// ===== Relationship Traits (Premium: 관계에서 드러나는 진짜 성향) =====
export const RELATIONSHIP_TRAITS: Record<string, string[]> = {
  '여행': ['관계에서 "같이 떠나자"가 애정 표현인 사람.', '혼자 있는 시간이 충분해야 관계에서도 편안해지는 타입.', '파트너에게도 자유를 주는 사람.'],
  '음식': ['함께 먹는 것으로 사랑을 표현하는 사람.', '"뭐 먹고 싶어?"가 "사랑해"의 다른 말.', '상대의 입맛을 기억하는 섬세한 면이 있어요.'],
  '일상': ['같은 공간에 있는 것만으로 충분한 사람.', '일상을 공유하고 싶은 마음이 곧 사랑의 표현.', '말보다 행동으로 보여주는 타입.'],
  '패션': ['상대의 스타일에 영향을 주고받는 관계를 좋아하는 사람.', '각자의 개성을 존중하는 관계를 원해요.', '첫인상에 신경을 많이 쓰는 편.'],
  '운동': ['함께 목표를 향해 달리는 관계를 좋아하는 사람.', '서로의 성장을 응원하는 게 사랑이라고 믿는 타입.', '노력하는 모습에 끌리는 사람.'],
  '카페': ['마주 앉아서 이야기하는 시간을 중요하게 여기는 사람.', '분위기에 민감한 만큼, 관계의 온도에도 예민한 편.', '혼자만의 시간이 필요한 만큼, 상대에게도 그 시간을 주는 사람.'],
  '야경': ['밤에 더 솔직해지는 사람. 깊은 대화는 밤에 시작되죠.', '감정의 깊이가 있는 만큼, 피상적인 관계에는 관심 없는 타입.', '자신의 약한 모습을 보여주기까지 시간이 좀 걸리는 편.'],
  '반려동물': ['돌봄의 언어로 사랑을 표현하는 사람.', '조건 없는 사랑을 알기에, 진심을 원하는 타입.', '작은 존재를 아끼는 따뜻한 마음.'],
};

// ===== Healing Conditions (Premium: 치유 에너지의 조건) =====
export const HEALING_CONDITIONS: Record<string, { condition: string; recommendation: string; energy: string }> = {
  '여행': { condition: '낯선 곳에서의 자유. 일상에서 벗어나는 순간 에너지가 충전돼요.', recommendation: '짧은 여행을 떠나보세요. 1박이어도, 집 근처 처음 가보는 길이어도 괜찮아요.', energy: '탐험 에너지' },
  '음식': { condition: '맛있는 음식을 먹는 순간. 특히 누군가와 함께일 때 치유 효과가 배가돼요.', recommendation: '좋아하는 사람과 좋아하는 음식을. 요리를 직접 해보는 것도 좋아요.', energy: '돌봄 에너지' },
  '일상': { condition: '소소한 루틴의 반복. 예측 가능한 일상이 안정감을 줘요.', recommendation: '매일 같은 시간에 같은 일을 하는 작은 의식을 만들어보세요.', energy: '안정 에너지' },
  '패션': { condition: '자기 표현의 순간. 마음에 드는 모습으로 가꿨을 때 충전돼요.', recommendation: '기분이 안 좋은 날일수록 좋아하는 옷을 입어보세요.', energy: '표현 에너지' },
  '운동': { condition: '몸을 움직이는 순간. 땀이 나면 마음의 짐도 함께 빠져나가요.', recommendation: '무거운 감정이 들 때, 일단 밖으로 나가서 걸으세요. 10분이면 충분해요.', energy: '행동 에너지' },
  '카페': { condition: '혼자만의 조용한 공간. 적당한 소음 속에서 자신과 대화하는 시간.', recommendation: '일주일에 한 번, "나만의 시간"을 정해두세요.', energy: '고요 에너지' },
  '야경': { condition: '밤의 고요한 시간. 어둠 속에서 빛을 발견할 때 마음이 정화돼요.', recommendation: '가끔 밤 산책을 해보세요. 도시의 불빛을 바라보는 것만으로도.', energy: '성찰 에너지' },
  '반려동물': { condition: '사랑하는 존재와의 교감. 말 없이 함께 있는 것만으로 치유가 돼요.', recommendation: '이 친구와 더 많은 시간을 보내세요.', energy: '교감 에너지' },
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
  { cats: ['여행', '음식'], text: '여행과 음식이 함께 나타나요. 미각이 기억을 저장하는 통로인 사람. 맛으로 여행을 기억하는 타입.' },
  { cats: ['일상', '반려동물'], text: '일상 기록과 반려동물이 함께 등장해요. 소소한 행복이 가장 큰 행복인 사람.' },
  { cats: ['운동', '음식'], text: '운동과 음식이 번갈아 나타나요. 자기관리와 보상이 반복되는 건강한 순환. 당신 나름의 밸런스가 있네요.' },
  { cats: ['패션', '야경'], text: '패션과 야경이 같은 날 올라와요. 누군가를 만났거나, 혼자여도 빛나고 싶은 날이었을 거예요.' },
];

// ===== Deep Personality Insights (shown after exploring 5+ stars) =====
export const DEEP_PERSONALITY: Record<string, string[]> = {
  '여행': [
    '당신은 현실에서 벗어날 때 진짜 자신을 만나는 사람이에요.',
    '새로운 장소가 당신에게는 새로운 버전의 자신을 만나는 기회.',
    '여행 빈도가 높아지는 시기는 현실에서 변화가 필요할 때.',
  ],
  '음식': [
    '음식은 당신에게 위로의 언어예요. 힘든 날일수록 맛있는 걸 찾아요.',
    '누군가와 밥을 먹을 때 가장 솔직해지는 사람.',
    '당신의 음식 취향 변화가 곧 감정 변화의 기록이에요.',
  ],
  '일상': [
    '기록하는 것 자체가 당신의 치유법이에요.',
    '"오늘도 괜찮았다"를 확인하고 싶은 마음이 있어요.',
    '루틴이 무너지면 마음도 흔들리는 타입. 지금 루틴은 괜찮나요?',
  ],
  '패션': [
    '입는 것으로 감정을 표현하는 사람. 오늘의 옷이 오늘의 기분.',
    '남에게 보이는 나와 진짜 나 사이에서 고민한 적 있죠?',
    '스타일이 바뀔 때마다 인생의 챕터가 바뀌고 있었어요.',
  ],
  '운동': [
    '운동은 당신에게 명상이에요. 몸을 움직여야 머리가 정리되는 사람.',
    '자기 자신과의 약속을 지키는 게 중요한 사람.',
    '최근 운동 강도가 올라갔다면, 풀어야 할 감정이 있다는 신호.',
  ],
  '카페': [
    '혼자만의 공간이 필요한 사람. 카페가 당신의 쉼터.',
    '사람들 속에 있으면서도 혼자인 그 느낌을 좋아하는 사람.',
    '같은 카페에 반복해서 간다면, 안정감이 필요하다는 뜻.',
  ],
  '야경': [
    '밤에 감정이 깊어지는 사람. 밤이 당신의 진짜 시간.',
    '하루의 끝에서 홀로 서 있는 시간이 당신을 단단하게 만들어요.',
    '야경을 찍는 건 "오늘도 버텼다"는 자신에게 주는 보상.',
  ],
  '반려동물': [
    '말 없이도 통하는 존재가 있다는 게 얼마나 큰 위안인지 아는 사람.',
    '사람에게 받은 상처를 이 친구가 치유해준 적 있죠?',
    '이 친구 덕분에 더 나은 사람이 되고 싶어지는 거, 맞죠?',
  ],
};

// ===== Achievement Badges =====
export const ACHIEVEMENT_BADGES: { condition: string; icon: string; title: string; desc: string }[] = [
  { condition: 'evening70', icon: '🌙', title: '야행성 기록자', desc: '게시물의 70% 이상이 저녁 이후' },
  { condition: 'morning40', icon: '🌅', title: '얼리버드', desc: '아침 시간대 게시물이 40% 이상' },
  { condition: 'category7', icon: '🌈', title: '다채로운 우주', desc: '7가지 이상의 카테고리를 가진 우주' },
  { condition: 'likes500', icon: '✨', title: '반짝이는 별', desc: '좋아요 500 이상의 게시물 보유' },
  { condition: 'streak60', icon: '🔥', title: '꾸준한 기록가', desc: '60일 이상 꾸준히 기록 중' },
  { condition: 'topcat50', icon: '💎', title: '깊은 몰입가', desc: '하나의 카테고리가 50% 이상' },
];

// ===== Monthly Pattern Insights =====
export const MONTHLY_INSIGHTS: string[] = [
  '최근 3개월간 게시물 빈도가 높아지고 있어요. 표현하고 싶은 것들이 많아지는 시기.',
  '주말 게시물이 평일보다 2배 많아요. 쉬는 날에 더 자유로운 사람.',
  '매달 꾸준히 기록하고 있어요. 이 습관이 당신을 지켜주고 있을 거예요.',
  '특정 달에 게시물이 집중되어 있어요. 그때 어떤 변화가 있었나요?',
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

// ===== Personality Keywords (shown as teaser before payment) =====
export const PERSONALITY_KEYWORDS: Record<string, string[]> = {
  '여행': ['자유로운 탐험가', '혼자만의 시간을 사랑하는', '리셋이 필요한 감성파', '낯선 곳에서 빛나는'],
  '음식': ['감성 미식가', '먹는 게 곧 위로인', '함께 나누는 걸 좋아하는', '자기돌봄 실천파'],
  '일상': ['꾸준한 기록자', '소소한 행복 수집가', '자기확인이 필요한', '루틴의 힘을 아는'],
  '패션': ['자기표현 마스터', '거울 속 자신을 사랑하는', '기분 전환의 달인', '비주얼 감성파'],
  '운동': ['의지력 끝판왕', '몸으로 감정을 푸는', '새벽형 도전가', '자기와의 약속을 지키는'],
  '카페': ['고독을 즐기는 감성인', '분위기에 민감한', '자기만의 아지트가 필요한', '커피로 하루를 여는'],
  '야경': ['밤에 감성이 깊어지는', '혼자만의 시간이 필요한', '감정 깊이가 남다른', '하루 끝의 여백을 아는'],
  '반려동물': ['조건 없는 사랑을 아는', '작은 존재에게 마음을 여는', '돌봄이 자연스러운', '평화로운 순간을 사랑하는'],
};

// ===== Emotional Pattern Teasers =====
export const EMOTION_TEASERS: Record<string, string> = {
  '여행': '여행 게시물이 특정 시기에 집중되어 있어요. 그때 무슨 일이...',
  '음식': '혼밥과 함께 먹는 날의 패턴이 보여요. 최근에는...',
  '일상': '기록 빈도가 감정 상태와 연동되어 있어요. 특히...',
  '패션': '스타일 변화가 시즌이 아닌 감정과 연결되어 있어요...',
  '운동': '운동 빈도 곡선에 흥미로운 패턴이 있어요. 특히...',
  '카페': '혼자 간 카페와 함께 간 카페의 차이에 비밀이...',
  '야경': '야경 게시물의 요일 분포에 의미 있는 패턴이...',
  '반려동물': '이 친구와 함께하는 시간의 변화에 숨겨진 의미가...',
};

// ===== Time Pattern Descriptions =====
export const TIME_LABELS: Record<string, string> = {
  'dawn': '새벽 (0-6시)',
  'morning': '오전 (6-12시)',
  'afternoon': '오후 (12-18시)',
  'evening': '저녁 (18-24시)',
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
      displayUrl: undefined,
      postUrl: undefined,
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
