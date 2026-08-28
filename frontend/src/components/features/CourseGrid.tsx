import Link from 'next/link';
import { Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';
import { BookOpen, User, ArrowRight, Layers, Folder } from 'lucide-react';

interface CourseGridProps {
  courses: Course[];
  emptyMessage?: string;
  renderAction?: (course: Course) => React.ReactNode;
}

export function CourseGrid({ 
  courses, 
  emptyMessage = "No courses found.",
  renderAction
}: CourseGridProps) {
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs px-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <p className="text-surface-900 dark:text-surface-100 font-semibold text-base">{emptyMessage}</p>
        <p className="text-surface-500 dark:text-surface-400 text-xs mt-1">Try adjusting your filters or search keywords.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card 
          key={course.documentId} 
          className="flex flex-col overflow-hidden border border-surface-200/90 dark:border-surface-800 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 bg-white dark:bg-surface-900 group rounded-xl"
        >
          {/* Thumbnail Header */}
          <div className="h-44 bg-gradient-to-br from-surface-100 via-surface-50 to-surface-100 dark:from-surface-800 dark:via-surface-900 dark:to-surface-800 flex items-center justify-center relative overflow-hidden border-b border-surface-100 dark:border-surface-800">
            {getThumbnailSrc(course.thumbnail) ? (
              <img 
                src={getThumbnailSrc(course.thumbnail)} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-surface-300 dark:text-surface-600">
                <BookOpen className="w-10 h-10 stroke-[1.5]" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              {course.level && (
                <Badge variant="outline" size="sm" className="bg-white/95 dark:bg-surface-900/95 backdrop-blur-xs font-semibold shadow-xs">
                  {course.level}
                </Badge>
              )}
              {course.category && (
                <Badge variant="default" size="sm" className="bg-brand-50/95 dark:bg-brand-950/90 backdrop-blur-xs shadow-xs">
                  {course.category}
                </Badge>
              )}
            </div>
          </div>
          
          <CardHeader className="p-5 pb-3 flex-grow">
            <CardTitle className="text-base font-bold text-surface-900 dark:text-surface-50 leading-snug line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-surface-500 dark:text-surface-400 text-xs line-clamp-2 mt-1.5 leading-relaxed">
              {course.description || 'Comprehensive curriculum designed to master core concepts.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-5 pb-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-surface-600 dark:text-surface-400">
              <div className="w-5 h-5 rounded-full bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {course.instructor?.username?.charAt(0).toUpperCase() || 'I'}
              </div>
              <span className="truncate font-medium">{course.instructor?.username || 'Verified Instructor'}</span>
            </div>
          </CardContent>
          
          <CardFooter className="px-5 py-4 mt-auto border-t border-surface-100 dark:border-surface-800 bg-surface-50/40 dark:bg-surface-950/40">
            {renderAction ? (
              renderAction(course)
            ) : (
              <Link href={`/courses/${course.documentId}`} className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between group/btn text-xs font-medium">
                  <span>View Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5 text-surface-400 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
