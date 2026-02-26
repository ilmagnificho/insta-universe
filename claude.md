# Insta Universe

## 프로젝트 개요
인스타그램 username을 입력하면 게시물들을 AI로 분석해서
아름다운 우주/별자리 비주얼로 시각화해주는 웹서비스.
캐치프레이즈: "내 인스타그램으로 우주를 만든다"

## 핵심 가치
결과물이 너무 예뻐서 공유/자랑하고 싶어지는 비주얼.
ingan.ai의 심리분석 로직 + Obsidian Graph View 스타일의 비주얼을 결합.
결제 전 데모 미리보기 → 결제 후 실제 데이터 기반 우주 생성 구조.

## 타겟 유저
인스타그램 활성 유저. 특히 자기 계정 히스토리에 관심 있는 사람.
한국 유저 우선.

## 기술 스택
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- 우주 비주얼: D3.js
- Backend/DB: Supabase (결제 후 결과 저장용)
- 데이터 수집: Apify Instagram Post Scraper (PPR 모델)
- AI 분석: Anthropic Claude API (Haiku 4.5 기본, Sonnet 4.5도 비용 차이 미미)
- 결제: 토스페이먼츠
- 배포: Vercel
- GitHub: https://github.com/ilmagnificho/insta-universe

## 프로젝트 디렉토리 구조
```
insta-universe/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 랜딩페이지 (username 입력)
│   ├── preview/
│   │   └── page.tsx            # 데모 미리보기 + 결제 유도
│   ├── result/
│   │   └── [id]/
│   │       └── page.tsx        # 결제 완료 후 전체 우주 보기 + 공유
│   ├── payment/
│   │   ├── success/page.tsx    # 결제 성공 콜백
│   │   └── fail/page.tsx       # 결제 실패 콜백
│   └── api/
│       ├── scrape/route.ts     # Apify 호출 (결제 확인 후)
│       ├── analyze/route.ts    # Claude AI 분석
│       ├── payment/
│       │   ├── request/route.ts  # 결제 요청
│       │   └── confirm/route.ts  # 결제 확인(승인)
│       └── share/route.ts      # OG 이미지 생성
├── components/
│   ├── UniverseCanvas.tsx      # D3.js 우주 비주얼 메인 컴포넌트
│   ├── DemoUniverse.tsx        # 가짜 데모 미리보기용
│   ├── LoadingAnimation.tsx    # 별이 모이는 로딩
│   ├── StarTooltip.tsx         # hover 시 게시물 정보
│   └── ShareButtons.tsx        # 공유 버튼
├── lib/
│   ├── apify.ts                # Apify API 클라이언트
│   ├── claude.ts               # Claude API 클라이언트
│   ├── supabase.ts             # Supabase 클라이언트
│   ├── toss.ts                 # 토스페이먼츠 클라이언트
│   └── universe.ts             # 우주 데이터 변환 로직
├── public/
│   └── demo-data.json          # 데모 미리보기용 샘플 데이터
├── .env.local
└── package.json
```

## 유저 플로우
1. 랜딩페이지 → username 입력
2. "우주 생성 중..." 로딩 애니메이션 (별들이 모이는 느낌)
3. 데모 미리보기: 샘플 데이터로 만든 예시 우주 보여줌
   - "이건 예시예요. 결제하면 내 실제 인스타 데이터로 우주를 만들어 드려요"
4. "내 우주 만들기" 버튼 → 결제 (4,900원)
5. 결제 확인 → Apify로 실제 데이터 수집 → AI 분석 → 우주 생성
6. 결과 페이지: 전체 우주 비주얼 + 공유 버튼

## 미리보기 전략 (A/B 테스트)
- 기본값(그룹 A): 가짜 데모 미리보기 → Apify 비용 0원
- 테스트(그룹 B): 실제 12개 게시물 수집 후 블러 처리 → Apify 비용 약 45원/건
- 핵심 측정 지표: 결제 전환율
- 최소 각 그룹 200-300명 수집 후 판단
- 그룹 B 전환율이 그룹 A 대비 2배 이상이 아니면 그룹 A 유지

## Apify 스크래핑 스펙
- 사용 Actor: apify/instagram-post-scraper (PPR 모델, $2.70/1,000 results)
- 수집 대상: 공개 계정의 최근 50개 게시물
- 수집 데이터: 캡션, 해시태그, 좋아요 수, 게시 날짜, 미디어 타입
- 이미지 URL은 수집하되 저장하지 않음 (썸네일 참조용)
- 비공개 계정: "공개 계정만 지원합니다" 안내 후 중단
- 게시물 5개 미만: "분석에 충분한 게시물이 없습니다" 안내

## AI 분석 로직 (Claude API)
- 모델: claude-haiku-4-5 (기본) / claude-sonnet-4-5 (품질 우선 시)
- 분석 내용:
  1. 해시태그 카테고리 분류 (여행, 음식, 일상, 패션, 운동 등 최대 8개)
  2. 게시물별 주요 키워드 추출 (1-3개)
  3. 게시물 간 유사도/관계 판단 (같은 카테고리, 연속된 이벤트 등)
  4. 전체 계정 요약 (한 줄 설명)
- Input: 전체 게시물의 캡션 + 해시태그 JSON
- Output: 카테고리 분류 + 키워드 + 관계 맵 JSON
- 예상 토큰: Input 약 2,000 / Output 약 500 (게시물 50개 기준)
- 비용: Haiku 약 6원/건, Sonnet 약 19원/건

