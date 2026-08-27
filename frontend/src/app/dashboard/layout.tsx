'use client';

import { useAuthStore } from '@/stores/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileText, 
  PlusCircle, 
  Search, 
  LogOut, 
  Menu,
  GraduationCap
} from 'lucide-react';

/**
 * Dashboard Layout
 * 
 * Uses a clean SaaS sidebar with balanced typography and Lucide icons.
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
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          <p className="text-surface-500 text-sm font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleType = (typeof user.role === 'object' ? user.role?.type : user.role) || 'student';
  const navLinks = getNavLinks(roleType);
  const roleConfig = getRoleBadgeConfig(roleType);

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-surface-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          w-64 bg-white border-r border-surface-200 flex flex-col fixed h-screen z-50 shrink-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:top-0
        `}
      >
        {/* Brand */}
        <div className="p-5 border-b border-surface-200/80 shrink-0">
          <Logo size="sm" href="/" />
        </div>

        {/* User Profile Snippet */}
        <div className="px-5 py-4 border-b border-surface-200/70 bg-surface-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg border font-bold flex items-center justify-center text-sm shadow-2xs shrink-0 ${roleConfig.avatarClasses}`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-surface-900 font-semibold text-sm truncate leading-tight">{user.username}</p>
              <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 border text-[11px] font-semibold rounded-md capitalize leading-none ${roleConfig.badgeClasses}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleConfig.dotClasses}`} />
                {user.role?.name || roleConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-brand-50/90 text-brand-800 border border-brand-200/80 shadow-2xs'
                    : 'text-surface-700 hover:bg-surface-100 hover:text-surface-950'
                }`}
              >
                <Icon 
                  className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                    isActive 
                      ? 'text-brand-600 fill-brand-600' 
                      : 'text-surface-500 group-hover:text-surface-800 fill-none'
                  }`}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout - Pinned to bottom with separator */}
        <div className="p-3 border-t border-surface-200 mt-auto shrink-0 bg-white">
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-surface-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 text-surface-500 group-hover:text-red-600 transition-colors" strokeWidth={1.75} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-surface-200 text-surface-600 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="xs" href="/" />
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Role Badge Color & Style Configuration ─────────────────────

function getRoleBadgeConfig(roleType: string) {
  switch (roleType) {
    case 'admin':
      return {
        label: 'Admin',
        badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/15',
        avatarClasses: 'bg-purple-100 text-purple-700 border-purple-200',
        dotClasses: 'bg-purple-500',
      };
    case 'content_manager':
      return {
        label: 'Content Manager',
        badgeClasses: 'bg-orange-50 text-orange-800 border-orange-200 ring-1 ring-orange-500/15',
        avatarClasses: 'bg-orange-100 text-orange-800 border-orange-200',
        dotClasses: 'bg-orange-500',
      };
    case 'instructor':
      return {
        label: 'Instructor',
        badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/15',
        avatarClasses: 'bg-blue-100 text-blue-700 border-blue-200',
        dotClasses: 'bg-blue-500',
      };
    case 'student':
    default:
      return {
        label: 'Student',
        badgeClasses: 'bg-teal-50 text-teal-700 border-teal-200 ring-1 ring-teal-500/15',
        avatarClasses: 'bg-teal-100 text-teal-700 border-teal-200',
        dotClasses: 'bg-teal-500',
      };
  }
}

// ─── Navigation config per role ─────────────────────────────────

function getNavLinks(roleType: string) {
  const common = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  switch (roleType) {
    case 'admin':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'All Courses', icon: BookOpen },
        { href: '/dashboard/users', label: 'Manage Users', icon: Users },
        { href: '/dashboard/blog', label: 'Blog Posts', icon: FileText },
      ];
    case 'content_manager':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'Manage Courses', icon: BookOpen },
        { href: '/dashboard/blog', label: 'Blog Posts', icon: FileText },
      ];
    case 'instructor':
      return [
        ...common,
        { href: '/dashboard/courses', label: 'My Courses', icon: BookOpen },
        { href: '/dashboard/courses/new', label: 'Create Course', icon: PlusCircle },
      ];
    case 'student':
    default:
      return [
        ...common,
        { href: '/dashboard/my-courses', label: 'My Learning', icon: GraduationCap },
        { href: '/courses', label: 'Browse Catalog', icon: Search },
      ];
  }
}
