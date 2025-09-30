import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { ToastContainer } from './components/Toast';
import { useStore } from './store/useStore';
import { getUserProfile, getSetting } from './db/database';

function App() {
  const [isLoading, setIsLoading] = useState(true);
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
      // Check if onboarding is complete
      const onboardingStatus = await getSetting('onboardingComplete');
      const userProfile = await getUserProfile();
      
      if (onboardingStatus && userProfile) {
        setOnboardingComplete(true);
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
