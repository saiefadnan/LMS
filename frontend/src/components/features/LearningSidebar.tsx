'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Course, Lesson } from '@/types';
import { CheckCircle2, Circle, PlayCircle, Trophy, HelpCircle } from 'lucide-react';

interface LearningSidebarProps {
  course: Course;
  completedLessonIds: number[];
}

export default function LearningSidebar({ course, completedLessonIds }: LearningSidebarProps) {
  const pathname = usePathname();
  
  // Sort lessons by order
  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const quizzes = course.quizzes || [];

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

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Lessons Section */}
        <div>
          <div className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-surface-400">
            Curriculum
          </div>
          <div className="space-y-1.5">
            {lessons.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-4">No lessons available.</p>
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
                        ? 'bg-brand-50 border border-brand-100 text-brand-900 shadow-sm' 
                        : 'hover:bg-surface-50 border border-transparent text-surface-700'
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
                      <p className="text-sm font-medium leading-snug">
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

        {/* Quizzes Section */}
        {quizzes.length > 0 && (
          <div>
            <div className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
              <span>Assessments</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                {quizzes.length}
              </span>
            </div>
            <div className="space-y-1.5">
              {quizzes.map((quiz, qIndex) => {
                const isActive = pathname === `/learn/${course.documentId}/quiz/${quiz.documentId}`;
                const qCount = quiz.questions?.length || 0;

                return (
                  <Link
                    key={quiz.documentId || quiz.id}
                    href={`/learn/${course.documentId}/quiz/${quiz.documentId}`}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 shadow-sm'
                        : 'hover:bg-surface-50 border border-transparent text-surface-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Trophy className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-snug">
                        {quiz.title}
                      </p>
                      <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                        📝 {qCount} Question{qCount === 1 ? '' : 's'} • Auto-Graded
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
