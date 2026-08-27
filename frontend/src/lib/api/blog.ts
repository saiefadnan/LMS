/**
 * Blog API
 */
import { fetchAPI } from './client';
import type { BlogPost, BlogPostInput, StrapiResponse } from '@/types';

export async function getBlogPosts(
  query: string = ''
): Promise<StrapiResponse<BlogPost[]>> {
  return fetchAPI(
    `/api/blog-posts?populate=*&sort=createdAt:desc${query ? `&${query}` : ''}`
  );
}

export async function getBlogPost(
  documentId: string
): Promise<StrapiResponse<BlogPost>> {
  return fetchAPI(`/api/blog-posts/${documentId}?populate=*`);
}

export async function createBlogPost(
  data: BlogPostInput | Partial<BlogPost>
): Promise<StrapiResponse<BlogPost>> {
  return fetchAPI('/api/blog-posts', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function updateBlogPost(
  documentId: string,
  data: BlogPostInput | Partial<BlogPost>
): Promise<StrapiResponse<BlogPost>> {
  return fetchAPI(`/api/blog-posts/${documentId}`, {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

export async function deleteBlogPost(documentId: string): Promise<void> {
  return fetchAPI(`/api/blog-posts/${documentId}`, { method: 'DELETE' });
}
