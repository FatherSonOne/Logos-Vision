import React from 'react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (ids: string[]) => void;
  variant?: 'danger';
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  actions: BulkAction[];
  selectedIds: string[];
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
  selectedIds,
}) => {
  const isActive = selectedCount > 0;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <div className="flex items-center gap-4 bg-slate-800 text-white rounded-lg shadow-2xl p-3 border border-slate-700 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={isAllSelected ? onClearSelection : onSelectAll}
            className="h-4 w-4 rounded border-slate-500 text-cyan-600 bg-slate-700 focus:ring-cyan-500"
            aria-label={isAllSelected ? "Deselect all" : "Select all"}
          />
          <span className="font-bold text-sm">{selectedCount} selected</span>
        </div>
        <div className="h-6 w-px bg-slate-600" />
        <div className="flex items-center gap-2">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => action.onClick(selectedIds)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                action.variant === 'danger'
                  ? 'text-red-300 hover:bg-red-500/20'
                  : 'text-slate-200 hover:bg-slate-700'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-slate-600" />
        <button onClick={onClearSelection} title="Clear selection" className="p-1.5 rounded-full hover:bg-slate-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </div>
  );
};
