import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getErrorMessage } from '@/backend/http/logger-utils';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { CreateAdvertiserProfileRequestSchema } from './schema';
import { createAdvertiserProfile, getAdvertiserProfileByUserId } from './service';
import { advertiserErrorCodes } from './error';

export const registerAdvertiserRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/advertisers/profile', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return respond(c, failure(401, 'UNAUTHORIZED', 'Missing authorization header'));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      return respond(c, failure(401, 'UNAUTHORIZED', 'Invalid token'));
    }

    const body = await c.req.json();
    const parsedBody = CreateAdvertiserProfileRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, advertiserErrorCodes.validationError, 'Invalid profile data', parsedBody.error.format()),
      );
    }

    const result = await createAdvertiserProfile(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      logger.error('Failed to create advertiser profile', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/advertisers/profile/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return respond(c, failure(401, 'UNAUTHORIZED', 'Missing authorization header'));
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (!user) {
      return respond(c, failure(401, 'UNAUTHORIZED', 'Invalid token'));
    }

    const result = await getAdvertiserProfileByUserId(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch advertiser profile', getErrorMessage(result));
    }

    return respond(c, result);
  });
};
