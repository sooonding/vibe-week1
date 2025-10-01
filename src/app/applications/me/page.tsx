'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMyApplications } from '@/features/application/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect } from 'react';

export default function MyApplicationsPage() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: applications, isLoading, error } = useMyApplications(statusFilter);

  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
  }, [requireAuth]);

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
        <ErrorMessage message={error instanceof Error ? error.message : '지원 목록을 불러오는데 실패했습니다.'} />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">신청완료</Badge>;
      case 'selected':
        return <Badge variant="default">선정</Badge>;
      case 'rejected':
        return <Badge variant="destructive">반려</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">내 지원 목록</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">상태 필터:</span>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="pending">신청완료</SelectItem>
              <SelectItem value="selected">선정</SelectItem>
              <SelectItem value="rejected">반려</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!applications?.applications || applications.applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">지원한 체험단이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.applications.map((application) => (
            <Card
              key={application.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/campaigns/${application.campaignId}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{application.campaignTitle}</CardTitle>
                    <CardDescription>
                      방문 예정일: {format(new Date(application.visitDate), 'PPP', { locale: ko })}
                    </CardDescription>
                  </div>
                  <div>{getStatusBadge(application.status)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">각오 한마디</p>
                    <p className="text-sm">{application.motivation}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    지원일: {format(new Date(application.createdAt), 'PPP', { locale: ko })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
