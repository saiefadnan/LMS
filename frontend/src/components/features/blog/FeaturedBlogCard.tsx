'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { Newspaper, Calendar, Clock, ArrowRight, FileText } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

interface FeaturedBlogCardProps {
  post: BlogPost;
}

export function FeaturedBlogCard({ post }: FeaturedBlogCardProps) {
  const getReadingTime = (text?: string) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all group">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 relative aspect-video lg:aspect-auto h-full min-h-[260px] bg-surface-100 dark:bg-surface-800 overflow-hidden">
          {post.coverImage ? (
            <img
              src={getThumbnailSrc(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-teal-50 dark:from-brand-950 dark:to-surface-900 text-brand-400">
              <FileText className="w-16 h-16 stroke-[1.2]" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/90 backdrop-blur-xs text-white text-xs font-bold tracking-wide shadow-xs">
              <Newspaper className="w-3.5 h-3.5" />
              <span>Featured Article</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-xs text-surface-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {getReadingTime(post.body || post.content)}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
              <Link href={`/blog/${post.documentId || post.id}`}>
                {post.title}
              </Link>
            </h2>

            <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed line-clamp-3">
              {post.body || post.content || 'Read this in-depth guide written by our instructors and editorial leads.'}
            </p>
          </div>

          <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-xs font-bold">
                {post.author?.username?.charAt(0).toUpperCase() || 'E'}
              </div>
              <div>
                <p className="text-xs font-bold text-surface-900 dark:text-surface-100">
                  {post.author?.username || 'Editorial Team'}
                </p>
                <p className="text-[11px] text-surface-400">Contributor</p>
              </div>
            </div>

            <Link href={`/blog/${post.documentId || post.id}`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
