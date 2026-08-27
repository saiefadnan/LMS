/**
 * Courses API
 */
import { fetchAPI } from './client';
import type { Course, CourseInput, StrapiResponse } from '@/types';

export async function getCourses(query: string = ''): Promise<StrapiResponse<Course[]>> {
  return fetchAPI(`/api/courses?populate=*${query ? `&${query}` : ''}`);
}

export async function getMyCourses(): Promise<StrapiResponse<Course[]>> {
  return fetchAPI('/api/courses/my');
}

export async function getCourse(documentId: string): Promise<StrapiResponse<Course>> {
  return fetchAPI(`/api/courses/${documentId}?populate=*`);
}

export async function createCourse(data: CourseInput | Partial<Course>): Promise<StrapiResponse<Course>> {
  return fetchAPI('/api/courses', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateCourse(
  documentId: string,
  data: CourseInput | Partial<Course>
): Promise<StrapiResponse<Course>> {
  return fetchAPI(`/api/courses/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteCourse(documentId: string): Promise<void> {
  return fetchAPI(`/api/courses/${documentId}`, { method: 'DELETE' });
}

export async function getCourseStudentProgress(
  documentId: string,
  params: { page?: number; pageSize?: number; search?: string } = {}
): Promise<import('@/types').CourseProgressResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  const qStr = query.toString();
  return fetchAPI(`/api/courses/${documentId}/students-progress${qStr ? `?${qStr}` : ''}`);
}
