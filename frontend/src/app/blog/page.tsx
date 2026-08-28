'use client';

import { useState } from 'react';
import { useBlogPosts } from '@/hooks/queries/useBlog';
import { Navbar } from '@/components/ui/Navbar';
import { PageHero } from '@/components/ui/PageHero';
import { Footer } from '@/components/ui/Footer';
import { Pagination } from '@/components/ui/Pagination';
import { FeaturedBlogCard } from '@/components/features/blog/FeaturedBlogCard';
import { BlogCard } from '@/components/features/blog/BlogCard';
import { BookOpen } from 'lucide-react';

export default function BlogIndexPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filteredPosts = posts.filter((post) => {
    const term = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      (post.body || post.content || '').toLowerCase().includes(term) ||
      (post.author?.username || '').toLowerCase().includes(term)
    );
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const allRemainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];
  const pageCount = Math.ceil(allRemainingPosts.length / pageSize) || 1;
  const paginatedRemainingPosts = allRemainingPosts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col transition-colors duration-150">
      <Navbar />

      <PageHero
        badgeIcon={<BookOpen className="w-4 h-4" />}
        badgeText="LearnHub Publication"
        title="Insights, Tutorials & Updates"
        description="Deep dive into software engineering concepts, curriculum breakdowns, and student learning guides."
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchPlaceholder="Search articles by title or keyword..."
      />

      <div className="max-w-6xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 flex-grow">
        {isLoading ? (
          <div className="space-y-12 animate-pulse w-full">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 h-72 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 h-80 w-full"
                />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs max-w-md mx-auto p-8">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3 text-surface-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-surface-900 dark:text-surface-50 text-base mb-1">No articles found</h3>
            <p className="text-surface-500 dark:text-surface-400 text-xs">
              {searchQuery ? 'Try adjusting your search terms.' : 'Articles will be published shortly.'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Article Top Slot */}
            {featuredPost && <FeaturedBlogCard post={featuredPost} />}

            {/* Remaining Articles Grid */}
            {paginatedRemainingPosts.length > 0 && (
              <div className="space-y-6 pt-4 border-t border-surface-200 dark:border-surface-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Latest Articles</h2>
                  <span className="text-xs text-surface-500 font-medium">
                    Showing {paginatedRemainingPosts.length} of {allRemainingPosts.length} post{allRemainingPosts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedRemainingPosts.map((post) => (
                    <BlogCard key={post.documentId || post.id} post={post} />
                  ))}
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

      <Footer />
    </div>
  );
}
