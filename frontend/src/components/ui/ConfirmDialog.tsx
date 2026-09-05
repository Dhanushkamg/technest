import React from 'react';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button, type ButtonVariant } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'primary';
  confirmVariant?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel,
  variant = 'danger',
  confirmVariant,
  isLoading = false,
}) => {
  const iconMap: Record<string, React.ReactNode> = {
    danger: <AlertTriangle className="w-6 h-6 text-rose-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    info: <Info className="w-6 h-6 text-sky-500" />,
  };

  const finalMessage = description || message || '';
  const finalConfirmLabel = confirmLabel || confirmText || 'Confirm';
  const finalCancelLabel = cancelLabel || cancelText || 'Cancel';
  const finalVariant = (confirmVariant || (variant === 'danger' ? 'danger' : 'primary')) as ButtonVariant;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center sm:text-left flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          {iconMap[variant] || <HelpCircle className="w-6 h-6 text-slate-500" />}
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h4>
          {finalMessage && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{finalMessage}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
          {finalCancelLabel}
        </Button>
        <Button
          variant={finalVariant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {finalConfirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
