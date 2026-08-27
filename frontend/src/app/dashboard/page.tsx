'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { getMyEnrollments, getMyQuizResults, getMyCourses, getPlatformStats } from '@/lib/api';
import { type QuizResult, type Enrollment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Trophy, Award, CheckCircle2, RotateCcw, ArrowRight, BookOpen, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Dashboard home page.
 * Shows a warm welcome, role-specific stats, quick actions, and student quiz marks.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<{ [key: string]: number | string }>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [studentQuizResults, setStudentQuizResults] = useState<QuizResult[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  
  // Quiz pagination & search
  const [quizPage, setQuizPage] = useState(1);
  const [quizPageSize, setQuizPageSize] = useState(5);
  const [quizSearch, setQuizSearch] = useState('');
  const [quizFilter, setQuizFilter] = useState<'all' | 'passed' | 'review'>('all');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  useEffect(() => {
    async function loadStats() {
      if (!user) return;
      try {
        if (roleType === 'admin') {
          const platform = await getPlatformStats();
          setStats({
            totalUsers: platform.totalUsers,
            totalCourses: platform.totalCourses,
            totalEnrollments: platform.totalEnrollments,
            blogPosts: platform.totalBlogPosts,
            totalStudents: platform.totalStudents,
            totalInstructors: platform.totalInstructors,
            totalManagers: platform.totalManagers,
          });
        } else if (roleType === 'content_manager') {
          const platform = await getPlatformStats();
          setStats({
            totalCourses: platform.totalCourses,
            totalEnrollments: platform.totalEnrollments,
            blogPosts: platform.totalBlogPosts,
            totalUsers: platform.totalUsers,
          });
        } else if (roleType === 'student') {
          const [enrollmentsRes, resultsRes] = await Promise.all([
            getMyEnrollments().catch(() => ({ data: [] })),
            getMyQuizResults().catch(() => ({ data: [] })),
          ]);

          const enrollmentsList = enrollmentsRes.data || [];
          const resultsList = resultsRes.data || [];

          setStudentEnrollments(enrollmentsList);
          setStudentQuizResults(resultsList);

          const enrolledCount = enrollmentsList.length;
          const passedCount = resultsList.filter((r) => {
            const percentage = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
            return r.passed ?? (percentage >= 70);
          }).length;

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

  // Filtered & Paginated Quiz Results
  const filteredQuizResults = studentQuizResults.filter((res) => {
    const qTitle = (res.quiz?.title || '').toLowerCase();
    const cTitle = (res.quiz?.course?.title || '').toLowerCase();
    const term = quizSearch.toLowerCase();
    const matchesSearch = qTitle.includes(term) || cTitle.includes(term);

    const total = res.totalQuestions || 0;
    const score = res.score || 0;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPassed = res.passed ?? (percentage >= 70);

    if (quizFilter === 'passed') return matchesSearch && isPassed;
    if (quizFilter === 'review') return matchesSearch && !isPassed;
    return matchesSearch;
  });

  const totalQuizCount = filteredQuizResults.length;
  const quizPageCount = Math.ceil(totalQuizCount / quizPageSize) || 1;
  const paginatedQuizResults = filteredQuizResults.slice(
    (quizPage - 1) * quizPageSize,
    quizPage * quizPageSize
  );

  const startQuizIndex = totalQuizCount === 0 ? 0 : (quizPage - 1) * quizPageSize + 1;
  const endQuizIndex = Math.min(quizPage * quizPageSize, totalQuizCount);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">
          Welcome back, {user.username} 👋
        </h1>
        <p className="text-surface-400 mt-1">
          {getRoleDescription(roleType)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${roleType === 'admin' || roleType === 'content_manager' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-5`}>
        {getStatsCards(roleType, stats, loadingStats).map((card: any, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-surface-200 p-5 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-lg ${card.bgColor} flex items-center justify-center text-xl shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-surface-900 truncate">{card.value}</p>
                <p className="text-surface-400 text-sm">{card.label}</p>
              </div>
            </div>
            {card.subtext && (
              <p className="text-xs text-surface-400 mt-3 pt-2 border-t border-surface-100 font-medium">
                {card.subtext}
              </p>
            )}
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

      {/* Past Quiz Results Section (Students only) */}
      {roleType === 'student' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                <span>🏆 Past Quiz Marks & Assessments</span>
              </h2>
              <p className="text-xs text-surface-500">Your score history and auto-graded assessments</p>
            </div>

            {/* Filter Tabs */}
            {studentQuizResults.length > 0 && (
              <div className="flex items-center gap-1.5 bg-surface-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
                <button
                  onClick={() => { setQuizFilter('all'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'all'
                      ? 'bg-white text-surface-900 shadow-sm font-semibold'
                      : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  All ({studentQuizResults.length})
                </button>
                <button
                  onClick={() => { setQuizFilter('passed'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'passed'
                      ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                      : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  Passed
                </button>
                <button
                  onClick={() => { setQuizFilter('review'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'review'
                      ? 'bg-white text-amber-700 shadow-sm font-semibold'
                      : 'text-surface-500 hover:text-surface-900'
                  }`}
                >
                  Needs Review
                </button>
              </div>
            )}
          </div>

          {/* Search & Stats Bar */}
          {studentQuizResults.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-surface-200 shadow-sm">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by quiz or course title..."
                  value={quizSearch}
                  onChange={(e) => {
                    setQuizSearch(e.target.value);
                    setQuizPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-surface-900"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-surface-500">
                  <span>Show:</span>
                  <select
                    value={quizPageSize}
                    onChange={(e) => {
                      setQuizPageSize(Number(e.target.value));
                      setQuizPage(1);
                    }}
                    className="px-2 py-1 bg-surface-50 border border-surface-200 rounded text-xs text-surface-800 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>

                <span className="text-xs text-surface-500 font-medium">
                  Showing {startQuizIndex}–{endQuizIndex} of {totalQuizCount} attempt{totalQuizCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loadingStats ? (
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm divide-y divide-surface-100">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-5 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-10 h-10 bg-surface-200 rounded-xl shrink-0"></div>
                    <div className="space-y-2 flex-1 max-w-md">
                      <div className="h-4 bg-surface-200 rounded w-48"></div>
                      <div className="h-3 bg-surface-100 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-surface-200 rounded-full w-20"></div>
                    <div className="h-8 bg-surface-200 rounded-lg w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : studentQuizResults.length === 0 ? (
            <div className="bg-white border border-surface-200 rounded-xl p-8 text-center space-y-3">
              <span className="text-4xl block">📝</span>
              <p className="text-surface-900 font-medium">No quiz attempts yet</p>
              <p className="text-surface-400 text-sm max-w-sm mx-auto">
                Enroll in courses and take practice quizzes to test your understanding!
              </p>
              <Link href="/courses">
                <Button variant="secondary" size="sm" className="mt-2 cursor-pointer">
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : totalQuizCount === 0 ? (
            <div className="bg-white border border-surface-200 rounded-xl p-8 text-center space-y-2">
              <p className="text-surface-700 font-medium text-sm">No quiz attempts matched your search or filter.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuizSearch(''); setQuizFilter('all'); }}
                className="text-xs text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white border border-surface-200 rounded-xl overflow-hidden shadow-sm">
                <div className="divide-y divide-surface-100">
                  {paginatedQuizResults.map((res) => {
                    const quizDoc = res.quiz?.documentId || (res.quiz as any)?.id;
                    const courseDoc = res.quiz?.course?.documentId || (res.quiz?.course as any)?.id;
                    const total = res.totalQuestions || 0;
                    const score = res.score || 0;
                    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                    const isPassed = res.passed ?? (percentage >= 70);

                    return (
                      <div
                        key={res.documentId || res.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50 transition-colors"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 mt-0.5 ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {isPassed ? <Award className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-surface-900 text-sm truncate">
                              {res.quiz?.title || 'Course Quiz'}
                            </h3>
                            <p className="text-xs text-surface-500 mt-0.5 flex items-center gap-2">
                              <span>{res.quiz?.course?.title || 'Enrolled Course'}</span>
                              {res.createdAt && (
                                <>
                                  <span>•</span>
                                  <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-base font-bold text-surface-900">
                                {score}/{total}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  isPassed
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {percentage}% {isPassed ? 'Passed' : 'Review'}
                              </span>
                            </div>
                          </div>

                          {courseDoc && quizDoc && (
                            <Link href={`/learn/${courseDoc}/quiz/${quizDoc}`}>
                              <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                                Review
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination Controls */}
              {quizPageCount > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuizPage((p) => Math.max(1, p - 1))}
                    disabled={quizPage <= 1}
                    className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <span className="text-xs font-semibold text-surface-700 bg-white px-3 py-1.5 rounded-lg border border-surface-200 shadow-sm">
                    Page {quizPage} of {quizPageCount}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setQuizPage((p) => Math.min(quizPageCount, p + 1))}
                    disabled={quizPage >= quizPageCount}
                    className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Progress Section (Students only) */}
      {roleType === 'student' && studentEnrollments.length === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Continue Learning</h2>
          <div className="bg-white border border-surface-200 rounded-xl p-8 text-center space-y-3">
            <span className="text-4xl block">🎯</span>
            <p className="text-surface-900 font-medium">No courses in progress</p>
            <p className="text-surface-400 text-sm max-w-sm mx-auto">
              Browse the catalog to find your first course!
            </p>
            <Link href="/courses">
              <Button variant="primary" size="sm" className="mt-2 cursor-pointer">
                Browse Catalog
              </Button>
            </Link>
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
        { icon: '👥', label: 'Total Users', value: loading ? '...' : stats.totalUsers ?? '—', subtext: `${stats.totalStudents || 0} Students · ${stats.totalInstructors || 0} Instructors`, bgColor: 'bg-blue-50' },
        { icon: '📚', label: 'Total Courses', value: loading ? '...' : stats.totalCourses ?? '—', bgColor: 'bg-green-50' },
        { icon: '🎓', label: 'Total Enrollments', value: loading ? '...' : stats.totalEnrollments ?? '—', bgColor: 'bg-amber-50' },
        { icon: '📝', label: 'Blog Posts', value: loading ? '...' : stats.blogPosts ?? '—', bgColor: 'bg-purple-50' },
      ];
    case 'content_manager':
      return [
        { icon: '📚', label: 'Total Courses', value: loading ? '...' : stats.totalCourses ?? '—', bgColor: 'bg-green-50' },
        { icon: '🎓', label: 'Total Enrollments', value: loading ? '...' : stats.totalEnrollments ?? '—', bgColor: 'bg-amber-50' },
        { icon: '📝', label: 'Blog Articles', value: loading ? '...' : stats.blogPosts ?? '—', bgColor: 'bg-purple-50' },
        { icon: '👥', label: 'Platform Users', value: loading ? '...' : stats.totalUsers ?? '—', bgColor: 'bg-blue-50' },
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
    case 'content_manager':
      return [
        { icon: '📚', label: 'Manage All Courses', description: 'Edit curriculum, lessons, and quizzes', href: '/dashboard/courses' },
        { icon: '📝', label: 'Editorial Manager', description: 'Write and publish blog guides', href: '/dashboard/blog' },
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
