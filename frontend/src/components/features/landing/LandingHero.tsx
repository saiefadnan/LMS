'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Award } from 'lucide-react';
import { User } from '@/types';

interface LandingHeroProps {
  user: User | null;
}

export function LandingHero({ user }: LandingHeroProps) {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Next-Gen Engineering & Tech Education</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-surface-900 dark:text-surface-50 tracking-tight leading-[1.15]">
              Education that <br className="hidden sm:inline" />
              prepares you for <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-teal-500 to-amber-500">
                what's next.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-surface-600 dark:text-surface-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Build real-world software engineering, computer science, and technical skills with industry experts through interactive curriculum and auto-graded assessments.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/courses">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 gap-2 cursor-pointer font-bold shadow-md">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/register">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12 cursor-pointer">
                    Join For Free
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Hero Image Panel with Floating Stats Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-surface-200 dark:border-surface-800 bg-surface-900 group">
              <img
                src="/login_student_realistic.jpg"
                alt="Student learning on laptop in university library"
                className="w-full h-[420px] sm:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Success Rate Badge */}
              <div className="absolute top-6 left-6 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-200 dark:border-surface-700 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce [animation-duration:3s]">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg">
                  ★
                </div>
                <div>
                  <span className="text-lg font-black text-surface-900 dark:text-surface-50">98%</span>
                  <p className="text-[11px] font-bold text-surface-500 dark:text-surface-400">Course Pass Rate</p>
                </div>
              </div>

              {/* Floating Certificate Badge Bottom */}
              <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border border-surface-200 dark:border-surface-700 p-3.5 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-surface-900 dark:text-surface-50">Verified Certificates</span>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400">Shareable & Career Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Proposition Feature Cards Below Hero */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">01. Quality</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
              Expert-Led Curriculum
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Handcrafted lessons designed by active software architects, systems engineers, and senior educators.
            </p>
          </div>

          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">02. Flexibility</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
              Self-Paced Learning
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Access interactive lesson readers, code walkthroughs, and auto-graded MCQ quizzes 24/7 on any device.
            </p>
          </div>

          <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-xs space-y-3 group hover:border-brand-300 dark:hover:border-brand-700 transition-all">
            <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest">03. Outcome</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-surface-50 group-hover:text-brand-600 transition-colors">
              Verified Credentials
            </h3>
            <p className="text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
              Earn recognized course certificates and track your detailed progress across lessons and assessments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
