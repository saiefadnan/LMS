/**
 * Blog API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from '@/config/endpoints';
import type { BlogPost, BlogPostInput, StrapiResponse } from '@/types';

export interface BlogQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export async function getBlogPosts(
  params: BlogQueryParams = {}
): Promise<StrapiResponse<BlogPost[]>> {
  const query = new URLSearchParams();
  query.set('populate', '*');
  query.set('sort', params.sort || 'createdAt:desc');

  if (params.page) query.set('pagination[page]', String(params.page));
  if (params.pageSize) query.set('pagination[pageSize]', String(params.pageSize));
  if (params.status && params.status !== 'all') {
    query.set('filters[status][$eq]', params.status);
  }
  if (params.search && params.search.trim()) {
    query.set('filters[title][$containsi]', params.search.trim());
  }

  const qStr = query.toString();
  return apiClient.get<StrapiResponse<BlogPost[]>>(
    `${API_ENDPOINTS.BLOG.ROOT}?${qStr}`
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
