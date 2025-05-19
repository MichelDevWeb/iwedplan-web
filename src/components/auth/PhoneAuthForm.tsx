'use client';

import { useState, useRef, useEffect } from 'react';
import { initPhoneAuth, sendVerificationCode, verifyPhoneWithCode } from '@/lib/firebase/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CreateWeddingDialog from '@/components/dialogs/CreateWeddingDialog';
import { Language, translations } from '@/lib/translations';
import { motion } from 'framer-motion';

interface PhoneAuthFormProps {
  language: Language;
}

export default function PhoneAuthForm({ language }: PhoneAuthFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter code
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    // Initialize recaptcha when component mounts
    let recaptchaVerifier: any;
    
    const initRecaptcha = async () => {
      if (recaptchaContainerRef.current) {
        try {
          recaptchaVerifier = await initPhoneAuth('recaptcha-container');
        } catch (err: any) {
          setError(err.message || 'Error initializing phone authentication');
        }
      }
    };

    initRecaptcha();

    return () => {
      // Cleanup if needed
      if (recaptchaVerifier && typeof recaptchaVerifier.clear === 'function') {
        recaptchaVerifier.clear();
      }
    };
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!recaptchaContainerRef.current) {
        throw new Error('reCAPTCHA not initialized');
      }

      // Format phone number with international format if not already
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+84${phoneNumber}`; // Default to Vietnam (+84)

      const recaptchaVerifier = await initPhoneAuth('recaptcha-container');
      const verificationId = await sendVerificationCode(formattedPhone, recaptchaVerifier);
      setVerificationId(verificationId);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await verifyPhoneWithCode(verificationId, verificationCode);
      // Open CreateWeddingDialog instead of redirecting
      setCreateDialogOpen(true);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-pink-100 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-800">{t.auth.quickSignIn}</CardTitle>
          <CardDescription className="text-center text-gray-500">
            {step === 1 
              ? language === 'vi' ? 'Nhập số điện thoại để nhận mã xác thực' : 'Enter your phone number to receive a verification code'
              : language === 'vi' ? 'Nhập mã xác thực đã gửi đến điện thoại của bạn' : 'Enter the verification code sent to your phone'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{language === 'vi' ? 'Số điện thoại' : 'Phone Number'}</Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder={t.auth.phonePlaceholder}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </motion.div>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? 'Nhập mã quốc gia, ví dụ: +84 cho Việt Nam' : 'Include country code, e.g., +84 for Vietnam'}
                </p>
              </div>
              
              <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
              
              {error && <p className="text-sm text-destructive">{error}</p>}
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
                  {loading 
                    ? language === 'vi' ? 'Đang gửi mã...' : 'Sending code...' 
                    : language === 'vi' ? 'Gửi mã xác thực' : 'Send Verification Code'}
                </Button>
              </motion.div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">{language === 'vi' ? 'Mã xác thực' : 'Verification Code'}</Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  />
                </motion.div>
              </div>
              
              {error && <p className="text-sm text-destructive">{error}</p>}
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button type="submit" className="w-full bg-rose-500 hover:bg-rose-600" disabled={loading}>
                  {loading 
                    ? language === 'vi' ? 'Đang xác thực...' : 'Verifying...' 
                    : language === 'vi' ? 'Xác thực & Đăng nhập' : 'Verify & Sign In'}
                </Button>
              </motion.div>
              
              <Button 
                type="button" 
                variant="link" 
                className="w-full text-rose-500" 
                onClick={() => setStep(1)}
                disabled={loading}
              >
                {language === 'vi' ? 'Thay đổi số điện thoại' : 'Change phone number'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center text-gray-500">
            {language === 'vi' ? 'Muốn dùng email?' : 'Prefer to use email?'}{' '}
            <Link href="/auth/login" className="text-rose-600 hover:underline">
              {language === 'vi' ? 'Đăng nhập với email' : 'Sign in with email'}
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