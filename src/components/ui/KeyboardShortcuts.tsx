import React from 'react';
import { Modal } from './Modal';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close dialog or modal' },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-4">
        {shortcuts.map((shortcut, i) => (
          <div key={i} className="flex justify-between items-center">
            <p className="text-sm text-slate-700 dark:text-slate-300">{shortcut.description}</p>
            <div className="flex items-center gap-1">
              {shortcut.keys.map(key => (
                <kbd key={key} className="px-2 py-1 text-xs font-semibold text-slate-600 bg-slate-200 border border-slate-300 rounded-md dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};