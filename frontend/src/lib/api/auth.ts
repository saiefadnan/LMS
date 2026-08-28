/**
 * Auth API — login, register, getMe
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { AuthResponse, User } from '@/types';

export async function loginUser(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    identifier,
    password,
  });

  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }

  return data;
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  role: string = 'student'
): Promise<AuthResponse> {
  const data = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    username,
    email,
    password,
    role,
  });

  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }

  return data;
}

export async function getMe(): Promise<User> {
  return apiClient.get<User>(`${API_ENDPOINTS.AUTH.ME}?populate=role`);
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
}
