'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBlogPosts, useUpdateBlogPost, useDeleteBlogPost } from '@/hooks/queries/useBlog';
import { type BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { BlogMetricCards } from '@/components/features/blog/BlogMetricCards';
import { BlogTableFilters } from '@/components/features/blog/BlogTableFilters';
import { BlogManagementTable } from '@/components/features/blog/BlogManagementTable';
import { Plus, Globe, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { modal } from '@/stores/modal';

export default function DashboardBlogPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || '';

  useEffect(() => {
    if (user && roleType !== 'admin' && roleType !== 'content_manager') {
      router.push('/dashboard');
    }
  }, [user, roleType, router]);

  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Server-side paginated queries
  const { data, isLoading } = useBlogPosts({
    page,
    pageSize,
    search: searchQuery,
    status: filter !== 'all' ? filter : undefined,
  });

  // Overall metric query
  const allPostsQuery = useBlogPosts();
  const allPosts = allPostsQuery.data?.posts || [];

  const updateMutation = useUpdateBlogPost();
  const deleteMutation = useDeleteBlogPost();

  const posts = data?.posts || [];
  const pagination = data?.pagination || { page: 1, pageSize: 10, pageCount: 1, total: 0 };

  const handleToggleStatus = async (post: BlogPost) => {
    const nextStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updateMutation.mutateAsync({
        documentId: post.documentId,
        data: { status: nextStatus },
      });
    } catch (err: any) {
      modal.alert({
        title: 'Status Update Failed',
        message: err.message || 'Failed to update post status.',
        variant: 'danger',
      });
    }
  };

  const handleDelete = async (postDocId: string) => {
    const confirmed = await modal.confirm({
      title: 'Delete Publication Post',
      message: 'Are you sure you want to permanently delete this blog article? This action cannot be undone.',
      variant: 'danger',
      confirmText: 'Delete Article',
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(postDocId);
    } catch (err: any) {
      modal.alert({
        title: 'Deletion Failed',
        message: err.message || 'Failed to delete blog post.',
        variant: 'danger',
      });
    }
  };

  const publishedCount = allPosts.filter((p) => p.status === 'published').length;
  const draftCount = allPosts.filter((p) => p.status === 'draft').length;

  const totalPostsCount = pagination.total;
  const pageCount = pagination.pageCount;
  const startCount = totalPostsCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalPostsCount);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50">Blog & Editorial Manager</h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">
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
      <BlogMetricCards
        totalCount={allPosts.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
      />

      {/* Search & Filter Bar */}
      <BlogTableFilters
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        filter={filter}
        onFilterChange={(f) => {
          setFilter(f);
          setPage(1);
        }}
        totalCount={allPosts.length}
        publishedCount={publishedCount}
        draftCount={draftCount}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      {/* Posts Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <BlogManagementTable
            posts={posts}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            searchQuery={searchQuery}
          />

          {posts.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-surface-200 dark:border-surface-800 rounded-xl bg-white dark:bg-surface-900 text-xs text-surface-500 dark:text-surface-400">
              <div>
                Showing <span className="font-bold text-surface-900 dark:text-surface-100">{startCount}</span> to{' '}
                <span className="font-bold text-surface-900 dark:text-surface-100">{endCount}</span> of{' '}
                <span className="font-bold text-surface-900 dark:text-surface-100">{totalPostsCount}</span> articles
              </div>

              <Pagination
                currentPage={page}
                totalPages={pageCount}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
