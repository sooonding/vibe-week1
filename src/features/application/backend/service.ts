import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { applicationErrorCodes, type ApplicationServiceError } from './error';
import type {
  CreateApplicationRequest,
  CreateApplicationResponse,
  ApplicationResponse,
  ApplicationListResponse,
  ApplicationRow,
  ApplicationDetailResponse,
  SelectApplicationsRequest,
  ApplicationStatusResponse,
} from './schema';
import { ApplicationRowSchema } from './schema';

export const createApplication = async (
  client: SupabaseClient,
  userId: string,
  payload: CreateApplicationRequest,
): Promise<HandlerResult<CreateApplicationResponse, ApplicationServiceError, unknown>> => {
  const visitDate = new Date(payload.visitDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (visitDate < today) {
    return failure(400, applicationErrorCodes.invalidVisitDate, 'Visit date must be in the future');
  }

  const { data: influencerData, error: influencerError } = await client
    .from('influencer_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (influencerError || !influencerData) {
    return failure(403, applicationErrorCodes.notInfluencer, 'Only influencers can apply');
  }

  const { data: campaignData, error: campaignError } = await client
    .from('campaigns')
    .select('status')
    .eq('id', payload.campaignId)
    .maybeSingle();

  if (campaignError || !campaignData) {
    return failure(404, applicationErrorCodes.notFound, 'Campaign not found');
  }

  if (campaignData.status !== 'recruiting') {
    return failure(400, applicationErrorCodes.campaignClosed, 'Campaign is not accepting applications');
  }

  const { data, error } = await client
    .from('applications')
    .insert({
      campaign_id: payload.campaignId,
      influencer_id: influencerData.id,
      motivation: payload.motivation,
      visit_date: payload.visitDate,
      status: 'pending',
    })
    .select('id, status')
    .single();

  if (error) {
    if (error.code === '23505') {
      return failure(409, applicationErrorCodes.duplicateApplication, 'You have already applied to this campaign');
    }
    return failure(500, applicationErrorCodes.createError, error.message);
  }

  return success(
    {
      applicationId: data.id,
      status: data.status as 'pending' | 'selected' | 'rejected',
    },
    201,
  );
};

export const getApplicationsByInfluencer = async (
  client: SupabaseClient,
  userId: string,
  status?: string,
): Promise<HandlerResult<ApplicationListResponse, ApplicationServiceError, unknown>> => {
  const { data: influencerData, error: influencerError } = await client
    .from('influencer_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (influencerError || !influencerData) {
    return failure(403, applicationErrorCodes.notInfluencer, 'Not an influencer');
  }

  let query = client
    .from('applications')
    .select(
      `
      *,
      campaigns!inner(title)
    `,
    )
    .eq('influencer_id', influencerData.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return failure(500, applicationErrorCodes.fetchError, error.message);
  }

  const applications: ApplicationResponse[] = (data as (ApplicationRow & { campaigns?: { title?: string } })[]).map(
    (app) => ({
      id: app.id,
      campaignId: app.campaign_id,
      campaignTitle: app.campaigns?.title,
      motivation: app.motivation,
      visitDate: app.visit_date,
      status: app.status,
      createdAt: app.created_at,
    }),
  );

  return success({ applications });
};

export const getApplicationsByCampaign = async (
  client: SupabaseClient,
  userId: string,
  campaignId: number,
): Promise<HandlerResult<{ applications: ApplicationDetailResponse[] }, ApplicationServiceError, unknown>> => {
  const { data: advertiserData, error: advertiserError } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (advertiserError || !advertiserData) {
    return failure(403, applicationErrorCodes.unauthorized, 'Not an advertiser');
  }

  const { data: campaignData, error: campaignError } = await client
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserData.id)
    .maybeSingle();

  if (campaignError || !campaignData) {
    return failure(404, applicationErrorCodes.notFound, 'Campaign not found or unauthorized');
  }

  const { data, error } = await client
    .from('applications')
    .select(
      `
      *,
      influencer_profiles!inner(
        user_id,
        users!inner(name, email, phone)
      ),
      campaigns!inner(title)
    `,
    )
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  if (error) {
    return failure(500, applicationErrorCodes.fetchError, error.message);
  }

  type ApplicationWithJoins = ApplicationRow & {
    influencer_profiles?: {
      users?: { name?: string; email?: string; phone?: string };
    };
    campaigns?: { title?: string };
  };

  const applications: ApplicationDetailResponse[] = (data as ApplicationWithJoins[]).map((app) => ({
    id: app.id,
    campaignId: app.campaign_id,
    campaignTitle: app.campaigns?.title,
    motivation: app.motivation,
    visitDate: app.visit_date,
    status: app.status,
    createdAt: app.created_at,
    influencerName: app.influencer_profiles?.users?.name,
    influencerEmail: app.influencer_profiles?.users?.email,
    influencerPhone: app.influencer_profiles?.users?.phone,
  }));

  return success({ applications });
};

export const selectApplications = async (
  client: SupabaseClient,
  userId: string,
  campaignId: number,
  payload: SelectApplicationsRequest,
): Promise<HandlerResult<{ success: boolean }, ApplicationServiceError, unknown>> => {
  const { data: advertiserData, error: advertiserError } = await client
    .from('advertiser_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (advertiserError || !advertiserData) {
    return failure(403, applicationErrorCodes.unauthorized, 'Not an advertiser');
  }

  const { data: campaignData, error: campaignError } = await client
    .from('campaigns')
    .select('status')
    .eq('id', campaignId)
    .eq('advertiser_id', advertiserData.id)
    .maybeSingle();

  if (campaignError || !campaignData) {
    return failure(404, applicationErrorCodes.notFound, 'Campaign not found or unauthorized');
  }

  if (campaignData.status !== 'closed') {
    return failure(400, applicationErrorCodes.validationError, 'Campaign must be closed before selection');
  }

  const { error: selectedError } = await client
    .from('applications')
    .update({ status: 'selected' })
    .in('id', payload.selectedApplicationIds)
    .eq('campaign_id', campaignId);

  if (selectedError) {
    return failure(500, applicationErrorCodes.updateError, selectedError.message);
  }

  const { error: rejectedError } = await client
    .from('applications')
    .update({ status: 'rejected' })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');

  if (rejectedError) {
    return failure(500, applicationErrorCodes.updateError, rejectedError.message);
  }

  const { error: campaignUpdateError } = await client.from('campaigns').update({ status: 'selected' }).eq('id', campaignId);

  if (campaignUpdateError) {
    return failure(500, applicationErrorCodes.updateError, campaignUpdateError.message);
  }

  return success({ success: true });
};

export const checkApplicationStatus = async (
  client: SupabaseClient,
  userId: string,
  campaignId: number,
): Promise<HandlerResult<ApplicationStatusResponse, ApplicationServiceError, unknown>> => {
  const { data: influencerData, error: influencerError } = await client
    .from('influencer_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (influencerError || !influencerData) {
    return success({ hasApplied: false });
  }

  const { data, error } = await client
    .from('applications')
    .select('id, status')
    .eq('campaign_id', campaignId)
    .eq('influencer_id', influencerData.id)
    .maybeSingle();

  if (error || !data) {
    return success({ hasApplied: false });
  }

  return success({
    hasApplied: true,
    applicationStatus: data.status as 'pending' | 'selected' | 'rejected',
  });
};
