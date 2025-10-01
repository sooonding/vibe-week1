import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getErrorMessage } from '@/backend/http/logger-utils';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { CreateApplicationRequestSchema, SelectApplicationsRequestSchema } from './schema';
import { createApplication, getApplicationsByInfluencer, getApplicationsByCampaign, selectApplications, checkApplicationStatus } from './service';
import { applicationErrorCodes } from './error';

export const registerApplicationRoutes = (app: Hono<AppEnv>) => {
  app.post('/api/applications', async (c) => {
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
    const parsedBody = CreateApplicationRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, applicationErrorCodes.validationError, 'Invalid application data', parsedBody.error.format()),
      );
    }

    const result = await createApplication(supabase, user.id, parsedBody.data);

    if (!result.ok) {
      logger.error('Failed to create application', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/applications/me', async (c) => {
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

    const status = c.req.query('status');

    const result = await getApplicationsByInfluencer(supabase, user.id, status);

    if (!result.ok) {
      logger.error('Failed to fetch applications', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/campaigns/:id/applications', async (c) => {
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
      return respond(c, failure(400, applicationErrorCodes.validationError, 'Invalid campaign ID'));
    }

    const result = await getApplicationsByCampaign(supabase, user.id, campaignId);

    if (!result.ok) {
      logger.error('Failed to fetch campaign applications', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.post('/api/campaigns/:id/select', async (c) => {
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
      return respond(c, failure(400, applicationErrorCodes.validationError, 'Invalid campaign ID'));
    }

    const body = await c.req.json();
    const parsedBody = SelectApplicationsRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(400, applicationErrorCodes.validationError, 'Invalid selection data', parsedBody.error.format()),
      );
    }

    const result = await selectApplications(supabase, user.id, campaignId, parsedBody.data);

    if (!result.ok) {
      logger.error('Failed to select applications', getErrorMessage(result));
    }

    return respond(c, result);
  });

  app.get('/api/campaigns/:id/application-status', async (c) => {
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
      return respond(c, failure(400, applicationErrorCodes.validationError, 'Invalid campaign ID'));
    }

    const result = await checkApplicationStatus(supabase, user.id, campaignId);

    if (!result.ok) {
      logger.error('Failed to check application status', getErrorMessage(result));
    }

    return respond(c, result);
  });
};
