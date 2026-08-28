'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, Edit, Trash2, PenTool, Plus } from 'lucide-react';

interface BlogManagementTableProps {
  posts: BlogPost[];
  onToggleStatus: (post: BlogPost) => void;
  onDelete: (documentId: string) => void;
  searchQuery: string;
}

export function BlogManagementTable({
  posts,
  onToggleStatus,
  onDelete,
  searchQuery,
}: BlogManagementTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 p-8 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500 flex items-center justify-center mx-auto mb-3">
          <PenTool className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-surface-900 dark:text-surface-100 mb-1 text-sm">
          No blog posts found
        </h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 mb-4 max-w-sm mx-auto">
          {searchQuery
            ? 'Try adjusting your search query or status filter.'
            : 'Click below to write your first editorial article.'}
        </p>
        <Link href="/dashboard/blog/new">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Post</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-surface-50 dark:bg-surface-800/60 border-b border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created Date</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {posts.map((post) => {
              const isPublished = post.status === 'published';
              return (
                <tr
                  key={post.documentId || post.id}
                  className="hover:bg-surface-50/70 dark:hover:bg-surface-800/40 transition-colors"
                >
                  <td className="p-4 pl-6 font-semibold text-surface-900 dark:text-surface-100 max-w-xs truncate text-xs sm:text-sm">
                    {post.title}
                  </td>
                  <td className="p-4 text-surface-600 dark:text-surface-400 text-xs">
                    {post.author?.username || 'Editorial Team'}
                  </td>
                  <td className="p-4">
                    <Badge variant={isPublished ? 'success' : 'warning'} size="sm">
                      {isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="p-4 text-surface-500 dark:text-surface-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(post)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                          isPublished
                            ? 'bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                        }`}
                        title={isPublished ? 'Unpublish to draft' : 'Publish to live site'}
                      >
                        {isPublished ? 'Unpublish' : 'Publish Live'}
                      </button>

                      {isPublished && (
                        <Link href={`/blog/${post.documentId}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 cursor-pointer"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}

                      <Link href={`/dashboard/blog/${post.documentId}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(post.documentId)}
                        className="p-2 text-surface-400 dark:text-surface-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
