'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateWeddingDialog from '@/components/modals/CreateWeddingModal';
import LoadingScreen from '@/components/ui/loading-screen';

interface AuthRedirectProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  redirectTo?: string;
  loadingMessage?: string;
}

export default function AuthRedirect({ 
  children, 
  requiredAuth = true,
  redirectTo = '/auth/login',
  loadingMessage = 'Đang kiểm tra xác thực...'
}: AuthRedirectProps) {
  const { isAuthenticated, loading } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requiredAuth && !isAuthenticated) {
        // Show loading before redirecting to login
        setRedirecting(true);
        // Redirect to login if authentication is required but user is not authenticated
        setTimeout(() => {
          router.push(redirectTo);
        }, 300); // Small delay for loading animation
      } else if (!requiredAuth && isAuthenticated) {
        // Redirect to landing page if the user is accessing auth pages while authenticated
        const pathname = window.location.pathname;
        if (pathname.startsWith('/auth')) {
          router.push('/landing');
          // Open the create wedding dialog instead of redirecting to landing page
          setCreateDialogOpen(true);
        }
      }
    }
  }, [isAuthenticated, loading, redirectTo, requiredAuth, router]);

  // Show loading state while checking authentication or redirecting
  if (loading || redirecting) {
    return (
      <LoadingScreen 
        message={redirecting ? 'Đang chuyển hướng...' : loadingMessage}
        size="md"
        fullScreen={true}
      />
    );
  }

  return (
    <>
      {children}
      
      {/* Create Wedding Dialog */}
      <CreateWeddingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
} 