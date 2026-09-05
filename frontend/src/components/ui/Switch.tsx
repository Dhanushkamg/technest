import React, { forwardRef, useId } from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: React.ReactNode;
  description?: string;
  size?: 'sm' | 'md';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, size = 'md', className = '', id, checked, disabled, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const dimensions =
      size === 'sm'
        ? { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'peer-checked:translate-x-4' }
        : { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 'peer-checked:translate-x-5' };

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-3 cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative inline-flex items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`${dimensions.track} bg-slate-300 dark:bg-slate-700 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-sky-500 transition-colors duration-200 ease-in-out`}
          />
          <div
            className={`absolute left-0.5 top-0.5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-md ${dimensions.thumb} ${dimensions.translate}`}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
