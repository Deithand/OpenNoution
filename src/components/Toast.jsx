import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { create } from 'zustand';

// Toast store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));
    
    // Auto remove after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  }))
}));

// Toast component
const Toast = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const Icon = icons[toast.type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-white dark:bg-black-800 border-2 border-black dark:border-black-600 rounded-xl shadow-lg p-4 flex items-start gap-3 min-w-[320px] max-w-md"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
        toast.type === 'success' ? 'text-green-600 dark:text-green-400' :
        toast.type === 'error' ? 'text-red-600 dark:text-red-400' :
        'text-black dark:text-white'
      }`} />

      <div className="flex-1">
        {toast.title && (
          <div className="font-semibold mb-1 dark:text-white">{toast.title}</div>
        )}
        <div className="text-sm text-black-600 dark:text-black-400">{toast.message}</div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-black-100 dark:hover:bg-black-700 rounded transition-colors dark:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Toast container
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper function to show toasts
export const toast = {
  success: (message, title) => useToastStore.getState().addToast({
    type: 'success',
    message,
    title
  }),
  error: (message, title) => useToastStore.getState().addToast({
    type: 'error',
    message,
    title
  }),
  info: (message, title) => useToastStore.getState().addToast({
    type: 'info',
    message,
    title
  })
};
