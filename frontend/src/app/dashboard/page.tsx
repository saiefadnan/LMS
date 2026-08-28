'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { usePlatformStats, useUsers } from '@/hooks/queries/useAdmin';
import { useCourses, useMyCourses, useMyEnrollments } from '@/hooks/queries/useCourses';
import { useMyQuizResults } from '@/hooks/queries/useQuizzes';
import { useBlogPosts } from '@/hooks/queries/useBlog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DashboardAnalytics } from '@/components/features/DashboardAnalytics';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Users,
  GraduationCap,
  FileText,
  PlusCircle,
  Compass,
  BarChart3,
  Flame,
  FileQuestion
} from 'lucide-react';

/**
 * Dashboard home page.
 * Polished SaaS dashboard with clean metrics, active quick actions, and assessment history.
 */
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  const [quizPage, setQuizPage] = useState(1);
  const [quizPageSize, setQuizPageSize] = useState(5);
  const [quizSearch, setQuizSearch] = useState('');
  const [quizFilter, setQuizFilter] = useState<'all' | 'passed' | 'review'>('all');

  // TanStack Query Hooks based on role
  const { data: platformStats, isLoading: platformLoading } = usePlatformStats(
    roleType === 'admin' || roleType === 'content_manager'
  );
  const { data: allUsers = [], isLoading: usersLoading } = useUsers(roleType === 'admin');
  const { data: allCourses = [], isLoading: coursesLoading } = useCourses();
  const { data: myCourses = [], isLoading: myCoursesLoading } = useMyCourses(roleType === 'instructor');
  const { data: studentEnrollments = [], isLoading: enrollmentsLoading } = useMyEnrollments(roleType === 'student');
  const { data: studentQuizResults = [], isLoading: quizResultsLoading } = useMyQuizResults(roleType === 'student');
  const { data: allPosts = [], isLoading: postsLoading } = useBlogPosts();

  if (!user) return null;

  const loadingStats =
    roleType === 'admin'
      ? platformLoading || usersLoading || coursesLoading || postsLoading
      : roleType === 'content_manager'
      ? platformLoading || coursesLoading || postsLoading
      : roleType === 'instructor'
      ? myCoursesLoading
      : enrollmentsLoading || quizResultsLoading;

  // Build metrics for role
  let stats: { [key: string]: number | string } = {};

  if (roleType === 'admin') {
    const platform: any = platformStats || {};
    stats = {
      totalUsers: platform.totalUsers ?? allUsers.length,
      totalCourses: platform.totalCourses ?? allCourses.length,
      totalEnrollments: platform.totalEnrollments ?? 0,
      blogPosts: platform.totalBlogPosts ?? allPosts.length,
      totalStudents: platform.totalStudents ?? allUsers.filter((u: any) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'student').length,
      totalInstructors: platform.totalInstructors ?? allUsers.filter((u: any) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'instructor').length,
      totalManagers: platform.totalManagers ?? allUsers.filter((u: any) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'content_manager').length,
    };
  } else if (roleType === 'content_manager') {
    const platform: any = platformStats || {};
    stats = {
      totalCourses: platform.totalCourses ?? allCourses.length,
      totalEnrollments: platform.totalEnrollments ?? 0,
      blogPosts: platform.totalBlogPosts ?? allPosts.length,
      totalUsers: platform.totalUsers ?? 0,
    };
  } else if (roleType === 'instructor') {
    const totalStudents = myCourses.reduce((acc, c) => acc + (c.enrollments?.length || 0), 0);
    stats = {
      myCourses: myCourses.length,
      totalStudents,
    };
  } else {
    const enrolledCount = studentEnrollments.length;
    const passedCount = studentQuizResults.filter((r) => {
      const percentage = r.totalQuestions > 0 ? Math.round((r.score / r.totalQuestions) * 100) : 0;
      return r.passed ?? (percentage >= 70);
    }).length;
    stats = {
      enrolled: enrolledCount,
      quizzesPassed: passedCount,
    };
  }

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 dark:border-surface-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
            Welcome back, {user.username}
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-sm mt-0.5">
            {getRoleDescription(roleType)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="md">
            Role: <span className="font-semibold text-surface-900 dark:text-surface-100 capitalize ml-1">{user.role?.name || roleType.replace('_', ' ')}</span>
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${roleType === 'admin' || roleType === 'content_manager' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {getStatsCards(roleType, stats, loadingStats).map((card: any, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs hover:border-surface-300 dark:hover:border-surface-700 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0 border border-surface-200/60 dark:border-surface-700/60`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight truncate leading-none mb-1">
                    {card.value}
                  </p>
                  <p className="text-surface-500 dark:text-surface-400 text-xs font-medium">{card.label}</p>
                </div>
              </div>
              {card.subtext && (
                <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-3 pt-2.5 border-t border-surface-100 dark:border-surface-800 font-medium">
                  {card.subtext}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-surface-400 dark:text-surface-500">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getQuickActions(roleType).map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                href={action.href}
                className="group bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-4.5 hover:border-brand-300 dark:hover:border-brand-500/50 hover:shadow-xs transition-all duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/50 group-hover:border-brand-200 dark:group-hover:border-brand-800 flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-surface-900 dark:text-surface-100 font-semibold text-sm group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">
                      {action.label}
                    </p>
                    <p className="text-surface-500 dark:text-surface-400 text-xs truncate mt-0.5">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-surface-400 dark:text-surface-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role-tailored Analytics & Heatmaps */}
      <DashboardAnalytics
        roleType={roleType}
        stats={stats}
        quizResults={studentQuizResults}
        enrollments={studentEnrollments}
        courses={roleType === 'instructor' ? myCourses : allCourses}
        users={allUsers}
        posts={allPosts}
      />

      {/* Past Quiz Results Section (Students only) */}
      {roleType === 'student' && (
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Assessment History & Scores</span>
              </h2>
              <p className="text-xs text-surface-500 dark:text-surface-400">Your score history and auto-graded quiz attempts</p>
            </div>

            {/* Filter Tabs */}
            {studentQuizResults.length > 0 && (
              <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-surface-200/60 dark:border-surface-700">
                <button
                  onClick={() => { setQuizFilter('all'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'all'
                      ? 'bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 shadow-xs font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  All ({studentQuizResults.length})
                </button>
                <button
                  onClick={() => { setQuizFilter('passed'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'passed'
                      ? 'bg-white dark:bg-surface-900 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  Passed
                </button>
                <button
                  onClick={() => { setQuizFilter('review'); setQuizPage(1); }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    quizFilter === 'review'
                      ? 'bg-white dark:bg-surface-900 text-amber-700 dark:text-amber-400 shadow-xs font-semibold'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  Needs Review
                </button>
              </div>
            )}
          </div>

          {/* Search & Stats Bar */}
          {studentQuizResults.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-3 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-surface-400 dark:text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by quiz or course title..."
                  value={quizSearch}
                  onChange={(e) => {
                    setQuizSearch(e.target.value);
                    setQuizPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400">
                  <span>Show:</span>
                  <select
                    value={quizPageSize}
                    onChange={(e) => {
                      setQuizPageSize(Number(e.target.value));
                      setQuizPage(1);
                    }}
                    className="px-2 py-1 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded text-xs text-surface-800 dark:text-surface-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                  </select>
                </div>

                <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
                  Showing {startQuizIndex}–{endQuizIndex} of {totalQuizCount} attempt{totalQuizCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loadingStats ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-surface-900 rounded-xl p-5 border border-surface-200 dark:border-surface-800 flex justify-between items-center h-20" />
              ))}
            </div>
          ) : filteredQuizResults.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6">
              <FileQuestion className="w-8 h-8 text-surface-400 dark:text-surface-600 mx-auto mb-2" />
              <p className="text-surface-900 dark:text-surface-100 font-bold text-sm">
                {quizSearch ? 'No matching assessments found' : 'No quizzes completed yet'}
              </p>
              <p className="text-surface-500 dark:text-surface-400 text-xs mt-1 max-w-sm mx-auto">
                {quizSearch
                  ? 'Try a different search keyword.'
                  : 'Enroll in a course, work through the video modules, and take assessments to test your knowledge.'}
              </p>
              {!quizSearch && (
                <Link href="/courses">
                  <Button variant="primary" size="sm" className="mt-4 text-xs font-semibold cursor-pointer">
                    Browse Course Catalog
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedQuizResults.map((result) => {
                const total = result.totalQuestions || 0;
                const score = result.score || 0;
                const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                const isPassed = result.passed ?? (percentage >= 70);

                return (
                  <div
                    key={result.id || result.documentId}
                    className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-4 sm:p-5 shadow-xs hover:border-surface-300 dark:hover:border-surface-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                            {result.quiz?.title || 'Course Assessment'}
                          </h3>
                          <Badge
                            variant={isPassed ? 'success' : 'warning'}
                            size="sm"
                          >
                            {isPassed ? 'Passed' : 'Needs Review'}
                          </Badge>
                        </div>
                        <p className="text-surface-500 dark:text-surface-400 text-xs mt-0.5">
                          Course: <span className="font-medium text-surface-700 dark:text-surface-300">{result.quiz?.course?.title || 'General'}</span>
                          <span className="mx-1.5">•</span>
                          {new Date(result.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-surface-100 dark:border-surface-800">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-base font-extrabold ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {score} / {total}
                          </span>
                          <span className="text-xs font-bold text-surface-400">({percentage}%)</span>
                        </div>
                        <p className="text-[11px] text-surface-400 font-medium">Final Grade</p>
                      </div>

                      {result.quiz?.course?.documentId && (
                        <Link href={`/learn/${result.quiz.course.documentId}/quiz/${result.quiz.documentId || result.quiz.id}`}>
                          <Button variant="secondary" size="sm" className="gap-1.5 text-xs cursor-pointer">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retake</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Quiz Pagination Controls */}
              {quizPageCount > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-surface-500 dark:text-surface-400">
                    Page {quizPage} of {quizPageCount}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={quizPage === 1}
                      onClick={() => setQuizPage((prev) => Math.max(1, prev - 1))}
                      className="cursor-pointer text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={quizPage >= quizPageCount}
                      onClick={() => setQuizPage((prev) => Math.min(quizPageCount, prev + 1))}
                      className="cursor-pointer text-xs"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Role-specific content ──────────────────────────────────────

function getRoleDescription(roleType: string) {
  switch (roleType) {
    case 'admin': return 'Platform Administrator — Full system configuration and oversight.';
    case 'content_manager': return 'Editorial & Curriculum Manager — Publish and manage courses and blog articles.';
    case 'instructor': return 'Instructor Portal — Create curriculum, lessons, and evaluate student progress.';
    default: return 'Student Portal — Pick up learning where you left off.';
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
        { icon: Users, label: 'Total Users', value: loading ? '...' : stats.totalUsers ?? '—', subtext: `${stats.totalStudents || 0} Students · ${stats.totalInstructors || 0} Instructors`, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
        { icon: BookOpen, label: 'Total Courses', value: loading ? '...' : stats.totalCourses ?? '—', bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { icon: GraduationCap, label: 'Total Enrollments', value: loading ? '...' : stats.totalEnrollments ?? '—', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
        { icon: FileText, label: 'Blog Posts', value: loading ? '...' : stats.blogPosts ?? '—', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
      ];
    case 'content_manager':
      return [
        { icon: BookOpen, label: 'Total Courses', value: loading ? '...' : stats.totalCourses ?? '—', bgColor: 'bg-teal-50', iconColor: 'text-teal-600' },
        { icon: GraduationCap, label: 'Total Enrollments', value: loading ? '...' : stats.totalEnrollments ?? '—', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
        { icon: FileText, label: 'Blog Articles', value: loading ? '...' : stats.blogPosts ?? '—', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
        { icon: Users, label: 'Platform Users', value: loading ? '...' : stats.totalUsers ?? '—', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
      ];
    case 'instructor':
      return [
        { icon: BookOpen, label: 'My Courses', value: loading ? '...' : stats.myCourses ?? '0', bgColor: 'bg-brand-50', iconColor: 'text-brand-600' },
        { icon: Users, label: 'Total Students', value: loading ? '...' : stats.totalStudents ?? '0', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
        { icon: BarChart3, label: 'Assessments Active', value: loading ? '...' : stats.quizzesCount ?? '—', bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
      ];
    default:
      return [
        { icon: BookOpen, label: 'Enrolled Courses', value: loading ? '...' : stats.enrolled ?? '0', bgColor: 'bg-brand-50', iconColor: 'text-brand-600' },
        { icon: Award, label: 'Quizzes Passed', value: loading ? '...' : stats.quizzesPassed ?? '0', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
        { icon: Flame, label: 'Active Momentum', value: 'Consistent', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
      ];
  }
}

function getQuickActions(roleType: string) {
  switch (roleType) {
    case 'admin':
      return [
        { icon: Users, label: 'Manage Users', description: 'Assign roles, review accounts, and manage permissions', href: '/dashboard/users' },
        { icon: BookOpen, label: 'Platform Curriculum', description: 'Inspect, edit, and organize all published courses', href: '/dashboard/courses' },
      ];
    case 'content_manager':
      return [
        { icon: BookOpen, label: 'Course Catalog', description: 'Curate modules, lessons, and interactive quizzes', href: '/dashboard/courses' },
        { icon: FileText, label: 'Editorial Publication', description: 'Author, draft, and publish learning guides & articles', href: '/dashboard/blog' },
      ];
    case 'instructor':
      return [
        { icon: PlusCircle, label: 'Create New Course', description: 'Author a new course curriculum with video & text lessons', href: '/dashboard/courses/new' },
        { icon: BookOpen, label: 'Manage Courses', description: 'Update existing curriculum and track student progress', href: '/dashboard/courses' },
      ];
    default:
      return [
        { icon: Compass, label: 'Explore Catalog', description: 'Discover new skills, frameworks, and masterclasses', href: '/courses' },
        { icon: GraduationCap, label: 'My Learning Workspace', description: 'Resume lessons, review progress, and complete quizzes', href: '/dashboard/my-courses' },
      ];
  }
}
