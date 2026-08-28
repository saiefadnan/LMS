'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Award, RotateCcw, ArrowRight } from 'lucide-react';

interface QuizResultsBannerProps {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  courseId: string;
  onRetake: () => void;
}

export function QuizResultsBanner({
  score,
  totalQuestions,
  percentage,
  passed,
  courseId,
  onRetake,
}: QuizResultsBannerProps) {
  return (
    <div
      className={`p-8 rounded-2xl border text-center relative overflow-hidden transition-colors ${
        passed
          ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/70 dark:to-surface-900 border-emerald-200 dark:border-emerald-800/80'
          : 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/70 dark:to-surface-900 border-amber-200 dark:border-amber-800/80'
      }`}
    >
      {passed ? (
        <div className="inline-flex p-4 rounded-full mb-4 bg-emerald-100/60 dark:bg-emerald-950/80 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <Award className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
      ) : (
        <div className="inline-flex p-4 rounded-full mb-4 bg-amber-100/60 dark:bg-amber-950/80 shadow-xs border border-amber-200 dark:border-amber-800">
          <RotateCcw className="w-12 h-12 text-amber-600 dark:text-amber-400" />
        </div>
      )}

      <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-1">
        {passed ? 'Assessment Completed Successfully' : 'Review Recommended'}
      </h2>
      <p className="text-surface-600 dark:text-surface-300 text-sm max-w-md mx-auto mb-6">
        {passed
          ? `You mastered this assessment with a score of ${percentage}%. Your certificate progress has been updated.`
          : `You scored ${percentage}%. You need at least 70% to pass. Review the answers below and try again!`}
      </p>

      <div className="flex justify-center items-center gap-6 py-4 px-6 bg-white/80 dark:bg-surface-800/80 backdrop-blur rounded-xl max-w-xs mx-auto border border-surface-200 dark:border-surface-700 shadow-xs">
        <div className="text-center">
          <span className="text-xs text-surface-400 dark:text-surface-500 font-medium block">SCORE</span>
          <span className="text-2xl font-black text-surface-900 dark:text-surface-50">
            {score} / {totalQuestions}
          </span>
        </div>
        <div className="h-8 w-px bg-surface-200 dark:bg-surface-700" />
        <div className="text-center">
          <span className="text-xs text-surface-400 dark:text-surface-500 font-medium block">PERCENTAGE</span>
          <span
            className={`text-2xl font-black ${
              passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 mt-8">
        <Button onClick={onRetake} variant="secondary" className="gap-2 cursor-pointer">
          <RotateCcw className="w-4 h-4" />
          Retake Quiz
        </Button>
        <Link href={`/learn/${courseId}`}>
          <Button variant="primary" className="gap-2 cursor-pointer">
            Back to Course
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
