import Link from 'next/link';
import { Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

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
      <div className="text-center py-12 bg-white rounded-xl border border-surface-200">
        <p className="text-surface-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.documentId} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
          {/* Thumbnail or fallback icon */}
          <div className="h-48 bg-surface-100 flex items-center justify-center relative overflow-hidden">
            {getThumbnailSrc(course.thumbnail)
              ? <img src={getThumbnailSrc(course.thumbnail)} alt={course.title} className="w-full h-full object-cover" />
              : <span className="text-4xl text-surface-300">📚</span>
            }
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-surface-900 border-surface-200">
                {course.level}
              </Badge>
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-surface-900 border-surface-200">
                {course.category}
              </Badge>
            </div>
          </div>
          
          <CardHeader className="pb-3 flex-grow">
            <CardTitle className="text-xl mb-2 line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-4">
            <div className="flex items-center gap-2 text-sm text-surface-500">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
                {course.instructor?.username?.charAt(0).toUpperCase() || 'I'}
              </span>
              <span>{course.instructor?.username || 'Unknown Instructor'}</span>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 flex justify-between items-center mt-auto border-t border-surface-100 pt-4">
            {renderAction ? (
              renderAction(course)
            ) : (
              <Link href={`/courses/${course.documentId}`} className="w-full">
                <Button variant="secondary" className="w-full group">
                  View Course
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
