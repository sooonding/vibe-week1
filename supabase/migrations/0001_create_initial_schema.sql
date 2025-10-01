-- ============================================
-- 블로그 체험단 SaaS 초기 스키마 마이그레이션
-- ============================================

BEGIN;

-- ============================================
-- 1. 공통 사용자 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('advertiser', 'influencer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

COMMENT ON TABLE users IS '공통 사용자 프로필 (광고주/인플루언서)';
COMMENT ON COLUMN users.role IS '사용자 역할: advertiser(광고주) | influencer(인플루언서)';

-- RLS 비활성화
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. 약관 동의 이력
-- ============================================
CREATE TABLE IF NOT EXISTS terms_agreements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  terms_type VARCHAR(50) NOT NULL,
  agreed BOOLEAN NOT NULL DEFAULT true,
  agreed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terms_user_id ON terms_agreements(user_id);

COMMENT ON TABLE terms_agreements IS '약관 동의 이력';
COMMENT ON COLUMN terms_agreements.terms_type IS '약관 유형: service, privacy, marketing 등';

-- RLS 비활성화
ALTER TABLE terms_agreements DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. 인플루언서 프로필
-- ============================================
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_user_id ON influencer_profiles(user_id);

COMMENT ON TABLE influencer_profiles IS '인플루언서 프로필';

-- RLS 비활성화
ALTER TABLE influencer_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. 인플루언서 SNS 채널
-- ============================================
CREATE TABLE IF NOT EXISTS influencer_channels (
  id BIGSERIAL PRIMARY KEY,
  influencer_id BIGINT NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('naver', 'youtube', 'instagram', 'threads')),
  channel_name VARCHAR(255) NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_channels_influencer_id ON influencer_channels(influencer_id);
CREATE INDEX IF NOT EXISTS idx_channels_verification ON influencer_channels(verification_status);

COMMENT ON TABLE influencer_channels IS '인플루언서 SNS 채널';
COMMENT ON COLUMN influencer_channels.platform IS 'SNS 플랫폼: naver | youtube | instagram | threads';
COMMENT ON COLUMN influencer_channels.verification_status IS '검증 상태: pending | verified | failed';

-- RLS 비활성화
ALTER TABLE influencer_channels DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. 광고주 프로필
-- ============================================
CREATE TABLE IF NOT EXISTS advertiser_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(200) NOT NULL,
  location VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  business_registration_number VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advertiser_user_id ON advertiser_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_advertiser_business_number ON advertiser_profiles(business_registration_number);

COMMENT ON TABLE advertiser_profiles IS '광고주 프로필';

-- RLS 비활성화
ALTER TABLE advertiser_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. 체험단 캠페인
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  advertiser_id BIGINT NOT NULL REFERENCES advertiser_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  recruitment_start_date DATE NOT NULL,
  recruitment_end_date DATE NOT NULL,
  max_participants INT NOT NULL CHECK (max_participants > 0),
  benefits TEXT NOT NULL,
  store_info TEXT NOT NULL,
  mission TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'selected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_recruitment_dates ON campaigns(recruitment_start_date, recruitment_end_date);

COMMENT ON TABLE campaigns IS '체험단 캠페인';
COMMENT ON COLUMN campaigns.status IS '캠페인 상태: recruiting(모집중) | closed(모집종료) | selected(선정완료)';

-- RLS 비활성화
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. 체험단 지원
-- ============================================
CREATE TABLE IF NOT EXISTS applications (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id BIGINT NOT NULL REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  visit_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_influencer UNIQUE(campaign_id, influencer_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_influencer_id ON applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

COMMENT ON TABLE applications IS '체험단 지원';
COMMENT ON COLUMN applications.motivation IS '각오 한마디';
COMMENT ON COLUMN applications.status IS '지원 상태: pending(신청완료) | selected(선정) | rejected(반려)';

-- RLS 비활성화
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. updated_at 자동 갱신 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. 트리거 적용
-- ============================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencer_profiles_updated_at ON influencer_profiles;
CREATE TRIGGER update_influencer_profiles_updated_at
  BEFORE UPDATE ON influencer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencer_channels_updated_at ON influencer_channels;
CREATE TRIGGER update_influencer_channels_updated_at
  BEFORE UPDATE ON influencer_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advertiser_profiles_updated_at ON advertiser_profiles;
CREATE TRIGGER update_advertiser_profiles_updated_at
  BEFORE UPDATE ON advertiser_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================
-- 마이그레이션 완료
-- ============================================
