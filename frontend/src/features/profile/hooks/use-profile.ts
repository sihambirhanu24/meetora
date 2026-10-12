import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile-api';
import { UpdateProfileRequest } from '../types';

export const useProfile = () => {
  const queryClient = useQueryClient();

  // Get user profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update both profile and currentUser caches
      queryClient.setQueryData(['profile'], updatedProfile);
      queryClient.setQueryData(['currentUser'], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileMutation,
  };
};
