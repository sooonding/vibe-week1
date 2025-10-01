# 블로그 체험단 플랫폼 SaaS

광고주와 인플루언서를 연결하는 체험단 매칭 플랫폼입니다.

## 프로젝트 개요

본 서비스는 광고주가 자사 제품·서비스를 홍보하기 위해 체험단을 등록 및 관리할 수 있으며, 인플루언서는 다양한 체험단에 지원하고 활동 결과를 확인할 수 있는 SaaS 플랫폼입니다.

### 주요 기능

#### 광고주 (Advertiser)

- ✅ 회원가입 및 사업자 정보 등록
- ✅ 체험단 생성 및 관리
- ✅ 지원자 목록 조회 및 선정
- ✅ 모집 상태 관리 (모집중 → 모집종료 → 선정완료)

#### 인플루언서 (Influencer)

- ✅ 회원가입 및 SNS 채널 등록 (Naver, YouTube, Instagram)
- ✅ 팔로워 수 등록
- ✅ 모집 중인 체험단 탐색
- ✅ 체험단 지원 및 상태 확인

## 기술 스택

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **State Management**:
  - React Query (@tanstack/react-query) - 서버 상태
  - Zustand - 클라이언트 전역 상태
- **Form**: React Hook Form + Zod
- **Icons**: Lucide React
- **Utilities**: date-fns, es-toolkit, react-use, ts-pattern
- **Theme**: next-themes (다크모드 지원)

### Backend

- **API Framework**: Hono.js (Next.js Route Handler 위임)
- **Database & Auth**: Supabase (PostgreSQL)
- **Validation**: Zod
- **Runtime**: Node.js

### Architecture

- **Pattern**: Feature-based 모듈 구조
- **API Layer**: Hono + Next.js App Router
- **Type Safety**: End-to-end TypeScript with Zod

## 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── api/[[...hono]]/         # Hono 진입점 (Route Handler)
│   ├── campaigns/               # 체험단 페이지
│   ├── dashboard/               # 광고주 대시보드
│   ├── login/                   # 로그인
│   ├── signup/                  # 회원가입
│   ├── onboarding/              # 역할별 온보딩
│   └── page.tsx                 # 홈 (체험단 목록)
├── backend/
│   ├── hono/                    # Hono 앱 설정
│   ├── http/                    # HTTP 응답 유틸
│   ├── middleware/              # 공통 미들웨어
│   ├── supabase/                # Supabase 클라이언트
│   └── config/                  # 환경 변수 설정
├── features/                     # 기능별 모듈
│   ├── campaign/                # 체험단 관리
│   │   ├── backend/             # 서비스, 라우터, 스키마
│   │   ├── components/          # UI 컴포넌트
│   │   ├── hooks/               # React Query 훅
│   │   └── lib/                 # DTO 재노출
│   ├── application/             # 지원 관리
│   ├── advertiser/              # 광고주 프로필
│   └── influencer/              # 인플루언서 프로필
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── shared/                  # 공통 컴포넌트
│   └── layout/                  # 레이아웃 컴포넌트
├── hooks/                        # 공통 훅
├── lib/                          # 유틸리티 함수
└── constants/                    # 상수
```

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Supabase 마이그레이션 실행

Supabase SQL Editor에서 다음 마이그레이션 파일들을 순서대로 실행하세요:

1. `supabase/migrations/0001_create_initial_schema.sql`
2. `supabase/migrations/0002_add_follower_count.sql`

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

## 주요 페이지

| 경로                       | 설명                          | 접근 권한     |
| -------------------------- | ----------------------------- | ------------- |
| `/`                        | 홈 (모집 중/완료 체험단 목록) | 전체          |
| `/signup`                  | 회원가입                      | 비로그인      |
| `/login`                   | 로그인                        | 비로그인      |
| `/onboarding`              | 역할별 정보 입력              | 로그인 (최초) |
| `/campaigns/:id`           | 체험단 상세                   | 전체          |
| `/campaigns/:id/apply`     | 체험단 지원                   | 인플루언서    |
| `/my-applications`         | 내 지원 목록                  | 인플루언서    |
| `/dashboard/campaigns`     | 체험단 관리                   | 광고주        |
| `/dashboard/campaigns/:id` | 지원자 관리                   | 광고주        |

## 데이터베이스 스키마

### 주요 테이블

- **users**: 공통 사용자 정보 (name, email, role)
- **advertiser_profiles**: 광고주 프로필 (업체명, 사업자등록번호 등)
- **influencer_profiles**: 인플루언서 프로필 (생년월일)
- **influencer_channels**: 인플루언서 SNS 채널 (platform, URL, follower_count)
- **campaigns**: 체험단 캠페인 (제목, 모집기간, 혜택, 미션 등)
- **applications**: 체험단 지원 (각오, 방문예정일, 상태)
- **terms_agreements**: 약관 동의 이력

### 주요 관계

```
users (1) ─┬─ (1) advertiser_profiles ─ (1:N) campaigns ─ (N:M) applications
           │
           └─ (1) influencer_profiles ─┬─ (1:N) influencer_channels
                                        └─ (1:N) applications
