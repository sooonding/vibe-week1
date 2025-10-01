'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { getSessionToken } from '@/lib/supabase/get-session-token';
import {
  ApplicationListResponseSchema,
  CampaignApplicationListResponseSchema,
  ApplicationStatusResponseSchema,
  type CreateApplicationRequest,
  type ApplicationListResponse,
  type SelectApplicationsRequest,
  type ApplicationStatusResponse,
} from '../lib/dto';

import type { z } from 'zod';

const createApplication = async (payload: CreateApplicationRequest) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.post('/api/applications', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

const fetchMyApplications = async (status?: string): Promise<ApplicationListResponse> => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const url = status ? `/api/applications/me?status=${status}` : '/api/applications/me';
  const { data } = await apiClient.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return ApplicationListResponseSchema.parse(data);
};

const fetchCampaignApplications = async (campaignId: number): Promise<z.infer<typeof CampaignApplicationListResponseSchema>> => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.get(`/api/campaigns/${campaignId}/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return CampaignApplicationListResponseSchema.parse(data);
};

const selectApplications = async (params: { campaignId: number; selectedApplicationIds: number[] }) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.post(`/api/campaigns/${params.campaignId}/select`,
    { selectedApplicationIds: params.selectedApplicationIds },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data;
};

const fetchApplicationStatus = async (campaignId: number): Promise<ApplicationStatusResponse> => {
  const token = await getSessionToken();
  if (!token) {
    return { hasApplied: false };
  }

  try {
    const { data } = await apiClient.get(`/api/campaigns/${campaignId}/application-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return ApplicationStatusResponseSchema.parse(data);
  } catch {
    return { hasApplied: false };
  }
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to create application');
      throw new Error(message);
    },
  });
};

export const useMyApplications = (status?: string) =>
  useQuery({
    queryKey: ['my-applications', status],
    queryFn: () => fetchMyApplications(status),
    staleTime: 30 * 1000,
  });

export const useCampaignApplications = (campaignId: number) =>
  useQuery({
    queryKey: ['campaign-applications', campaignId],
    queryFn: () => fetchCampaignApplications(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 30 * 1000,
  });

export const useSelectApplications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selectApplications,
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to select applications');
      throw new Error(message);
    },
  });
};

export const useApplicationStatus = (campaignId: number) =>
  useQuery({
    queryKey: ['application-status', campaignId],
    queryFn: () => fetchApplicationStatus(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 60 * 1000,
  });
