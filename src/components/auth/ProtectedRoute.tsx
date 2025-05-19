'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/lib/firebase/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push(redirectTo);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="relative">
          <Heart className="w-12 h-12 text-pink-500 animate-pulse" />
          <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">Đang xác thực...</h3>
        <div className="mt-2 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-pink-500 animate-spin mr-2" />
          <span className="text-sm text-gray-500">Vui lòng đợi trong giây lát</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 