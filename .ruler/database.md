# 블로그 체험단 SaaS — 데이터베이스 설계 최종본

## 1. 데이터플로우 개요

### 1.1 회원가입 & 인증 플로우
```
Supabase Auth (auth.users)
    ↓
users 테이블 (공통 프로필)
    ↓
terms_agreements (약관 동의 이력)
    ↓
역할 분기
    ├─ influencer → influencer_profiles + influencer_channels
    └─ advertiser → advertiser_profiles
```

### 1.2 체험단 운영 플로우
```
advertiser_profiles
    ↓
campaigns (체험단 등록)
    ↓
applications (인플루언서 지원)
    ↓
광고주 선정 프로세스
    ↓
applications.status 업데이트 (pending → selected/rejected)
```

### 1.3 주요 데이터 관계
- **1:1 관계**: `users` ↔ `influencer_profiles`, `users` ↔ `advertiser_profiles`
- **1:N 관계**:
  - `influencer_profiles` → `influencer_channels` (한 인플루언서가 여러 SNS 채널 보유)
  - `advertiser_profiles` → `campaigns` (한 광고주가 여러 체험단 운영)
  - `campaigns` → `applications` (한 체험단에 여러 지원)
  - `influencer_profiles` → `applications` (한 인플루언서가 여러 체험단 지원)

---

## 2. 테이블 구조

### 2.1 users (공통 사용자)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK, FK → auth.users | Supabase Auth 사용자 ID |
| name | VARCHAR(100) | NOT NULL | 사용자 이름 |
| phone | VARCHAR(20) | NOT NULL | 휴대폰번호 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 |
| role | VARCHAR(20) | NOT NULL, CHECK | advertiser \| influencer |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**: role, email

---

### 2.2 terms_agreements (약관 동의 이력)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 약관 동의 ID |
| user_id | UUID | NOT NULL, FK → users | 사용자 ID |
| terms_type | VARCHAR(50) | NOT NULL | 약관 유형 (service, privacy, marketing 등) |
| agreed | BOOLEAN | NOT NULL, DEFAULT true | 동의 여부 |
| agreed_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 동의 일시 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |

**인덱스**: user_id

---

### 2.3 influencer_profiles (인플루언서 프로필)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 인플루언서 프로필 ID |
| user_id | UUID | NOT NULL, UNIQUE, FK → users | 사용자 ID |
| birth_date | DATE | NOT NULL | 생년월일 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**: user_id

---

### 2.4 influencer_channels (인플루언서 SNS 채널)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 채널 ID |
| influencer_id | BIGINT | NOT NULL, FK → influencer_profiles | 인플루언서 프로필 ID |
| platform | VARCHAR(50) | NOT NULL, CHECK | naver \| youtube \| instagram \| threads |
| channel_name | VARCHAR(255) | NOT NULL | 채널명 |
| channel_url | VARCHAR(500) | NOT NULL | 채널 URL |
| verification_status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | pending \| verified \| failed |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**: influencer_id, verification_status

---

### 2.5 advertiser_profiles (광고주 프로필)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 광고주 프로필 ID |
| user_id | UUID | NOT NULL, UNIQUE, FK → users | 사용자 ID |
| business_name | VARCHAR(200) | NOT NULL | 업체명 |
| location | VARCHAR(500) | NOT NULL | 위치 |
| category | VARCHAR(100) | NOT NULL | 카테고리 |
| business_registration_number | VARCHAR(50) | NOT NULL, UNIQUE | 사업자등록번호 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**: user_id, business_registration_number

---

### 2.6 campaigns (체험단 캠페인)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 캠페인 ID |
| advertiser_id | BIGINT | NOT NULL, FK → advertiser_profiles | 광고주 프로필 ID |
| title | VARCHAR(255) | NOT NULL | 체험단명 |
| recruitment_start_date | DATE | NOT NULL | 모집 시작일 |
| recruitment_end_date | DATE | NOT NULL | 모집 종료일 |
| max_participants | INT | NOT NULL, CHECK > 0 | 모집 인원 |
| benefits | TEXT | NOT NULL | 제공 혜택 |
| store_info | TEXT | NOT NULL | 매장 정보 |
| mission | TEXT | NOT NULL | 미션 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'recruiting', CHECK | recruiting \| closed \| selected |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**인덱스**: advertiser_id, status, (recruitment_start_date, recruitment_end_date)

