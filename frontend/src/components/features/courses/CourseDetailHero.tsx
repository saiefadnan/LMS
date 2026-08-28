'use client';

import React from 'react';
import { Course } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { BookOpen } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

interface CourseDetailHeroProps {
  course: Course;
}

export function CourseDetailHero({ course }: CourseDetailHeroProps) {
  return (
    <div className="bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 dark:from-brand-950 dark:via-brand-900 dark:to-brand-950 text-white py-16 lg:py-20 border-b border-brand-800/60 dark:border-brand-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex gap-2 mb-4">
              {course.level && (
                <Badge variant="outline" className="bg-white/10 text-brand-200 border-white/20">
                  {course.level}
                </Badge>
              )}
              {course.category && (
                <Badge variant="outline" className="text-surface-300 border-surface-700 bg-surface-800">
                  {course.category}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 tracking-tight">
              {course.title}
            </h1>
            <p className="text-base text-surface-300 mb-6 max-w-xl leading-relaxed">
              {course.description}
            </p>
            <div className="flex items-center gap-3 text-surface-200">
              <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-sm">
                {course.instructor?.username?.charAt(0).toUpperCase() || 'I'}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">
                  {course.instructor?.username || 'Verified Instructor'}
                </p>
                <p className="text-xs text-surface-400">Course Lead</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video bg-surface-800 border border-surface-700/50">
            {course.thumbnail ? (
              <img
                src={getThumbnailSrc(course.thumbnail)}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-surface-500">
                <BookOpen className="w-14 h-14 stroke-[1.5]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
