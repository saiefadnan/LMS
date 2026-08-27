'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBlogPost } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft } from 'lucide-react';

export default function NewBlogPostPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || '';

  useEffect(() => {
    if (user && roleType !== 'admin' && roleType !== 'content_manager') {
      router.push('/dashboard');
    }
  }, [user, roleType, router]);

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
      setLoading(true);
      setError('');

      await createBlogPost({
        title: title.trim(),
        body: body.trim(),
        coverImage: coverImage.trim() || undefined,
        status,
      });

      router.push('/dashboard/blog');
    } catch (err: any) {
      console.error('Failed to create blog post:', err);
      setError(err.message || 'Failed to save blog post.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/blog" className="text-surface-500 hover:text-surface-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Write New Article</h1>
          <p className="text-surface-500 text-sm">Publish tutorials, guides, and platform updates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 space-y-6 shadow-sm">
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
              <div className="mt-3 aspect-video max-h-48 rounded-xl overflow-hidden bg-surface-100 border border-surface-200">
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
              className="w-4 h-4 text-emerald-600 rounded border-surface-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="publishNow" className="text-sm font-medium text-surface-700 cursor-pointer">
              Publish immediately (visible on public blog)
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard/blog">
            <Button type="button" variant="ghost" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={loading}
            className={status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
          >
            {status === 'published' ? 'Publish Article 🚀' : 'Save as Draft 💾'}
          </Button>
        </div>
      </form>
    </div>
  );
}
