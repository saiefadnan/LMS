'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Course, Lesson } from '@/types';
import { 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Trophy, 
  HelpCircle, 
  Video, 
  FileText, 
  ArrowLeft 
} from 'lucide-react';

interface LearningSidebarProps {
  course: Course;
  completedLessonIds: number[];
}

export default function LearningSidebar({ course, completedLessonIds }: LearningSidebarProps) {
  const pathname = usePathname();
  
  // Sort lessons by order
  const lessons = [...(course.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  const quizzes = course.quizzes || [];
  const progressPercent = lessons.length ? Math.round((completedLessonIds.length / lessons.length) * 100) : 0;

  return (
    <div className="w-80 border-r border-surface-200 bg-white h-full flex flex-col shrink-0">
      <div className="p-5 border-b border-surface-200/80 bg-surface-50/40">
        <Link 
          href="/dashboard/my-courses" 
          className="text-xs font-medium text-surface-500 hover:text-brand-600 inline-flex items-center gap-1.5 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Learning</span>
        </Link>
        <h2 className="font-bold text-base text-surface-900 line-clamp-2 leading-snug">{course.title}</h2>
        <div className="mt-3.5 space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-surface-500">
            <span>Course Progress</span>
            <span className="font-semibold text-brand-700">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-brand-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-surface-400">
            {completedLessonIds.length} of {lessons.length} lessons completed
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Lessons Section */}
        <div>
          <div className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-surface-400">
            Curriculum
          </div>
          <div className="space-y-1">
            {lessons.length === 0 ? (
              <p className="text-xs text-surface-500 text-center py-4">No lessons uploaded yet.</p>
            ) : (
              lessons.map((lesson, index) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isActive = pathname === `/learn/${course.documentId}/${lesson.documentId}`;
                
                return (
                  <Link
                    key={lesson.documentId}
                    href={`/learn/${course.documentId}/${lesson.documentId}`}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-all text-xs ${
                      isActive 
                        ? 'bg-brand-50 border border-brand-200 text-brand-900 font-medium shadow-2xs' 
                        : 'hover:bg-surface-50 border border-transparent text-surface-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-surface-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`leading-snug truncate ${isCompleted ? 'text-surface-600' : 'text-surface-900 font-medium'}`}>
                        {index + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-surface-400 mt-0.5">
                        {lesson.videoUrl ? (
                          <>
                            <Video className="w-3 h-3 text-brand-500" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 text-surface-400" />
                            <span>Article</span>
                          </>
                        )}
                      </div>
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
            <div className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-surface-400 flex items-center justify-between">
              <span>Assessments</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                {quizzes.length}
              </span>
            </div>
            <div className="space-y-1">
              {quizzes.map((quiz) => {
                const isActive = pathname === `/learn/${course.documentId}/quiz/${quiz.documentId}`;
                const qCount = quiz.questions?.length || 0;

                return (
                  <Link
                    key={quiz.documentId || quiz.id}
                    href={`/learn/${course.documentId}/quiz/${quiz.documentId}`}
                    className={`flex items-start gap-3 p-2.5 rounded-lg transition-all text-xs ${
                      isActive
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 font-medium shadow-2xs'
                        : 'hover:bg-surface-50 border border-transparent text-surface-700'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Trophy className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-amber-500'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="leading-snug truncate font-medium text-surface-900">
                        {quiz.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-surface-400 mt-0.5">
                        <HelpCircle className="w-3 h-3" />
                        <span>{qCount} Question{qCount === 1 ? '' : 's'} • Auto-Graded</span>
                      </div>
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
