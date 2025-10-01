import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { userErrorCodes, type UserServiceError } from './error';
import type { SignupRequest, SignupResponse, UserRow } from './schema';
import { UserRowSchema } from './schema';

export const createUser = async (
  client: SupabaseClient,
  adminClient: SupabaseClient,
  payload: SignupRequest,
): Promise<HandlerResult<SignupResponse, UserServiceError, unknown>> => {
  // Step 1: Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error('[createUser] Auth creation failed:', authError);
    return failure(500, userErrorCodes.createError, authError?.message ?? 'Failed to create auth user');
  }

  const userId = authData.user.id;
  console.log('[createUser] Auth user created:', userId);

  // Step 2: Insert into users table
  const { error: userError } = await client.from('users').insert({
    id: userId,
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    role: payload.role,
  });

  if (userError) {
    console.error('[createUser] Users table insert failed:', userError);
    if (userError.code === '23505') {
      return failure(409, userErrorCodes.alreadyExists, 'User already exists');
    }
    return failure(500, userErrorCodes.createError, `Database error: ${userError.message}`);
  }

  console.log('[createUser] User record created');

  // Step 3: Insert terms agreements
  const termsInserts = payload.termsAgreed.map((termsType) => ({
    user_id: userId,
    terms_type: termsType,
    agreed: true,
  }));

  const { error: termsError } = await client.from('terms_agreements').insert(termsInserts);

  if (termsError) {
    console.error('[createUser] Terms insert failed:', termsError);
    return failure(500, userErrorCodes.createError, `Terms agreement error: ${termsError.message}`);
  }

  console.log('[createUser] Terms agreements saved');

  return success(
    {
      userId,
      role: payload.role,
    },
    201,
  );
};

export const getUserById = async (
  client: SupabaseClient,
  userId: string,
): Promise<HandlerResult<UserRow, UserServiceError, unknown>> => {
  const { data, error } = await client.from('users').select('*').eq('id', userId).maybeSingle<UserRow>();

  if (error) {
    return failure(500, userErrorCodes.createError, error.message);
  }

  if (!data) {
    return failure(404, userErrorCodes.createError, 'User not found');
  }

  const parsed = UserRowSchema.safeParse(data);

  if (!parsed.success) {
    return failure(500, userErrorCodes.validationError, 'User validation failed', parsed.error.format());
  }

  return success(parsed.data);
};
