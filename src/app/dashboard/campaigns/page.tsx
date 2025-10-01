'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMyCampaigns, useCreateCampaign } from '@/features/campaign/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { ErrorMessage } from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CreateCampaignRequestSchema } from '@/features/campaign/lib/dto';
import type { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus } from 'lucide-react';

type CampaignFormData = z.infer<typeof CreateCampaignRequestSchema>;

export default function CampaignManagementPage() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: campaigns, isLoading, error } = useMyCampaigns();
  const { mutate: createCampaign, isPending, isSuccess } = useCreateCampaign();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(CreateCampaignRequestSchema),
    defaultValues: {
      title: '',
      recruitmentStartDate: '',
      recruitmentEndDate: '',
      maxParticipants: 1,
      benefits: '',
      storeInfo: '',
      mission: '',
    },
  });

  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
  }, [requireAuth]);

  useEffect(() => {
    if (isSuccess) {
      setIsDialogOpen(false);
      form.reset();
    }
  }, [isSuccess, form]);

  const onSubmit = (data: CampaignFormData) => {
    createCampaign(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recruiting':
        return <Badge variant="default">모집 중</Badge>;
      case 'closed':
        return <Badge variant="secondary">모집 마감</Badge>;
      case 'selected':
        return <Badge variant="outline">선정 완료</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
        <ErrorMessage message={error instanceof Error ? error.message : '체험단 목록을 불러오는데 실패했습니다.'} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">체험단 관리</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              새 체험단 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 체험단 등록</DialogTitle>
              <DialogDescription>체험단 정보를 입력하여 새로운 체험단을 등록하세요.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>체험단명</FormLabel>
                      <FormControl>
                        <Input placeholder="체험단 제목을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="recruitmentStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>모집 시작일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recruitmentEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>모집 종료일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>모집 인원</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제공 혜택</FormLabel>
                      <FormControl>
                        <Textarea placeholder="제공되는 혜택을 작성하세요" className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storeInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>매장 정보</FormLabel>
                      <FormControl>
                        <Textarea placeholder="매장 위치 및 정보를 작성하세요" className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>미션</FormLabel>
                      <FormControl>
                        <Textarea placeholder="체험단이 수행할 미션을 작성하세요" className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    취소
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? '등록 중...' : '등록하기'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {!campaigns?.campaigns || campaigns.campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">등록된 체험단이 없습니다.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">첫 체험단 등록하기</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                  {getStatusBadge(campaign.status)}
                </div>
                <CardDescription>
                  {format(new Date(campaign.recruitmentStartDate), 'PPP', { locale: ko })} ~{' '}
                  {format(new Date(campaign.recruitmentEndDate), 'PPP', { locale: ko })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">모집 인원: {campaign.maxParticipants}명</p>
                  <p className="text-muted-foreground truncate">혜택: {campaign.benefits}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
