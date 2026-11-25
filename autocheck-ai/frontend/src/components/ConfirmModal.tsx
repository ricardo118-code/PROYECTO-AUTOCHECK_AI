import React from 'react';
import { Trash2, LucideIcon } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: LucideIcon;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  children,
  confirmText = 'Sí, eliminar',
  cancelText = 'Cancelar',
  loadingText = 'Eliminando...',
  isLoading = false,
  variant = 'danger',
  icon: Icon = Trash2,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const colorStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400',
      btn: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20',
    },
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20',
    },
    primary: {
      iconBg: 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400',
      btn: 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20',
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-transparent dark:border-slate-800 space-y-4 text-center max-h-[90vh] overflow-y-auto transition-colors">

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${colorStyles.iconBg}`}>
          <Icon className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {description}
          </div>
        </div>

        {children && <div className="text-left space-y-2.5">{children}</div>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex-1 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 ${colorStyles.btn}`}
          >
            {isLoading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
