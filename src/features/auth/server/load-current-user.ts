import "server-only";

import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { CurrentUserSnapshot } from "../types";

const mapUser = async (authUser: User, supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) => {
  const { data: userData } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', authUser.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRecord = userData as any;
  const name = userRecord?.name ?? '';
  const role = (userRecord?.role ?? 'influencer') as 'influencer' | 'advertiser';

  return {
    id: authUser.id,
    email: authUser.email,
    name,
    role,
    appMetadata: authUser.app_metadata ?? {},
    userMetadata: authUser.user_metadata ?? {},
  };
};

export const loadCurrentUser = async (): Promise<CurrentUserSnapshot> => {
  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.getUser();
  const user = result.data.user;

  if (user) {
    return {
      status: "authenticated",
      user: await mapUser(user, supabase),
    };
  }

  return { status: "unauthenticated", user: null };
};
