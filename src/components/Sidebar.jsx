import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Settings as SettingsIcon,
  ChevronRight,
  FileText,
  Trash2,
  Download,
  Upload,
  Menu
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPages, createPage, deletePage, exportAllData, importAllData, getUserProfile, exportAllAsMarkdown, importFromMarkdown } from '../db/database';
import { toast } from './Toast';
import Settings from './Settings';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  const {
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    addPage,
    removePage,
    isSidebarOpen,
    toggleSidebar,
    toggleSearch
  } = useStore();
  
  const [expandedPages, setExpandedPages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    loadPages();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const profile = await getUserProfile();
    setUserProfile(profile);
  };

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

  const handleExportMarkdown = async () => {
    try {
      const markdown = await exportAllAsMarkdown();

      if (window.electronAPI) {
        const result = await window.electronAPI.saveMarkdown?.(markdown);
        if (result?.success) {
          toast.success('Markdown успешно экспортирован!', 'Экспорт');
        } else if (!result?.cancelled) {
          toast.error('Не удалось сохранить Markdown', 'Ошибка');
        }
      } else {
        // Browser fallback
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `opennoution-export-${Date.now()}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Markdown успешно экспортирован!', 'Экспорт');
      }
    } catch (error) {
      toast.error('Произошла ошибка при экспорте', 'Ошибка');
    }
  };

  const handleImportMarkdown = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadMarkdown?.();
        if (result?.success) {
          await importFromMarkdown(result.data);
          await loadPages();
          toast.success('Markdown успешно импортирован!', 'Импорт');
        } else if (result?.error) {
          toast.error(result.error, 'Ошибка импорта');
        }
      } else {
        // Browser fallback
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown';
        input.onchange = async (e) => {
          try {
            const file = e.target.files[0];
            if (file) {
              const text = await file.text();
              await importFromMarkdown(text, file.name.replace(/\.(md|markdown)$/, ''));
              await loadPages();
              toast.success('Markdown успешно импортирован!', 'Импорт');
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
            isActive ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black-100 dark:hover:bg-black-800 dark:text-white'
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
      className="w-64 h-screen bg-white dark:bg-black-900 border-r-2 border-black-200 dark:border-black-700 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b-2 border-black-200 dark:border-black-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold dark:text-white">OpenNoution</h1>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-black-100 rounded transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => handleCreatePage()}
            className="w-full flex items-center gap-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-black-800 dark:hover:bg-black-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Новая страница</span>
          </button>

          <button
            onClick={toggleSearch}
            className="w-full flex items-center gap-2 px-3 py-2 bg-black-100 dark:bg-black-800 hover:bg-black-200 dark:hover:bg-black-700 rounded-lg transition-colors"
          >
            <Search className="w-4 h-4 dark:text-white" />
            <span className="text-sm dark:text-white">Поиск (Ctrl+K)</span>
          </button>
        </div>
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
      <div className="p-3 border-t-2 border-black-200 dark:border-black-700 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex-1 flex items-center gap-2 px-3 py-2 hover:bg-black-100 dark:hover:bg-black-800 rounded-lg transition-colors text-sm font-medium"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Настройки</span>
          </button>
          <ThemeToggle />
        </div>

        <button
          onClick={handleExport}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 dark:hover:bg-black-800 rounded-lg transition-colors text-sm dark:text-white"
        >
          <Download className="w-4 h-4" />
          <span>Экспорт .opn</span>
        </button>

        <button
          onClick={handleImport}
          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 dark:hover:bg-black-800 rounded-lg transition-colors text-sm dark:text-white"
        >
          <Upload className="w-4 h-4" />
          <span>Импорт .opn</span>
        </button>

        <div className="border-t border-black-200 dark:border-black-700 pt-2 mt-2 space-y-2">
          <button
            onClick={handleExportMarkdown}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 dark:hover:bg-black-800 rounded-lg transition-colors text-sm dark:text-white"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт Markdown</span>
          </button>

          <button
            onClick={handleImportMarkdown}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-black-100 dark:hover:bg-black-800 rounded-lg transition-colors text-sm dark:text-white"
          >
            <Upload className="w-4 h-4" />
            <span>Импорт Markdown</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={userProfile}
      />
    </motion.div>
  );
}
