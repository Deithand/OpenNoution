import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Code,
  Highlighter,
  Link,
  Trash2,
  Copy,
  Scissors
} from 'lucide-react';

export default function ContextMenu({ position, onAction, onClose, selectedText }) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.context-menu')) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!position) return null;

  const menuItems = [
    { 
      icon: Bold, 
      label: 'Жирный', 
      action: 'bold',
      shortcut: 'Ctrl+B',
      wrapper: (text) => `**${text}**`
    },
    { 
      icon: Italic, 
      label: 'Курсив', 
      action: 'italic',
      shortcut: 'Ctrl+I',
      wrapper: (text) => `*${text}*`
    },
    { 
      icon: Underline, 
      label: 'Подчеркнутый', 
      action: 'underline',
      shortcut: 'Ctrl+U',
      wrapper: (text) => `<u>${text}</u>`
    },
    { 
      icon: Code, 
      label: 'Код', 
      action: 'code',
      shortcut: 'Ctrl+E',
      wrapper: (text) => `\`${text}\``
    },
    { 
      icon: Highlighter, 
      label: 'Выделить', 
      action: 'highlight',
      wrapper: (text) => `==${text}==`
    },
    { divider: true },
    { 
      icon: Link, 
      label: 'Вставить ссылку', 
      action: 'link',
      wrapper: (text) => `[${text}](url)`
    },
    { divider: true },
    { 
      icon: Copy, 
      label: 'Копировать', 
      action: 'copy',
      shortcut: 'Ctrl+C'
    },
    { 
      icon: Scissors, 
      label: 'Вырезать', 
      action: 'cut',
      shortcut: 'Ctrl+X'
    },
    { 
      icon: Trash2, 
      label: 'Удалить', 
      action: 'delete',
      color: 'text-red-600'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="context-menu fixed z-50 bg-white border-2 border-black rounded-xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        style={{
          top: position.y,
          left: position.x,
          minWidth: '220px'
        }}
      >
        <div className="py-2">
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <div key={index} className="h-px bg-black-200 my-1" />
              );
            }

            const Icon = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => onAction(item.action, item.wrapper)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-black text-left transition-colors ${
                  item.color || 'hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-black-400 font-mono">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
