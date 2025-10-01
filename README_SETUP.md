# 블로그 체험단 SaaS - 설치 가이드

## 1. Supabase 데이터베이스 마이그레이션

Supabase 대시보드 > SQL Editor로 이동하여 다음 마이그레이션 파일을 실행하세요:

```bash
supabase/migrations/0001_create_initial_schema.sql
```

또는 Supabase CLI를 사용하는 경우:

```bash
supabase db push
```

## 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 값을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. 설치 및 실행

```bash
npm install
npm run dev
```

## 4. 주요 페이지

- `/` - 홈 (모집 중인 체험단 목록)
- `/signup` - 회원가입
- `/login` - 로그인
- `/onboarding` - 역할별 온보딩 (인플루언서/광고주 정보 등록)
- `/campaigns/:id` - 체험단 상세
- `/my-applications` - 내 지원 목록 (인플루언서)
- `/dashboard` - 체험단 관리 (광고주)

## 5. 데이터베이스 스키마

자세한 스키마 정보는 `.ruler/database.md`를 참조하세요.

## 6. API 엔드포인트

모든 API는 `/api/*` 경로로 Hono를 통해 제공됩니다.

- `POST /api/users/signup` - 회원가입
- `POST /api/influencers/profile` - 인플루언서 프로필 등록
- `POST /api/advertisers/profile` - 광고주 프로필 등록
- `GET /api/campaigns` - 체험단 목록
- `POST /api/campaigns` - 체험단 등록 (광고주)
- `POST /api/applications` - 체험단 지원 (인플루언서)
- `POST /api/campaigns/:id/select` - 체험단 선정 (광고주)
