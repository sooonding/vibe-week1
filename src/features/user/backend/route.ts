import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { getErrorMessage } from '@/backend/http/logger-utils';
import { SignupRequestSchema } from './schema';
import { createUser } from './service';
import { userErrorCodes } from './error';
import { createSupabaseAdmin } from '@/backend/supabase/client';

export const registerUserRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/users/signup', async (c) => {
    const body = await c.req.json();
    const logger = getLogger(c);

    logger.info('[Signup] Starting signup process', { email: body.email });

    const parsedBody = SignupRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      logger.warn('[Signup] Validation failed', parsedBody.error.format());
      return respond(
        c,
        failure(400, userErrorCodes.validationError, 'Invalid signup data', parsedBody.error.format()),
      );
    }

    const supabase = getSupabase(c);
    const adminClient = createSupabaseAdmin();

    logger.info('[Signup] Creating user via admin client');
    const result = await createUser(supabase, adminClient, parsedBody.data);

    if (!result.ok) {
      logger.error('[Signup] Failed to create user', {
        error: getErrorMessage(result),
        status: result.status,
      });
    } else {
      logger.info('[Signup] User created successfully', { userId: result.data.userId });
    }

    return respond(c, result);
  });
};
