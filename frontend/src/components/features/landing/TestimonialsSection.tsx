'use client';

import React from 'react';

const testimonials = [
  {
    initial: 'D',
    bg: 'bg-brand-100 text-brand-700',
    name: 'Daniel K.',
    role: 'Software Engineer Student',
    quote: 'LearnHub helped me master C pointers and memory allocation within 2 weeks! The auto-graded quizzes ensured I actually understood the concepts.',
  },
  {
    initial: 'E',
    bg: 'bg-amber-100 text-amber-800',
    name: 'Elena R.',
    role: 'Computer Science Educator',
    quote: 'As an instructor, creating lessons and adding MCQ quizzes was so smooth. Being able to track student completion rates in real-time is fantastic!',
  },
  {
    initial: 'M',
    bg: 'bg-purple-100 text-purple-800',
    name: 'Marcus T.',
    role: 'Full-Stack Learner',
    quote: 'The dark theme and sleek dashboard interface make studying late at night super comfortable. Highly recommended!',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
            What our students say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-4"
            >
              <div className="flex text-amber-500 gap-1 text-sm">
                ★★★★★
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed italic">
                "{t.quote}"
              </p>
              <div className="pt-2 flex items-center gap-3 border-t border-surface-100 dark:border-surface-800">
                <div className={`w-8 h-8 rounded-full ${t.bg} font-bold text-xs flex items-center justify-center`}>
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-surface-900 dark:text-surface-100 text-xs">{t.name}</p>
                  <p className="text-[10px] text-surface-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
