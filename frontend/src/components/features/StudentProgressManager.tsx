'use client';

import { useState } from 'react';
import { useCourseStudentProgress } from '@/hooks/queries/useCourses';
import { Users, Award, Search, ChevronLeft, ChevronRight, AlertCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StudentProgressManagerProps {
  courseDocumentId: string;
}

export function StudentProgressManager({ courseDocumentId }: StudentProgressManagerProps) {
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isError, error } = useCourseStudentProgress(
    courseDocumentId,
    {
      page,
      pageSize,
      search: activeSearch.trim() || undefined,
    },
    Boolean(courseDocumentId)
  );

  const students = data?.students || [];
  const pagination = data?.pagination || {
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    setActiveSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-900 p-4 sm:p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-900">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-surface-900 dark:text-surface-50 text-base">Enrolled Students Roster</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Track real-time progress, quiz attempts, and lesson completion percentages
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500" />
            <input
              type="text"
              placeholder="Search student username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="cursor-pointer text-xs">
            Search
          </Button>
          {activeSearch && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClearSearch}
              className="cursor-pointer text-xs text-surface-500 hover:text-surface-900"
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Error state */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error instanceof Error ? error.message : 'Failed to load enrolled students progress.'}</span>
        </div>
      )}

      {/* Loading Shimmer */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent mx-auto"></div>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-3 font-medium">
            Fetching student roster and grading analytics...
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs p-8 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-3 text-surface-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-surface-900 dark:text-surface-50 text-base mb-1">
            {activeSearch ? 'No matching students found' : 'No students enrolled yet'}
          </h4>
          <p className="text-surface-500 dark:text-surface-400 text-xs leading-relaxed max-w-sm mx-auto">
            {activeSearch
              ? `No student matched "${activeSearch}". Try searching for another username or email.`
              : 'As soon as learners enroll in this course, their progress, lesson completion counts, and quiz scores will appear here.'}
          </p>
        </div>
      ) : (
        /* Progress Roster Table */
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/40 text-[11px] font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Student</th>
                  <th className="py-3.5 px-4 text-center">Lessons Completed</th>
                  <th className="py-3.5 px-4">Progress %</th>
                  <th className="py-3.5 px-4">Assessment Scores</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Enrolled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-xs">
                {students.map((student) => {
                  const initials = student.student?.username
                    ? student.student.username.substring(0, 2).toUpperCase()
                    : 'ST';
                  const isFinished = student.progressPercentage === 100;

                  return (
                    <tr
                      key={student.student?.id || Math.random()}
                      className="hover:bg-surface-50/70 dark:hover:bg-surface-800/40 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs shrink-0 border border-brand-200 dark:border-brand-900">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-surface-900 dark:text-surface-50">
                              {student.student?.username || 'Unknown Student'}
                            </div>
                            <div className="text-[11px] text-surface-500 dark:text-surface-400">
                              {student.student?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Lesson Count Ratio */}
                      <td className="py-4 px-4 text-center font-semibold text-surface-700 dark:text-surface-300">
                        <span className={isFinished ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                          {student.completedLessonsCount}
                        </span>
                        <span className="text-surface-400 dark:text-surface-500 font-normal"> / {student.totalLessons}</span>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-4 px-4 w-48">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[11px] font-bold">
                            <span
                              className={
                                isFinished
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-brand-600 dark:text-brand-400'
                              }
                            >
                              {student.progressPercentage}%
                            </span>
                            {isFinished && (
                              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="w-full h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-500' : 'bg-brand-600 dark:bg-brand-500'
                              }`}
                              style={{ width: `${student.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quiz Scores */}
                      <td className="py-4 px-4">
                        {student.quizResults && student.quizResults.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {student.quizResults.map((q) => (
                              <span
                                key={q.id || Math.random()}
                                title={`${q.quizTitle}: ${q.score}/${q.totalQuestions} (${q.percentage}%)`}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  q.passed
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                                }`}
                              >
                                <Award className="w-3 h-3 shrink-0" />
                                <span>
                                  {q.quizTitle}: {q.score}/{q.totalQuestions} ({q.percentage}%)
                                </span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-surface-400 dark:text-surface-500 text-[11px] italic">
                            No quizzes taken
                          </span>
                        )}
                      </td>

                      {/* Enrolled At Date */}
                      <td className="py-4 px-4 sm:px-6 text-right text-surface-500 dark:text-surface-400 text-[11px]">
                        {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.pageCount > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/30 text-xs text-surface-600 dark:text-surface-400">
              <div>
                Showing page <span className="font-bold text-surface-900 dark:text-surface-100">{pagination.page}</span> of{' '}
                <span className="font-bold text-surface-900 dark:text-surface-100">{pagination.pageCount}</span> ({pagination.total} students)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="gap-1 cursor-pointer text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.pageCount}
                  onClick={() => setPage((prev) => Math.min(pagination.pageCount, prev + 1))}
                  className="gap-1 cursor-pointer text-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
