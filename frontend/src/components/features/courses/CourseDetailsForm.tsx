'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, type CourseFormValues } from '@/lib/validations';
import { Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FileText, AlertCircle } from 'lucide-react';

interface CourseDetailsFormProps {
  course: Course;
  saveError: string;
  onSaveCourse: (values: CourseFormValues) => Promise<void>;
}

export function CourseDetailsForm({
  course,
  saveError,
  onSaveCourse,
}: CourseDetailsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      level: course.level,
      category: course.category,
      published: course.published,
      thumbnail:
        typeof course.thumbnail === 'string'
          ? course.thumbnail
          : course.thumbnail?.url || '',
    },
  });

  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 md:p-8 shadow-xs">
      <h2 className="text-base font-bold text-surface-900 dark:text-surface-50 mb-5 flex items-center gap-2">
        <FileText className="w-4 h-4 text-brand-600" />
        Course Details & Content Settings
      </h2>
      <form onSubmit={handleSubmit(onSaveCourse)} className="space-y-6">
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
              <option value="beginner" className="dark:bg-surface-900">
                Beginner
              </option>
              <option value="intermediate" className="dark:bg-surface-900">
                Intermediate
              </option>
              <option value="advanced" className="dark:bg-surface-900">
                Advanced
              </option>
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.level.message}</p>
            )}
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
          <label
            htmlFor="published"
            className="text-sm font-medium text-surface-700 dark:text-surface-300 cursor-pointer select-none"
          >
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
  );
}
