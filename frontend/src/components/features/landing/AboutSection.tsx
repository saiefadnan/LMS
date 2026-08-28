'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-surface-50 dark:bg-surface-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Image */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-3xl overflow-hidden border border-surface-200 dark:border-surface-800 shadow-xl bg-surface-900">
              <img
                src="/register_graduation_realistic.jpg"
                alt="Graduate celebrating on campus"
                className="w-full h-[400px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hidden sm:flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 shrink-0" />
              <div>
                <p className="text-sm font-bold">100% Accredited</p>
                <p className="text-[11px] text-emerald-100">Industry Recognized</p>
              </div>
            </div>
          </div>

          {/* Right Benefits List */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              About LearnHub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-surface-900 dark:text-surface-50 tracking-tight">
              Ways we can help you succeed
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
              Whether you're starting your engineering career, switching industries, or mastering new tech stacks, LearnHub provides structured pathways designed for real outcomes.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Personalized Learning Dashboard</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Track your lesson completion rates, resume interrupted modules, and review quiz scores in real-time.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Interactive Auto-Graded Assessments</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Test your understanding with instant multiple-choice quizzes that evaluate your concept mastery.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-surface-900 dark:text-surface-100 text-sm">Role-Based Multi-Dashboard Access</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">Seamless workflows for Students, Instructors, Content Managers, and System Admins.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/courses">
                <Button size="lg" className="px-8 font-bold cursor-pointer gap-2">
                  <span>Explore Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
