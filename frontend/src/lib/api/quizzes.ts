/**
 * Quizzes API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Quiz, QuizInput, QuizResult, StrapiResponse } from '@/types';

export async function getQuizzes(courseDocumentId?: string): Promise<StrapiResponse<Quiz[]>> {
  const query = courseDocumentId
    ? `?filters[course][documentId][$eq]=${courseDocumentId}&populate=*`
    : '?populate=*';
  return apiClient.get<StrapiResponse<Quiz[]>>(`${API_ENDPOINTS.QUIZZES.ROOT}${query}`);
}

export async function getQuiz(documentId: string): Promise<StrapiResponse<Quiz>> {
  return apiClient.get<StrapiResponse<Quiz>>(
    `${API_ENDPOINTS.QUIZZES.DETAIL(documentId)}?populate=*`
  );
}

export async function createQuiz(data: QuizInput | Partial<Quiz>): Promise<StrapiResponse<Quiz>> {
  return apiClient.post<StrapiResponse<Quiz>>(API_ENDPOINTS.QUIZZES.ROOT, { data });
}

export async function updateQuiz(
  documentId: string,
  data: QuizInput | Partial<Quiz>
): Promise<StrapiResponse<Quiz>> {
  return apiClient.put<StrapiResponse<Quiz>>(API_ENDPOINTS.QUIZZES.DETAIL(documentId), { data });
}

export async function deleteQuiz(documentId: string): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.QUIZZES.DETAIL(documentId));
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
  return apiClient.post<StrapiResponse<QuizResult>>(API_ENDPOINTS.QUIZ_RESULTS.ROOT, { data });
}

export async function getMyQuizResults(): Promise<StrapiResponse<QuizResult[]>> {
  return apiClient.get<StrapiResponse<QuizResult[]>>(`${API_ENDPOINTS.QUIZ_RESULTS.ROOT}?populate=*`);
}

export async function getQuizResult(documentId: string): Promise<StrapiResponse<QuizResult>> {
  return apiClient.get<StrapiResponse<QuizResult>>(
    `${API_ENDPOINTS.QUIZ_RESULTS.DETAIL(documentId)}?populate=*`
  );
}
