import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getPages, getBlocks } from '../db/database';

const GlobalSearch = () => {
  const { isSearchOpen, toggleSearch, setCurrentPageId } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      // Escape to close search
      if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch();
        setQuery('');
        setResults([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, toggleSearch]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const searchContent = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const pages = await getPages();
        const allBlocks = await Promise.all(
          pages.map(async (page) => {
            const blocks = await getBlocks(page.id);
            return blocks.map(block => ({ ...block, pageTitle: page.title, pageId: page.id }));
          })
        );
        const flatBlocks = allBlocks.flat();

        const searchLower = query.toLowerCase();
        const filteredPages = pages.filter(page =>
          page.title.toLowerCase().includes(searchLower)
        );

        const filteredBlocks = flatBlocks.filter(block =>
          block.content.toLowerCase().includes(searchLower)
        );

        const combined = [
          ...filteredPages.map(p => ({ type: 'page', data: p })),
          ...filteredBlocks.map(b => ({ type: 'block', data: b }))
        ];

        setResults(combined.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchContent, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleResultClick = (result) => {
    if (result.type === 'page') {
      setCurrentPageId(result.data.id);
    } else if (result.type === 'block') {
      setCurrentPageId(result.data.pageId);
    }
    toggleSearch();
    setQuery('');
    setResults([]);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-600 dark:text-black">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isSearchOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
        onClick={() => {
          toggleSearch();
          setQuery('');
          setResults([]);
        }}
      >
        <motion.div
          initial={{ scale: 0.95, y: -20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white dark:bg-black-800 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-black-200 dark:border-black-700">
            <Search className="w-5 h-5 text-black-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по страницам и контенту... (Ctrl+K)"
              className="flex-1 bg-transparent outline-none text-lg dark:text-white placeholder:text-black-400"
            />
            <button
              onClick={() => {
                toggleSearch();
                setQuery('');
                setResults([]);
              }}
              className="p-1 hover:bg-black-100 dark:hover:bg-black-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-black-400">
                <div className="w-8 h-8 border-4 border-black-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Поиск...</p>
              </div>
            ) : results.length === 0 && query.trim() ? (
              <div className="p-8 text-center text-black-400">
                <p>Ничего не найдено</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-black-400">
                <p>Начните вводить для поиска</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {results.map((result, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-black-100 dark:hover:bg-black-700 transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 mt-0.5 flex-shrink-0 text-black-400" />
                    <div className="flex-1 min-w-0">
                      {result.type === 'page' ? (
                        <>
                          <div className="font-medium dark:text-white">
                            {highlightText(result.data.title, query)}
                          </div>
                          <div className="text-sm text-black-500 dark:text-black-400">
                            Страница
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-black-500 dark:text-black-400 mb-1">
                            {result.data.pageTitle}
                          </div>
                          <div className="text-sm dark:text-white truncate">
                            {highlightText(result.data.content, query)}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-black-200 dark:border-black-700 flex items-center justify-between text-xs text-black-500 dark:text-black-400">
            <div className="flex items-center gap-4">
              <span>↵ Открыть</span>
              <span>ESC Закрыть</span>
            </div>
            <span>{results.length} результат(ов)</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalSearch;
