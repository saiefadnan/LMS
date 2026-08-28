'use client';

import React from 'react';
import { QuizQuestion } from '@/types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizReviewBreakdownProps {
  questions: QuizQuestion[];
  userAnswers: Record<number, number>;
}

export function QuizReviewBreakdown({
  questions,
  userAnswers,
}: QuizReviewBreakdownProps) {
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-surface-900 dark:text-surface-50 flex items-center gap-2">
        <span>Detailed Breakdown</span>
        <span className="text-xs font-normal text-surface-500 dark:text-surface-400">
          (Review correct answers vs your choices)
        </span>
      </h3>

      {questions.map((q, qIndex) => {
        const studentChoice = userAnswers[qIndex];
        const targetCorrect =
          q.correctIndex !== undefined ? q.correctIndex : q.correctAnswer;
        const isCorrect = studentChoice === targetCorrect;

        return (
          <div
            key={qIndex}
            className={`p-6 rounded-xl border bg-white dark:bg-surface-900 shadow-xs space-y-4 ${
              isCorrect
                ? 'border-emerald-200 dark:border-emerald-800'
                : 'border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                  }`}
                >
                  {qIndex + 1}
                </span>
                <h4 className="font-semibold text-surface-900 dark:text-surface-100">
                  {q.text || q.question || (q as any).questionText}
                </h4>
              </div>
              {isCorrect ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle2 className="w-4 h-4" /> Correct
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900">
                  <XCircle className="w-4 h-4" /> Incorrect
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {q.options.map((opt, optIdx) => {
                const wasSelected = studentChoice === optIdx;
                const isOptionCorrect = targetCorrect === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                let badgeStyle =
                  'border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/60 text-surface-700 dark:text-surface-300';
                if (isOptionCorrect) {
                  badgeStyle =
                    'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500 font-medium';
                } else if (wasSelected && !isCorrect) {
                  badgeStyle =
                    'border-red-400 bg-red-50 dark:bg-red-950/60 text-red-900 dark:text-red-300 font-medium';
                }

                return (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-lg border flex items-center justify-between text-sm ${badgeStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs opacity-75">{letter}.</span>
                      <span>{opt}</span>
                    </div>
                    {isOptionCorrect && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded">
                        Correct Answer
                      </span>
                    )}
                    {wasSelected && !isOptionCorrect && (
                      <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/80 px-2 py-0.5 rounded">
                        Your Choice
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
