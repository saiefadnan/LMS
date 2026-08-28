'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  type BlogQueryParams,
} from '@/lib/api/blog';
import type { BlogPost, BlogPostInput } from '@/types';

// Query Keys Constant Factory
export const blogKeys = {
  all: ['blog-posts'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (params: BlogQueryParams = {}) => [...blogKeys.lists(), params] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
};

/**
 * Fetch all public or dashboard blog posts with server pagination & filtering
 */
export function useBlogPosts(params: BlogQueryParams = {}) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => getBlogPosts(params),
    select: (res) => ({
      posts: res.data || [],
      pagination: res.meta?.pagination || {
        page: 1,
        pageSize: 10,
        pageCount: 1,
        total: res.data?.length || 0,
      },
    }),
  });
}

/**
 * Fetch a single blog post by documentId
 */
export function useBlogPost(documentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: blogKeys.detail(documentId),
    queryFn: () => getBlogPost(documentId),
    select: (data) => data.data,
    enabled: Boolean(documentId) && enabled,
  });
}

/**
 * Mutation: Create a new blog post
 */
export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlogPostInput | Partial<BlogPost>) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}

/**
 * Mutation: Update blog post details or publish status
 */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: BlogPostInput | Partial<BlogPost> }) =>
      updateBlogPost(documentId, data),
    onSuccess: (res, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(documentId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
}

/**
 * Mutation: Delete blog post
 */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteBlogPost(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all });
    },
  });
}
