'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
} from '@/lib/api/lessons';
import type { Lesson, LessonInput } from '@/types';
import { courseKeys } from './useCourses';

export const lessonKeys = {
  all: ['lessons'] as const,
  course: (courseDocId: string) => [...lessonKeys.all, 'course', courseDocId] as const,
  detail: (id: string) => [...lessonKeys.all, 'detail', id] as const,
};

/**
 * Fetch lessons for a course
 */
export function useLessons(courseDocId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: lessonKeys.course(courseDocId),
    queryFn: () => getLessons(courseDocId),
    select: (data) => data.data || [],
    enabled: Boolean(courseDocId) && enabled,
  });
}

/**
 * Fetch single lesson
 */
export function useLesson(documentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: lessonKeys.detail(documentId),
    queryFn: () => getLesson(documentId),
    select: (data) => data.data,
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Mutation: Create lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LessonInput | Partial<Lesson>) => createLesson(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Update lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: LessonInput | Partial<Lesson> }) =>
      updateLesson(documentId, data),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Delete lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteLesson(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lessonKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}
