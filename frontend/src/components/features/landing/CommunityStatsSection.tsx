'use client';

import React from 'react';

export function CommunityStatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-teal-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-10">
          Building a lifelong learning community
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-black">1.5M+</span>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">
              Active Students Worldwide
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-black">98%</span>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">
              Completion & Pass Rate
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-black">350+</span>
            <p className="text-xs sm:text-sm font-semibold text-brand-100 uppercase tracking-wider">
              Expert Instructors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
