/**
 * Lessons API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Lesson, LessonInput, StrapiResponse } from '@/types';

export async function getLessons(
  courseDocumentId: string
): Promise<StrapiResponse<Lesson[]>> {
  return apiClient.get<StrapiResponse<Lesson[]>>(
    `${API_ENDPOINTS.LESSONS.ROOT}?filters[course][documentId][$eq]=${courseDocumentId}&populate=*&sort=order:asc`
  );
}

export async function getLesson(documentId: string): Promise<StrapiResponse<Lesson>> {
  return apiClient.get<StrapiResponse<Lesson>>(
    `${API_ENDPOINTS.LESSONS.DETAIL(documentId)}?populate=*`
  );
}

export async function createLesson(data: LessonInput | Partial<Lesson>): Promise<StrapiResponse<Lesson>> {
  return apiClient.post<StrapiResponse<Lesson>>(API_ENDPOINTS.LESSONS.ROOT, { data });
}

export async function updateLesson(
  documentId: string,
  data: LessonInput | Partial<Lesson>
): Promise<StrapiResponse<Lesson>> {
  return apiClient.put<StrapiResponse<Lesson>>(API_ENDPOINTS.LESSONS.DETAIL(documentId), { data });
}

export async function deleteLesson(documentId: string): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.LESSONS.DETAIL(documentId));
}
