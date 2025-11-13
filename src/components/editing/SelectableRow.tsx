import React from 'react';

interface SelectableRowProps {
  id: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const SelectableRow: React.FC<SelectableRowProps> = ({ id, isSelected, onToggle, children, className }) => {
  return (
    <tr 
      className={`transition-colors cursor-pointer ${isSelected ? 'bg-cyan-50 dark:bg-cyan-900/30' : 'hover:bg-white/20 dark:hover:bg-black/20'} ${className}`}
      onClick={() => onToggle(id)}
    >
      <td className="px-6 py-4 w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(id)}
          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 dark:bg-slate-700 dark:border-slate-600"
          onClick={(e) => e.stopPropagation()} // Prevent row click from firing twice
          aria-label={`Select task`}
        />
      </td>
      {children}
    </tr>
  );
};
