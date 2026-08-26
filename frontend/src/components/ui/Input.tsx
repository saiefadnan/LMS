import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          className={`
            flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-surface-900 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
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
Input.displayName = "Input"

export { Input }
