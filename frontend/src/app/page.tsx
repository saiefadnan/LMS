'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold tracking-tight text-surface-900 flex items-center gap-1">
                <span className="text-brand-600">Learn</span>Hub
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/courses" className="text-surface-600 hover:text-surface-900 font-medium hidden sm:block mr-4">
                Browse Courses
              </Link>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="secondary">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-surface-900 tracking-tight leading-tight mb-6">
              Master new skills to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-amber-500">
                advance your career
              </span>
            </h1>
            
            <p className="text-xl text-surface-600 mb-10 max-w-2xl mx-auto">
              LearnHub provides world-class education from industry experts. 
              Join thousands of students learning modern technologies today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/courses">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                  Explore Courses
                </Button>
              </Link>
              {!user && (
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-lg px-8 h-14 bg-white border-2 border-surface-200">
                    Join for Free
                  </Button>
                </Link>
              )}
            </div>

            {/* Social Proof Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-surface-200 pt-10">
              <div>
                <p className="text-3xl font-bold text-surface-900">500+</p>
                <p className="text-surface-500 mt-1">Premium Courses</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-surface-900">50k+</p>
                <p className="text-surface-500 mt-1">Active Students</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-surface-900">4.8/5</p>
                <p className="text-surface-500 mt-1">Average Rating</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-surface-900">100%</p>
                <p className="text-surface-500 mt-1">Online & Flexible</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-surface-500">
          <p>© 2026 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
