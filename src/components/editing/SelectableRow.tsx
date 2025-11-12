import React from 'react';

interface SelectableRowProps {
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SelectableRow: React.FC<SelectableRowProps> = ({ isSelected, onSelect, children, className }) => {
  return (
    <tr className={`transition-colors ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-white/20 dark:hover:bg-black/10'} ${className}`}>
        <td className="px-6 py-4">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={onSelect}
                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:bg-slate-700 dark:border-slate-600"
                onClick={(e) => e.stopPropagation()}
            />
        </td>
        {children}
    </tr>
  );
};