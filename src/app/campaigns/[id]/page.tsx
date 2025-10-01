'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCampaignById } from '@/features/campaign/hooks/useCampaigns';
import { useApplicationStatus } from '@/features/application/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string, 10);
  const { user, isAuthenticated } = useAuth();

  const { data: campaign, isLoading, error } = useCampaignById(campaignId);
  const { data: applicationStatus, isLoading: statusLoading } = useApplicationStatus(campaignId);

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
  const hasApplied = applicationStatus?.hasApplied || false;
  const appStatus = applicationStatus?.applicationStatus;
  const isAdvertiser = user?.role === 'advertiser';

  const getButtonContent = () => {
    // 광고주는 지원 버튼을 볼 수 없음
    if (isAdvertiser) {
      return null;
    }

    if (!isRecruiting) {
      return { disabled: true, text: '모집 마감', variant: 'secondary' as const };
    }

    if (!isAuthenticated) {
      return { disabled: false, text: '로그인하고 지원하기', variant: 'default' as const };
    }

    if (statusLoading) {
      return { disabled: true, text: '확인 중...', variant: 'secondary' as const };
    }

    if (hasApplied) {
      if (appStatus === 'pending') {
        return { disabled: true, text: '지원 완료 (검토중)', variant: 'secondary' as const };
      }
      if (appStatus === 'selected') {
        return { disabled: true, text: '선정됨', variant: 'default' as const };
      }
      if (appStatus === 'rejected') {
        return { disabled: false, text: '재지원하기', variant: 'outline' as const };
      }
    }

    return { disabled: false, text: '지원하기', variant: 'default' as const };
  };

  const buttonContent = getButtonContent();

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pt-20 relative">
      {/* 배경 장식 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-40 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="mx-auto max-w-[900px] px-6 md:px-12 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-transparent">
          {/* Header */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-primary/5 to-accent/5 border-b-2 border-gray-100 dark:border-gray-700">
            <div className="flex flex-wrap gap-3 mb-4">
              {campaign.status === 'recruiting' && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 font-bold px-4 py-2 rounded-full shadow-md text-base">
                  🔥 모집 중
                </Badge>
              )}
              {campaign.status === 'selected' && (
                <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white border-0 font-bold px-4 py-2 rounded-full shadow-md text-base">
                  ✓ 선정 완료
                </Badge>
              )}
              {campaign.status === 'closed' && (
                <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-0 font-bold px-4 py-2 rounded-full text-base">
                  모집 마감
                </Badge>
              )}
              {hasApplied && (
                <>
                  {appStatus === 'pending' && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 font-bold px-4 py-2 rounded-full shadow-md text-base">
                      ⏳ 검토중
                    </Badge>
                  )}
                  {appStatus === 'selected' && (
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-bold px-4 py-2 rounded-full shadow-md text-base">
                      🎉 선정됨
                    </Badge>
                  )}
                  {appStatus === 'rejected' && (
                    <Badge className="bg-gray-400 dark:bg-gray-600 text-white border-0 font-bold px-4 py-2 rounded-full text-base">
                      미선정
                    </Badge>
                  )}
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">{campaign.title}</h1>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">모집 기간</h3>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {format(new Date(campaign.recruitmentStartDate), 'PPP', { locale: ko })}
                  <br />
                  ~ {format(new Date(campaign.recruitmentEndDate), 'PPP', { locale: ko })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border-2 border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xl">👥</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">모집 인원</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">{campaign.maxParticipants}명</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-6 border-2 border-secondary/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎁</span>
                <h3 className="text-lg font-bold text-foreground">제공 혜택</h3>
              </div>
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{campaign.benefits}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏪</span>
                <h3 className="text-lg font-bold text-foreground">매장 정보</h3>
              </div>
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{campaign.storeInfo}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-bold text-foreground">미션</h3>
              </div>
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{campaign.mission}</p>
            </div>

            {buttonContent && (
              <>
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent"></div>
                <Button
                  onClick={handleApply}
                  size="lg"
                  className="w-full h-16 text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                  disabled={buttonContent.disabled}
                  variant={buttonContent.variant}
                >
                  {buttonContent.text}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
