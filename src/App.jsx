import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { ToastContainer } from './components/Toast';
import { useStore } from './store/useStore';
import { getUserProfile, getSetting, initializeDatabase } from './db/database';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const {
    isOnboardingComplete,
    setOnboardingComplete,
    setUser,
    isSidebarOpen
  } = useStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database first
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        setDbError(true);
        setIsLoading(false);
        return;
      }

      // Check if onboarding is complete
      const onboardingStatus = await getSetting('onboardingComplete');
      const userProfile = await getUserProfile();
      
      if (onboardingStatus && userProfile) {
        setOnboardingComplete(true);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setDbError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (dbError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Ошибка базы данных</h1>
          <p className="text-lg text-black-600 mb-6">
            Не удалось инициализировать локальное хранилище. Это может быть связано с правами доступа.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-black-800 transition-colors"
          >
            Перезагрузить приложение
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold">Загрузка OpenNoution...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <AnimatePresence mode="wait">
        {!isOnboardingComplete ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-screen overflow-hidden bg-white"
          >
            <Sidebar />
            <Editor />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