---

### 2.7 applications (체험단 지원)
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | 지원 ID |
| campaign_id | BIGINT | NOT NULL, FK → campaigns | 캠페인 ID |
| influencer_id | BIGINT | NOT NULL, FK → influencer_profiles | 인플루언서 프로필 ID |
| motivation | TEXT | NOT NULL | 각오 한마디 |
| visit_date | DATE | NOT NULL | 방문 예정일 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK | pending \| selected \| rejected |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 수정일시 |

**제약**: UNIQUE(campaign_id, influencer_id) — 중복 지원 방지
**인덱스**: campaign_id, influencer_id, status

---

## 3. 트리거

### 3.1 updated_at 자동 갱신
모든 테이블에 대해 `UPDATE` 발생 시 `updated_at` 컬럼을 자동으로 현재 시각으로 갱신

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**적용 테이블**: users, influencer_profiles, influencer_channels, advertiser_profiles, campaigns, applications

---

## 4. RLS (Row Level Security)

**정책**: 모든 테이블에서 RLS 비활성화 (서버 사이드 로직에서 권한 제어)

---

## 5. 주요 쿼리 패턴

### 5.1 홈 페이지 — 모집 중 체험단 목록
```sql
SELECT c.*, a.business_name
FROM campaigns c
JOIN advertiser_profiles a ON c.advertiser_id = a.id
WHERE c.status = 'recruiting'
  AND c.recruitment_end_date >= CURRENT_DATE
ORDER BY c.created_at DESC
LIMIT 20 OFFSET 0;
```

### 5.2 인플루언서 — 내 지원 목록
```sql
SELECT app.*, c.title, c.status AS campaign_status
FROM applications app
JOIN campaigns c ON app.campaign_id = c.id
JOIN influencer_profiles ip ON app.influencer_id = ip.id
WHERE ip.user_id = $1
  AND app.status = $2  -- 필터: pending/selected/rejected
ORDER BY app.created_at DESC;
```

### 5.3 광고주 — 내 체험단 목록
```sql
SELECT c.*
FROM campaigns c
JOIN advertiser_profiles ap ON c.advertiser_id = ap.id
WHERE ap.user_id = $1
ORDER BY c.created_at DESC;
```

### 5.4 광고주 — 체험단 지원자 목록
```sql
SELECT app.*, ip.birth_date, u.name, u.email, u.phone
FROM applications app
JOIN influencer_profiles ip ON app.influencer_id = ip.id
JOIN users u ON ip.user_id = u.id
WHERE app.campaign_id = $1
ORDER BY app.created_at ASC;
```

### 5.5 체험단 선정 프로세스
```sql
-- 1. 캠페인 상태를 'closed'로 변경
UPDATE campaigns SET status = 'closed' WHERE id = $1;

-- 2. 선정된 지원자들 상태 업데이트
UPDATE applications
SET status = 'selected'
WHERE id = ANY($2);  -- $2는 선정된 application id 배열

-- 3. 나머지 지원자들 반려 처리
UPDATE applications
SET status = 'rejected'
WHERE campaign_id = $1 AND status = 'pending';

-- 4. 캠페인 최종 상태를 'selected'로 변경
UPDATE campaigns SET status = 'selected' WHERE id = $1;
```

---

## 6. 확장 고려사항 (현재 스펙 외)

- **리뷰 시스템**: 선정된 인플루언서의 리뷰 제출 및 광고주 피드백
- **알림**: 지원 상태 변경, 모집 마감 임박 등 푸시/이메일 알림
- **메트릭**: 체험단별 조회수, 지원율, 선정율 등 통계
- **파일 첨부**: 체험단 이미지, 인플루언서 포트폴리오 등
- **정산**: 광고주 결제, 인플루언서 보상 처리

---

## 7. 마이그레이션 적용 방법

```bash
# Supabase CLI 로그인
supabase login

# 마이그레이션 적용
supabase db push

# 또는 Supabase 대시보드에서 SQL Editor를 통해 직접 실행
```
