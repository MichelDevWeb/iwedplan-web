'use client';

import AuthRedirect from '@/components/auth/AuthRedirect';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Logo and brand header
  const renderBrandHeader = () => (
    <Link href="/" className="absolute top-4 left-4 z-50 flex items-center">
      <div className="relative h-10 w-10 mr-2 overflow-hidden rounded-full border-2 border-pink-300">
        <Image
          src="/images/iWEDPLAN.png"
          alt="iWedPlan Logo"
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <motion.span 
        className="text-2xl font-script text-pink-600 font-bold"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        iWedPlan
      </motion.span>
    </Link>
  );

  return (
    <AuthRedirect requiredAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/auth/floral-pattern.png"
            alt="Floral background pattern"
            fill
            className="object-cover opacity-10"
            sizes="100vw"
            priority
          />
        </div>
        
        {renderBrandHeader()}
        
        {/* Content container */}
        <motion.div 
          className="relative z-10 w-full max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          className="absolute bottom-2 text-xs text-center text-pink-400/60 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          © {new Date().getFullYear()} iWedPlan • Your Dream Wedding Begins Here
        </motion.div>
      </div>
    </AuthRedirect>
  );
}