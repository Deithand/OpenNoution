import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Settings,
  ChevronRight,
  FileText,
  Trash2,
  Download,
  Upload,
  Menu
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPages, createPage, deletePage, exportAllData, importAllData } from '../db/database';
import { toast } from './Toast';

export default function Sidebar() {
  const {
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    addPage,
    removePage,
    isSidebarOpen,
    toggleSidebar
  } = useStore();
  
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setIsLoading(true);
    const allPages = await getPages();
    setPages(allPages);
    setIsLoading(false);
  };

  const handleCreatePage = async (parentId = null) => {
    const pageId = await createPage('Новая страница', parentId);
    const allPages = await getPages();
    setPages(allPages);
    setCurrentPageId(pageId);
  };

  const handleDeletePage = async (pageId, e) => {
    e.stopPropagation();
    if (confirm('Удалить эту страницу и все её подстраницы?')) {
      await deletePage(pageId);
      removePage(pageId);
      const allPages = await getPages();
      setPages(allPages);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      
      if (window.electronAPI) {
        const result = await window.electronAPI.saveBackup(data);
        if (result.success) {
          toast.success('Бэкап успешно сохранён!', 'Экспорт');
        } else if (!result.cancelled) {
          toast.error('Не удалось сохранить бэкап', 'Ошибка');
        }
      } else {
        // Fallback for browser
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opennoution-backup-${Date.now()}.opn`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Бэкап успешно сохранён!', 'Экспорт');
      }
    } catch (error) {
      toast.error('Произошла ошибка при экспорте', 'Ошибка');
    }
  };

  const handleImport = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadBackup();
        if (result.success) {
          await importAllData(result.data);
          await loadPages();
          toast.success('Бэкап успешно загружен!', 'Импорт');
        } else if (result.error) {
          toast.error(result.error, 'Ошибка импорта');
        }
      } else {
        // Fallback for browser
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.opn';
        input.onchange = async (e) => {
          try {
            const file = e.target.files[0];
            if (file) {
              const text = await file.text();
              const data = JSON.parse(text);
              await importAllData(data);
              await loadPages();
              toast.success('Бэкап успешно загружен!', 'Импорт');
            }
          } catch (error) {
            toast.error('Неверный формат файла', 'Ошибка');
          }
        };
        input.click();
      }
    } catch (error) {
      toast.error('Произошла ошибка при импорте', 'Ошибка');
    }
  };

  const toggleExpand = (pageId) => {
    const newExpanded = new Set(expandedPages);
    if (newExpanded.has(pageId)) {
      newExpanded.delete(pageId);
    } else {
      newExpanded.add(pageId);
    }
    setExpandedPages(newExpanded);
  };

  const rootPages = pages.filter(p => !p.parentId);
  
  const getChildPages = (parentId) => {
    return pages.filter(p => p.parentId === parentId);
  };

  const PageItem = ({ page, level = 0 }) => {
    const hasChildren = getChildPages(page.id).length > 0;
    const isExpanded = expandedPages.has(page.id);
    const isActive = currentPageId === page.id;

    return (
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
            isActive ? 'bg-black text-white' : 'hover:bg-black-100'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
          onClick={() => setCurrentPageId(page.id)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(page.id);
              }}
              className="p-0.5 hover:bg-black-200 rounded"
            >
              <ChevronRight
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <FileText className="w-4 h-4 flex-shrink-0" />
          
          <span className="flex-1 truncate text-sm">{page.title}</span>
          
          <button
            onClick={(e) => handleDeletePage(page.id, e)}
            className={`opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity ${
              isActive ? 'hover:bg-red-500' : ''
            }`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {getChildPages(page.id).map(childPage => (
                <PageItem key={childPage.id} page={childPage} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white border-2 border-black rounded-lg hover:bg-black-50 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
    );
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      exit={{ x: -300 }}
      className="w-64 h-screen bg-white border-r-2 border-black-200 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-black-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">OpenNoution</h1>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-black-100 rounded transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <button
          onClick={() => handleCreatePage()}
          className="w-full flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-black-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Новая страница</span>
        </button>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="text-center py-8 text-black-400">Загрузка...</div>
        ) : rootPages.length === 0 ? (
          <div className="text-center py-8 text-black-400 text-sm">
            Нет страниц. Создайте первую!
          </div>
        ) : (
          <div className="space-y-1">
            {rootPages.map(page => (
              <PageItem key={page.id} page={page} />
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-3 border-t-2 border-black-200 space-y-2">
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 rounded-lg transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Экспорт .opn</span>
        </button>
        
        <button
          onClick={handleImport}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 rounded-lg transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Импорт .opn</span>
        </button>
      </div>
    </motion.div>
  );
}
