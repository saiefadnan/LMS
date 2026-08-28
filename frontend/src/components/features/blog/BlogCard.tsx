'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowRight, FileText } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const getReadingTime = (text?: string) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <article className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group">
      <div className="h-44 bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
        {post.coverImage ? (
          <img
            src={getThumbnailSrc(post.coverImage)}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-800 dark:to-surface-900 text-surface-400 dark:text-surface-500">
            <FileText className="w-10 h-10 stroke-[1.5]" />
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-xs text-surface-400 font-medium">
            <span>
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span>•</span>
            <span>{getReadingTime(post.body || post.content)}</span>
          </div>

          <h3 className="font-bold text-surface-900 dark:text-surface-50 text-base leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
            <Link href={`/blog/${post.documentId || post.id}`}>
              {post.title}
            </Link>
          </h3>

          <p className="text-surface-500 dark:text-surface-400 text-xs line-clamp-2 leading-relaxed">
            {post.body || post.content || 'Read this editorial guide to explore new concepts and practical takeaways.'}
          </p>
        </div>

        <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-[10px] font-bold">
              {post.author?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <span className="text-xs text-surface-600 dark:text-surface-300 font-medium truncate max-w-[120px]">
              {post.author?.username || 'Editorial Team'}
            </span>
          </div>

          <Link href={`/blog/${post.documentId || post.id}`}>
            <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto font-bold text-xs text-brand-600 dark:text-brand-400 hover:bg-transparent">
              <span>Read</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
