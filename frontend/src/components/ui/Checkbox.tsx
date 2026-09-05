import React, { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, checked, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 peer-checked:bg-gradient-to-r peer-checked:from-sky-500 peer-checked:to-blue-600 peer-checked:border-sky-500 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 bg-white dark:bg-slate-900 flex items-center justify-center cursor-pointer transition-all duration-200 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed shadow-sm"
          >
            <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
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

Checkbox.displayName = 'Checkbox';
