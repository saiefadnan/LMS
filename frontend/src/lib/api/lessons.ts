/**
 * Lessons API
 */
import { fetchAPI } from './client';
import type { Lesson, LessonInput, StrapiResponse } from '@/types';

export async function getLessons(
  courseDocumentId: string
): Promise<StrapiResponse<Lesson[]>> {
  return fetchAPI(
    `/api/lessons?filters[course][documentId][$eq]=${courseDocumentId}&populate=*&sort=order:asc`
  );
}

export async function getLesson(documentId: string): Promise<StrapiResponse<Lesson>> {
  return fetchAPI(`/api/lessons/${documentId}?populate=*`);
}

export async function createLesson(data: LessonInput | Partial<Lesson>): Promise<StrapiResponse<Lesson>> {
  return fetchAPI('/api/lessons', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateLesson(
  documentId: string,
  data: LessonInput | Partial<Lesson>
): Promise<StrapiResponse<Lesson>> {
  return fetchAPI(`/api/lessons/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteLesson(documentId: string): Promise<void> {
  return fetchAPI(`/api/lessons/${documentId}`, { method: 'DELETE' });
}
