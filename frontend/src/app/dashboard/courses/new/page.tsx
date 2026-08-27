'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCourse } from '@/lib/api';
import { courseSchema, type CourseFormValues } from '@/lib/validations';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState('');

  const roleType = (typeof user?.role === 'object' ? user?.role?.type : user?.role) || 'student';

  useEffect(() => {
    if (user && roleType === 'student') {
      router.push('/dashboard');
    }
  }, [user, roleType, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      level: 'beginner',
      category: '',
      published: false,
      thumbnail: '',
    },
  });

  const onSubmit = async (data: CourseFormValues) => {
    if (!user) {
      setError('You must be logged in as an instructor to create a course.');
      return;
    }
    
    try {
      setError('');
      const payload: Record<string, any> = {
        title: data.title,
        description: data.description,
        level: data.level,
        category: data.category,
        published: Boolean(data.published),
      };

      // Only include thumbnail if provided and not empty
      if (data.thumbnail && data.thumbnail.trim()) {
        payload.thumbnail = data.thumbnail.trim();
      }
      
      const res = await createCourse(payload);
      if (res?.data?.documentId) {
        router.push(`/dashboard/courses/${res.data.documentId}/edit`);
      } else {
        router.push('/dashboard/courses');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/courses" className="text-surface-500 hover:text-surface-900 flex items-center gap-1.5 text-xs font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Create New Course</h1>

      <div className="bg-white rounded-xl border border-surface-200 p-6 md:p-8 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Course Title"
            placeholder="e.g. Advanced Next.js Patterns"
            {...register('title')}
            error={errors.title?.message}
          />

          <Textarea
            label="Course Description"
            placeholder="Explain what students will learn..."
            {...register('description')}
            error={errors.description?.message}
            className="min-h-[120px]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="e.g. Web Development"
              {...register('category')}
              error={errors.category?.message}
            />
          </div>

          <Input
            label="Thumbnail URL (Optional)"
            placeholder="https://example.com/image.jpg"
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

          <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
            <Link href="/dashboard/courses">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
