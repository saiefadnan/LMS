'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, updateBlogPost, deleteBlogPost } from '@/lib/api';
import { type BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, Eye, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export default function DashboardBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const user = useAuthStore((s) => s.user);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // For editors/admins, backend returns all posts including drafts
      const res = await getBlogPosts();
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load blog posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updateBlogPost(post.documentId, { status: nextStatus });
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to update post status');
    }
  };

  const handleDelete = async (postDocId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteBlogPost(postDocId);
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog post');
    }
  };

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  const filteredPosts = posts.filter((p) => {
    if (filter === 'published') return p.status === 'published';
    if (filter === 'draft') return p.status === 'draft';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Blog & Editorial Manager</h1>
          <p className="text-surface-500 text-sm mt-1">
            Create, edit, and publish platform announcements and tutorial articles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/blog" target="_blank">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Globe className="w-4 h-4" />
              View Public Blog ↗
            </Button>
          </Link>
          <Link href="/dashboard/blog/new">
            <Button variant="primary" className="gap-2">
              <Plus className="w-4 h-4" />
              Write New Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xl font-bold">
            📄
          </div>
          <div>
            <span className="text-2xl font-black text-surface-900">{posts.length}</span>
            <p className="text-xs text-surface-500">Total Articles</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            🌐
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-600">{publishedCount}</span>
            <p className="text-xs text-surface-500">Live & Published</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
            ✏️
          </div>
          <div>
            <span className="text-2xl font-black text-amber-600">{draftCount}</span>
            <p className="text-xs text-surface-500">Drafts in Progress</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-200 mb-6 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-brand-50 text-brand-700'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          All Posts ({posts.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'published'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'draft'
              ? 'bg-amber-50 text-amber-700'
              : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
          }`}
        >
          Drafts ({draftCount})
        </button>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-surface-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-surface-300 p-6">
          <span className="text-4xl block mb-2">✍️</span>
          <h3 className="font-bold text-surface-900 mb-1">No blog posts in this view</h3>
          <p className="text-sm text-surface-500 mb-4">
            Click below to write your next article.
          </p>
          <Link href="/dashboard/blog/new">
            <Button variant="secondary" size="sm">
              + Write New Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredPosts.map((post) => {
                  const isPublished = post.status === 'published';
                  return (
                    <tr key={post.documentId || post.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="p-4 pl-6 font-medium text-surface-900 max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="p-4 text-surface-600">
                        {post.author?.username || 'You'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPublished ? '● Published' : '○ Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-surface-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                              isPublished
                                ? 'bg-surface-50 text-surface-700 border-surface-200 hover:bg-surface-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={isPublished ? 'Unpublish to draft' : 'Publish to live site'}
                          >
                            {isPublished ? 'Unpublish' : 'Publish Live'}
                          </button>

                          {isPublished && (
                            <Link href={`/blog/${post.documentId}`} target="_blank">
                              <Button variant="ghost" size="sm" className="p-2 text-surface-500 hover:text-surface-900" title="View Public Page">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          )}

                          <Link href={`/dashboard/blog/${post.documentId}/edit`}>
                            <Button variant="ghost" size="sm" className="p-2 text-surface-500 hover:text-brand-600" title="Edit Post">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.documentId)}
                            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50"
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
      )}
    </div>
  );
}
