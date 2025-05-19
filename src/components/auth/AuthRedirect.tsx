'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CreateWeddingDialog from '@/components/dialogs/CreateWeddingDialog';

interface AuthRedirectProps {
  children: React.ReactNode;
  requiredAuth?: boolean;
  redirectTo?: string;
}

export default function AuthRedirect({ 
  children, 
  requiredAuth = true,
  redirectTo = '/auth/login' 
}: AuthRedirectProps) {
  const { isAuthenticated, loading } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requiredAuth && !isAuthenticated) {
        // Redirect to login if authentication is required but user is not authenticated
        router.push(redirectTo);
      } else if (!requiredAuth && isAuthenticated) {
        // Redirect to dashboard if the user is accessing auth pages while authenticated
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/auth')) {
          // Open the create wedding dialog instead of redirecting to dashboard
          setCreateDialogOpen(true);
        }
      }
    }
  }, [isAuthenticated, loading, redirectTo, requiredAuth, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-pink-200 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-pink-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-pink-200 rounded"></div>
              <div className="h-4 bg-pink-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
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