'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLesson, updateLesson, deleteLesson } from '@/lib/api';
import { lessonSchema, type LessonFormValues } from '@/lib/validations';
import { type Lesson, type Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface LessonManagerProps {
  course: Course;
  onLessonChanged: () => void;
}

export function LessonManager({ course, onLessonChanged }: LessonManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
  });

  const lessons = course.lessons || [];

  const handleStartAdd = () => {
    reset({
      title: '',
      content: '',
      videoUrl: '',
      order: lessons.length + 1,
    });
    setEditingId(null);
    setIsAdding(true);
    setError('');
  };

  const handleStartEdit = (lesson: Lesson) => {
    reset({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      order: lesson.order,
    });
    setIsAdding(false);
    setEditingId(lesson.id);
    setError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset();
  };

  const onSubmit = async (data: LessonFormValues) => {
    try {
      setError('');
      if (isAdding) {
        await createLesson({
          ...data,
          course: course.id,
        });
      } else if (editingId) {
        const lessonToEdit = lessons.find((l) => l.id === editingId);
        if (lessonToEdit) {
          await updateLesson(lessonToEdit.documentId, data);
        }
      }
      setIsAdding(false);
      setEditingId(null);
      onLessonChanged(); // Trigger parent to refetch course data
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    }
  };

  const handleDelete = async (lessonDocId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await deleteLesson(lessonDocId);
      onLessonChanged();
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-surface-900">Curriculum ({lessons.length} Lessons)</h2>
        {!isAdding && !editingId && (
          <Button onClick={handleStartAdd} variant="secondary" size="sm">
            + Add Lesson
          </Button>
        )}
      </div>

      {/* Lesson List */}
      {!isAdding && !editingId && (
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <p className="text-surface-500 text-center py-8 border border-dashed border-surface-300 rounded-lg">
              No lessons yet. Click "Add Lesson" to start building your curriculum.
            </p>
          ) : (
            lessons.map((lesson) => (
              <div 
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-white border border-surface-200 rounded-lg hover:border-surface-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-surface-100 flex items-center justify-center text-surface-500 font-medium text-sm">
                    {lesson.order}
                  </div>
                  <div>
                    <h4 className="font-medium text-surface-900">{lesson.title}</h4>
                    {lesson.videoUrl && (
                      <span className="text-xs text-brand-600 font-medium">Includes Video</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleStartEdit(lesson)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(lesson.documentId)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-surface-50 p-6 rounded-xl border border-surface-200">
          <h3 className="text-lg font-bold text-surface-900 mb-4">
            {isAdding ? 'Add New Lesson' : 'Edit Lesson'}
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Input
                  label="Lesson Title"
                  {...register('title')}
                  error={errors.title?.message}
                />
              </div>
              <div>
                <Input
                  label="Order"
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                  error={errors.order?.message}
                />
              </div>
            </div>

            <Input
              label="Video URL (Optional YouTube/Vimeo link)"
              {...register('videoUrl')}
              error={errors.videoUrl?.message}
            />

            <Textarea
              label="Lesson Content (Text/Markdown)"
              {...register('content')}
              error={errors.content?.message}
              className="min-h-[200px]"
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Lesson
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
