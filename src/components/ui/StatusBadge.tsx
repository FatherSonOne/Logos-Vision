
import React from 'react';
import { ProjectStatus, TaskStatus, CaseStatus, ActivityStatus, WebpageStatus, CasePriority } from '../../types';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'pink';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
        // Success
        case ProjectStatus.Completed:
        case TaskStatus.Done:
        case CaseStatus.Resolved:
        case ActivityStatus.Completed:
        case WebpageStatus.Published:
            return 'success';

        // Warning
        case ProjectStatus.OnHold:
        case CasePriority.Medium:
            return 'warning';
        
        // Pink
        case CasePriority.High:
            return 'pink';

        // Info
        case ProjectStatus.InProgress:
        case TaskStatus.InProgress:
        case CaseStatus.InProgress:
        case CaseStatus.New:
        case ActivityStatus.Scheduled:
            return 'info';
        
        // Purple
        case ProjectStatus.Planning:
            return 'purple';

        // Neutral
        case TaskStatus.ToDo:
        case CaseStatus.Closed:
        case WebpageStatus.Draft:
        case WebpageStatus.Archived:
        case ActivityStatus.Cancelled:
        case CasePriority.Low:
        default:
            return 'neutral';
    }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant, className, icon }) => {
  const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    neutral: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1.5 ${variantClasses[variant]} ${className}`}>
      {icon}
      {label}
    </span>
  );
};
