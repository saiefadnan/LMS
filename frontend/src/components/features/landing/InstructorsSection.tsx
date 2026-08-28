'use client';

import React from 'react';

const instructors = [
  {
    name: 'Dr. Robert Chen',
    role: 'Algorithms & Systems Lead',
    image: '/instructor_1_realistic.jpg',
  },
  {
    name: 'Maya Lin',
    role: 'Full-Stack Architect',
    image: '/instructor_2_realistic.jpg',
  },
  {
    name: 'Alex Vance',
    role: 'Database & Backend Specialist',
    image: '/student_graduation_hero.jpg',
  },
  {
    name: 'Sarah Jenkins',
    role: 'UI/UX Product Director',
    image: '/lms_hero_illustration.jpg',
  },
];

export function InstructorsSection() {
  return (
    <section id="instructors" className="py-20 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Instructors
          </span>
          <h2 className="text-3xl font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
            Meet our experts
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Learn directly from accomplished computer science faculty and software leaders.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((inst, idx) => (
            <div
              key={idx}
              className="bg-surface-50 dark:bg-surface-950 p-5 rounded-2xl border border-surface-200 dark:border-surface-800 text-center space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-brand-500 shadow-md">
                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <h4 className="font-bold text-surface-900 dark:text-surface-100 text-base">{inst.name}</h4>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{inst.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
