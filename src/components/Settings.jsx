import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Database, Info, Github } from 'lucide-react';

export default function Settings({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'data', label: 'Данные', icon: Database },
    { id: 'about', label: 'О программе', icon: Info }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black-200">
            <h2 className="text-2xl font-bold">Настройки</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-48 border-r-2 border-black-200 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                      activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'hover:bg-black-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Профиль пользователя</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Имя</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="w-full px-4 py-2 border-2 border-black-200 rounded-lg bg-black-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || 'Не указан'}
                        readOnly
                        className="w-full px-4 py-2 border-2 border-black-200 rounded-lg bg-black-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Род занятий</label>
                      <input
                        type="text"
                        value={user?.occupation || 'Не указан'}
                        readOnly
                        className="w-full px-4 py-2 border-2 border-black-200 rounded-lg bg-black-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Цель использования</label>
                      <input
                        type="text"
                        value={user?.purpose || 'Не указана'}
                        readOnly
                        className="w-full px-4 py-2 border-2 border-black-200 rounded-lg bg-black-50"
                      />
                    </div>

                    <p className="text-sm text-black-500 mt-4">
                      Для изменения данных профиля, очистите данные приложения и пройдите онбординг заново.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Управление данными</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-black-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Экспорт данных</h4>
                      <p className="text-sm text-black-600 mb-3">
                        Сохраните все ваши данные в файл .opn для резервного копирования.
                      </p>
                      <p className="text-sm text-black-500">
                        Используйте кнопку "Экспорт .opn" в боковой панели.
                      </p>
                    </div>

                    <div className="p-4 border-2 border-black-200 rounded-lg">
                      <h4 className="font-semibold mb-2">Импорт данных</h4>
                      <p className="text-sm text-black-600 mb-3">
                        Восстановите данные из файла .opn бэкапа.
                      </p>
                      <p className="text-sm text-black-500">
                        Используйте кнопку "Импорт .opn" в боковой панели.
                      </p>
                    </div>

                    <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                      <h4 className="font-semibold mb-2 text-red-800">Опасная зона</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Очистка данных удалит все страницы, блоки и настройки без возможности восстановления.
                      </p>
                      <button
                        onClick={() => {
                          if (confirm('Вы уверены? Все данные будут удалены!')) {
                            if (confirm('Это действие нельзя отменить! Продолжить?')) {
                              indexedDB.deleteDatabase('OpenNoutionDB');
                              window.location.reload();
                            }
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Очистить все данные
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div>
                  <h3 className="text-xl font-bold mb-4">О программе</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">OpenNoution</h4>
                      <p className="text-sm text-black-600">
                        Бесплатный open-source аналог Notion с минималистичным дизайном
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Версия</h4>
                      <p className="text-sm text-black-600">0.0.1 (Alpha)</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Технологии</h4>
                      <ul className="text-sm text-black-600 space-y-1">
                        <li>React 18</li>
                        <li>Electron 28</li>
                        <li>Tailwind CSS</li>
                        <li>GSAP + Framer Motion</li>
                        <li>Dexie (IndexedDB)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Лицензия</h4>
                      <p className="text-sm text-black-600">MIT License</p>
                    </div>

                    <div className="pt-4">
                      <a
                        href="https://github.com/Deithand/OpenNoution"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black-800 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        GitHub Repository
                      </a>
                    </div>

                    <p className="text-sm text-black-500 pt-4">
                      Made with ❤️ by the Open Source Community
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
