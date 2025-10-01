'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCampaignById } from '@/features/campaign/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string, 10);
  const { user, isAuthenticated } = useAuth();

  const { data: campaign, isLoading, error } = useCampaignById(campaignId);

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectedFrom=${encodeURIComponent(`/campaigns/${campaignId}`)}`);
      return;
    }
    router.push(`/campaigns/${campaignId}/apply`);
  };

  if (isNaN(campaignId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="유효하지 않은 체험단 ID입니다." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message={error instanceof Error ? error.message : '체험단 정보를 불러오는데 실패했습니다.'} />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="체험단을 찾을 수 없습니다." />
      </div>
    );
  }

  const isRecruiting = campaign.status === 'recruiting';
  const canApply = isRecruiting && isAuthenticated && user;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{campaign.title}</CardTitle>
          <CardDescription>
            {campaign.status === 'recruiting' && '모집 중'}
            {campaign.status === 'closed' && '모집 마감'}
            {campaign.status === 'selected' && '선정 완료'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">모집 기간</h3>
            <p className="text-muted-foreground">
              {format(new Date(campaign.recruitmentStartDate), 'PPP', { locale: ko })} ~{' '}
              {format(new Date(campaign.recruitmentEndDate), 'PPP', { locale: ko })}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">모집 인원</h3>
            <p className="text-muted-foreground">{campaign.maxParticipants}명</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">제공 혜택</h3>
            <p className="whitespace-pre-wrap">{campaign.benefits}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">매장 정보</h3>
            <p className="whitespace-pre-wrap">{campaign.storeInfo}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">미션</h3>
            <p className="whitespace-pre-wrap">{campaign.mission}</p>
          </div>

          <div className="pt-4">
            {canApply ? (
              <Button onClick={handleApply} size="lg" className="w-full">
                지원하기
              </Button>
            ) : !isRecruiting ? (
              <Button disabled size="lg" className="w-full">
                모집 마감
              </Button>
            ) : (
              <Button onClick={handleApply} size="lg" className="w-full">
                로그인하고 지원하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
