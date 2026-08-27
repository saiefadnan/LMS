'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCourse, updateCourse } from '@/lib/api';
import { courseSchema, type CourseFormValues } from '@/lib/validations';
import { type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LessonManager } from '@/components/features/LessonManager';
import { QuizManager } from '@/components/features/QuizManager';
import { StudentProgressManager } from '@/components/features/StudentProgressManager';

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState('');

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
      setCourse(res.data);
      // Populate form
      reset({
        title: res.data.title,
        description: res.data.description,
        level: res.data.level,
        category: res.data.category,
        published: res.data.published,
        thumbnail: typeof res.data.thumbnail === 'string' 
          ? res.data.thumbnail 
          : res.data.thumbnail?.url || '',
      });
    } catch (error) {
      console.error('Failed to load course', error);
      setSaveError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [documentId, reset]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses" className="text-surface-500 hover:text-surface-900">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-surface-900">Edit Course</h1>
        </div>
        <Link href={`/courses/${course.documentId}`} target="_blank">
          <Button variant="ghost">View Public Page ↗</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-surface-200 p-6 md:p-8">
            <h2 className="text-lg font-bold text-surface-900 mb-6">Course Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {saveError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {saveError}
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
                  className="w-4 h-4 text-brand-600 rounded border-surface-300 focus:ring-brand-500"
                />
                <label htmlFor="published" className="text-sm font-medium text-surface-700">
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
          <div className="bg-surface-50 rounded-xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">Course Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-surface-200">
                <span className="text-surface-500">Status</span>
                <span className={course.published ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200">
                <span className="text-surface-500">Students</span>
                <span className="text-surface-900 font-medium">
                  {course.enrollments?.length || 0}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200">
                <span className="text-surface-500">Lessons</span>
                <span className="text-surface-900 font-medium">
                  {course.lessons?.length || 0}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-surface-200">
                <span className="text-surface-500">Quizzes</span>
                <span className="text-surface-900 font-medium">
                  {course.quizzes?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Created</span>
                <span className="text-surface-900">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
