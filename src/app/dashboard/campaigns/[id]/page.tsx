'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCampaignById, useCloseCampaign } from '@/features/campaign/hooks/useCampaigns';
import { useCampaignApplications, useSelectApplications } from '@/features/application/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function CampaignDetailManagementPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string, 10);
  const { requireAuth } = useAuth();

  const [selectedApplicationIds, setSelectedApplicationIds] = useState<number[]>([]);
  const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);

  const { data: campaign, isLoading: campaignLoading } = useCampaignById(campaignId);
  const { data: applications, isLoading: applicationsLoading } = useCampaignApplications(campaignId);
  const { mutate: closeCampaign, isPending: isClosing } = useCloseCampaign();
  const { mutate: selectApplications, isPending: isSelecting, isSuccess: isSelectSuccess } = useSelectApplications();

  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
  }, [requireAuth]);

  useEffect(() => {
    if (isSelectSuccess) {
      setIsSelectDialogOpen(false);
      setSelectedApplicationIds([]);
    }
  }, [isSelectSuccess]);

  const handleCloseCampaign = () => {
    closeCampaign(campaignId);
  };

  const handleSelectApplications = () => {
    if (selectedApplicationIds.length === 0) {
      alert('선정할 지원자를 선택해주세요.');
      return;
    }
    selectApplications({
      campaignId,
      selectedApplicationIds,
    });
  };

  const toggleApplicationSelection = (applicationId: number) => {
    setSelectedApplicationIds((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기 중</Badge>;
      case 'selected':
        return <Badge variant="default">선정됨</Badge>;
      case 'rejected':
        return <Badge variant="destructive">반려됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isNaN(campaignId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="유효하지 않은 체험단 ID입니다." />
      </div>
    );
  }

  if (campaignLoading || applicationsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner />
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
  const isClosed = campaign.status === 'closed';
  const isSelected = campaign.status === 'selected';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{campaign.title}</CardTitle>
              <CardDescription>
                {format(new Date(campaign.recruitmentStartDate), 'PPP', { locale: ko })} ~{' '}
                {format(new Date(campaign.recruitmentEndDate), 'PPP', { locale: ko })}
              </CardDescription>
            </div>
            <div>
              {isRecruiting && (
                <Badge variant="default" className="text-base px-4 py-1">
                  모집 중
                </Badge>
              )}
              {isClosed && (
                <Badge variant="secondary" className="text-base px-4 py-1">
                  모집 마감
                </Badge>
              )}
              {isSelected && (
                <Badge variant="outline" className="text-base px-4 py-1">
                  선정 완료
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">모집 인원</p>
              <p>{campaign.maxParticipants}명</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">현재 지원자</p>
              <p>{applications?.applications?.length || 0}명</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">제공 혜택</p>
            <p className="whitespace-pre-wrap">{campaign.benefits}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">매장 정보</p>
            <p className="whitespace-pre-wrap">{campaign.storeInfo}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">미션</p>
            <p className="whitespace-pre-wrap">{campaign.mission}</p>
          </div>

          <div className="pt-4 flex gap-4">
            {isRecruiting && (
              <Button onClick={handleCloseCampaign} disabled={isClosing} variant="outline">
                {isClosing ? '처리 중...' : '모집 종료'}
              </Button>
            )}
            {isClosed && (
              <Button onClick={() => setIsSelectDialogOpen(true)}>체험단 선정</Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/dashboard/campaigns')}>
              목록으로
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>지원자 목록</CardTitle>
          <CardDescription>
            {applications?.applications?.length || 0}명의 인플루언서가 지원했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!applications?.applications || applications.applications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              아직 지원자가 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지원자</TableHead>
                  <TableHead>각오 한마디</TableHead>
                  <TableHead>방문 예정일</TableHead>
                  <TableHead>지원일</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.influencerName}</TableCell>
                    <TableCell className="max-w-md truncate">{application.motivation}</TableCell>
                    <TableCell>
                      {format(new Date(application.visitDate), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.createdAt), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>체험단 선정</DialogTitle>
            <DialogDescription>
              선정할 인플루언서를 선택하세요. 선택되지 않은 지원자는 자동으로 반려됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {applications?.applications
              ?.filter((app) => app.status === 'pending')
              .map((application) => (
                <div key={application.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Checkbox
                    checked={selectedApplicationIds.includes(application.id)}
                    onCheckedChange={() => toggleApplicationSelection(application.id)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{application.influencerName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{application.motivation}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      방문 예정: {format(new Date(application.visitDate), 'PPP', { locale: ko })}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSelectDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSelectApplications} disabled={isSelecting}>
              {isSelecting ? '선정 중...' : `${selectedApplicationIds.length}명 선정하기`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
