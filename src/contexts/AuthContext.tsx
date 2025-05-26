'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
} from '@/lib/firebase/authService';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for cached user data
        if (typeof window !== 'undefined') {
          const cachedUser = localStorage.getItem('iwedplan_user');
          if (cachedUser) {
            try {
              const parsedUser = JSON.parse(cachedUser);
              setUser(parsedUser);
              setIsAuthenticated(true);
              
              // If user is accessing auth pages with cached data, redirect to dashboard
              if (pathname?.startsWith('/auth')) {
                router.push('/landing');
              }
            } catch (e) {
              // Invalid cache, will be replaced by real auth
              localStorage.removeItem('iwedplan_user');
            }
          }
        }

        // Set up real-time auth listener
        const unsubscribe = await onAuthChange((firebaseUser) => {
          setUser(firebaseUser);
          setIsAuthenticated(!!firebaseUser);
          setLoading(false);

          // Cache user data when logged in
          if (firebaseUser && typeof window !== 'undefined') {
            const userToCache = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              phoneNumber: firebaseUser.phoneNumber,
              photoURL: firebaseUser.photoURL,
            };
            localStorage.setItem('iwedplan_user', JSON.stringify(userToCache));
            
            // Redirect from auth pages if user is authenticated
            if (pathname?.startsWith('/auth')) {
              router.push('/landing');
            }
          } else if (!firebaseUser && typeof window !== 'undefined') {
            localStorage.removeItem('iwedplan_user');
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
        return () => {};
      }
    };

    const authUnsubscribe = initAuth();
    
    return () => {
      authUnsubscribe.then(unsubscribe => unsubscribe());
    };
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 