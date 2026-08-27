import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600 active:bg-brand-800 shadow-sm hover:shadow focus-visible:ring-brand-500",
      secondary:
        "bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 active:bg-surface-300 dark:active:bg-surface-600 border border-surface-200/80 dark:border-surface-700 focus-visible:ring-surface-400",
      outline:
        "bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 active:bg-surface-100 dark:active:bg-surface-700 border border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600 focus-visible:ring-brand-500",
      ghost:
        "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100/80 dark:hover:bg-surface-800/80 active:bg-surface-200/60 dark:active:bg-surface-700/60 focus-visible:ring-surface-400",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm focus-visible:ring-red-500",
    };

    const sizes = {
      xs: "h-7 px-2.5 text-xs gap-1.5",
      sm: "h-8.5 px-3 text-xs gap-1.5",
      md: "h-10 px-4 py-2 text-sm gap-2",
      lg: "h-11 px-6 text-base gap-2.5",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
