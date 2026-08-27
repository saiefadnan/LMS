/**
 * Admin API
 */
import { fetchAPI } from './client';
import type { User, UserRole, Course, BlogPost, StrapiResponse } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  return fetchAPI<User[]>('/api/users?populate=role');
}

export async function getRoles(): Promise<{ roles: UserRole[] }> {
  return fetchAPI<{ roles: UserRole[] }>('/api/users-permissions/roles');
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

export async function deleteUser(userId: number): Promise<void> {
  return fetchAPI(`/api/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalCourses: number;
  totalBlogPosts: number;
  totalStudents: number;
  totalInstructors: number;
  totalManagers: number;
}> {
  const [users, coursesRes, blogsRes] = await Promise.all([
    getAllUsers().catch(() => [] as User[]),
    fetchAPI<StrapiResponse<Course[]>>('/api/courses').catch(() => ({ data: [] })),
    fetchAPI<StrapiResponse<BlogPost[]>>('/api/blog-posts').catch(() => ({ data: [] })),
  ]);

  const students = users.filter((u) => u.role?.type === 'student').length;
  const instructors = users.filter((u) => u.role?.type === 'instructor').length;
  const managers = users.filter((u) => u.role?.type === 'content_manager').length;

  return {
    totalUsers: users.length,
    totalCourses: coursesRes.data?.length || 0,
    totalBlogPosts: blogsRes.data?.length || 0,
    totalStudents: students,
    totalInstructors: instructors,
    totalManagers: managers,
  };
}
