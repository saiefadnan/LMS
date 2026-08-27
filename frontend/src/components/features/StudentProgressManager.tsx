'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCourseStudentProgress } from '@/lib/api';
import { type CourseStudentProgressItem } from '@/types';
import { Users, Award, Search, ChevronLeft, ChevronRight, AlertCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StudentProgressManagerProps {
  courseDocumentId: string;
}

export function StudentProgressManager({ courseDocumentId }: StudentProgressManagerProps) {
  const [students, setStudents] = useState<CourseStudentProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Search state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    pageCount: 1,
  });

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCourseStudentProgress(courseDocumentId, {
        page,
        pageSize,
        search: search.trim() || undefined,
      });

      setStudents(res.students || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load student progress', err);
      setError(err.message || 'Failed to load enrolled students progress.');
    } finally {
      setLoading(false);
    }
  }, [courseDocumentId, page, pageSize, search]);

  useEffect(() => {
    if (courseDocumentId) {
      loadProgress();
    }
  }, [courseDocumentId, page, pageSize, loadProgress]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProgress();
  };

  const totalStudents = pagination.total;
  const startCount = totalStudents === 0 ? 0 : (page - 1) * pageSize + 1;
  const endCount = Math.min(page * pageSize, totalStudents);

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 md:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600" />
            Enrolled Students & Progress
          </h2>
          <p className="text-surface-500 text-xs mt-0.5">
            Real-time lesson completion and quiz performance across all enrolled learners.
          </p>
        </div>

        {/* Total metric badge */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-brand-50 text-brand-800 rounded-lg border border-brand-200 font-semibold">
            <span>Total Enrolled: </span>
            <span className="font-black text-brand-900">{totalStudents}</span>
          </div>
        </div>
      </div>

      {/* Search & Page Size Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-50 p-3 rounded-xl border border-surface-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-white border border-surface-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-surface-900"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-surface-500 font-medium">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-surface-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-surface-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
          <p className="text-surface-500 text-xs mt-3">Loading student roster and progress...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-surface-200 rounded-xl p-6 bg-surface-50/50">
          <div className="w-10 h-10 rounded-full bg-surface-100 text-surface-400 flex items-center justify-center mx-auto mb-2.5">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-surface-900 text-sm mb-1">
            {search ? 'No matching students found' : 'No students enrolled yet'}
          </h3>
          <p className="text-surface-500 text-xs max-w-sm mx-auto">
            {search
              ? 'Try adjusting your search keyword.'
              : 'Once students enroll in this course, their lesson progress and quiz scores will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-3.5 pl-4">Student</th>
                  <th className="p-3.5">Enrolled Date</th>
                  <th className="p-3.5">Lesson Progress</th>
                  <th className="p-3.5 pr-4">Quiz Scores</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {students.map((item) => (
                  <tr key={item.student.id} className="hover:bg-surface-50/50 transition-colors">
                    {/* Student Avatar + Details */}
                    <td className="p-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200 shrink-0">
                          {item.student.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-surface-900 text-xs sm:text-sm">
                            {item.student.username}
                          </p>
                          <p className="text-[11px] text-surface-400">{item.student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Enrolled Date */}
                    <td className="p-3.5 text-xs text-surface-500">
                      {new Date(item.enrolledAt).toLocaleDateString()}
                    </td>

                    {/* Progress Bar & Counter */}
                    <td className="p-3.5">
                      <div className="w-44 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-surface-700">
                          <span>
                            {item.completedLessonsCount} / {item.totalLessons} Lessons
                          </span>
                          <span
                            className={
                              item.progressPercentage === 100 ? 'text-emerald-600' : 'text-brand-600'
                            }
                          >
                            {item.progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-surface-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Quiz Results */}
                    <td className="p-3.5 pr-4">
                      {item.quizResults.length === 0 ? (
                        <span className="text-xs text-surface-400 italic">No quizzes taken</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {item.quizResults.map((qr) => (
                            <span
                              key={qr.id}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                qr.passed
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                              title={`${qr.quizTitle}: ${qr.score}/${qr.totalQuestions} (${qr.percentage}%)`}
                            >
                              <Award className="w-3 h-3" />
                              {qr.quizTitle}: {qr.percentage}% ({qr.passed ? 'Pass' : 'Fail'})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-100 text-xs text-surface-500">
            <div>
              Showing <span className="font-bold text-surface-900">{startCount}</span> to{' '}
              <span className="font-bold text-surface-900">{endCount}</span> of{' '}
              <span className="font-bold text-surface-900">{totalStudents}</span> enrolled learners
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <span className="px-3 py-1 font-semibold text-surface-700 bg-surface-50 rounded border border-surface-200">
                Page {page} of {pagination.pageCount}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.pageCount, p + 1))}
                disabled={page >= pagination.pageCount}
                className="gap-1 px-2.5 py-1 text-xs cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
