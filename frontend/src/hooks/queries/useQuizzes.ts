'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizResult,
  getMyQuizResults,
  getQuizResult,
} from '@/lib/api/quizzes';
import type { Quiz, QuizInput, QuizResult } from '@/types';
import { courseKeys } from './useCourses';

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (courseDocId?: string) => [...quizKeys.lists(), { courseDocId }] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: string) => [...quizKeys.details(), id] as const,
  results: ['quiz-results'] as const,
  resultList: () => [...quizKeys.results, 'my'] as const,
  resultDetail: (id: string) => [...quizKeys.results, 'detail', id] as const,
};

/**
 * Fetch quizzes for a course or all quizzes
 */
export function useQuizzes(courseDocId?: string) {
  return useQuery({
    queryKey: quizKeys.list(courseDocId),
    queryFn: () => getQuizzes(courseDocId),
    select: (data) => data.data || [],
  });
}

/**
 * Fetch a single quiz
 */
export function useQuiz(documentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: quizKeys.detail(documentId),
    queryFn: () => getQuiz(documentId),
    select: (data) => data.data,
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Fetch current user's quiz attempt results
 */
export function useMyQuizResults(enabled: boolean = true) {
  return useQuery({
    queryKey: quizKeys.resultList(),
    queryFn: () => getMyQuizResults(),
    select: (data) => data.data || [],
    enabled,
  });
}

/**
 * Fetch single quiz result details
 */
export function useQuizResult(documentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: quizKeys.resultDetail(documentId),
    queryFn: () => getQuizResult(documentId),
    select: (data) => data.data,
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Mutation: Create quiz
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: QuizInput | Partial<Quiz>) => createQuiz(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Update quiz
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: QuizInput | Partial<Quiz> }) =>
      updateQuiz(documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: quizKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Delete quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteQuiz(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Submit quiz answers
 */
export function useSubmitQuizResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      quiz: string | number;
      score: number;
      totalQuestions: number;
      answers: Record<string, number>;
      passed: boolean;
    }) => submitQuizResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quizKeys.results });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
