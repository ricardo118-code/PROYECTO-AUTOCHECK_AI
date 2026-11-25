import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, LucideIcon } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'success' | 'info';

export interface AlertBannerProps {
  type?: AlertType;
  message?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'error',
  message,
  children,
  className = '',
  icon: CustomIcon,
}) => {
  const content = message || children;
  if (!content) return null;

  const config = {
    error: {
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
      iconColor: 'text-red-500 dark:text-red-400',
      defaultIcon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400',
      defaultIcon: AlertTriangle,
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      defaultIcon: CheckCircle2,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200',
      iconColor: 'text-brand-600 dark:text-brand-400',
      defaultIcon: Info,
    },
  }[type];

  const Icon = CustomIcon || config.defaultIcon;

  return (
    <div
      className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 transition-all ${config.bg} ${className}`}
    >
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="leading-relaxed min-w-0 flex-1">{content}</div>
    </div>
  );
};
