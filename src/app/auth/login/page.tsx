'use client';

import LoginForm from '@/components/auth/LoginForm';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { translations, Language } from '@/lib/translations';

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>('vi');
  const t = translations[language];

  return (
    <div className="w-full">
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
          {t.auth.signIn}
        </motion.h1>
        <motion.p 
          className="text-gray-500 mt-2 font-serif italic text-sm md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.6 }}
        >
          {t.auth.loginSubtitle}
        </motion.p>
      </motion.div>
      
      {/* Login form */}
      <LoginForm language={language} />
    </div>
  );
} 