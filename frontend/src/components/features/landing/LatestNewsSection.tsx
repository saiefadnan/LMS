'use client';

import React from 'react';
import Link from 'next/link';
import { BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

interface LatestNewsSectionProps {
  posts: BlogPost[];
}

export function LatestNewsSection({ posts }: LatestNewsSectionProps) {
  return (
    <section className="py-20 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Publications
            </span>
            <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight mt-1">
              Stay updated with our news and blog
            </h2>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold cursor-pointer">
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-video bg-surface-200 dark:bg-surface-800 overflow-hidden">
                  <img
                    src={getThumbnailSrc(post.coverImage)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-surface-400 mb-2">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-brand-600 font-semibold">
                        {post.author?.username || 'Editorial'}
                      </span>
                    </div>
                    <h3 className="font-bold text-surface-900 dark:text-surface-100 text-base group-hover:text-brand-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </div>

                  <Link href={`/blog/${post.documentId}`}>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:underline">
                      Read Article →
                    </span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            [
              { title: 'Why C Memory Management Still Matters in Modern Systems', date: 'Aug 27' },
              { title: 'Top 5 Tech Skills to Learn for 2026 Career Growth', date: 'Aug 26' },
              { title: 'How Auto-Graded MCQ Quizzes Boost Knowledge Retention', date: 'Aug 25' },
            ].map((b, i) => (
              <div key={i} className="bg-surface-50 dark:bg-surface-950 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 space-y-3">
                <span className="text-[11px] text-surface-400">{b.date}</span>
                <h3 className="font-bold text-surface-900 dark:text-surface-100 text-sm">{b.title}</h3>
                <Link href="/blog">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">Read Article →</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
