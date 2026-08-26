'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Course, Lesson } from '@/types';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface LearningSidebarProps {
  course: Course;
  completedLessonIds: number[];
}

export default function LearningSidebar({ course, completedLessonIds }: LearningSidebarProps) {
  const pathname = usePathname();
  
  // Sort lessons by order
  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="w-80 border-r border-surface-200 bg-white h-full flex flex-col shrink-0">
      <div className="p-6 border-b border-surface-200">
        <Link href="/dashboard/my-courses" className="text-sm text-surface-500 hover:text-brand-600 flex items-center gap-2 mb-4">
          ← Back to Dashboard
        </Link>
        <h2 className="font-bold text-lg text-surface-900 line-clamp-2">{course.title}</h2>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-600 transition-all duration-500"
              style={{ width: `${lessons.length ? (completedLessonIds.length / lessons.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-medium text-surface-500">
            {completedLessonIds.length}/{lessons.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {lessons.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-8">No lessons available yet.</p>
        ) : (
          lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.includes(lesson.id);
            const isActive = pathname === `/learn/${course.documentId}/${lesson.documentId}`;
            
            return (
              <Link
                key={lesson.documentId}
                href={`/learn/${course.documentId}/${lesson.documentId}`}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-brand-50 border border-brand-100' 
                    : 'hover:bg-surface-50 border border-transparent'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <PlayCircle className="w-5 h-5 text-brand-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-surface-300" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium leading-snug ${isActive ? 'text-brand-900' : 'text-surface-700'}`}>
                    {index + 1}. {lesson.title}
                  </p>
                  <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                    {lesson.videoUrl ? '🎥 Video' : '📄 Article'}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
