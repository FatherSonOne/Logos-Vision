
import React from 'react';
import { PlusIcon } from '../icons';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionText, onAction }) => {
  return (
    <div className="text-center p-12 bg-white/30 dark:bg-black/20 backdrop-blur-xl rounded-lg border border-dashed border-white/20 dark:border-white/10 text-slate-500 dark:text-slate-400">
      <div className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <p className="mt-1 text-sm">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 flex items-center justify-center mx-auto bg-gradient-to-r from-cyan-600 to-sky-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:from-cyan-700 hover:to-sky-700 transition-all shadow-md"
        >
          <PlusIcon size="sm" />
          <span className="ml-2">{actionText}</span>
        </button>
      )}
    </div>
  );
};
