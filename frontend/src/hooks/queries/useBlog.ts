'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/api/blog';
import type { BlogPost, BlogPostInput } from '@/types';

// Query Keys Constant Factory
export const blogKeys = {
  all: ['blog-posts'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (query: string) => [...blogKeys.lists(), { query }] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
};

/**
 * Fetch all public or dashboard blog posts
 */
export function useBlogPosts(query: string = '') {
  return useQuery({
    queryKey: blogKeys.list(query),
    queryFn: () => getBlogPosts(query),
    select: (data) => data.data || [],
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
