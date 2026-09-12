import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-body font-semibold uppercase tracking-wider text-bone/70"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={
            `w-full rounded bg-void-light/60 px-4 py-2.5 font-body text-sm text-parchment ` +
            `border transition-colors duration-150 placeholder:text-bone/30 ` +
            `disabled:opacity-50 disabled:cursor-not-allowed ` +
            `${error
              ? 'border-crimson/60 shadow-inner'
              : 'border-violet/30 hover:border-violet-muted shadow-inner-glow'
            } ${className}`
          }
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-crimson font-body" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
