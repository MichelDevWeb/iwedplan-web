'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, LogOut, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/firebase/authService';
import { translations, Language } from '@/lib/translations';

interface HeaderProps {
  setLanguage: (lang: string) => void;
  language: Language;
}

export default function Header({ setLanguage, language }: HeaderProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const [initials, setInitials] = useState('');
  const router = useRouter();
  const t = translations[language];

  useEffect(() => {
    if (user?.displayName) {
      // Generate initials from display name
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        setInitials(`${names[0][0]}${names[names.length - 1][0]}`);
      } else if (names.length === 1) {
        setInitials(names[0].substring(0, 2));
      }
    } else if (user?.email) {
      // Use first two characters of email if no display name
      setInitials(user.email.substring(0, 2).toUpperCase());
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Clear user data from localStorage
      localStorage.removeItem('iwedplan_user');
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center">
            <span className="text-2xl font-bold text-pink-500 font-playfair">iWedPlan</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-pink-500 px-3 py-2 text-sm font-medium">
              {t.features}
            </Link>
            <Link href="#download-app" className="text-gray-600 hover:text-pink-500 px-3 py-2 text-sm font-medium">
              {t.downloadApp}
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-pink-500 px-3 py-2 text-sm font-medium">
              {t.pricing}
            </Link>
          </nav>
          
          {/* Right side - Auth and Language */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className={language === 'en' ? 'bg-pink-50 text-pink-500' : ''}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('vi')}
                  className={language === 'vi' ? 'bg-pink-50 text-pink-500' : ''}
                >
                  Tiếng Việt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth buttons or User dropdown */}
            {loading ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                      <AvatarFallback className="bg-pink-100 text-pink-700">{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.displayName || user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t.dashboard}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t.settings}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t.logout}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-gray-600 hover:text-pink-500"
                  asChild
                >
                  <Link href="/auth/login">
                    {t.loginToStart}
                  </Link>
                </Button>
                <Button 
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  asChild
                >
                  <Link href="/auth/register">
                    {language === 'vi' ? 'Đăng ký' : 'Register'}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 