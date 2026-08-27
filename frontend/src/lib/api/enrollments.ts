/**
 * Enrollments API
 */
import { fetchAPI } from './client';
import type { Enrollment, StrapiResponse } from '@/types';

export async function enrollInCourse(courseId: string | number): Promise<StrapiResponse<Enrollment>> {
  return fetchAPI('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ data: { course: courseId } }),
  });
}

export async function getMyEnrollments(): Promise<StrapiResponse<Enrollment[]>> {
  return fetchAPI('/api/enrollments/my');
}
