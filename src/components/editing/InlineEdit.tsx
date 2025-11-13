import React, { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, className, multiline }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (multiline) {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, multiline]);
  
  const handleSave = () => {
    if (currentValue.trim() && currentValue !== value) {
        onSave(currentValue);
    } else {
        setCurrentValue(value); // revert if empty or unchanged
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  const inputClasses = `bg-white/80 dark:bg-black/50 p-1 -m-1 rounded-md focus:outline-none focus:ring-2 ring-cyan-500 w-full ${className}`;

  if (isEditing) {
    if (multiline) {
        return (
            <textarea
                ref={textareaRef}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                rows={4}
                className={inputClasses}
            />
        );
    }
    return (
      <input
        ref={inputRef}
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClasses}
      />
    );
  }

  return (
    <span onClick={() => setIsEditing(true)} className={`hover:bg-white/50 dark:hover:bg-black/30 p-1 -m-1 rounded-md cursor-pointer whitespace-pre-wrap ${className}`}>
      {value || (multiline ? '(Click to add description)' : '(Click to edit)')}
    </span>
  );
};
