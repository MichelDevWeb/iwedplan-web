'use client';

import { useState } from 'react';
import { createUserWithEmail, signInWithGoogle } from '@/lib/firebase/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CreateWeddingDialog from '@/components/modals/CreateWeddingModal';
import { Language, translations } from '@/lib/translations';
import { motion } from 'framer-motion';

interface RegisterFormProps {
  language: Language;
}

export default function RegisterForm({ language }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const t = translations[language];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(language === 'vi' ? 'Mật khẩu không khớp' : 'Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmail(email, password, name);
      setCreateDialogOpen(true);
    } catch (err: any) {
      setError(err.message || (language === 'vi' ? 'Không thể tạo tài khoản' : 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      setCreateDialogOpen(true);
    } catch (err: any) {
      setError(err.message || (language === 'vi' ? 'Không thể đăng ký bằng Google' : 'Failed to sign up with Google'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-pink-100 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">{t.auth.register}</CardTitle>
          <CardDescription className="text-center text-gray-500">
            {t.auth.registerSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">{language === 'vi' ? 'Họ và tên' : 'Full Name'}</Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.auth.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  required
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  required
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">{language === 'vi' ? 'Mật khẩu' : 'Password'}</Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  required
                />
              </motion.div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">{language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}</Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={language === 'vi' ? 'Nhập lại mật khẩu' : 'Confirm your password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/70 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                  required
                />
              </motion.div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                disabled={loading}
              >
                {loading 
                  ? (language === 'vi' ? 'Đang tạo tài khoản...' : 'Creating Account...') 
                  : t.auth.createAccount}
              </Button>
            </motion.div>
          </form>
          
          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">{language === 'vi' ? 'Hoặc tiếp tục với' : 'Or continue with'}</span>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-gray-300 text-gray-700"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <FaGoogle className="text-red-500" />
              <span>{language === 'vi' ? 'Đăng ký với Google' : 'Sign up with Google'}</span>
            </Button>
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-gray-500">
            {language === 'vi' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
            <Link href="/auth/login" className="text-pink-600 hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </CardFooter>
      </Card>
      
      <CreateWeddingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
} 