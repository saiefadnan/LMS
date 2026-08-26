/**
 * Auth API — login, register, getMe
 */
import { fetchAPI } from './client';
import type { AuthResponse, User } from '@/types';

export async function loginUser(
  identifier: string,
  password: string
): Promise<AuthResponse> {
  const data = await fetchAPI<AuthResponse>('/api/auth/local', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
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
  const data = await fetchAPI<AuthResponse>('/api/auth/local/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, role }),
  });

  if (data.jwt) {
    localStorage.setItem('jwt', data.jwt);
  }

  return data;
}

export async function getMe(): Promise<User> {
  return fetchAPI<User>('/api/users/me?populate=role');
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
}
