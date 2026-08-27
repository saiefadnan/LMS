import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

function Badge({ className = '', variant = "default", size = "md", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium tracking-tight border transition-colors select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] rounded-md gap-1",
    md: "px-2.5 py-0.5 text-xs rounded-md gap-1.5",
  };

  const variants = {
    default: "border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300",
    success: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
    warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    destructive: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300",
    neutral: "border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300",
    outline: "border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-900",
  };

  return (
    <div className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props} />
  );
}

export { Badge };
