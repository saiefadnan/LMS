'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Navbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="bg-white/90 dark:bg-surface-900/90 backdrop-blur-md border-b border-surface-200 dark:border-surface-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Logo size="md" href="/" />
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
              <Link
                href="/courses"
                className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Browse Catalog
              </Link>
              <Link
                href="/blog"
                className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Blog & News
              </Link>
              <a
                href="/#about"
                className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Why LearnHub
              </a>
              <a
                href="/#instructors"
                className="text-surface-600 dark:text-surface-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
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
