/**
 * Progress API
 */
import { fetchAPI } from './client';
import type { Progress, StrapiResponse } from '@/types';

export async function markLessonComplete(
  lessonId: number,
  courseId: number
): Promise<StrapiResponse<Progress>> {
  return fetchAPI('/api/progresses', {
    method: 'POST',
    body: JSON.stringify({
      data: { lesson: lessonId, course: courseId, completed: true },
    }),
  });
}

export async function getMyProgress(
  courseDocumentId: string
): Promise<StrapiResponse<Progress[]>> {
  return fetchAPI(
    `/api/progresses?filters[course][documentId][$eq]=${courseDocumentId}&filters[student][id][$eq]=me&populate=lesson`
  );
}
