"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/remote/api-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

const defaultFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  role: "" as "advertiser" | "influencer" | "",
  termsService: false,
  termsPrivacy: false,
};

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, refresh } = useCurrentUser();
  const [formState, setFormState] = useState(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // 회원가입 중일 때는 자동 리다이렉션하지 않음
    if (isAuthenticated && !isSubmitting) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, isSubmitting, router, searchParams]);

  const isSubmitDisabled = useMemo(
    () =>
      !formState.email.trim() ||
      !formState.password.trim() ||
      formState.password !== formState.confirmPassword ||
      !formState.name.trim() ||
      !formState.phone.trim() ||
      !formState.role ||
      !formState.termsService ||
      !formState.termsPrivacy,
    [formState]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = event.target;
      const checked = type === "checkbox" ? (event.target as HTMLInputElement).checked : undefined;

      setFormState((previous) => ({
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setErrorMessage(null);

      if (formState.password !== formState.confirmPassword) {
        setErrorMessage("비밀번호가 일치하지 않습니다.");
        setIsSubmitting(false);
        return;
      }

      try {
        const termsAgreed: string[] = [];
        if (formState.termsService) termsAgreed.push("service");
        if (formState.termsPrivacy) termsAgreed.push("privacy");

        const { data } = await apiClient.post("/api/users/signup", {
          email: formState.email,
          password: formState.password,
          name: formState.name,
          phone: formState.phone,
          role: formState.role,
          termsAgreed,
        });

        // Auto-login after signup with session verification
        const supabase = (await import('@/lib/supabase/browser-client')).getSupabaseBrowserClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        if (signInError) {
          console.error('[Signup] Auto-login failed:', signInError);
          setErrorMessage('회원가입은 완료되었으나 자동 로그인에 실패했습니다.');
          return;
        }

        // Wait for session to be fully established
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('[Signup] Session not established after login');
          setErrorMessage('세션 생성에 실패했습니다. 다시 로그인해주세요.');
          return;
        }

        console.log('[Signup] Session established:', session.access_token.substring(0, 20) + '...');

        // 온보딩으로 이동 (refresh는 온보딩 페이지에서 자동으로 처리됨)
        router.push(`/onboarding?role=${data.role}`);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("회원가입 처리 중 문제가 발생했습니다.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, refresh, router]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          블로그 체험단 플랫폼에 가입하고 시작하세요
        </p>
      </header>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
        >
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            이름
            <input
              type="text"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            휴대폰번호
            <input
              type="tel"
              name="phone"
              placeholder="010-1234-5678"
              required
              value={formState.phone}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            이메일
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              value={formState.password}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            비밀번호 확인
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formState.confirmPassword}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            역할
            <select
              name="role"
              required
              value={formState.role}
              onChange={handleChange}
              className="rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            >
              <option value="">선택하세요</option>
              <option value="influencer">인플루언서</option>
              <option value="advertiser">광고주</option>
            </select>
          </label>

          <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="termsService"
                checked={formState.termsService}
                onChange={handleChange}
                className="h-4 w-4"
              />
              서비스 이용약관 동의 (필수)
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="termsPrivacy"
                checked={formState.termsPrivacy}
                onChange={handleChange}
                className="h-4 w-4"
              />
              개인정보 처리방침 동의 (필수)
            </label>
          </div>

          {errorMessage ? (
            <p className="text-sm text-rose-500">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting || isSubmitDisabled}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "등록 중" : "회원가입"}
          </button>

          <p className="text-xs text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-700 underline hover:text-slate-900"
            >
              로그인으로 이동
            </Link>
          </p>
        </form>

        <figure className="overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/signup/640/640"
            alt="회원가입"
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
