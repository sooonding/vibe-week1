"use client";

import Link from "next/link";
import { useCampaigns } from "@/features/campaign/hooks/useCampaigns";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";

type HomePageProps = {
  params: Promise<Record<string, never>>;
};

export default function HomePage({ params }: HomePageProps) {
  void params;
  const { data, isLoading, error } = useCampaigns("recruiting");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            모집 중인 체험단
          </h1>
          <p className="mt-2 text-slate-600">
            다양한 체험단에 지원하고 새로운 경험을 해보세요
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && <ErrorMessage message={error.message} />}

        {data && data.campaigns.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-600">현재 모집 중인 체험단이 없습니다</p>
          </div>
        )}

        {data && data.campaigns.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700">
                  {campaign.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {campaign.benefits}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>모집인원: {campaign.maxParticipants}명</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                    모집중
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {new Date(campaign.recruitmentStartDate).toLocaleDateString()} ~{" "}
                  {new Date(campaign.recruitmentEndDate).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
