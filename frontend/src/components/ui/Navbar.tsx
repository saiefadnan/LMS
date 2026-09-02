'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const isCoursesActive = pathname === '/courses' || pathname.startsWith('/courses/');
  const isBlogActive = pathname === '/blog' || pathname.startsWith('/blog/');

  return (
    <nav className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Logo size="md" href="/" />
            
            {/* Desktop Navigation Links with Active Indicators */}
            <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold p-1 bg-surface-100/60 dark:bg-surface-800/40 rounded-xl border border-surface-200/60 dark:border-surface-800/60">
              <Link
                href="/courses"
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isCoursesActive
                    ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-2xs font-bold border border-surface-200/80 dark:border-surface-700/80'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-white/50 dark:hover:bg-surface-700/40'
                }`}
              >
                {isCoursesActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                )}
                <span>Browse Catalog</span>
              </Link>

              <Link
                href="/blog"
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                  isBlogActive
                    ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-2xs font-bold border border-surface-200/80 dark:border-surface-700/80'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-white/50 dark:hover:bg-surface-700/40'
                }`}
              >
                {isBlogActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                )}
                <span>Blog & News</span>
              </Link>

              <a
                href="/#about"
                className="px-3.5 py-1.5 rounded-lg text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-white/50 dark:hover:bg-surface-700/40 transition-all duration-150 cursor-pointer"
              >
                Why LearnHub
              </a>

              <a
                href="/#instructors"
                className="px-3.5 py-1.5 rounded-lg text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-white/50 dark:hover:bg-surface-700/40 transition-all duration-150 cursor-pointer"
              >
                Instructors
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle size="sm" />
            {user ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm" className="cursor-pointer font-bold">
                  Dashboard →
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="cursor-pointer font-bold">
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
