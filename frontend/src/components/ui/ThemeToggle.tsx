import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore, type Theme } from '../../store/useThemeStore';
import { Dropdown } from './Dropdown';

export interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  if (variant === 'segmented') {
    const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
      { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
      { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
      { id: 'system', label: 'System', icon: <Laptop className="w-4 h-4" /> },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={`inline-flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 ${className}`}
      >
        {options.map((opt) => {
          const isSelected = theme === opt.id;
          return (
            <button
              key={opt.id}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown or Icon trigger
  const triggerIcon =
    resolvedTheme === 'dark' ? (
      <Moon className="w-4 h-4 text-sky-400" />
    ) : (
      <Sun className="w-4 h-4 text-amber-500" />
    );

  const items = [
    {
      label: 'Light',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
      onClick: () => setTheme('light'),
    },
    {
      label: 'Dark',
      icon: <Moon className="w-4 h-4 text-sky-400" />,
      onClick: () => setTheme('dark'),
    },
    {
      label: 'System',
      icon: <Laptop className="w-4 h-4 text-slate-500" />,
      onClick: () => setTheme('system'),
    },
  ];

  return (
    <Dropdown
      className={className}
      items={items}
      trigger={
        <button
          type="button"
          aria-label={`Current theme: ${theme}. Click to change theme`}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          {triggerIcon}
        </button>
      }
    />
  );
};
