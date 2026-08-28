/**
 * Admin API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { User, UserRole, Course, BlogPost, StrapiResponse } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  return apiClient.get<User[]>(`${API_ENDPOINTS.ADMIN.USERS}?populate=role`);
}

export async function getRoles(): Promise<{ roles: UserRole[] }> {
  return apiClient.get<{ roles: UserRole[] }>(API_ENDPOINTS.ADMIN.ROLES);
}

export async function updateUserRole(
  userId: number,
  roleId: number
): Promise<User> {
  return apiClient.put<User>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId), { role: roleId });
}

export async function deleteUser(userId: number): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId));
}

export async function getPlatformStats(): Promise<{
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalBlogPosts: number;
  totalStudents: number;
  totalInstructors: number;
  totalManagers: number;
}> {
  const [users, coursesRes, blogsRes, enrollmentsRes] = await Promise.all([
    getAllUsers().catch(() => [] as User[]),
    apiClient.get<StrapiResponse<Course[]>>(API_ENDPOINTS.COURSES.ROOT).catch(() => ({ data: [] })),
    apiClient.get<StrapiResponse<BlogPost[]>>(API_ENDPOINTS.BLOG.ROOT).catch(() => ({ data: [] })),
    apiClient.get<StrapiResponse<any[]>>(API_ENDPOINTS.ENROLLMENTS.ROOT).catch(() => ({ data: [] })),
  ]);

  const students = users.filter((u) => u.role?.type === 'student').length;
  const instructors = users.filter((u) => u.role?.type === 'instructor').length;
  const managers = users.filter((u) => u.role?.type === 'content_manager').length;

  return {
    totalUsers: users.length,
    totalCourses: coursesRes.data?.length || 0,
    totalEnrollments: enrollmentsRes.data?.length || 0,
    totalBlogPosts: blogsRes.data?.length || 0,
    totalStudents: students,
    totalInstructors: instructors,
    totalManagers: managers,
  };
}