## 우주 비주얼 스펙
- 배경: 딥 블랙/딥 퍼플, 미세한 배경별 반짝임
- 게시물 1개 = 별 1개
- 별 크기: 좋아요 수에 비례
- 별 색상: 해시태그 카테고리별로 다른 색
- 클러스터: 비슷한 해시태그 게시물끼리 성단처럼 모임
- 인터랙션: hover 시 날짜+키워드 툴팁, 클릭 시 캡션 미리보기
- 별들 사이 연결선: 같은 해시태그면 희미한 선으로 연결

## Supabase 테이블 구조
```sql
-- 결제 완료된 분석 결과 저장
CREATE TABLE universe_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  payment_order_id TEXT UNIQUE NOT NULL,
  raw_posts JSONB,          -- Apify 수집 원본
  analysis JSONB,           -- Claude 분석 결과
  universe_data JSONB,      -- 프론트 렌더링용 가공 데이터
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ    -- 개인정보 보호: 30일 후 자동 삭제
);

-- 결제 기록
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 4900,
  status TEXT NOT NULL DEFAULT 'pending', -- pending / confirmed / failed
  payment_key TEXT,
  ab_group TEXT,             -- A/B 테스트 그룹 (demo / real)
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);
```
- Supabase Row Level Security 활성화
- expires_at 기반으로 30일 후 데이터 자동 삭제 (Supabase Edge Function 또는 cron)

## 결제 플로우 (토스페이먼츠)
1. 클라이언트에서 토스페이먼츠 SDK 호출 → 결제창 오픈
2. 결제 완료 시 successUrl로 리다이렉트 (paymentKey, orderId, amount 포함)
3. /api/payment/confirm에서 토스 서버에 결제 승인 요청 (Secret Key 사용)
4. 승인 성공 → payments 테이블 업데이트 → Apify 수집 시작 → AI 분석 → 결과 저장
5. 결과 페이지로 리다이렉트
- 실패 시: failUrl로 리다이렉트, 사용자에게 안내 + 재시도 버튼

## 공유 기능
- 방식: 고유 URL 공유 (/result/[id])
- OG 이미지: 우주 비주얼을 서버사이드에서 캡처하여 정적 이미지로 생성
  - 카카오톡, 인스타 스토리 등에서 예쁜 미리보기 카드 표시
- 공유 버튼: 카카오톡, 인스타 스토리, 링크 복사
- 공유 페이지에서 "나도 만들어보기" CTA 버튼 → 랜딩페이지로 유도 (바이럴 루프)

## 에러 처리
- 비공개 계정: "공개 계정만 지원합니다" 안내
- 존재하지 않는 계정: "계정을 찾을 수 없습니다" 안내
- 게시물 5개 미만: "분석에 충분한 게시물이 없습니다" 안내
- Apify 실패/타임아웃: "일시적 오류, 잠시 후 다시 시도해주세요" + 자동 재시도 1회
- 결제 실패: 실패 페이지에서 이유 안내 + 재시도 버튼
- AI 분석 실패: 폴백으로 해시태그 기반 단순 분류 사용

## 비용 구조 (건당, 2025년 2월 기준)
- Apify (50개 게시물): 약 189원
- Claude Haiku 4.5: 약 6원
- 토스페이먼츠 PG 수수료 (4.3% + VAT): 약 232원
- 건당 API 원가 합계: 약 427원
- 건당 순이익: 약 4,473원 (마진율 약 91%)
- ⚠ 비결제 유저의 미리보기 비용 주의 (전략 B 사용 시 건당 45원 손실)

## SEO / OG 메타태그
- 각 결과 페이지에 동적 OG 태그 생성
  - og:title: "[username]의 인스타 우주"
  - og:description: "내 인스타그램으로 만든 나만의 우주를 확인해보세요"
  - og:image: 서버에서 생성한 우주 비주얼 이미지
- 랜딩페이지: 정적 OG 태그 + 구조화 데이터(JSON-LD)
- 카카오톡 공유 시 예쁘게 보이도록 이미지 비율 1.91:1 권장

## 법적 요건
- 개인정보처리방침 페이지 필수 포함
  - 수집 항목: 인스타그램 공개 게시물(캡션, 해시태그, 좋아요 수, 게시 날짜)
  - 수집 목적: AI 분석 및 우주 비주얼 생성
  - 보관 기간: 결제 후 30일, 이후 자동 삭제
  - 제3자 제공: Apify(데이터 수집), Anthropic(AI 분석)에 전달
- 이용약관 페이지 필수 포함
- 공개 계정 게시물만 수집 (비공개 계정 접근 불가)

## 개발 원칙
- 모바일 퍼스트 (한국 유저는 모바일 비율 높음)
- 컴포넌트는 최대한 단순하게 유지
- API 비용 최소화 (Apify 호출은 결제 확인 후에만)
- 환경변수는 반드시 .env.local 사용, 절대 하드코딩 금지
- 모든 API Route에서 결제 상태 확인 후 처리 (무단 호출 방지)

## 환경변수 목록
```
APIFY_API_TOKEN=
ANTHROPIC_API_KEY=
TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_TOSS_CLIENT_KEY=
NEXT_PUBLIC_BASE_URL=          # 공유 URL 생성용
```
