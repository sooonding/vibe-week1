'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { getSessionToken } from '@/lib/supabase/get-session-token';
import {
  CreateAdvertiserProfileRequestSchema,
  GetAdvertiserProfileResponseSchema,
  type CreateAdvertiserProfileRequest,
  type GetAdvertiserProfileResponse,
} from '../lib/dto';

const createAdvertiserProfile = async (payload: CreateAdvertiserProfileRequest) => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.post('/api/advertisers/profile', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};

const fetchAdvertiserProfile = async (): Promise<GetAdvertiserProfileResponse> => {
  const token = await getSessionToken();
  if (!token) throw new Error('Not authenticated');

  const { data } = await apiClient.get('/api/advertisers/profile/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  return GetAdvertiserProfileResponseSchema.parse(data);
};

export const useCreateAdvertiserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdvertiserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertiser-profile'] });
    },
    onError: (error: unknown) => {
      const message = extractApiErrorMessage(error, 'Failed to create advertiser profile');
      throw new Error(message);
    },
  });
};

export const useAdvertiserProfile = () =>
  useQuery({
    queryKey: ['advertiser-profile'],
    queryFn: fetchAdvertiserProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
