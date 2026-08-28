'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCourses,
  getMyCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudentProgress,
} from '@/lib/api/courses';
import { enrollInCourse, getMyEnrollments } from '@/lib/api/enrollments';
import type { Course, CourseInput } from '@/types';

// Query Keys Constant Factory
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (query: string) => [...courseKeys.lists(), { query }] as const,
  myCourses: () => [...courseKeys.all, 'my-courses'] as const,
  myEnrollments: () => ['enrollments', 'my'] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  progress: (id: string, params: any) => [...courseKeys.detail(id), 'student-progress', params] as const,
};

/**
 * Fetch public or filtered courses catalog
 */
export function useCourses(query: string = '') {
  return useQuery({
    queryKey: courseKeys.list(query),
    queryFn: () => getCourses(query),
    select: (data) => data.data || [],
  });
}

/**
 * Fetch instructor authored courses or all courses for managers
 */
export function useMyCourses(enabled: boolean = true) {
  return useQuery({
    queryKey: courseKeys.myCourses(),
    queryFn: () => getMyCourses(),
    select: (data) => data.data || [],
    enabled,
  });
}

/**
 * Fetch single course detail with lessons, quizzes, instructor
 */
export function useCourse(documentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: courseKeys.detail(documentId),
    queryFn: () => getCourse(documentId),
    select: (data) => data.data,
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Fetch current student's enrolled courses
 */
export function useMyEnrollments(enabled: boolean = true) {
  return useQuery({
    queryKey: courseKeys.myEnrollments(),
    queryFn: () => getMyEnrollments(),
    select: (data) => data.data || [],
    enabled,
  });
}

/**
 * Fetch student roster and progress metrics for a course (instructor/admin view)
 */
export function useCourseStudentProgress(
  documentId: string,
  params: { page?: number; pageSize?: number; search?: string } = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: courseKeys.progress(documentId, params),
    queryFn: () => getCourseStudentProgress(documentId, params),
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Mutation: Enroll current student in a course
 */
export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string | number) => enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.myEnrollments() });
      if (typeof courseId === 'string') {
        queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      }
    },
  });
}

/**
 * Mutation: Create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseInput | Partial<Course>) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
    },
  });
}

/**
 * Mutation: Update course details
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: CourseInput | Partial<Course> }) =>
      updateCourse(documentId, data),
    onSuccess: (res, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: courseKeys.myCourses() });
    },
  });
}

/**
 * Mutation: Delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteCourse(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all });
      queryClient.invalidateQueries({ queryKey: courseKeys.myEnrollments() });
    },
  });
}
