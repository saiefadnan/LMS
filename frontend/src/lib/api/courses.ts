/**
 * Courses API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Course, CourseInput, StrapiResponse, CourseProgressResponse } from '@/types';

export async function getCourses(query: string = ''): Promise<StrapiResponse<Course[]>> {
  return apiClient.get<StrapiResponse<Course[]>>(
    `${API_ENDPOINTS.COURSES.ROOT}?populate=*${query ? `&${query}` : ''}`
  );
}

export async function getMyCourses(): Promise<StrapiResponse<Course[]>> {
  return apiClient.get<StrapiResponse<Course[]>>(API_ENDPOINTS.COURSES.MY_COURSES);
}

export async function getCourse(documentId: string): Promise<StrapiResponse<Course>> {
  return apiClient.get<StrapiResponse<Course>>(
    `${API_ENDPOINTS.COURSES.DETAIL(documentId)}?populate=*`
  );
}

export async function createCourse(data: CourseInput | Partial<Course>): Promise<StrapiResponse<Course>> {
  return apiClient.post<StrapiResponse<Course>>(API_ENDPOINTS.COURSES.ROOT, { data });
}

export async function updateCourse(
  documentId: string,
  data: CourseInput | Partial<Course>
): Promise<StrapiResponse<Course>> {
  return apiClient.put<StrapiResponse<Course>>(API_ENDPOINTS.COURSES.DETAIL(documentId), { data });
}

export async function deleteCourse(documentId: string): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.COURSES.DETAIL(documentId));
}

export async function getCourseStudentProgress(
  documentId: string,
  params: { page?: number; pageSize?: number; search?: string } = {}
): Promise<CourseProgressResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  const qStr = query.toString();
  return apiClient.get<CourseProgressResponse>(
    `${API_ENDPOINTS.COURSES.STUDENT_PROGRESS(documentId)}${qStr ? `?${qStr}` : ''}`
  );
}
