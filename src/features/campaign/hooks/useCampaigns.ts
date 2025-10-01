'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { getSessionToken } from '@/lib/supabase/get-session-token';
import {
  CampaignListResponseSchema,
  CampaignDetailResponseSchema,
  type CreateCampaignRequest,
  type CampaignListResponse,
  type CampaignDetailResponse,
} from '../lib/dto';

const fetchCampaigns = async (status?: string): Promise<CampaignListResponse> => {
  const url = status ? `/api/campaigns?status=${status}` : '/api/campaigns';
  const { data } = await apiClient.get(url);
  return CampaignListResponseSchema.parse(data);
};

const fetchCampaignById = async (id: number): Promise<CampaignDetailResponse> => {
  const { data } = await apiClient.get(`/api/campaigns/${id}`);
  return CampaignDetailResponseSchema.parse(data);
};

const fetchMyCampaigns = async (): Promise<CampaignListResponse> => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.get('/api/campaigns/me/list', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return CampaignListResponseSchema.parse(data);
};

const createCampaign = async (payload: CreateCampaignRequest) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.post('/api/campaigns', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

const closeCampaign = async (id: number) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.patch(`/api/campaigns/${id}/close`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

export const useCampaigns = (status?: string) =>
  useQuery({
    queryKey: ['campaigns', status],
    queryFn: () => fetchCampaigns(status),
    staleTime: 30 * 1000,
  });

export const useCampaignDetail = (id: number) =>
  useQuery({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaignById(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });

export const useCampaignById = useCampaignDetail;

export const useMyCampaigns = () =>
  useQuery({
    queryKey: ['my-campaigns'],
    queryFn: fetchMyCampaigns,
    staleTime: 30 * 1000,
  });

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to create campaign');
      throw new Error(message);
    },
  });
};

export const useCloseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: closeCampaign,
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to close campaign');
      throw new Error(message);
    },
  });
};