```

## API 엔드포인트

모든 API는 `/api` 경로를 통해 Hono.js로 위임됩니다.

### 체험단 (Campaign)

- `GET /api/campaigns?status=recruiting` - 체험단 목록 조회
- `GET /api/campaigns/:id` - 체험단 상세 조회
- `POST /api/campaigns` - 체험단 생성 (광고주)
- `GET /api/my-campaigns` - 내 체험단 목록 (광고주)
- `PATCH /api/campaigns/:id/close` - 모집 종료 (광고주)
- `POST /api/campaigns/:id/select` - 체험단 선정 (광고주)

### 지원 (Application)

- `POST /api/applications` - 체험단 지원
- `GET /api/my-applications?status=pending` - 내 지원 목록
- `GET /api/campaigns/:id/applications` - 지원자 목록 (광고주)
- `GET /api/campaigns/:id/application-status` - 지원 상태 확인

### 사용자 (User)

- `POST /api/onboarding/advertiser` - 광고주 정보 등록
- `POST /api/onboarding/influencer` - 인플루언서 정보 등록

## 사용 가능한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 주요 라이브러리

- **Next.js 15**: React 프레임워크
- **Hono.js**: 빠르고 가벼운 웹 프레임워크
- **Supabase**: PostgreSQL 기반 BaaS (인증, 데이터베이스)
- **React Query**: 서버 상태 관리
- **Zod**: 런타임 타입 검증
- **React Hook Form**: 폼 상태 관리
- **shadcn/ui**: 접근성 기반 UI 컴포넌트
- **Tailwind CSS**: 유틸리티 CSS 프레임워크
- **date-fns**: 날짜 처리
- **ts-pattern**: 패턴 매칭

## 개발 가이드

### 새로운 기능 추가하기

1. `src/features/[featureName]` 디렉토리 생성
2. 백엔드 레이어 구현:
   - `backend/schema.ts`: Zod 스키마 정의
   - `backend/service.ts`: 비즈니스 로직
   - `backend/route.ts`: Hono 라우터
   - `backend/error.ts`: 에러 코드
3. 프론트엔드 레이어 구현:
   - `lib/dto.ts`: 백엔드 스키마 재노출
   - `hooks/use[Feature].ts`: React Query 훅
   - `components/`: UI 컴포넌트
4. Hono 앱에 라우터 등록 (`src/backend/hono/app.ts`)

### 마이그레이션 추가하기

1. `supabase/migrations/` 에 `XXXX_description.sql` 파일 생성
2. SQL 작성 (idempotent하게, `IF NOT EXISTS` 사용)
3. Supabase SQL Editor에서 실행

## 라이선스

This project is private and confidential.
