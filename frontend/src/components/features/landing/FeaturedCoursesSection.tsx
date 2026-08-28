'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { Button } from '@/components/ui/Button';
import { Star, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';
import { getThumbnailSrc } from '@/lib/utils/thumbnail';

interface FeaturedCoursesSectionProps {
  courses: Course[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  categories: string[];
}

export function FeaturedCoursesSection({
  courses,
  activeCategory,
  onSelectCategory,
  categories,
}: FeaturedCoursesSectionProps) {
  const filteredCourses = courses.filter((c) => {
    if (activeCategory === 'all') return true;
    return (c.category || '').toLowerCase().includes(activeCategory);
  });

  return (
    <section className="py-16 bg-white dark:bg-surface-900 border-y border-surface-200 dark:border-surface-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Explore Programs
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
            Find your perfect program
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Browse top-rated technical courses across computer science, web development, and algorithms.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {cat === 'all' ? 'All Courses' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-video bg-surface-200 dark:bg-surface-800 overflow-hidden">
                  <img
                    src={getThumbnailSrc(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-surface-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {course.level || 'Beginner'}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 mb-2">
                      <span className="capitalize font-semibold text-brand-600 dark:text-brand-400">
                        {course.category || 'Engineering'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-surface-900 dark:text-surface-100 text-lg group-hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-2 line-clamp-2 leading-relaxed">
                      {course.description || 'Learn essential concepts, master practical skills, and build projects.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 font-medium">
                      <BookOpen className="w-4 h-4 text-surface-400" />
                      <span>{course.lessons?.length || 0} Lessons</span>
                    </div>

                    <Link href={`/courses/${course.documentId}`}>
                      <Button size="sm" variant="secondary" className="gap-1 text-xs cursor-pointer font-semibold">
                        <span>Enroll Now</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            [
              { title: 'Data Structures & C Algorithms', level: 'Beginner', category: 'Programming', lessons: 8 },
              { title: 'Full-Stack Web Development with React', level: 'Intermediate', category: 'Web Dev', lessons: 12 },
              { title: 'Database Architecture & SQL Queries', level: 'Advanced', category: 'Data Science', lessons: 10 },
            ].map((c, i) => (
              <div key={i} className="bg-surface-50 dark:bg-surface-950 rounded-2xl border border-surface-200 dark:border-surface-800 overflow-hidden shadow-xs p-6 space-y-4">
                <span className="text-xs font-bold text-brand-600 uppercase">{c.category}</span>
                <h3 className="font-bold text-surface-900 dark:text-surface-100 text-lg">{c.title}</h3>
                <p className="text-xs text-surface-500 dark:text-surface-400">Master fundamental skills with guided interactive modules.</p>
                <Link href="/courses">
                  <Button size="sm" variant="secondary" className="w-full">Explore Course</Button>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/courses">
            <Button size="lg" variant="outline" className="px-8 font-bold cursor-pointer gap-2">
              <span>Browse All Courses ({courses.length}+)</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
