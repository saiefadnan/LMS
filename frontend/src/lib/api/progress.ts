/**
 * Progress API
 */
import { fetchAPI } from './client';
import type { Progress, StrapiResponse } from '@/types';

export async function markLessonComplete(
  lessonId: number
): Promise<StrapiResponse<Progress>> {
  return fetchAPI('/api/progresses', {
    method: 'POST',
    body: JSON.stringify({
      data: { lesson: lessonId, completed: true },
    }),
  });
}

export async function getMyProgress(
  courseDocumentId: string
): Promise<StrapiResponse<Progress[]>> {
  return fetchAPI(`/api/progresses/my/${courseDocumentId}`);
}
