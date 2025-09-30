import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Quote,
  Code,
  Plus,
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

const blockTypes = [
  { type: 'text', label: 'Текст', icon: Type },
  { type: 'h1', label: 'Заголовок 1', icon: Heading1 },
  { type: 'h2', label: 'Заголовок 2', icon: Heading2 },
  { type: 'h3', label: 'Заголовок 3', icon: Heading3 },
  { type: 'list', label: 'Список', icon: List },
  { type: 'checklist', label: 'Чеклист', icon: CheckSquare },
  { type: 'quote', label: 'Цитата', icon: Quote },
  { type: 'code', label: 'Код', icon: Code }
];

const Block = ({ block, onUpdate, onDelete, onEnter, isLast }) => {
  const [content, setContent] = useState(block.content);
  const [checked, setChecked] = useState(block.checked || false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  const handleBlur = () => {
    if (content !== block.content) {
      onUpdate(block.id, { content });
    }
  };

  const handleCheckToggle = () => {
    const newChecked = !checked;
    setChecked(newChecked);
    onUpdate(block.id, { checked: newChecked });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter(block.id);
    }
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
      <div className="flex-1 min-w-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className={`${getBlockClasses()} ${checked ? 'line-through text-black-400' : ''}`}
          rows={1}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
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
  );
};

export default function Editor() {
  const { currentPageId, blocks, setBlocks } = useStore();
  const [page, setPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [showBlockMenu, setShowBlockMenu] = useState(false);
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
      const textarea = document.querySelector(`[data-block-id="${blockId}"] textarea`);
      textarea?.focus();
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
            <div className="text-black-400">
              <p className="mb-4">Пустая страница. Начните печатать или добавьте блок.</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} data-block-id={block.id}>
                <Block
                  block={block}
                  onUpdate={handleUpdateBlock}
                  onDelete={handleDeleteBlock}
                  onEnter={handleEnter}
                  isLast={index === blocks.length - 1}
                />
              </div>
            ))
          )}
        </div>

        {/* Add block button */}
        <div className="mt-4 relative">
          <button
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className="flex items-center gap-2 px-3 py-2 text-black-400 hover:text-black hover:bg-black-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Добавить блок</span>
          </button>

          {/* Block type menu */}
          {showBlockMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-2 bg-white border-2 border-black-200 rounded-xl shadow-lg overflow-hidden z-10"
            >
              {blockTypes.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    handleAddBlock(type);
                    setShowBlockMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black-100 transition-colors text-left"
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
