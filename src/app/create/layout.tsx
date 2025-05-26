'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AuthRedirect from '@/components/auth/AuthRedirect';

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthRedirect requiredAuth={true}>
        <div className="template-create">
          {children}
        </div>
      </AuthRedirect>
    </AuthProvider>
  );
} 