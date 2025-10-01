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
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 font-bold px-3 py-1 rounded-full shadow-md">⏳ 신청완료</Badge>;
      case 'selected':
        return <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 font-bold px-3 py-1 rounded-full shadow-md">🎉 선정</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-400 dark:bg-gray-600 text-white border-0 font-bold px-3 py-1 rounded-full">반려</Badge>;
      default:
        return <Badge variant="outline" className="font-bold px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">내 지원 목록 📝</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">상태 필터:</span>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value)}>
              <SelectTrigger className="w-[200px] rounded-xl border-2 font-semibold">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="pending">⏳ 신청완료</SelectItem>
                <SelectItem value="selected">🎉 선정</SelectItem>
                <SelectItem value="rejected">반려</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      {!applications?.applications || applications.applications.length === 0 ? (
        <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 p-20 text-center">
          <p className="text-lg text-muted-foreground">지원한 체험단이 없습니다 😢</p>
          <p className="text-sm text-muted-foreground mt-2">다양한 체험단에 지원해보세요!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.applications.map((application) => (
            <div
              key={application.id}
              className="cursor-pointer rounded-3xl bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
              onClick={() => router.push(`/campaigns/${application.campaignId}`)}
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-4">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{application.campaignTitle}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="text-base">📅</span>
                      방문 예정일: {format(new Date(application.visitDate), 'PPP', { locale: ko })}
                    </p>
                  </div>
                  <div>{getStatusBadge(application.status)}</div>
                </div>
                <div className="space-y-3 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-2">각오 한마디 💪</p>
                    <p className="text-base text-foreground leading-relaxed">{application.motivation}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    지원일: {format(new Date(application.createdAt), 'PPP', { locale: ko })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
