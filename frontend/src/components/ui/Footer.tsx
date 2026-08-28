'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-surface-950 border-t border-surface-200 dark:border-surface-800 py-12 sm:py-16 transition-colors mt-16 sm:mt-24 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-surface-200 dark:border-surface-800">
          <div className="space-y-4">
            <Logo size="md" href="/" />
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
              LearnHub is a comprehensive learning management platform empowering students and educators worldwide with quality tech education.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm mb-4">Programs</h4>
            <ul className="space-y-2.5 text-xs text-surface-500 dark:text-surface-400">
              <li><Link href="/courses" className="hover:text-brand-600 dark:hover:text-brand-400">Software Engineering</Link></li>
              <li><Link href="/courses" className="hover:text-brand-600 dark:hover:text-brand-400">Web Development</Link></li>
              <li><Link href="/courses" className="hover:text-brand-600 dark:hover:text-brand-400">Algorithms & Data Structures</Link></li>
              <li><Link href="/courses" className="hover:text-brand-600 dark:hover:text-brand-400">Database Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs text-surface-500 dark:text-surface-400">
              <li><Link href="/blog" className="hover:text-brand-600 dark:hover:text-brand-400">Blog & Editorial</Link></li>
              <li><Link href="/register" className="hover:text-brand-600 dark:hover:text-brand-400">Student Account</Link></li>
              <li><Link href="/login" className="hover:text-brand-600 dark:hover:text-brand-400">Instructor Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm mb-4">Platform</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed mb-3">
              Need help or have questions about course enrollments?
            </p>
            <Link href="/register">
              <Button size="sm" variant="secondary" className="w-full text-xs cursor-pointer">
                Join Community
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500 dark:text-surface-400">
          <p>&copy; {new Date().getFullYear()} LearnHub LMS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-surface-700 dark:hover:text-surface-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-surface-700 dark:hover:text-surface-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-surface-700 dark:hover:text-surface-200 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
