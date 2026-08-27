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
import { ArrowLeft, ExternalLink, Trash2, AlertCircle } from 'lucide-react';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

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

  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!window.confirm(`Are you sure you want to permanently delete course "${course.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteCourse(documentId);
      router.push('/dashboard/courses');
    } catch (err: any) {
      alert(err.message || 'Failed to delete course');
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

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/courses" className="text-surface-500 hover:text-surface-900 flex items-center gap-1.5 text-xs font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
        <Link href={`/courses/${course.documentId}`} target="_blank">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <span>View Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-surface-900">Edit Course: {course.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-surface-200 p-6 md:p-8 shadow-xs">
            <h2 className="text-base font-bold text-surface-900 mb-5">Course Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {saveError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2.5">
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
                  <label className="block text-sm font-medium text-surface-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    {...register('level')}
                    className="flex h-10 w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm text-surface-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  {...register('published')}
                  className="w-4 h-4 text-brand-600 rounded border-surface-300 focus:ring-brand-500 cursor-pointer"
                />
                <label htmlFor="published" className="text-sm font-medium text-surface-700 cursor-pointer">
                  Publish immediately (visible to students)
                </label>
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end">
                <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Lesson Manager Component */}
          <LessonManager course={course} onLessonChanged={fetchCourse} />
          
          {/* Quiz Manager Component */}
          <QuizManager course={course} onQuizChanged={fetchCourse} />

          {/* Enrolled Students & Progress Component */}
          <StudentProgressManager courseDocumentId={course.documentId} />
        </div>

        {/* Right Column - Status/Meta */}
        <div className="space-y-6">
          <div className="bg-surface-50 rounded-xl border border-surface-200 p-5 shadow-xs">
            <h3 className="font-bold text-surface-900 text-sm mb-3.5">Course Overview</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-surface-200/80">
                <span className="text-surface-500">Status</span>
                <span className={course.published ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200/80">
                <span className="text-surface-500">Students</span>
                <span className="text-surface-900 font-semibold">
                  {course.enrollments?.length || 0}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200/80">
                <span className="text-surface-500">Lessons</span>
                <span className="text-surface-900 font-semibold">
                  {course.lessons?.length || 0}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200/80">
                <span className="text-surface-500">Quizzes</span>
                <span className="text-surface-900 font-semibold">
                  {course.quizzes?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Created</span>
                <span className="text-surface-700">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-xl border border-red-200 p-5 space-y-3 shadow-xs">
            <h3 className="font-bold text-red-900 text-xs uppercase tracking-wider">Danger Zone</h3>
            <p className="text-[11px] text-red-600 leading-relaxed">
              Permanently remove this course, its lessons, quizzes, and associated records.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteCourse}
              className="w-full gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Course</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
