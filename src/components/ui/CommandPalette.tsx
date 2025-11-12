import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SearchIcon } from '../icons';

export interface Command {
  id: string;
  title: string;
  category: string;
  action: () => void;
  icon: React.ReactNode;
}

interface CommandPaletteProps {
  commands: Command[];
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands, isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const filteredCommands = query
    ? commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) || 
        cmd.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const command = filteredCommands[activeIndex];
      if (command) {
        command.action();
        onClose();
      }
    }
  }, [activeIndex, filteredCommands, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-20" onClick={onClose}>
      <div className="w-full max-w-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative border-b border-white/20 dark:border-slate-700">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full p-4 pl-12 text-md bg-transparent focus:outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {Object.entries(groupedCommands).length > 0 ? Object.entries(groupedCommands).map(([category, cmds]: [string, Command[]]) => (
            <div key={category}>
              <h3 className="px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{category}</h3>
              <ul>
                {cmds.map(cmd => {
                    const index = filteredCommands.findIndex(c => c.id === cmd.id);
                    return (
                        <li key={cmd.id}>
                            <button
                                onClick={() => { cmd.action(); onClose(); }}
                                className={`w-full text-left p-3 rounded-md flex items-center gap-3 text-sm ${activeIndex === index ? 'bg-cyan-500 text-white' : 'hover:bg-white/50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                            >
                                <span className={activeIndex === index ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>{cmd.icon}</span>
                                {cmd.title}
                            </button>
                        </li>
                    )
                })}
              </ul>
            </div>
          )) : <p className="p-4 text-center text-sm text-slate-500">No results found.</p>}
        </div>
      </div>
    </div>
  );
};
