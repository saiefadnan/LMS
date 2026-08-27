/**
 * Quizzes API
 */
import { fetchAPI } from './client';
import type { Quiz, QuizInput, QuizResult, StrapiResponse } from '@/types';

export async function getQuizzes(courseDocumentId?: string): Promise<StrapiResponse<Quiz[]>> {
  const query = courseDocumentId
    ? `?filters[course][documentId][$eq]=${courseDocumentId}&populate=*`
    : '?populate=*';
  return fetchAPI(`/api/quizzes${query}`);
}

export async function getQuiz(documentId: string): Promise<StrapiResponse<Quiz>> {
  return fetchAPI(`/api/quizzes/${documentId}?populate=*`);
}

export async function createQuiz(data: QuizInput | Partial<Quiz>): Promise<StrapiResponse<Quiz>> {
  return fetchAPI('/api/quizzes', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateQuiz(
  documentId: string,
  data: QuizInput | Partial<Quiz>
): Promise<StrapiResponse<Quiz>> {
  return fetchAPI(`/api/quizzes/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteQuiz(documentId: string): Promise<void> {
  return fetchAPI(`/api/quizzes/${documentId}`, { method: 'DELETE' });
}

export async function submitQuizResult(
  data: {
    quiz: string | number;
    score: number;
    totalQuestions: number;
    answers: Record<string, number>;
    passed: boolean;
  }
): Promise<StrapiResponse<QuizResult>> {
  return fetchAPI('/api/quiz-results', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function getMyQuizResults(): Promise<StrapiResponse<QuizResult[]>> {
  return fetchAPI('/api/quiz-results?populate=*');
}

export async function getQuizResult(documentId: string): Promise<StrapiResponse<QuizResult>> {
  return fetchAPI(`/api/quiz-results/${documentId}?populate=*`);
}
