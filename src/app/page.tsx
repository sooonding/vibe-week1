"use client";

import Link from "next/link";
import { useCampaigns } from "@/features/campaign/hooks/useCampaigns";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

type HomePageProps = {
  params: Promise<Record<string, never>>;
};

export default function HomePage({ params }: HomePageProps) {
  void params;
  const { data: recruitingData, isLoading: recruitingLoading, error: recruitingError } = useCampaigns("recruiting");
  const { data: selectedData, isLoading: selectedLoading, error: selectedError } = useCampaigns("selected");
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900 pt-16 md:pt-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-12 py-8 md:py-16 lg:py-24 space-y-16 md:space-y-24 lg:space-y-32">
        {/* Hero Section - Family.co 스타일 */}
        <section className="text-center py-8 md:py-12 lg:py-20 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 md:top-20 left-5 md:left-10 w-16 h-16 md:w-20 md:h-20 bg-accent/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-20 md:top-40 right-10 md:right-20 w-24 h-24 md:w-32 md:h-32 bg-primary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-10 md:bottom-20 left-1/4 w-20 h-20 md:w-24 md:h-24 bg-secondary/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 md:mb-6 tracking-tight leading-tight px-4">
            새로운 체험의<br className="sm:hidden" /> 시작 ✨
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-4">
            광고주와 인플루언서를 연결하는<br className="sm:hidden" />
            <span className="font-semibold text-primary">프리미엄 체험단 플랫폼</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
                지금 시작하기
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 rounded-2xl hover:bg-primary/10 transition-all duration-300">
                로그인
              </Button>
            </Link>
          </div>
        </section>

        {/* 모집 중인 체험단 섹션 */}
        <section>
          <header className="mb-8 md:mb-12 text-center px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3 md:mb-4">
              모집 중인 체험단 🎯
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              다양한 체험단에 지원하고 새로운 경험을 해보세요
            </p>
          </header>

          {recruitingLoading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {recruitingError && <ErrorMessage message={recruitingError.message} />}

          {recruitingData && recruitingData.campaigns.length === 0 && (
            <div className="rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-dashed border-primary/20 p-16 text-center">
              <p className="text-lg text-muted-foreground">현재 모집 중인 체험단이 없습니다 😢</p>
              <p className="text-sm text-muted-foreground mt-2">곧 새로운 체험단이 등록될 예정이에요!</p>
            </div>
          )}

          {recruitingData && recruitingData.campaigns.length > 0 && (
            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {recruitingData.campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group block rounded-3xl bg-white dark:bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-md text-xs md:text-sm">
                        🔥 모집중
                      </Badge>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                      {campaign.title}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-4 md:mb-6 leading-relaxed min-h-[2.5rem] md:min-h-[3rem]">
                      {campaign.benefits}
                    </p>

                    <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t-2 border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
                        </div>
                        <span className="font-semibold">모집인원 {campaign.maxParticipants}명</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                        </div>
                        <span className="font-semibold">
                          {format(new Date(campaign.recruitmentStartDate), "M월 d일", { locale: ko })} ~ {format(new Date(campaign.recruitmentEndDate), "M월 d일", { locale: ko })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 모집 완료된 체험단 섹션 */}
        {selectedData && selectedData.campaigns.length > 0 && (
          <section>
            <header className="mb-8 md:mb-12 text-center px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-3 md:mb-4">
                모집 완료된 체험단 ✅
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                이미 선정이 완료된 체험단입니다
              </p>
            </header>

            {selectedLoading && (
              <div className="flex justify-center py-20">
                <LoadingSpinner />
              </div>
            )}

            {selectedError && <ErrorMessage message={selectedError.message} />}

            <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {selectedData.campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="group block rounded-3xl bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 opacity-70 hover:opacity-90 border-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <Badge className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-0 font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm">
                        ✓ 모집완료
                      </Badge>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-3 line-clamp-2 min-h-[3rem] md:min-h-[3.5rem]">
                      {campaign.title}
                    </h3>

                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2 mb-4 md:mb-6 leading-relaxed min-h-[2.5rem] md:min-h-[3rem]">
                      {campaign.benefits}
                    </p>

                    <div className="space-y-2 md:space-y-3 pt-4 md:pt-6 border-t-2 border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                        </div>
                        <span className="font-semibold">모집인원 {campaign.maxParticipants}명</span>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
                        </div>
                        <span className="font-semibold">
                          {format(new Date(campaign.recruitmentStartDate), "M월 d일", { locale: ko })} ~ {format(new Date(campaign.recruitmentEndDate), "M월 d일", { locale: ko })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
