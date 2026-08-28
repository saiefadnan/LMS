'use client';

import React from 'react';
import { QuizQuestion } from '@/types';

interface QuizQuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedOptionIndex?: number;
  onSelectOption: (optionIndex: number) => void;
}

export function QuizQuestionCard({
  question,
  questionIndex,
  selectedOptionIndex,
  onSelectOption,
}: QuizQuestionCardProps) {
  return (
    <div className="p-8 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-xs space-y-6">
      <div className="flex items-start gap-4">
        <span className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-sm flex items-center justify-center shrink-0 border border-brand-200 dark:border-brand-800">
          {questionIndex + 1}
        </span>
        <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 leading-snug">
          {question.text || question.question || (question as any).questionText}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3 pt-2">
        {question.options.map((opt, optIndex) => {
          const isSelected = selectedOptionIndex === optIndex;
          const letter = String.fromCharCode(65 + optIndex);

          return (
            <button
              key={optIndex}
              type="button"
              onClick={() => onSelectOption(optIndex)}
              className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-brand-600 dark:border-brand-400 bg-brand-50/70 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500 shadow-xs'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800 text-surface-800 dark:text-surface-200'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 dark:bg-brand-500 text-white'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400'
                }`}
              >
                {letter}
              </span>
              <span className="font-medium text-base">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
