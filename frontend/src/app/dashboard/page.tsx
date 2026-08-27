'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { getMyEnrollments, getMyQuizResults, getMyCourses } from '@/lib/api';

/**
 * Dashboard home page.
 * Shows a warm welcome, role-specific stats, and quick action cards.
 * Uses green for success/completion states, amber for CTAs.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<{ [key: string]: number | string }>({});
  const [loadingStats, setLoadingStats] = useState(true);

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        if (roleType === 'student') {
          const [enrollmentsRes, resultsRes] = await Promise.all([
            getMyEnrollments().catch(() => ({ data: [] })),
            getMyQuizResults().catch(() => ({ data: [] })),
          ]);

          const enrolledCount = enrollmentsRes.data?.length || 0;
          const passedCount = (resultsRes.data || []).filter((r) => r.passed).length;

          setStats({
            enrolled: enrolledCount,
            quizzesPassed: passedCount,
          });
        } else if (roleType === 'instructor') {
          const coursesRes = await getMyCourses().catch(() => ({ data: [] }));
          const courses = coursesRes.data || [];
          const totalStudents = courses.reduce((acc, c) => acc + (c.enrollments?.length || 0), 0);

          setStats({
            myCourses: courses.length,
            totalStudents: totalStudents,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [user, roleType]);

  if (!user) return null;

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">
          Welcome back, {user.username} 👋
        </h1>
        <p className="text-surface-400 mt-1">
          {getRoleDescription(roleType)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {getStatsCards(roleType, stats, loadingStats).map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg ${card.bgColor} flex items-center justify-center text-xl`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{card.value}</p>
                <p className="text-surface-400 text-sm">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getQuickActions(roleType).map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group bg-white border border-surface-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{action.icon}</span>
                <div>
                  <p className="text-surface-900 font-medium group-hover:text-brand-700 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-surface-400 text-sm">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Progress Section (Students only) */}
      {roleType === 'student' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Continue Learning</h2>
          <div className="bg-white border border-surface-200 rounded-xl p-6">
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">🎯</span>
              <p className="text-surface-900 font-medium">No courses in progress</p>
              <p className="text-surface-400 text-sm mt-1">Browse the catalog to find your first course!</p>
              <Link
                href="/courses"
                className="inline-block mt-4 px-5 py-2 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Role-specific content ──────────────────────────────────────

function getRoleDescription(roleType: string) {
  switch (roleType) {
    case 'admin': return 'You have full control of the platform.';
    case 'content_manager': return 'Manage courses, lessons, and blog content.';
    case 'instructor': return 'Create and manage your courses.';
    default: return 'Continue your learning journey.';
  }
}

function getStatsCards(
  roleType: string,
  stats: { [key: string]: number | string } = {},
  loading: boolean = false
) {
  switch (roleType) {
    case 'admin':
      return [
        { icon: '👥', label: 'Total Users', value: loading ? '...' : stats.totalUsers ?? '—', bgColor: 'bg-blue-50' },
        { icon: '📚', label: 'Total Courses', value: loading ? '...' : stats.totalCourses ?? '—', bgColor: 'bg-green-50' },
        { icon: '📝', label: 'Blog Posts', value: loading ? '...' : stats.blogPosts ?? '—', bgColor: 'bg-purple-50' },
      ];
    case 'instructor':
      return [
        { icon: '📚', label: 'My Courses', value: loading ? '...' : stats.myCourses ?? '0', bgColor: 'bg-brand-50' },
        { icon: '👨‍🎓', label: 'Total Students', value: loading ? '...' : stats.totalStudents ?? '0', bgColor: 'bg-green-50' },
        { icon: '📊', label: 'Quizzes Created', value: loading ? '...' : stats.quizzesCount ?? '—', bgColor: 'bg-purple-50' },
      ];
    default:
      return [
        { icon: '📚', label: 'Enrolled Courses', value: loading ? '...' : stats.enrolled ?? '0', bgColor: 'bg-brand-50' },
        { icon: '🏆', label: 'Quizzes Passed', value: loading ? '...' : stats.quizzesPassed ?? '0', bgColor: 'bg-amber-50' },
        { icon: '✨', label: 'Learning Streak', value: '1 Day 🔥', bgColor: 'bg-emerald-50' },
      ];
  }
}

function getQuickActions(roleType: string) {
  switch (roleType) {
    case 'admin':
      return [
        { icon: '👥', label: 'Manage Users', description: 'View and manage all platform users', href: '/dashboard/users' },
        { icon: '📚', label: 'View All Courses', description: 'Browse and manage courses', href: '/dashboard/courses' },
      ];
    case 'instructor':
      return [
        { icon: '➕', label: 'Create New Course', description: 'Start building a new course', href: '/dashboard/courses/new' },
        { icon: '📚', label: 'My Courses', description: 'Manage your existing courses', href: '/dashboard/courses' },
      ];
    default:
      return [
        { icon: '🔍', label: 'Browse Courses', description: 'Discover new courses to learn', href: '/courses' },
        { icon: '📚', label: 'My Courses', description: 'Pick up where you left off', href: '/dashboard/my-courses' },
      ];
  }
}
