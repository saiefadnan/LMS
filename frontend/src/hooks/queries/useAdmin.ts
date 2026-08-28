'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  getRoles,
  updateUserRole,
  deleteUser,
  getPlatformStats,
} from '@/lib/api/admin';

export const adminKeys = {
  users: ['admin', 'users'] as const,
  roles: ['admin', 'roles'] as const,
  stats: ['admin', 'stats'] as const,
};

/**
 * Fetch all registered users with their roles
 */
export function useUsers(enabled: boolean = true) {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: () => getAllUsers(),
    enabled,
  });
}

/**
 * Fetch available user roles
 */
export function useRoles(enabled: boolean = true) {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: () => getRoles(),
    select: (data) => data.roles || [],
    enabled,
  });
}

/**
 * Fetch top-level admin KPI platform stats
 */
export function usePlatformStats(enabled: boolean = true) {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: () => getPlatformStats(),
    enabled,
  });
}

/**
 * Mutation: Update a user's role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      updateUserRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}

/**
 * Mutation: Delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats });
    },
  });
}
