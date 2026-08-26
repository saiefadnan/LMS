import * as React from "react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          className={`
            flex min-h-[80px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-surface-900 
            placeholder:text-surface-400 
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:border-brand-500
            disabled:cursor-not-allowed disabled:opacity-50
            transition-colors
            ${error ? 'border-red-500 focus-visible:ring-red-500' : 'border-surface-300'}
            ${className || ''}
          `}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
