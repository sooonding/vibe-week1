'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCampaignById } from '@/features/campaign/hooks/useCampaigns';
import { useCreateApplication } from '@/features/application/hooks/useApplications';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { CreateApplicationRequestSchema } from '@/features/application/lib/dto';
import type { z } from 'zod';
import { useEffect } from 'react';

type ApplicationFormData = z.infer<typeof CreateApplicationRequestSchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string, 10);
  const { requireAuth } = useAuth();

  const { data: campaign, isLoading: campaignLoading } = useCampaignById(campaignId);
  const { mutate: createApplication, isPending, isSuccess, error: submitError } = useCreateApplication();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(CreateApplicationRequestSchema),
    defaultValues: {
      campaignId,
      motivation: '',
      visitDate: '',
    },
  });

  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
  }, [requireAuth]);

  useEffect(() => {
    if (isSuccess) {
      router.push('/applications/me');
    }
  }, [isSuccess, router]);

  const onSubmit = (data: ApplicationFormData) => {
    createApplication(data);
  };

  if (isNaN(campaignId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="유효하지 않은 체험단 ID입니다." />
      </div>
    );
  }

  if (campaignLoading) {
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

  if (campaign.status !== 'recruiting') {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage message="모집이 마감된 체험단입니다." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>체험단 지원</CardTitle>
          <CardDescription>{campaign.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>각오 한마디</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="체험단에 지원하는 이유와 각오를 작성해주세요"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visitDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>방문 예정일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <div className="rounded-md bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4">
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {submitError instanceof Error ? submitError.message : '지원 중 오류가 발생했습니다.'}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  취소
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? '제출 중...' : '지원하기'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
