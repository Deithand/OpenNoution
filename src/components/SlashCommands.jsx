import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Quote,
  Code
} from 'lucide-react';

const commands = [
  { 
    type: 'text', 
    label: 'Текст', 
    icon: Type, 
    keywords: ['text', 'текст', 'paragraph'],
    shortcut: 'text'
  },
  { 
    type: 'h1', 
    label: 'Заголовок 1', 
    icon: Heading1, 
    keywords: ['h1', 'heading1', 'заголовок'],
    shortcut: 'h1'
  },
  { 
    type: 'h2', 
    label: 'Заголовок 2', 
    icon: Heading2, 
    keywords: ['h2', 'heading2', 'заголовок'],
    shortcut: 'h2'
  },
  { 
    type: 'h3', 
    label: 'Заголовок 3', 
    icon: Heading3, 
    keywords: ['h3', 'heading3', 'заголовок'],
    shortcut: 'h3'
  },
  { 
    type: 'list', 
    label: 'Список', 
    icon: List, 
    keywords: ['list', 'список', 'ul'],
    shortcut: 'list'
  },
  { 
    type: 'checklist', 
    label: 'Чеклист', 
    icon: CheckSquare, 
    keywords: ['checklist', 'todo', 'чеклист', 'задачи'],
    shortcut: 'todo'
  },
  { 
    type: 'quote', 
    label: 'Цитата', 
    icon: Quote, 
    keywords: ['quote', 'цитата', 'blockquote'],
    shortcut: 'quote'
  },
  { 
    type: 'code', 
    label: 'Код', 
    icon: Code, 
    keywords: ['code', 'код', 'snippet'],
    shortcut: 'code'
  }
];

export default function SlashCommands({ query, onSelect, position }) {
  const menuRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredCommands = commands.filter(cmd => {
    const searchQuery = query.toLowerCase();
    return cmd.keywords.some(keyword => keyword.includes(searchQuery)) ||
           cmd.label.toLowerCase().includes(searchQuery);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect]);

  if (filteredCommands.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute z-50 bg-white border-2 border-black rounded-xl shadow-2xl overflow-hidden"
        style={{
          top: position?.top || 0,
          left: position?.left || 0,
          minWidth: '280px',
          maxHeight: '320px',
          overflowY: 'auto'
        }}
      >
        <div className="p-2">
          <div className="text-xs text-black-400 px-3 py-2 font-semibold">
            БЛОКИ
          </div>
          {filteredCommands.map((cmd, index) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.type}
                onClick={() => onSelect(cmd.type)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  index === selectedIndex
                    ? 'bg-black text-white'
                    : 'hover:bg-black-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{cmd.label}</div>
                  <div className={`text-xs ${
                    index === selectedIndex ? 'text-white opacity-70' : 'text-black-400'
                  }`}>
                    /{cmd.shortcut}
                  </div>
                </div>
                {index === selectedIndex && (
                  <div className="text-xs bg-white text-black px-2 py-1 rounded">
                    Tab
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="border-t-2 border-black-100 px-3 py-2 bg-black-50 text-xs text-black-500">
          <span className="font-semibold">↑↓</span> навигация • 
          <span className="font-semibold ml-1">Tab/Enter</span> выбрать • 
          <span className="font-semibold ml-1">Esc</span> закрыть
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
