import { getSupabaseBrowserClient } from './browser-client';

export const getSessionToken = async (): Promise<string | null> => {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.warn('[Auth] No active session found');
    return null;
  }

  console.log('[Auth] Session token retrieved:', session.access_token.substring(0, 20) + '...');
  return session.access_token;
};
