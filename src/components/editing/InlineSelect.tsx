import React, { useState, useEffect, useRef } from 'react';

interface InlineSelectProps {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => void;
  className?: string;
}

export const InlineSelect: React.FC<InlineSelectProps> = ({ value, options, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing) {
      selectRef.current?.focus();
    }
  }, [isEditing]);
  
  const handleSave = (newValue: string) => {
    onSave(newValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => handleSave(e.target.value)}
        onBlur={() => setIsEditing(false)}
        className={`bg-white/80 dark:bg-black/50 p-1 -m-1 rounded-md focus:outline-none focus:ring-2 ring-cyan-500 ${className}`}
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    );
  }

  const currentLabel = options.find(o => o.value === value)?.label || value;

  return (
    <span onClick={() => setIsEditing(true)} className={`hover:bg-white/50 dark:hover:bg-black/30 p-1 -m-1 rounded-md cursor-pointer ${className}`}>
      {currentLabel}
    </span>
  );
};