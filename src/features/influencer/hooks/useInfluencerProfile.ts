'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { getSessionToken } from '@/lib/supabase/get-session-token';
import {
  CreateInfluencerProfileRequestSchema,
  GetInfluencerProfileResponseSchema,
  type CreateInfluencerProfileRequest,
  type GetInfluencerProfileResponse,
} from '../lib/dto';

const createInfluencerProfile = async (payload: CreateInfluencerProfileRequest) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.post('/api/influencers/profile', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

const fetchInfluencerProfile = async (): Promise<GetInfluencerProfileResponse> => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.get('/api/influencers/profile/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return GetInfluencerProfileResponseSchema.parse(data);
};

export const useCreateInfluencerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInfluencerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-profile'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to create influencer profile');
      throw new Error(message);
    },
  });
};

export const useInfluencerProfile = () =>
  useQuery({
    queryKey: ['influencer-profile'],
    queryFn: fetchInfluencerProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
