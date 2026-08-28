'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function CallToActionBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-600 via-teal-600 to-brand-700 dark:from-brand-900 dark:via-brand-800 dark:to-brand-900 text-white relative overflow-hidden transition-colors border-y border-brand-500/20 dark:border-brand-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white dark:text-surface-50">
          Finding Your Right Course Today
        </h2>
        <p className="text-brand-100 dark:text-surface-300 text-sm max-w-xl mx-auto leading-relaxed font-medium">
          Join thousands of learners and instructors advancing engineering skills on LearnHub LMS.
        </p>
        <div>
          <Link href="/courses">
            <Button
              size="lg"
              variant="outline"
              className="px-8 font-extrabold text-base h-12 cursor-pointer shadow-md bg-white text-surface-900 hover:bg-surface-50 dark:bg-brand-600 dark:text-white dark:hover:bg-brand-500 border border-surface-200 dark:border-brand-500"
            >
              Get Started Now →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
