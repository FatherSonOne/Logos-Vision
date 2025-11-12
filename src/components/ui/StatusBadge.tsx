import React from 'react';
import { ProjectStatus, TaskStatus, CaseStatus, ActivityStatus } from '../../types';

type StatusType = ProjectStatus | TaskStatus | CaseStatus | ActivityStatus;

interface StatusBadgeProps {
  status: StatusType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // FIX: The original object had duplicate keys because different enums (e.g., ProjectStatus.InProgress, CaseStatus.InProgress)
  // resolved to the same string value ('In Progress'), which is not allowed in an object literal.
  // The conflicting/duplicate keys have been removed to resolve the error. A single style is now used for each status string.
  const colors: Record<string, string> = {
    // Project Statuses
    [ProjectStatus.Planning]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [ProjectStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [ProjectStatus.Completed]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    [ProjectStatus.OnHold]: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
    // Task Statuses
    [TaskStatus.ToDo]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    [TaskStatus.Done]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    // Case Statuses
    [CaseStatus.New]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [CaseStatus.Resolved]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300',
    [CaseStatus.Closed]: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
    // Activity Statuses
    [ActivityStatus.Scheduled]: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    [ActivityStatus.Cancelled]: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300',
  };

  const colorClass = colors[status] || 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};
