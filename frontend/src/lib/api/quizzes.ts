/**
 * Quizzes API
 */
import { fetchAPI } from './client';
import type { Quiz, QuizResult, StrapiResponse } from '@/types';

export async function getQuiz(documentId: string): Promise<StrapiResponse<Quiz>> {
  return fetchAPI(`/api/quizzes/${documentId}?populate=*`);
}

export async function submitQuizResult(
  data: Partial<QuizResult>
): Promise<StrapiResponse<QuizResult>> {
  return fetchAPI('/api/quiz-results', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}
