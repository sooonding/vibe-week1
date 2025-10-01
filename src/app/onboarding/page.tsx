"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useCreateInfluencerProfile } from "@/features/influencer/hooks/useInfluencerProfile";
import { useCreateAdvertiserProfile } from "@/features/advertiser/hooks/useAdvertiserProfile";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorMessage } from "@/components/shared/error-message";
import type { ChannelInput } from "@/features/influencer/lib/dto";

type OnboardingPageProps = {
  params: Promise<Record<string, never>>;
};

export default function OnboardingPage({ params }: OnboardingPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as "influencer" | "advertiser" | null;

  useEffect(() => {
    if (!role || (role !== "influencer" && role !== "advertiser")) {
      router.replace("/");
    }
  }, [role, router]);

  if (role === "influencer") {
    return <InfluencerOnboarding />;
  }

  if (role === "advertiser") {
    return <AdvertiserOnboarding />;
  }

  return null;
}

function InfluencerOnboarding() {
  const router = useRouter();
  const { mutate, isPending, error } = useCreateInfluencerProfile();
  const [birthDate, setBirthDate] = useState("");
  const [channels, setChannels] = useState<ChannelInput[]>([
    { platform: "naver", channelName: "", channelUrl: "" },
  ]);

  const handleAddChannel = useCallback(() => {
    setChannels((prev) => [...prev, { platform: "naver", channelName: "", channelUrl: "" }]);
  }, []);

  const handleRemoveChannel = useCallback((index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleChannelChange = useCallback((index: number, field: keyof ChannelInput, value: string) => {
    setChannels((prev) => prev.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch)));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      mutate(
        { birthDate, channels },
        {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        }
      );
    },
    [birthDate, channels, mutate, router]
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">인플루언서 정보 등록</h1>
        <p className="text-slate-500">체험단 지원을 위해 추가 정보를 입력해주세요</p>
      </header>

      <div className="grid w-full gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            생년월일
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 14)).toISOString().split('T')[0]}
              required
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">SNS 채널</h3>
              <button
                type="button"
                onClick={handleAddChannel}
                className="text-xs text-slate-600 hover:text-slate-900 underline"
              >
                + 채널 추가
              </button>
            </div>

            {channels.map((channel, index) => (
              <div key={index} className="flex flex-col gap-2 border border-slate-200 rounded-md p-3">
                <select
                  value={channel.platform}
                  onChange={(e) => handleChannelChange(index, "platform", e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                >
                  <option value="naver">네이버 블로그</option>
                  <option value="youtube">유튜브</option>
                  <option value="instagram">인스타그램</option>
                  <option value="threads">스레드</option>
                </select>

                <input
                  type="text"
                  placeholder="채널명"
                  value={channel.channelName}
                  onChange={(e) => handleChannelChange(index, "channelName", e.target.value)}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />

                <input
                  type="url"
                  placeholder="채널 URL"
                  value={channel.channelUrl}
                  onChange={(e) => handleChannelChange(index, "channelUrl", e.target.value)}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                />

                {channels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(index)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>

          {error && <ErrorMessage message={error instanceof Error ? error.message : 'An error occurred'} />}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "등록 완료"}
          </button>
        </form>

        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/influencer/640/640"
            alt="인플루언서"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}

function AdvertiserOnboarding() {
  const router = useRouter();
  const { mutate, isPending, error } = useCreateAdvertiserProfile();
  const [formState, setFormState] = useState({
    businessName: "",
    location: "",
    category: "",
    businessRegistrationNumber: "",
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      mutate(formState, {
        onSuccess: () => {
          router.push("/dashboard/campaigns");
          router.refresh();
        },
      });
    },
    [formState, mutate, router]
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">광고주 정보 등록</h1>
        <p className="text-slate-500">체험단 등록을 위해 사업자 정보를 입력해주세요</p>
      </header>

      <div className="grid w-full gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            업체명
            <input
              type="text"
              name="businessName"
              value={formState.businessName}
              onChange={handleChange}
              required
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            위치
            <input
              type="text"
              name="location"
              placeholder="서울특별시 강남구..."
              value={formState.location}
              onChange={handleChange}
              required
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            카테고리
            <input
              type="text"
              name="category"
              placeholder="예: 카페, 레스토랑, 뷰티"
              value={formState.category}
              onChange={handleChange}
              required
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            사업자등록번호
            <input
              type="text"
              name="businessRegistrationNumber"
              placeholder="10자리 숫자"
              value={formState.businessRegistrationNumber}
              onChange={handleChange}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          {error && <ErrorMessage message={error instanceof Error ? error.message : 'An error occurred'} />}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "등록 완료"}
          </button>
        </form>

        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/advertiser/640/640"
            alt="광고주"
            width={640}
            height={640}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
