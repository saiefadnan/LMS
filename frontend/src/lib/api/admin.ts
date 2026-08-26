/**
 * Admin API
 */
import { fetchAPI } from './client';
import type { User } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  return fetchAPI<User[]>('/api/users?populate=role');
}

export async function updateUserRole(
  userId: number,
  roleId: number
): Promise<User> {
  return fetchAPI<User>(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role: roleId }),
  });
}
