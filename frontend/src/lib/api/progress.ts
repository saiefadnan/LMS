/**
 * Progress API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Progress, StrapiResponse } from '@/types';

export async function markLessonComplete(
  lessonId: string | number
): Promise<StrapiResponse<Progress>> {
  return apiClient.post<StrapiResponse<Progress>>(API_ENDPOINTS.PROGRESS.ROOT, {
    data: { lesson: lessonId, completed: true },
  });
}

export async function getMyProgress(
  courseDocumentId: string
): Promise<StrapiResponse<Progress[]>> {
  return apiClient.get<StrapiResponse<Progress[]>>(API_ENDPOINTS.PROGRESS.MY_COURSE(courseDocumentId));
}
