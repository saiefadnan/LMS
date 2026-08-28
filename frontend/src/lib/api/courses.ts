/**
 * Courses API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Course, CourseInput, StrapiResponse, CourseProgressResponse } from '@/types';

export interface CourseQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  level?: string;
  sort?: string;
  instructorId?: number;
}

export async function getCourses(params: CourseQueryParams = {}): Promise<StrapiResponse<Course[]>> {
  const query = new URLSearchParams();
  query.set('populate', '*');

  if (params.page) query.set('pagination[page]', String(params.page));
  if (params.pageSize) query.set('pagination[pageSize]', String(params.pageSize));
  if (params.sort) query.set('sort', params.sort);
  if (params.category && params.category !== 'all') {
    query.set('filters[category][$eqi]', params.category);
  }
  if (params.level && params.level !== 'all') {
    query.set('filters[level][$eqi]', params.level);
  }
  if (params.search && params.search.trim()) {
    query.set('filters[title][$containsi]', params.search.trim());
  }

  const qStr = query.toString();
  return apiClient.get<StrapiResponse<Course[]>>(`${API_ENDPOINTS.COURSES.ROOT}?${qStr}`);
}

export async function getMyCourses(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<StrapiResponse<Course[]>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  const qStr = query.toString();
  return apiClient.get<StrapiResponse<Course[]>>(`${API_ENDPOINTS.COURSES.MY_COURSES}${qStr ? `?${qStr}` : ''}`);
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
