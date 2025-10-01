"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

type LoginPageProps = {
  params: Promise<Record<string, never>>;
};

export default function LoginPage({ params }: LoginPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh, isAuthenticated } = useCurrentUser();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      setErrorMessage(null);
      const supabase = getSupabaseBrowserClient();

      try {
        const result = await supabase.auth.signInWithPassword({
          email: formState.email,
          password: formState.password,
        });

        const nextAction = result.error
          ? result.error.message ?? "로그인에 실패했습니다."
          : ("success" as const);

        if (nextAction === "success") {
          await refresh();
          const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
          router.replace(redirectedFrom);
        } else {
          setErrorMessage(nextAction);
        }
      } catch (error) {
        setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState.email, formState.password, refresh, router, searchParams]
  );

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background dark:bg-gray-900 pt-20 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <header className="flex flex-col items-center gap-3 text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">로그인 🔐</h1>
          <p className="text-lg text-muted-foreground">
            계정으로 로그인하고 체험단에 참여하세요
          </p>
        </header>
        <div className="grid w-full gap-8 md:grid-cols-2 items-start">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 rounded-3xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-xl"
          >
            <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              이메일
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formState.email}
                onChange={handleChange}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-foreground px-4 py-3 focus:border-primary focus:outline-none transition-colors"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
              비밀번호
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={formState.password}
                onChange={handleChange}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-foreground px-4 py-3 focus:border-primary focus:outline-none transition-colors"
              />
            </label>
            {errorMessage ? (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border-2 border-red-200 dark:border-red-800">{errorMessage}</p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-4 text-base font-bold text-white transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
            <p className="text-sm text-muted-foreground text-center">
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary underline hover:text-accent transition-colors"
              >
                회원가입
              </Link>
            </p>
          </form>
          <figure className="overflow-hidden rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-xl h-[400px]">
            <Image
              src="https://picsum.photos/seed/login/640/640"
              alt="로그인"
              width={640}
              height={640}
              className="h-full w-full object-cover"
              priority
            />
          </figure>
        </div>
      </div>
    </div>
  );
}
