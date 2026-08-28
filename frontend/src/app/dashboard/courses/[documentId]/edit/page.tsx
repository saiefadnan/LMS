'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCourse, updateCourse, deleteCourse } from '@/lib/api';
import { courseSchema, type CourseFormValues } from '@/lib/validations';
import { type Course } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LessonManager } from '@/components/features/LessonManager';
import { QuizManager } from '@/components/features/QuizManager';
import { StudentProgressManager } from '@/components/features/StudentProgressManager';
import { ArrowLeft, ExternalLink, Trash2, AlertCircle, Users, BookOpen, HelpCircle, FileText, Layers, CheckCircle2, Clock, Eye } from 'lucide-react';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'lessons' | 'quizzes' | 'students' | 'all'>('details');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
  });

  const fetchCourse = useCallback(async () => {
    try {
      const res = await getCourse(documentId);
      const courseData = res.data;

      if (user && roleType === 'student') {
        router.push('/dashboard/my-courses');
        return;
      }
      if (user && roleType === 'instructor') {
        const isOwner = (courseData.instructor as any)?.id === user.id || (courseData.instructor as any) === user.id;
        if (courseData.instructor && !isOwner) {
          alert('You can only edit courses you created.');
          router.push('/dashboard/courses');
          return;
        }
      }

      setCourse(courseData);
      // Populate form
      reset({
        title: courseData.title,
        description: courseData.description,
        level: courseData.level,
        category: courseData.category,
        published: courseData.published,
        thumbnail: typeof courseData.thumbnail === 'string' 
          ? courseData.thumbnail 
          : courseData.thumbnail?.url || '',
      });
    } catch (error) {
      console.error('Failed to load course', error);
      setSaveError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [documentId, reset, user, roleType, router]);

  useEffect(() => {
    if (documentId) {
      fetchCourse();
    }
  }, [documentId, fetchCourse]);

  const onSubmit = async (data: CourseFormValues) => {
    try {
      setSaveError('');
      const payload: Record<string, any> = {
        title: data.title,
        description: data.description,
        level: data.level,
        category: data.category,
        published: Boolean(data.published),
      };

      if (data.thumbnail && data.thumbnail.trim()) {
        payload.thumbnail = data.thumbnail.trim();
      }

      await updateCourse(documentId, payload);
      alert('Course updated successfully');
      // Refetch to get updated data
      fetchCourse();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update course');
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCourse = async () => {
    if (!course) return;
    const confirmed = window.confirm(`Are you sure you want to permanently delete course "${course.title}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      console.log('Deleting course with documentId:', documentId);
      await deleteCourse(documentId);
      console.log('Course successfully deleted. Navigating to /dashboard/courses...');
      window.location.href = '/dashboard/courses';
    } catch (err: any) {
      console.error('Course deletion failed:', err);
      alert(err.message || 'Failed to delete course');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-surface-600 text-sm">Course not found</div>;
  }

  const lessonCount = course.lessons?.length || 0;
  const quizCount = course.quizzes?.length || 0;
  const studentCount = course.enrollments?.length || 0;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/courses" className="text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 flex items-center gap-1.5 text-xs font-medium transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
              Edit Course: {course.title}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              course.published
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
            }`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/courses/${course.documentId}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
              <span>View Public Page</span>
              <ExternalLink className="w-3 h-3 text-surface-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards (Fills top horizontal space) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Visibility Status</p>
            <p className="text-base font-bold text-surface-900 dark:text-surface-100 mt-1">
              {course.published ? 'Live & Public' : 'Draft Mode'}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            course.published ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Total Enrolled</p>
            <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{studentCount} Learners</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Lessons Count</p>
            <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{lessonCount} Modules</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 p-4.5 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Assessments</p>
            <p className="text-xl font-bold text-surface-900 dark:text-surface-100 mt-1">{quizCount} Quizzes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Segmented Studio Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-100 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'details'
              ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Course Details & Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum ({lessonCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quizzes ({quizCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Roster ({studentCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            activeTab === 'all'
              ? 'bg-white dark:bg-surface-800 text-brand-600 dark:text-brand-400 shadow-xs'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Sections</span>
        </button>
      </div>

      {/* Workspace Area */}
      {(activeTab === 'details' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-xs">
              <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                Course Details & Content Settings
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {saveError && (
                  <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-900 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                <Input
                  label="Course Title"
                  {...register('title')}
                  error={errors.title?.message}
                />

                <Textarea
                  label="Course Description"
                  {...register('description')}
                  error={errors.description?.message}
                  className="min-h-[120px]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-800 dark:text-surface-200 mb-1.5">
                      Difficulty Level
                    </label>
                    <select
                      {...register('level')}
                      className="flex h-10 w-full rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 px-3 py-2 text-sm text-surface-900 dark:text-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <option value="beginner" className="dark:bg-surface-900">Beginner</option>
                      <option value="intermediate" className="dark:bg-surface-900">Intermediate</option>
                      <option value="advanced" className="dark:bg-surface-900">Advanced</option>
                    </select>
                    {errors.level && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.level.message}</p>}
                  </div>
                  <Input
                    label="Category"
                    {...register('category')}
                    error={errors.category?.message}
                  />
                </div>

                <Input
                  label="Thumbnail URL (Optional)"
                  {...register('thumbnail')}
                  error={errors.thumbnail?.message}
                />

                <div className="flex items-center gap-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                  <input
                    type="checkbox"
                    id="published"
                    {...register('published')}
                    className="w-4 h-4 text-brand-600 rounded border-surface-300 dark:border-surface-700 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-surface-700 dark:text-surface-300 cursor-pointer select-none">
                    Publish course (visible in public catalog)
                  </label>
                </div>

                <div className="pt-4 border-t border-surface-100 dark:border-surface-800 flex justify-end">
                  <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column Meta */}
          <div className="space-y-6">
            <div className="bg-surface-50 dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-5 shadow-xs">
              <h3 className="font-bold text-surface-900 dark:text-surface-50 text-sm mb-3.5">Course Overview</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
                  <span className="text-surface-500 dark:text-surface-400">Status</span>
                  <span className={course.published ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
                  <span className="text-surface-500 dark:text-surface-400">Students</span>
                  <span className="text-surface-900 dark:text-surface-100 font-semibold">{studentCount}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
                  <span className="text-surface-500 dark:text-surface-400">Lessons</span>
                  <span className="text-surface-900 dark:text-surface-100 font-semibold">{lessonCount}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-surface-200/80 dark:border-surface-800">
                  <span className="text-surface-500 dark:text-surface-400">Quizzes</span>
                  <span className="text-surface-900 dark:text-surface-100 font-semibold">{quizCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Created</span>
                  <span className="text-surface-700 dark:text-surface-300">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 p-5 space-y-3 shadow-xs">
              <h3 className="font-bold text-red-900 dark:text-red-300 text-xs uppercase tracking-wider">Danger Zone</h3>
              <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">
                Permanently remove this course, its lessons, quizzes, and associated records.
              </p>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteCourse}
                isLoading={isDeleting}
                className="w-full gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Course</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum / Lessons View */}
      {(activeTab === 'lessons' || activeTab === 'all') && (
        <div className="w-full">
          <LessonManager course={course} onLessonChanged={fetchCourse} />
        </div>
      )}

      {/* Quizzes View */}
      {(activeTab === 'quizzes' || activeTab === 'all') && (
        <div className="w-full">
          <QuizManager course={course} onQuizChanged={fetchCourse} />
        </div>
      )}

      {/* Student Progress Roster View */}
      {(activeTab === 'students' || activeTab === 'all') && (
        <div className="w-full">
          <StudentProgressManager courseDocumentId={course.documentId} />
        </div>
      )}
    </div>
  );
}
