import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import type { 
  UserProfile, 
  UserStats, 
  RatingCategoryStats, 
  TopTenEntry, 
  Activity,
  Playlist,
  Post
} from '../../../shared/types/index.js';

export const useProfile = (username: string) => {
  return useQuery<UserProfile>({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return data;
    },
    enabled: !!username,
  });
};

export const useProfileStats = (username: string, enabled: boolean = true) => {
  return useQuery<UserStats>({
    queryKey: ['profile', username, 'stats'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/stats`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useProfileFingerprint = (username: string, enabled: boolean = true) => {
  return useQuery<RatingCategoryStats[]>({
    queryKey: ['profile', username, 'fingerprint'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/fingerprint`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useProfileTopTen = (username: string, enabled: boolean = true) => {
  return useQuery<TopTenEntry[]>({
    queryKey: ['profile', username, 'topten'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/topten`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useProfileActivity = (username: string, enabled: boolean = true) => {
  return useQuery<Activity[]>({
    queryKey: ['profile', username, 'activity'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/activity`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useFollowMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ username, isFollowing }: { username: string, isFollowing: boolean }) => {
      if (isFollowing) {
        await api.delete(`/follow/${username}`);
      } else {
        await api.post(`/follow/${username}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.username] });
    },
  });
};

export const useProfilePlaylists = (username: string, enabled: boolean = true) => {
  return useQuery<Playlist[]>({
    queryKey: ['profile', username, 'playlists'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/playlists`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useProfilePosts = (username: string, enabled: boolean = true) => {
  return useQuery<Post[]>({
    queryKey: ['profile', username, 'posts'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/posts`);
      return data;
    },
    enabled: !!username && enabled,
  });
};

export const useProfileDebates = (username: string, enabled: boolean = true) => {
  return useQuery<{ arenas: any[], stats: any }>({
    queryKey: ['profile', username, 'debates'],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}/debates`);
      return data;
    },
    enabled: !!username && enabled,
  });
};
