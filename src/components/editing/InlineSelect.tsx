import React, { useState, useEffect, useRef } from 'react';
import { getStatusVariant, BadgeVariant, StatusBadge } from '../ui/StatusBadge';

interface InlineSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({ value, options, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing) {
      selectRef.current?.focus();
    }
  }, [isEditing]);
  
  const handleSave = (newValue: string) => {
    if (newValue !== value) {
        onSave(newValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => handleSave(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className="bg-white/80 dark:bg-black/50 p-1 rounded-md focus:outline-none focus:ring-2 ring-cyan-500 text-xs font-semibold"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }

  const currentOption = options.find(o => o.value === value);
  const variant = getStatusVariant(value);

  return (
    <button onClick={() => setIsEditing(true)} className="hover:ring-2 ring-cyan-500 rounded-full transition-all">
        <StatusBadge label={currentOption?.label || value} variant={variant} />
    </button>
  );
};
