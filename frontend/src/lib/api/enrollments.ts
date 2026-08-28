/**
 * Enrollments API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { Enrollment, StrapiResponse } from '@/types';

export async function enrollInCourse(courseId: string | number): Promise<StrapiResponse<Enrollment>> {
  return apiClient.post<StrapiResponse<Enrollment>>(API_ENDPOINTS.ENROLLMENTS.ROOT, {
    data: { course: courseId },
  });
}

export async function getMyEnrollments(): Promise<StrapiResponse<Enrollment[]>> {
  return apiClient.get<StrapiResponse<Enrollment[]>>(API_ENDPOINTS.ENROLLMENTS.MY);
}
