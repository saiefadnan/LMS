'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { getMyEnrollments, getMyQuizResults, getMyCourses, getPlatformStats } from '@/lib/api';
import { type QuizResult, type Enrollment } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  Clock, 
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
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden shadow-xs divide-y divide-surface-100 dark:divide-surface-800">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="w-9 h-9 bg-surface-200 dark:bg-surface-800 rounded-lg shrink-0"></div>
                    <div className="space-y-1.5 flex-1 max-w-md">
                      <div className="h-4 bg-surface-200 dark:bg-surface-800 rounded w-48"></div>
                      <div className="h-3 bg-surface-100 dark:bg-surface-800/60 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-surface-200 dark:bg-surface-800 rounded w-20"></div>
                    <div className="h-8 bg-surface-200 dark:bg-surface-800 rounded-lg w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : studentQuizResults.length === 0 ? (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-10 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
                <FileQuestion className="w-6 h-6" />
              </div>
              <p className="text-surface-900 dark:text-surface-100 font-semibold text-sm">No quiz attempts recorded yet</p>
              <p className="text-surface-500 dark:text-surface-400 text-xs max-w-sm mx-auto">
                Enroll in courses and take practice quizzes to test your understanding!
              </p>
              <Link href="/courses" className="inline-block pt-1">
                <Button variant="secondary" size="sm">
                  Browse Courses
                </Button>
              </Link>
            </div>
          ) : totalQuizCount === 0 ? (
            <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 text-center space-y-2 shadow-xs">
              <p className="text-surface-700 dark:text-surface-300 font-medium text-sm">No quiz attempts matched your search or filter.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setQuizSearch(''); setQuizFilter('all'); }}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden shadow-xs">
                <div className="divide-y divide-surface-100 dark:divide-surface-800">
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
                        className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-50/70 dark:hover:bg-surface-800/60 transition-colors"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isPassed
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {isPassed ? <Award className="w-4.5 h-4.5" /> : <RotateCcw className="w-4.5 h-4.5" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm truncate">
                              {res.quiz?.title || 'Course Assessment'}
                            </h3>
                            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 flex items-center gap-2">
                              <span>{res.quiz?.course?.title || 'Enrolled Course'}</span>
                              {res.createdAt && (
                                <>
                                  <span className="text-surface-300 dark:text-surface-600">•</span>
                                  <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                                {score}/{total}
                              </span>
                              <Badge variant={isPassed ? 'success' : 'warning'} size="sm">
                                {percentage}% {isPassed ? 'Passed' : 'Review'}
                              </Badge>
                            </div>
                          </div>

                          {courseDoc && quizDoc && (
                            <Link href={`/learn/${courseDoc}/quiz/${quizDoc}`}>
                              <Button variant="outline" size="sm" className="text-xs gap-1">
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
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuizPage((p) => Math.max(1, p - 1))}
                    disabled={quizPage <= 1}
                    className="gap-1 px-3 text-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </Button>

                  <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 shadow-xs">
                    Page {quizPage} of {quizPageCount}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuizPage((p) => Math.min(quizPageCount, p + 1))}
                    disabled={quizPage >= quizPageCount}
                    className="gap-1 px-3 text-xs"
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

      {/* Enrolled Courses Preview (Student only) */}
      {roleType === 'student' && studentEnrollments.length === 0 && !loadingStats && (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-surface-900 dark:text-surface-100 font-semibold text-sm">No courses currently in progress</p>
          <p className="text-surface-500 dark:text-surface-400 text-xs max-w-sm mx-auto">
            Explore our catalog of industry-ready engineering and technology courses.
          </p>
          <Link href="/courses" className="inline-block pt-1">
            <Button variant="primary" size="sm">
              Explore Course Catalog
            </Button>
          </Link>
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
