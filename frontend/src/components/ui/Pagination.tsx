'use client';

import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 pt-6 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Previous</span>
      </Button>

      <span className="text-xs font-semibold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-800 shadow-xs">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="gap-1 px-3 py-1.5 text-xs cursor-pointer"
        aria-label="Next Page"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
