-- ============================================
-- 인플루언서 채널에 팔로워수 추가
-- ============================================

BEGIN;

-- influencer_channels 테이블에 follower_count 컬럼 추가
ALTER TABLE influencer_channels
ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN influencer_channels.follower_count IS '채널 팔로워 수';

COMMIT;
