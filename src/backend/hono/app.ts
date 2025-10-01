import { Hono } from 'hono';
import { errorBoundary } from '@/backend/middleware/error';
import { withAppContext } from '@/backend/middleware/context';
import { withSupabase } from '@/backend/middleware/supabase';
import { registerExampleRoutes } from '@/features/example/backend/route';
import { registerUserRoutes } from '@/features/user/backend/route';
import { registerInfluencerRoutes } from '@/features/influencer/backend/route';
import { registerAdvertiserRoutes } from '@/features/advertiser/backend/route';
import { registerCampaignRoutes } from '@/features/campaign/backend/route';
import { registerApplicationRoutes } from '@/features/application/backend/route';
import type { AppEnv } from '@/backend/hono/context';

let singletonApp: Hono<AppEnv> | null = null;

export const createHonoApp = () => {
  if (singletonApp) {
    return singletonApp;
  }

  const app = new Hono<AppEnv>();

  app.use('*', errorBoundary());
  app.use('*', withAppContext());
  app.use('*', withSupabase());

  // Debug: Log all incoming requests
  app.use('*', async (c, next) => {
    console.log(`[Hono] ${c.req.method} ${c.req.path}`);
    await next();
  });

  registerExampleRoutes(app);
  registerUserRoutes(app);
  registerInfluencerRoutes(app);
  registerAdvertiserRoutes(app);
  registerCampaignRoutes(app);
  registerApplicationRoutes(app);

  singletonApp = app;

  return app;
};
