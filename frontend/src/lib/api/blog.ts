/**
 * Blog API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { BlogPost, BlogPostInput, StrapiResponse } from '@/types';

export async function getBlogPosts(
  query: string = ''
): Promise<StrapiResponse<BlogPost[]>> {
  return apiClient.get<StrapiResponse<BlogPost[]>>(
    `${API_ENDPOINTS.BLOG.ROOT}?populate=*&sort=createdAt:desc${query ? `&${query}` : ''}`
  );
}

export async function getBlogPost(
  documentId: string
): Promise<StrapiResponse<BlogPost>> {
  return apiClient.get<StrapiResponse<BlogPost>>(
    `${API_ENDPOINTS.BLOG.DETAIL(documentId)}?populate=*`
  );
}

export async function createBlogPost(
  data: BlogPostInput | Partial<BlogPost>
): Promise<StrapiResponse<BlogPost>> {
  return apiClient.post<StrapiResponse<BlogPost>>(API_ENDPOINTS.BLOG.ROOT, { data });
}

export async function updateBlogPost(
  documentId: string,
  data: BlogPostInput | Partial<BlogPost>
): Promise<StrapiResponse<BlogPost>> {
  return apiClient.put<StrapiResponse<BlogPost>>(API_ENDPOINTS.BLOG.DETAIL(documentId), { data });
}

export async function deleteBlogPost(documentId: string): Promise<void> {
  return apiClient.delete<void>(API_ENDPOINTS.BLOG.DETAIL(documentId));
}
