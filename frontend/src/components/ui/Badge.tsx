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
    default: "border-brand-200 bg-brand-50 text-brand-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    destructive: "border-red-200 bg-red-50 text-red-700",
    neutral: "border-surface-200 bg-surface-100 text-surface-700",
    outline: "border-surface-200 text-surface-700 bg-white",
  };

  return (
    <div className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} {...props} />
  );
}

export { Badge };
