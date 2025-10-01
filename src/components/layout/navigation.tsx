'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, refresh } = useCurrentUser();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.push('/');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-slate-900">
              체험단
            </Link>

            <div className="flex gap-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                  pathname === '/' ? 'text-slate-900' : 'text-slate-600'
                }`}
              >
                홈
              </Link>

              {isAuthenticated && user?.role === 'influencer' && (
                <Link
                  href="/applications/me"
                  className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                    isActive('/applications/me') ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  내 지원 목록
                </Link>
              )}

              {isAuthenticated && user?.role === 'advertiser' && (
                <Link
                  href="/dashboard/campaigns"
                  className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                    isActive('/dashboard/campaigns') ? 'text-slate-900' : 'text-slate-600'
                  }`}
                >
                  체험단 관리
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">
                  {user?.name}님
                  {user?.role === 'advertiser' && ' (광고주)'}
                  {user?.role === 'influencer' && ' (인플루언서)'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
