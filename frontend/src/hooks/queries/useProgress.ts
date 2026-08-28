'use client';

import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProgress, markLessonComplete } from '@/lib/api/progress';
import { courseKeys } from './useCourses';
import type { Enrollment, Progress, StrapiResponse } from '@/types';

export const progressKeys = {
  all: ['progress'] as const,
  course: (courseDocId: string) => [...progressKeys.all, courseDocId] as const,
};

/**
 * Fetch current user's lesson completion progress for a single course
 */
export function useCourseProgress(courseDocId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: progressKeys.course(courseDocId),
    queryFn: () => getMyProgress(courseDocId),
    select: (data) => data.data || [],
    enabled: Boolean(courseDocId) && enabled,
  });
}

/**
 * Fetch progress across all enrolled courses in parallel with TanStack cache
 */
export function useMyEnrollmentsProgress(enrollments: Enrollment[]) {
  const validCourses = enrollments
    .map((e) => e.course)
    .filter((c): c is NonNullable<typeof c> => Boolean(c?.documentId));

  const progressQueries = useQueries({
    queries: validCourses.map((course) => ({
      queryKey: progressKeys.course(course.documentId),
      queryFn: () => getMyProgress(course.documentId),
      select: (res: StrapiResponse<Progress[]>) => res.data || [],
    })),
  });

  const progressMap: Record<string, { completed: number; total: number; percentage: number }> = {};

  validCourses.forEach((course, idx) => {
    const query = progressQueries[idx];
    const progressList: Progress[] = (query?.data as Progress[]) || [];
    const completedCount = progressList.filter((p) => p.completed).length;
    const totalLessons = course.lessons?.length || 0;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    progressMap[course.documentId] = {
      completed: completedCount,
      total: totalLessons,
      percentage,
    };
  });

  const isLoading = progressQueries.some((q) => q.isLoading);

  return {
    progressMap,
    isLoading,
  };
}

/**
 * Mutation: Mark lesson complete with instant cache updates
 */
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, courseDocId }: { lessonId: string | number; courseDocId?: string }) =>
      markLessonComplete(lessonId),
    onSuccess: (_, { courseDocId }) => {
      if (courseDocId) {
        queryClient.invalidateQueries({ queryKey: progressKeys.course(courseDocId) });
      } else {
        queryClient.invalidateQueries({ queryKey: progressKeys.all });
      }
      queryClient.invalidateQueries({ queryKey: courseKeys.myEnrollments() });
    },
  });
}
