'use client';

import React, { useState } from 'react';
import { type QuizResult, type Enrollment, type Course } from '@/types';
import {
  Flame,
  TrendingUp,
  BarChart2,
  Calendar,
  Award,
  Users,
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface DashboardAnalyticsProps {
  roleType: string;
  stats?: { [key: string]: any };
  quizResults?: QuizResult[];
  enrollments?: Enrollment[];
  courses?: Course[];
  users?: any[];
  posts?: any[];
}

export function DashboardAnalytics({
  roleType,
  stats = {},
  quizResults = [],
  enrollments = [],
  courses = [],
  users = [],
  posts = [],
}: DashboardAnalyticsProps) {
  switch (roleType) {
    case 'admin':
      return <AdminPlatformAnalytics stats={stats} users={users} courses={courses} />;
    case 'content_manager':
      return <ContentManagerAnalytics stats={stats} courses={courses} posts={posts} />;
    case 'instructor':
      return <InstructorAnalytics courses={courses} stats={stats} quizResults={quizResults} />;
    case 'student':
    default:
      return <StudentActivityHeatmap quizResults={quizResults} enrollments={enrollments} />;
  }
}

// ─── 1. Student Activity Heatmap & Performance Line Chart ────────

function StudentActivityHeatmap({
  quizResults = [],
  enrollments = [],
}: {
  quizResults: QuizResult[];
  enrollments: Enrollment[];
}) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Generate 28 days of activity strictly from real student data
  const daysCount = 28;
  const days = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().split('T')[0];

    // Count attempts on date
    const attemptsOnDate = quizResults.filter(
      (r) => r.createdAt && r.createdAt.startsWith(dateStr)
    ).length;

    // Count enrollments on date
    const enrollmentsOnDate = enrollments.filter(
      (e) => e.createdAt && e.createdAt.startsWith(dateStr)
    ).length;

    const totalActivity = attemptsOnDate * 2 + enrollmentsOnDate * 3;

    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      dateStr,
      count: totalActivity,
    };
  });

  const totalActiveDays = days.filter((d) => d.count > 0).length;

  // Compute current active streak from today backward
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else if (i < days.length - 1) break; // Break on first inactive day before today
  }

  // Real Quiz Score Mastery Trend SVG Points (chronological order)
  const sortedQuizResults = [...quizResults].sort(
    (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
  );

  const realScores = sortedQuizResults.map((r) => {
    const total = r.totalQuestions || 1;
    return Math.round(((r.score || 0) / total) * 100);
  });

  const avgScore =
    realScores.length > 0
      ? Math.round(realScores.reduce((a, b) => a + b, 0) / realScores.length)
      : 0;

  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Learning Activity & Participation Heatmap</span>
          </h2>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Real daily study consistency, course completions, and assessment score progress.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold shadow-2xs">
          <Flame className="w-4 h-4 fill-current" />
          <span>{currentStreak}-Day Active Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap Grid Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
            <span className="font-semibold text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Past 4 Weeks Activity Grid
            </span>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-xs bg-surface-100 dark:bg-surface-800" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
              <span>More</span>
            </div>
          </div>

          {/* 28 Grid Squares */}
          <div className="grid grid-cols-7 gap-2 pt-1">
            {days.map((day, idx) => {
              let colorClass = 'bg-surface-100 dark:bg-surface-800/80 border-surface-200/80 dark:border-surface-700/60';
              if (day.count >= 6) {
                colorClass = 'bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700';
              } else if (day.count >= 3) {
                colorClass = 'bg-emerald-400 dark:bg-emerald-600 text-white border-emerald-500';
              } else if (day.count >= 1) {
                colorClass = 'bg-emerald-200 dark:bg-emerald-900/90 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800';
              }

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-10 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 relative ${colorClass}`}
                >
                  <span className="text-[10px] font-bold opacity-90">{day.date}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-surface-100 dark:border-surface-800 text-xs text-surface-500 dark:text-surface-400">
            <span>
              {hoveredDay
                ? `${hoveredDay.date}: ${hoveredDay.count} real activity unit${hoveredDay.count !== 1 ? 's' : ''}`
                : `Total active study days: ${totalActiveDays} / 28`}
            </span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {totalActiveDays > 0 ? 'Verified Activity' : 'No activity recorded yet'}
            </span>
          </div>
        </div>

        {/* Quiz Score Performance Trend Chart Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Score Mastery Trajectory
            </span>
            {realScores.length > 0 && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                Avg {avgScore}%
              </span>
            )}
          </div>

          {realScores.length >= 2 ? (
            <div className="h-36 w-full pt-2 flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" className="text-surface-100 dark:text-surface-800" strokeDasharray="4" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="currentColor" className="text-surface-100 dark:text-surface-800" strokeDasharray="4" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="currentColor" className="text-surface-100 dark:text-surface-800" strokeDasharray="4" />

                <polygon
                  points={`0,100 ${realScores.map((s, idx) => `${(idx * 300) / (realScores.length - 1)},${100 - s}`).join(' ')} 300,100`}
                  className="fill-brand-500/10 dark:fill-brand-400/15"
                />

                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-600 dark:text-brand-400"
                  points={realScores.map((s, idx) => `${(idx * 300) / (realScores.length - 1)},${100 - s}`).join(' ')}
                />

                {realScores.map((s, idx) => {
                  const cx = (idx * 300) / (realScores.length - 1);
                  const cy = 100 - s;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      className="fill-brand-600 dark:fill-brand-400 stroke-white dark:stroke-surface-900"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-surface-200 dark:border-surface-800 rounded-lg">
              <Award className="w-6 h-6 text-surface-400 dark:text-surface-500 mb-1" />
              <p className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                {realScores.length === 1 ? '1 Quiz Attempt Completed' : 'No quiz attempts recorded'}
              </p>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">
                Complete at least 2 quiz assessments to view your score trajectory line graph!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-surface-400 dark:text-surface-500 pt-2 border-t border-surface-100 dark:border-surface-800">
            <span>First Attempt</span>
            <span>Real API History</span>
            <span>Latest Attempt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Instructor Analytics Panel ───────────────────────────────

function InstructorAnalytics({
  courses = [],
  stats = {},
  quizResults = [],
}: {
  courses: Course[];
  stats: any;
  quizResults?: QuizResult[];
}) {
  // Aggregate real enrollment dates across all authored courses
  const allEnrollmentDates = courses.flatMap((c) =>
    (c.enrollments || []).map((e) => e.createdAt || c.createdAt)
  );

  // Group real enrollments by month (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mName = monthNames[d.getMonth()];
    const yStr = d.getFullYear();

    const count = allEnrollmentDates.filter((dateStr) => {
      if (!dateStr) return false;
      const ed = new Date(dateStr);
      return ed.getMonth() === d.getMonth() && ed.getFullYear() === yStr;
    }).length;

    return { month: mName, count };
  });

  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1);

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Course Enrollments & Student Growth</span>
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Real student enrollment timestamps and course breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Enrollment Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">
              Monthly Student Signup Velocity
            </span>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {allEnrollmentDates.length} Total Enrolled
            </span>
          </div>

          <div className="h-44 flex items-end gap-3 pt-6 pb-2">
            {monthlyData.map((d, i) => {
              const heightPercent = d.count > 0 ? Math.max(Math.round((d.count / maxCount) * 100), 10) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-surface-700 dark:text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      d.count > 0
                        ? 'bg-brand-600 dark:bg-brand-500 group-hover:bg-brand-700'
                        : 'bg-surface-100 dark:bg-surface-800'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Authored Courses Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 block">
            Authored Courses Roster
          </span>

          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {courses.length > 0 ? (
              courses.map((c) => {
                const enrolledCount = c.enrollments?.length || 0;
                return (
                  <div key={c.id} className="p-2.5 bg-surface-50 dark:bg-surface-800/60 rounded-lg border border-surface-200 dark:border-surface-700">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-surface-900 dark:text-surface-100 truncate max-w-[180px]">
                        {c.title}
                      </span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {enrolledCount} learner{enrolledCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-[11px] text-surface-400 flex items-center gap-2">
                      <span>{c.lessons?.length || 0} Lessons</span>
                      <span>•</span>
                      <span className="capitalize">{c.level || 'Beginner'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-surface-500 italic py-4 text-center">
                No courses created yet. Click "Create New Course" above!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Content Manager Analytics Panel ─────────────────────────

function ContentManagerAnalytics({
  stats = {},
  courses = [],
  posts = [],
}: {
  stats: any;
  courses: Course[];
  posts: any[];
}) {
  // Aggregate real categories from courses
  const categoryCounts: { [cat: string]: number } = {};
  courses.forEach((c) => {
    const cat = c.category ? c.category.trim() : 'General Tech';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalCatCourses = courses.length || 1;
  const categoriesList = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat,
    count,
    percentage: Math.round((count / totalCatCourses) * 100),
  }));

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Editorial & Course Publication Velocity</span>
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Real course counts and category distribution from your database.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 block">
            Publications Overview
          </span>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-surface-50 dark:bg-surface-800/60 rounded-xl border border-surface-200 dark:border-surface-700">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {posts.length || stats.blogPosts || 0}
              </span>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 font-medium">Published Articles</p>
            </div>

            <div className="p-4 bg-surface-50 dark:bg-surface-800/60 rounded-xl border border-surface-200 dark:border-surface-700">
              <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                {courses.length || stats.totalCourses || 0}
              </span>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 font-medium">Published Courses</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3">
          <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 block">
            Real Category Breakdown
          </span>
          <div className="space-y-3 text-xs max-h-44 overflow-y-auto pr-1">
            {categoriesList.length > 0 ? (
              categoriesList.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-semibold text-surface-800 dark:text-surface-200">
                    <span className="capitalize">{item.name}</span>
                    <span>
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                    <div style={{ width: `${item.percentage}%` }} className="h-full bg-purple-600 dark:bg-purple-500 rounded-full" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-surface-500 italic py-3">No categories found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 4. Admin Platform Analytics Panel ──────────────────────────

function AdminPlatformAnalytics({
  stats = {},
  users = [],
  courses = [],
}: {
  stats: any;
  users: any[];
  courses: Course[];
}) {
  const totalUsers = users.length || Number(stats.totalUsers) || 1;
  const students = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'student').length || Number(stats.totalStudents) || 0;
  const instructors = users.filter((u) => (typeof u.role === 'object' ? u.role?.type : u.role) === 'instructor').length || Number(stats.totalInstructors) || 0;
  const managers = users.filter((u) => {
    const rType = typeof u.role === 'object' ? u.role?.type : u.role;
    return rType === 'content_manager' || rType === 'admin';
  }).length || Number(stats.totalManagers) || 0;

  const studentPercent = Math.round((students / totalUsers) * 100);
  const instructorPercent = Math.round((instructors / totalUsers) * 100);
  const managerPercent = Math.max(0, 100 - studentPercent - instructorPercent);

  // Group real user signups by month (last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const userGrowthMonths = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const mName = monthNames[d.getMonth()];
    const yStr = d.getFullYear();

    const count = users.filter((u) => {
      if (!u.createdAt) return false;
      const ud = new Date(u.createdAt);
      return ud.getMonth() === d.getMonth() && ud.getFullYear() === yStr;
    }).length;

    return { month: mName, count };
  });

  const maxGrowthCount = Math.max(...userGrowthMonths.map((d) => d.count), 1);

  return (
    <div className="space-y-6 pt-2">
      <div>
        <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Platform Growth & User Role Distribution</span>
        </h2>
        <p className="text-xs text-surface-500 dark:text-surface-400">
          Real platform user registration timestamps and live role percentages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Growth & Registration Bar Chart */}
        <div className="lg:col-span-7 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-surface-800 dark:text-surface-200">
              Real User Registration Timestamps
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {totalUsers} Total Accounts
            </span>
          </div>

          <div className="h-44 flex items-end gap-3 pt-6 pb-2">
            {userGrowthMonths.map((d, i) => {
              const heightPercent = d.count > 0 ? Math.max(Math.round((d.count / maxGrowthCount) * 100), 12) : 4;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-surface-700 dark:text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all ${
                      d.count > 0
                        ? 'bg-blue-600 dark:bg-blue-500 group-hover:bg-blue-700'
                        : 'bg-surface-100 dark:bg-surface-800'
                    }`}
                  />
                  <span className="text-[11px] font-medium text-surface-500 dark:text-surface-400">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Role Distribution Bar Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4">
          <span className="text-xs font-semibold text-surface-800 dark:text-surface-200 block">
            Live System Role Distribution
          </span>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            <div style={{ width: `${studentPercent}%` }} className="bg-emerald-500" title={`Students: ${studentPercent}%`} />
            <div style={{ width: `${instructorPercent}%` }} className="bg-amber-500" title={`Instructors: ${instructorPercent}%`} />
            <div style={{ width: `${managerPercent}%` }} className="bg-blue-500" title={`Managers: ${managerPercent}%`} />
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-surface-700 dark:text-surface-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Students
              </span>
              <span className="font-bold text-surface-900 dark:text-surface-100">{students} ({studentPercent}%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-surface-700 dark:text-surface-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Instructors
              </span>
              <span className="font-bold text-surface-900 dark:text-surface-100">{instructors} ({instructorPercent}%)</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-surface-700 dark:text-surface-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Managers & Admins
              </span>
              <span className="font-bold text-surface-900 dark:text-surface-100">{managers} ({managerPercent}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
