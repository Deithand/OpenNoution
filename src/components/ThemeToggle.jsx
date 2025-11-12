import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { setSetting, getSetting } from '../db/database';

const ThemeToggle = () => {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    // Load theme from database on mount
    const loadTheme = async () => {
      const savedTheme = await getSetting('theme');
      if (savedTheme) {
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    };
    loadTheme();
  }, [setTheme]);

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    await setSetting('theme', newTheme);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-black-100 hover:bg-black-200 dark:bg-black-800 dark:hover:bg-black-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-black-900 dark:text-white" />
      ) : (
        <Sun className="w-5 h-5 text-black-900 dark:text-white" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
