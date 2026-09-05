import React, { forwardRef, useId } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, error, className = '', id, checked, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 peer-checked:border-sky-500 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer transition-all duration-200 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed shadow-sm"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
          </label>
        </div>

        {(label || description || error) && (
          <div className="flex flex-col select-none">
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </p>
            )}
            {error && (
              <p className="text-xs font-medium text-rose-500 dark:text-rose-400 mt-0.5">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
