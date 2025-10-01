import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getErrorMessage } from '@/backend/http/logger-utils';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { CreateCampaignRequestSchema } from './schema';
import {
  createCampaign,
  getCampaignsByStatus,
  getCampaignById,
  getCampaignsByAdvertiserId,
  closeCampaign,
} from './service';
import { campaignErrorCodes } from './error';

export const registerCampaignRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/campaigns', async (c) => {
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
    const parsedBody = CreateCampaignRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, campaignErrorCodes.validationError, 'Invalid campaign data', parsedBody.error.format()),
      );
    }

    const result = await createCampaign(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      logger.error('Failed to create campaign', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/campaigns', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const status = c.req.query('status');

    const result = await getCampaignsByStatus(supabase, status);

    if (!result.ok) {
      logger.error('Failed to fetch campaigns', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/campaigns/:id', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const campaignId = parseInt(c.req.param('id'), 10);

    if (isNaN(campaignId)) {
      return respond(c, failure(400, campaignErrorCodes.validationError, 'Invalid campaign ID'));
    }

    const result = await getCampaignById(supabase, campaignId);

    if (!result.ok) {
      logger.error('Failed to fetch campaign', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/campaigns/me/list', async (c) => {
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

    const result = await getCampaignsByAdvertiserId(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch advertiser campaigns', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.patch('/api/campaigns/:id/close', async (c) => {
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

    const campaignId = parseInt(c.req.param('id'), 10);

    if (isNaN(campaignId)) {
      return respond(c, failure(400, campaignErrorCodes.validationError, 'Invalid campaign ID'));
    }

    const result = await closeCampaign(supabase, user.id, campaignId);

    if (!result.ok) {
      logger.error('Failed to close campaign', getErrorMessage(result));
    }

    return respond(c, result);
  });
};
