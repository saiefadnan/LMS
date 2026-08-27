'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/api';
import { type BlogPost } from '@/types';
import { Button } from '@/components/ui/Button';
import { BookOpen, Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        // Backend controller automatically ensures unauthenticated / public only get published posts
        const res = await getBlogPosts();
        setPosts(res.data || []);
      } catch (err) {
        console.error('Failed to load blog posts', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const term = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(term) ||
      (post.body || post.content || '').toLowerCase().includes(term)
    );
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const getReadingTime = (text?: string) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-brand-200 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>LearnHub Publication</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Insights, Tutorials & Updates
          </h1>
          <p className="text-lg text-brand-200 max-w-2xl mx-auto">
            Deep dive into software engineering concepts, curriculum breakdowns, and student learning guides.
          </p>

          {/* Search bar */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-surface-900 shadow-lg placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto py-12 px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="md:col-span-3 h-80 bg-surface-200 rounded-2xl" />
            <div className="h-64 bg-surface-200 rounded-xl" />
            <div className="h-64 bg-surface-200 rounded-xl" />
            <div className="h-64 bg-surface-200 rounded-xl" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-surface-200 p-8 shadow-sm">
            <span className="text-5xl block mb-4">📰</span>
            <h3 className="text-xl font-bold text-surface-900 mb-2">No Articles Found</h3>
            <p className="text-surface-500 text-sm max-w-md mx-auto mb-6">
              {searchQuery
                ? `No posts matched your search for "${searchQuery}". Try a different keyword.`
                : 'Our instructors and content managers are crafting great guides. Check back soon!'}
            </p>
            {searchQuery && (
              <Button variant="secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Hero Card */}
            {featuredPost && (
              <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="h-64 lg:h-full bg-surface-100 relative overflow-hidden min-h-[280px]">
                    {featuredPost.coverImage ? (
                      <img
                        src={getThumbnailSrc(featuredPost.coverImage)}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 text-6xl text-brand-300">
                        ✍️
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                        Featured Article
                      </span>
                    </div>
                  </div>

                  <div className="p-8 lg:p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs text-surface-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-brand-600" />
                          {new Date(featuredPost.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-brand-600" />
                          {getReadingTime(featuredPost.body || featuredPost.content)}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 leading-tight hover:text-brand-600 transition-colors">
                        <Link href={`/blog/${featuredPost.documentId}`}>{featuredPost.title}</Link>
                      </h2>

                      <p className="text-surface-600 line-clamp-3 text-base leading-relaxed">
                        {featuredPost.body || featuredPost.content}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-surface-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                          {featuredPost.author?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-900">
                            {featuredPost.author?.username || 'LearnHub Editorial'}
                          </p>
                          <p className="text-xs text-surface-400">Author</p>
                        </div>
                      </div>

                      <Link href={`/blog/${featuredPost.documentId}`}>
                        <Button variant="primary" size="sm" className="gap-2">
                          Read Article <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Posts Grid */}
            {remainingPosts.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-surface-900 mb-6">Recent Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingPosts.map((post) => (
                    <article
                      key={post.documentId || post.id}
                      className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                    >
                      <div className="h-44 bg-surface-100 relative overflow-hidden">
                        {post.coverImage ? (
                          <img
                            src={getThumbnailSrc(post.coverImage)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-100 to-surface-200 text-4xl text-surface-400">
                            📄
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

                          <h4 className="text-lg font-bold text-surface-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                            <Link href={`/blog/${post.documentId}`}>{post.title}</Link>
                          </h4>

                          <p className="text-sm text-surface-600 line-clamp-2 leading-relaxed">
                            {post.body || post.content}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-surface-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-xs text-surface-600 font-medium">
                            <User className="w-3.5 h-3.5 text-surface-400" />
                            <span>{post.author?.username || 'Editorial Team'}</span>
                          </div>

                          <Link
                            href={`/blog/${post.documentId}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
