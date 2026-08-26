'use client';

import { useAuthStore } from '@/stores/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Dashboard Layout
 * 
 * Uses a light sidebar with warm neutral tones. The navigation changes
 * based on the user's role. Uses progressive disclosure — only showing
 * relevant options to reduce cognitive load (key LMS UX principle).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-brand-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-surface-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleType = (typeof user.role === 'object' ? user.role?.type : user.role) || 'student';
  const navLinks = getNavLinks(roleType);

  return (
    <div className="min-h-screen bg-surface-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-surface-200 flex flex-col fixed h-full z-50
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-surface-200">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">LH</span>
            </div>
            <span className="text-lg font-bold text-surface-900">LearnHub</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-surface-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="text-brand-700 font-semibold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-surface-900 font-medium text-sm truncate">{user.username}</p>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-full capitalize">
                {user.role?.name || roleType}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-surface-800 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-surface-200">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-800 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <span className="text-base">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5 text-surface-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-lg font-bold text-surface-900">LearnHub</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Navigation config per role ─────────────────────────────────

function getNavLinks(roleType: string) {
  const common = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  switch (roleType) {
    case 'admin':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'All Courses', icon: '📚' },
        { href: '/dashboard/users', label: 'Manage Users', icon: '👥' },
        { href: '/dashboard/blog', label: 'Blog Posts', icon: '📝' },
      ];
    case 'content_manager':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'Manage Courses', icon: '📚' },
        { href: '/dashboard/blog', label: 'Blog Posts', icon: '📝' },
      ];
    case 'instructor':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'My Courses', icon: '📚' },
        { href: '/dashboard/courses/new', label: 'Create Course', icon: '➕' },
      ];
    case 'student':
    default:
      return [
        ...common,
        { href: '/dashboard/my-courses', label: 'My Courses', icon: '📚' },
        { href: '/courses', label: 'Browse Catalog', icon: '🔍' },
      ];
  }
}
