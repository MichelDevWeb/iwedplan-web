'use client';

import { useState } from 'react';
import { resetPassword } from '@/lib/firebase/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { Language, translations } from '@/lib/translations';
import { motion } from 'framer-motion';

interface ForgotPasswordFormProps {
  language: Language;
}

export default function ForgotPasswordForm({ language }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const t = translations[language];

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || (language === 'vi' ? 'Không thể gửi email đặt lại mật khẩu' : 'Failed to send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm border-pink-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t.auth.forgotPassword}</CardTitle>
        <CardDescription className="text-center">
          {language === 'vi' 
            ? 'Nhập email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu' 
            : 'Enter your email and we\'ll send you a link to reset your password'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="rounded-full bg-green-100 text-green-800 p-3 w-12 h-12 flex items-center justify-center mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-medium">{language === 'vi' ? 'Kiểm tra email của bạn' : 'Check your email'}</h3>
            <p className="text-muted-foreground">
              {language === 'vi' 
                ? `Chúng tôi đã gửi liên kết đặt lại mật khẩu đến ${email}` 
                : `We've sent a password reset link to ${email}`}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="mt-4 bg-rose-500 hover:bg-rose-600 text-white" variant="default">
                <Link href="/auth/login">{t.auth.backToLogin}</Link>
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  required
                />
              </motion.div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
                {loading 
                  ? (language === 'vi' ? 'Đang gửi liên kết...' : 'Sending reset link...') 
                  : t.auth.resetLink}
              </Button>
            </motion.div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-muted-foreground">
          {language === 'vi' ? 'Đã nhớ mật khẩu?' : 'Remember your password?'}{' '}
          <Link href="/auth/login" className="text-rose-600 hover:underline">
            {t.auth.backToLogin}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 