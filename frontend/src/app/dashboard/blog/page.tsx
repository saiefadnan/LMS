'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts, updateBlogPost, deleteBlogPost } from '@/lib/api';
import { type BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Eye, Globe, Search, ChevronLeft, ChevronRight, FileText, PenTool, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

import { useRouter } from 'next/navigation';

export default function DashboardBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useAuthStore((s) => s.user);

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || '';

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getBlogPosts();
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load blog posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && roleType !== 'admin' && roleType !== 'content_manager') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchPosts();
    }
  }, [user, roleType, router]);

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
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(term) ||
      (p.author?.username || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;
    if (filter === 'published') return p.status === 'published';
    if (filter === 'draft') return p.status === 'draft';
    return true;
  });

  const totalPostsCount = filteredPosts.length;
  const pageCount = Math.ceil(totalPostsCount / pageSize) || 1;
  const paginatedPosts = filteredPosts.slice((page - 1) * pageSize, page * pageSize);

  const startCount = totalPostsCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalPostsCount);

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
            <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer text-xs">
              <Globe className="w-4 h-4" />
              <span>View Public Blog</span>
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </Button>
          </Link>
          <Link href="/dashboard/blog/new">
            <Button variant="primary" size="sm" className="gap-1.5 cursor-pointer text-xs">
              <Plus className="w-4 h-4" />
              <span>Write New Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-surface-100 text-surface-700 flex items-center justify-center border border-surface-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-surface-900">{posts.length}</span>
            <p className="text-xs text-surface-500 font-medium">Total Articles</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-700">{publishedCount}</span>
            <p className="text-xs text-surface-500 font-medium">Live & Published</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-bold text-amber-700">{draftCount}</span>
            <p className="text-xs text-surface-500 font-medium">Drafts in Progress</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-xs mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search article by title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-surface-900"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            All Posts ({posts.length})
          </button>
          <button
            onClick={() => {
              setFilter('published');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'published'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => {
              setFilter('draft');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === 'draft'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end lg:self-auto text-xs text-surface-500 font-medium">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-surface-50 border border-surface-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-surface-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-surface-200 p-8 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-surface-100 text-surface-400 flex items-center justify-center mx-auto mb-3">
            <PenTool className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-surface-900 mb-1 text-sm">No blog posts found</h3>
          <p className="text-xs text-surface-500 mb-4 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query or status filter.'
              : 'Click below to write your first editorial article.'}
          </p>
          <Link href="/dashboard/blog/new">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Write New Post</span>
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-xs">
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
                {paginatedPosts.map((post) => {
                  const isPublished = post.status === 'published';
                  return (
                    <tr key={post.documentId || post.id} className="hover:bg-surface-50/70 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-surface-900 max-w-xs truncate text-xs sm:text-sm">
                        {post.title}
                      </td>
                      <td className="p-4 text-surface-600 text-xs">
                        {post.author?.username || 'Editorial Team'}
                      </td>
                      <td className="p-4">
                        <Badge variant={isPublished ? 'success' : 'warning'} size="sm">
                          {isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4 text-surface-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-surface-500 hover:text-surface-900 cursor-pointer"
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
                              className="p-2 text-surface-500 hover:text-brand-600 cursor-pointer"
                              title="Edit Post"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.documentId)}
                            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
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

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-surface-200 bg-surface-50 text-xs text-surface-500">
            <div>
              Showing <span className="font-bold text-surface-900">{startCount}</span> to{' '}
              <span className="font-bold text-surface-900">{endCount}</span> of{' '}
              <span className="font-bold text-surface-900">{totalPostsCount}</span> articles
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="px-3 py-1 font-semibold text-surface-700 bg-white rounded border border-surface-200">
                Page {page} of {pageCount}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
