import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare,
  GripVertical,
  Trash2,
  FileText
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  getPage,
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  updatePage
} from '../db/database';
import SlashCommands from './SlashCommands';
import ContextMenu from './ContextMenu';

// Parse markdown to HTML
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)_(?!_)/g, '<em>$1</em>');
  
  // Code: `text`
  html = html.replace(/`(.+?)`/g, '<code class="bg-black-100 px-1 rounded">$1</code>');
  
  // Strikethrough: ~~text~~
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  // Highlight: ==text==
  html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200">$1</mark>');
  
  return html;
};

const Block = ({ block, onUpdate, onDelete, onEnter, onTypeChange }) => {
  const [content, setContent] = useState(block.content);
  const [checked, setChecked] = useState(block.checked || false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPosition, setSlashPosition] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  useEffect(() => {
    setChecked(block.checked || false);
  }, [block.checked]);

  // Auto-save after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== block.content && !showSlashMenu) {
        onUpdate(block.id, { content });
      }
    }, 500); // Save after 500ms of no typing

    return () => clearTimeout(timer);
  }, [content, showSlashMenu]);

  const handleBlur = () => {
    if (content !== block.content && !showSlashMenu) {
      onUpdate(block.id, { content });
    }
  };

  const handleCheckToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onUpdate(block.id, { checked: newChecked });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);

    // Проверка на slash команду
    if (value.startsWith('/') && value.length > 0) {
      const query = value.slice(1);
      setSlashQuery(query);
      
      // Позиция для меню
      const rect = e.target.getBoundingClientRect();
      setSlashPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSlashSelect = async (type) => {
    setShowSlashMenu(false);
    setContent('');
    await onTypeChange(block.id, type);
    
    // Фокус на блоке после смены типа
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    // Закрыть slash меню при Escape
    if (e.key === 'Escape' && showSlashMenu) {
      setShowSlashMenu(false);
      setContent('');
      return;
    }

    // Enter создает новый блок
    if (e.key === 'Enter' && !e.shiftKey && !showSlashMenu) {
      e.preventDefault();
      onEnter(block.id);
    }

    // Backspace на пустом блоке удаляет его
    if (e.key === 'Backspace' && content === '' && block.type === 'text') {
      e.preventDefault();
      onDelete(block.id);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        selectedText
      });
    }
  };

  const handleContextAction = (action, wrapper) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newContent = content;

    switch (action) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'code':
      case 'highlight':
      case 'link':
        if (wrapper) {
          const wrapped = wrapper(selectedText);
          newContent = content.substring(0, start) + wrapped + content.substring(end);
          setContent(newContent);
          onUpdate(block.id, { content: newContent });
        }
        break;
      
      case 'copy':
        navigator.clipboard.writeText(selectedText);
        break;
      
      case 'cut':
        navigator.clipboard.writeText(selectedText);
        newContent = content.substring(0, start) + content.substring(end);
        setContent(newContent);
        onUpdate(block.id, { content: newContent });
        break;
      
      case 'delete':
        newContent = content.substring(0, start) + content.substring(end);
        setContent(newContent);
        onUpdate(block.id, { content: newContent });
        break;
    }

    setContextMenu(null);
  };

  const getPlaceholder = () => {
    switch (block.type) {
      case 'h1': return 'Заголовок 1';
      case 'h2': return 'Заголовок 2';
      case 'h3': return 'Заголовок 3';
      case 'quote': return 'Цитата';
      case 'code': return 'Код';
      case 'list': return 'Элемент списка';
      case 'checklist': return 'Пункт чеклиста';
      default: return 'Введите текст или / для команд';
    }
  };

  const getBlockClasses = () => {
    const base = 'w-full bg-transparent border-none outline-none resize-none';
    switch (block.type) {
      case 'h1': return `${base} text-4xl font-bold`;
      case 'h2': return `${base} text-3xl font-bold`;
      case 'h3': return `${base} text-2xl font-semibold`;
      case 'quote': return `${base} text-lg italic border-l-4 border-black pl-4`;
      case 'code': return `${base} font-mono bg-black-100 p-3 rounded-lg`;
      default: return `${base} text-base`;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="group relative flex items-start gap-2 py-2"
      >
        {/* Drag handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-2">
          <GripVertical className="w-4 h-4 text-black-400 cursor-grab" />
        </div>

        {/* Checkbox for checklist */}
        {block.type === 'checklist' && (
          <button
            onClick={handleCheckToggle}
            className="mt-2 flex-shrink-0"
          >
            <CheckSquare
              className={`w-5 h-5 ${checked ? 'text-black' : 'text-black-300'}`}
            />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 relative">
          <div
            ref={textareaRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const text = e.target.innerText;
              setContent(text);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onContextMenu={handleContextMenu}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) || `<span class="text-black-400">${getPlaceholder()}</span>` }}
            className={`${getBlockClasses()} ${checked ? 'line-through text-black-400' : ''} outline-none`}
          />
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(block.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 p-1 hover:bg-red-100 rounded"
        >
          <Trash2 className="w-4 h-4 text-black-400" />
        </button>
      </motion.div>

      {/* Slash Commands Menu */}
      {showSlashMenu && (
        <SlashCommands
          query={slashQuery}
          onSelect={handleSlashSelect}
          position={slashPosition}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          selectedText={contextMenu.selectedText}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

export default function Editor() {
  const { currentPageId, blocks, setBlocks } = useStore();
  const [page, setPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentPageId) {
      loadPage();
      loadBlocks();
    }
  }, [currentPageId]);

  const loadPage = async () => {
    const pageData = await getPage(currentPageId);
    setPage(pageData);
    setPageTitle(pageData?.title || '');
  };

  const loadBlocks = async () => {
    setIsLoading(true);
    const pageBlocks = await getBlocks(currentPageId);
    setBlocks(pageBlocks);
    setIsLoading(false);
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setPageTitle(newTitle);
  };

  const handleTitleBlur = async () => {
    if (pageTitle !== page?.title) {
      await updatePage(currentPageId, { title: pageTitle || 'Без названия' });
    }
  };

  const handleAddBlock = async (type = 'text', afterBlockId = null) => {
    const position = afterBlockId
      ? blocks.findIndex(b => b.id === afterBlockId) + 1
      : blocks.length;
    
    const blockId = await createBlock(currentPageId, type, '', position);
    await loadBlocks();
    
    // Focus on the new block
    setTimeout(() => {
      const contentEditable = document.querySelector(
        `[data-block-id="${blockId}"] [contenteditable="true"]`
      );
      contentEditable?.focus();
    }, 100);
  };

  const handleUpdateBlock = async (blockId, updates) => {
    await updateBlock(blockId, updates);
  };

  const handleDeleteBlock = async (blockId) => {
    await deleteBlock(blockId);
    await loadBlocks();
  };

  const handleEnter = (blockId) => {
    handleAddBlock('text', blockId);
  };

  const handleTypeChange = async (blockId, newType) => {
    await updateBlock(blockId, { type: newType, content: '' });
    await loadBlocks();
  };

  if (!currentPageId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <FileText className="w-16 h-16 text-black-200 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-black-400 mb-2">
            Выберите страницу
          </h2>
          <p className="text-black-400">
            или создайте новую в боковой панели
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 bg-white overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* Page title */}
        <input
          type="text"
          value={pageTitle}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          placeholder="Без названия"
          className="w-full text-5xl font-bold mb-8 bg-transparent border-none outline-none"
        />

        {/* Blocks */}
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center py-8 text-black-400">Загрузка...</div>
          ) : blocks.length === 0 ? (
            <div 
              className="text-black-400 cursor-text py-4 px-2 hover:bg-black-50 rounded-lg transition-colors"
              onClick={() => handleAddBlock('text')}
            >
              <p>Пустая страница. Начните печатать или нажмите / для команд.</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} data-block-id={block.id}>
                <Block
                  block={block}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                  onEnter={handleEnter}
                  onTypeChange={handleTypeChange}
                  isLast={index === blocks.length - 1}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
