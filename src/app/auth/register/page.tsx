'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { translations, Language } from '@/lib/translations';
import LanguageSelector from '@/components/common/LanguageSelector';

export default function RegisterPage() {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];

  return (
    <div className="w-full">
      {/* Language selector */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector language={language} setLanguage={(lang) => setLanguage(lang as Language)} />
      </div>
      
      {/* Page header with subtle animation */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-script text-pink-600"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {t.auth.register}
        </motion.h1>
        <motion.p 
          className="text-gray-500 mt-2 font-serif italic text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
        >
          {t.auth.registerSubtitle}
        </motion.p>
      </motion.div>
      
      {/* Register form with enhanced styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <RegisterForm language={language} />
      </motion.div>
    </div>
  );
} 