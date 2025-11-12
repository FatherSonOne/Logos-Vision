
import React, { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  
  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white/80 dark:bg-black/50 p-1 -m-1 rounded-md focus:outline-none focus:ring-2 ring-cyan-500 ${className}`}
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className={`hover:bg-white/50 dark:hover:bg-black/30 p-1 -m-1 rounded-md cursor-pointer ${className}`}>
      {value}
    </span>
  );
};
