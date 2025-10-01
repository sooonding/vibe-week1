import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getErrorMessage } from '@/backend/http/logger-utils';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { CreateInfluencerProfileRequestSchema } from './schema';
import { createInfluencerProfile, getInfluencerProfileByUserId } from './service';
import { influencerErrorCodes } from './error';

export const registerInfluencerRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/influencers/profile', async (c) => {
    const authHeader = c.req.header('Authorization');
    const logger = getLogger(c);

    if (!authHeader) {
      logger.warn('Missing authorization header for influencer profile creation');
      return respond(c, failure(401, 'UNAUTHORIZED', 'Missing authorization header'));
    }

    const supabase = getSupabase(c);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.warn('Invalid token for influencer profile creation', authError?.message);
      return respond(c, failure(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    }

    const body = await c.req.json();
    const parsedBody = CreateInfluencerProfileRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, influencerErrorCodes.validationError, 'Invalid profile data', parsedBody.error.format()),
      );
    }

    const result = await createInfluencerProfile(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      logger.error('Failed to create influencer profile', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/influencers/profile/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    const logger = getLogger(c);

    if (!authHeader) {
      logger.warn('Missing authorization header for fetching influencer profile');
      return respond(c, failure(401, 'UNAUTHORIZED', 'Missing authorization header'));
    }

    const supabase = getSupabase(c);

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.warn('Invalid token for fetching influencer profile', authError?.message);
      return respond(c, failure(401, 'UNAUTHORIZED', 'Invalid or expired token'));
    }

    const result = await getInfluencerProfileByUserId(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch influencer profile', getErrorMessage(result));
    }

    return respond(c, result);
  });
};
