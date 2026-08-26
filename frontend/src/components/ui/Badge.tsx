import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-brand-100 text-brand-800 hover:bg-brand-200",
    success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
    warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
    destructive: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
    outline: "text-surface-900 border-surface-200",
  }

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className || ''}`} {...props} />
  )
}

export { Badge }
