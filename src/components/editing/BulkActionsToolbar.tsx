
import React from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: React.ReactNode;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ selectedCount, onClearSelection, children }) => {
  const isActive = selectedCount > 0;

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="flex items-center gap-4 bg-slate-800 text-white rounded-lg shadow-2xl p-3 border border-slate-700">
            <span className="font-bold text-sm">{selectedCount} selected</span>
            <div className="h-6 w-px bg-slate-600" />
            <div className="flex items-center gap-2">
                {children}
            </div>
            <div className="h-6 w-px bg-slate-600" />
            <button onClick={onClearSelection} title="Clear selection" className="p-1.5 rounded-full hover:bg-slate-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    </div>
  );
};
