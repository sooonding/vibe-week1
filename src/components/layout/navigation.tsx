'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { Building2, UserCircle } from 'lucide-react';

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
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50'>
      <div className='mx-auto px-6 max-w-[1400px]'>
        <div className='flex h-20 items-center justify-between'>
          <div className='flex items-center gap-10'>
            <Link
              href='/'
              className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300'
            >
              체험단 ✨
            </Link>

            {isAuthenticated && (
              <div className='flex items-center gap-6'>
                {user?.role === 'influencer' && (
                  <Link
                    href='/applications/me'
                    className={`text-base font-semibold transition-all duration-300 px-4 py-2 rounded-xl ${
                      isActive('/applications/me')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    내 지원 목록
                  </Link>
                )}

                {user?.role === 'advertiser' && (
                  <Link
                    href='/dashboard/campaigns'
                    className={`text-base font-semibold transition-all duration-300 px-4 py-2 rounded-xl ${
                      isActive('/dashboard/campaigns')
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    체험단 관리
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className='flex items-center gap-3'>
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Link href='/login'>
                  <Button variant='ghost' size='lg' className='font-semibold rounded-xl'>
                    로그인
                  </Button>
                </Link>
                <Link href='/signup'>
                  <Button size='lg' className='font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300'>
                    회원가입 🎉
                  </Button>
                </Link>
              </>
            ) : (
              <div className='flex items-center gap-3'>
                <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20'>
                  {user?.role === 'advertiser' ? (
                    <Building2 className='h-4 w-4 text-primary' />
                  ) : (
                    <UserCircle className='h-4 w-4 text-primary' />
                  )}
                  <span className='text-sm font-semibold text-foreground'>
                    {user?.name}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='lg'
                  onClick={handleLogout}
                  className='font-semibold rounded-xl'
                >
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
