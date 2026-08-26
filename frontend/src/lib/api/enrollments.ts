/**
 * Enrollments API
 */
import { fetchAPI } from './client';
import type { Enrollment, StrapiResponse } from '@/types';

export async function enrollInCourse(courseId: number): Promise<StrapiResponse<Enrollment>> {
  return fetchAPI('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ data: { course: courseId } }),
  });
}

export async function getMyEnrollments(userId?: number): Promise<StrapiResponse<Enrollment[]>> {
  const filter = userId ? `&filters[student][id][$eq]=${userId}` : '';
  return fetchAPI(`/api/enrollments?populate[course][populate]=*${filter}`);
}
