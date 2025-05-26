"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle } from 'react-icons/fa';
import { Heart, Mail, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase/authService';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import CreateWeddingDialog from '@/components/modals/CreateWeddingModal';
import { Language, translations } from '@/lib/translations';

interface LoginFormProps {
  language: Language;
}

export default function LoginForm({ language }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const t = translations[language];
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setCreateDialogOpen(true);
    }
  }, [isAuthenticated]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      // Open create wedding dialog instead of redirecting
      setCreateDialogOpen(true);
    } catch (err: any) {
      let errorMessage = language === 'vi' ? 'Đăng nhập không thành công' : 'Login failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = language === 'vi' ? 'Email hoặc mật khẩu không chính xác' : 'Incorrect email or password';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = language === 'vi' 
          ? 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau' 
          : 'Too many failed login attempts. Please try again later';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Open create wedding dialog instead of redirecting
      setCreateDialogOpen(true);
    } catch (err) {
      setError(language === 'vi' ? 'Đăng nhập với Google không thành công' : 'Google login failed');
      console.error(err);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  const floatingHearts = Array(5).fill(0).map((_, i) => (
    <motion.div
      key={i}
      className="absolute text-pink-400"
      initial={{ 
        x: Math.random() * 400 - 200, 
        y: Math.random() * 200 + 100,
        opacity: 0.2,
        scale: Math.random() * 0.5 + 0.5
      }}
      animate={{ 
        y: [null, -100],
        opacity: [null, 0],
        transition: { 
          repeat: Infinity, 
          duration: Math.random() * 5 + 10,
          ease: 'easeInOut',
          delay: Math.random() * 5
        }
      }}
    >
      <Heart className="fill-pink-100" size={Math.random() * 15 + 15} />
    </motion.div>
  ));

  return (
    <motion.div 
      className="relative w-full max-w-md mx-auto overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {floatingHearts}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-pink-100"
      >
        <motion.div variants={itemVariants} className="text-center mb-6">
          <motion.div 
            className="inline-block"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 5 }}
          >
            <Heart className="h-12 w-12 text-pink-500 mx-auto mb-2" />
          </motion.div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {language === 'vi' ? 'Chào mừng trở lại' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 mt-1">
            {t.auth.loginSubtitle}
          </p>
        </motion.div>
        
        {error && (
          <motion.div 
            variants={itemVariants}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.form onSubmit={handleSubmit} variants={containerVariants}>
          <motion.div className="space-y-4" variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  placeholder={t.auth.emailPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="password" className="text-gray-700">
                {language === 'vi' ? 'Mật khẩu' : 'Password'}
              </Label>
              <div className="relative mt-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  placeholder={t.auth.passwordPlaceholder}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end mt-1">
                <Link href="/auth/forgot-password" className="text-xs text-pink-600 hover:text-pink-700">
                  {language === 'vi' ? 'Quên mật khẩu?' : 'Forgot password?'}
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {t.auth.signIn}
              </Button>
            </motion.div>
          </motion.div>
        </motion.form>

        <motion.div variants={itemVariants} className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              {language === 'vi' ? 'Hoặc đăng nhập với' : 'Or sign in with'}
            </span>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 gap-3" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <FaGoogle className="text-red-500" />
              Google
            </Button>
          </motion.div>
        </motion.div>

        <motion.p 
          variants={itemVariants} 
          className="mt-8 text-center text-sm text-gray-500"
        >
          {language === 'vi' ? 'Chưa có tài khoản?' : 'Don\'t have an account?'}{' '}
          <Link 
            href="/auth/register" 
            className="font-medium text-pink-600 hover:text-pink-700"
          >
            {language === 'vi' ? 'Đăng ký ngay' : 'Register now'}
          </Link>
        </motion.p>
      </motion.div>

      <CreateWeddingDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </motion.div>
  );
} 