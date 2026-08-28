'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBlogPost, useUpdateBlogPost } from '@/hooks/queries/useBlog';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Globe, AlertCircle, ExternalLink } from 'lucide-react';

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const documentId = params.documentId as string;

  const { data: post, isLoading: initialLoading } = useBlogPost(documentId);
  const updateMutation = useUpdateBlogPost();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState('');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || '';

  useEffect(() => {
    if (user && roleType !== 'admin' && roleType !== 'content_manager') {
      router.push('/dashboard');
    }
  }, [user, roleType, router]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setBody(post.body || post.content || '');
      setCoverImage(
        typeof post.coverImage === 'string'
          ? post.coverImage
          : post.coverImage?.url || ''
      );
      setStatus(post.status || 'draft');
    }
  }, [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a post title.');
      return;
    }
    if (!body.trim()) {
      setError('Please enter article body text.');
      return;
    }

    try {
      setError('');

      await updateMutation.mutateAsync({
        documentId,
        data: {
          title: title.trim(),
          body: body.trim(),
          coverImage: coverImage.trim() || undefined,
          status,
        },
      });

      router.push('/dashboard/blog');
    } catch (err: any) {
      console.error('Failed to update blog post:', err);
      setError(err.message || 'Failed to save blog post.');
    }
  };

  if (initialLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog"
            className="text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </Link>
        </div>

        {status === 'published' && (
          <Link href={`/blog/${documentId}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </Button>
          </Link>
        )}
      </div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">Edit Article</h1>
      <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">
        Update your publication content and settings.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <Input
              label="Article Title"
              placeholder="e.g. Master C Memory Management in 10 Steps"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
            {coverImage.trim() && (
              <div className="mt-3 aspect-video max-h-48 rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <Textarea
              label="Article Content (Supports Markdown & formatted paragraphs)"
              placeholder="Write your article content here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              className="font-serif leading-relaxed text-base"
              required
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="publishNow"
              checked={status === 'published'}
              onChange={(e) => setStatus(e.target.checked ? 'published' : 'draft')}
              className="w-4 h-4 text-emerald-600 rounded border-surface-300 dark:border-surface-700 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="publishNow" className="text-sm font-medium text-surface-700 dark:text-surface-300 cursor-pointer">
              Publish immediately (visible on public blog)
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/blog">
            <Button type="button" variant="ghost" disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={updateMutation.isPending}
            className={status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer' : 'cursor-pointer'}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
