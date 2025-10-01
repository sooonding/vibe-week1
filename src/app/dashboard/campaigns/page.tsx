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
import { Plus, Users } from 'lucide-react';

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
        return <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 font-bold px-3 py-1 rounded-full shadow-md">🔥 모집 중</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-0 font-bold px-3 py-1 rounded-full">모집 마감</Badge>;
      case 'selected':
        return <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white border-0 font-bold px-3 py-1 rounded-full shadow-md">✓ 선정 완료</Badge>;
      default:
        return <Badge variant="outline" className="font-bold px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-16 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16">
        <ErrorMessage message={error instanceof Error ? error.message : '체험단 목록을 불러오는데 실패했습니다.'} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">체험단 관리 📋</h1>
            <p className="mt-3 text-lg text-muted-foreground">등록한 체험단을 관리하고 신청자를 확인하세요</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold text-base px-6 py-6 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all">
                <Plus className="mr-2 h-5 w-5" />
                새 체험단 등록
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2">
              <DialogHeader>
                <DialogTitle className="text-2xl">새 체험단 등록</DialogTitle>
                <DialogDescription className="text-base">체험단 정보를 입력하여 새로운 체험단을 등록하세요.</DialogDescription>
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

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-lg font-medium">
                    취소
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1 rounded-lg font-medium">
                    {isPending ? '등록 중...' : '등록하기'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>

        {!campaigns?.campaigns || campaigns.campaigns.length === 0 ? (
          <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 p-20 text-center">
            <p className="text-lg text-muted-foreground mb-6">등록된 체험단이 없습니다 😢</p>
            <p className="text-sm text-muted-foreground mb-8">첫 체험단을 등록하고 시작해보세요!</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl font-bold px-6 py-3 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all">
                  첫 체험단 등록하기 🎉
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {campaigns.campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="cursor-pointer rounded-3xl bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
                onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-bold text-foreground flex-1 pr-4">{campaign.title}</h3>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    {format(new Date(campaign.recruitmentStartDate), 'M월 d일', { locale: ko })} ~ {format(new Date(campaign.recruitmentEndDate), 'M월 d일', { locale: ko })}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="font-semibold">모집 인원 {campaign.maxParticipants}명</span>
                    </div>
                    <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed">{campaign.benefits}</p>
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
