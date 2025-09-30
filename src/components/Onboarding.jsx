import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Briefcase, Target, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { saveUserProfile, saveSetting } from '../db/database';
import { useStore } from '../store/useStore';

const steps = [
  {
    id: 1,
    title: 'Добро пожаловать в OpenNoution',
    subtitle: 'Минималистичный аналог Notion с открытым исходным кодом',
    icon: CheckCircle,
    field: null
  },
  {
    id: 2,
    title: 'Как вас зовут?',
    subtitle: 'Давайте познакомимся',
    icon: User,
    field: 'name',
    placeholder: 'Введите ваше имя'
  },
  {
    id: 3,
    title: 'Ваш email',
    subtitle: 'Для синхронизации и резервного копирования',
    icon: Mail,
    field: 'email',
    placeholder: 'your@email.com',
    optional: true
  },
  {
    id: 4,
    title: 'Чем вы занимаетесь?',
    subtitle: 'Это поможет нам персонализировать ваш опыт',
    icon: Briefcase,
    field: 'occupation',
    placeholder: 'Разработчик, дизайнер, студент...',
    optional: true
  },
  {
    id: 5,
    title: 'Для чего вы будете использовать OpenNoution?',
    subtitle: 'Выберите основную цель',
    icon: Target,
    field: 'purpose',
    options: [
      'Личные заметки',
      'Работа и проекты',
      'Учёба',
      'Творчество',
      'Всё вместе'
    ]
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    occupation: '',
    purpose: ''
  });
  const [isAnimating, setIsAnimating] = useState(false);
  
  const setUser = useStore(state => state.setUser);
  const setOnboardingComplete = useStore(state => state.setOnboardingComplete);
  
  useEffect(() => {
    // GSAP animation for the icon
    gsap.fromTo(
      '.onboarding-icon',
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    );
  }, [currentStep]);

  const handleNext = async () => {
    if (isAnimating) return;
    
    const step = steps[currentStep];
    
    // Validate required fields
    if (step.field && !step.optional && !formData[step.field]) {
      return;
    }
    
    setIsAnimating(true);
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Save user data and complete onboarding
      await saveUserProfile(formData);
      await saveSetting('onboardingComplete', true);
      setUser(formData);
      setOnboardingComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isAnimating) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const step = steps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="h-1 bg-black-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 text-sm text-black-400 text-right">
            {currentStep + 1} / {steps.length}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="onboarding-icon w-20 h-20 bg-black rounded-2xl flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title and subtitle */}
            <h1 className="text-4xl font-bold mb-3">{step.title}</h1>
            <p className="text-xl text-black-500 mb-12">{step.subtitle}</p>

            {/* Input fields */}
            <div className="mb-12">
              {step.field && !step.options && (
                <input
                  type={step.field === 'email' ? 'email' : 'text'}
                  value={formData[step.field]}
                  onChange={(e) => handleInputChange(step.field, e.target.value)}
                  placeholder={step.placeholder}
                  className="w-full px-6 py-4 text-lg border-2 border-black-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                />
              )}

              {step.options && (
                <div className="grid grid-cols-1 gap-3">
                  {step.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        handleInputChange(step.field, option);
                        setTimeout(handleNext, 200);
                      }}
                      className={`px-6 py-4 text-lg border-2 rounded-xl transition-all hover:border-black hover:bg-black-50 ${
                        formData[step.field] === option
                          ? 'border-black bg-black text-white'
                          : 'border-black-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 justify-center">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-black-200 rounded-xl hover:border-black transition-colors"
                >
                  Назад
                </button>
              )}
              
              {!step.options && (
                <button
                  onClick={handleNext}
                  disabled={step.field && !step.optional && !formData[step.field]}
                  className="px-8 py-3 bg-black text-white rounded-xl hover:bg-black-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {currentStep === steps.length - 1 ? 'Начать' : step.id === 1 ? 'Начать' : 'Далее'}
                </button>
              )}
            </div>

            {step.optional && (
              <button
                onClick={handleNext}
                className="mt-4 text-black-400 hover:text-black transition-colors"
              >
                Пропустить
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
