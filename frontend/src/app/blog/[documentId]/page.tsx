'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBlogPost } from '@/hooks/queries/useBlog';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, ArrowLeft, Share2, Newspaper } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/ui/Footer';
import { modal } from '@/stores/modal';

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const { data: post, isLoading, isError } = useBlogPost(documentId);

  const getReadingTime = (text?: string) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      modal.alert({
        title: 'Link Copied',
        message: 'Article link has been copied to your clipboard.',
        variant: 'success',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
        <div className="text-center max-w-md bg-white dark:bg-surface-900 p-8 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
            <Newspaper className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-1">Article Unavailable</h2>
          <p className="text-surface-500 dark:text-surface-400 text-xs mb-6 max-w-sm mx-auto">
            This article does not exist or has not been published yet.
          </p>
          <Link href="/blog">
            <Button variant="secondary" size="sm">Back to All Articles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-24 transition-colors duration-150">
      {/* Header Bar */}
      <div className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-0 z-20 backdrop-blur bg-white/90 dark:bg-surface-900/90">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Articles</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle size="sm" />
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-surface-600 dark:text-surface-300 cursor-pointer">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <span className="px-2.5 py-1 rounded-md bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900">
              Editorial Article
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-surface-500 dark:text-surface-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {getReadingTime(post.body || post.content)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-surface-900 dark:text-surface-50 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="flex items-center gap-3 pt-2">
            <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-base border border-brand-200 dark:border-brand-800">
              {post.author?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 dark:text-surface-100">
                {post.author?.username || 'LearnHub Editorial'}
              </p>
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Published on{' '}
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full aspect-[16/9] bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden mb-10 shadow-md">
            <img
              src={getThumbnailSrc(post.coverImage)}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 sm:p-12 border border-surface-200 dark:border-surface-800 shadow-xs">
          <div className="prose prose-surface dark:prose-invert max-w-none text-surface-800 dark:text-surface-200 leading-relaxed text-lg whitespace-pre-wrap font-serif">
            {post.body || post.content}
          </div>
        </div>

        {/* Author Bio Footer */}
        <div className="mt-12 p-8 bg-surface-100 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
            {post.author?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-surface-900 dark:text-surface-100 text-lg">
              Written by {post.author?.username || 'LearnHub Editorial'}
            </h4>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              Curriculum designer & educator at LearnHub. Passionate about software architecture, clean code, and making learning accessible for developers worldwide.
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button variant="secondary" size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Explore More Articles
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </article>
  );
}
