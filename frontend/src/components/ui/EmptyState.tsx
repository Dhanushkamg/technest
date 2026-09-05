import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button, type ButtonProps } from './Button';

type LucideIcon = React.FC<React.SVGProps<SVGSVGElement>>;

export interface EmptyStateProps {
  icon?: React.ReactNode | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  // Support both a Lucide component class and a rendered React node
  const IconNode =
    icon == null
      ? <PackageOpen className="w-8 h-8" />
      : typeof icon === 'function'
      ? React.createElement(icon as LucideIcon, { className: 'w-8 h-8' })
      : icon;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        {IconNode}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
