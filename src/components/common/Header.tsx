'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
import { 
  Globe, 
  LogOut, 
  User, 
  Settings, 
  LayoutDashboard, 
  Menu, 
  X, 
  Download, 
  Sparkles, 
  ChevronDown,
  Heart,
  CalendarHeart,
  FlowerIcon,
  Cake,
  Gift
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/firebase/authService';
import { translations, Language } from '@/lib/translations';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  setLanguage: (lang: string) => void;
  language: Language;
}

export default function Header({ setLanguage, language }: HeaderProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const [initials, setInitials] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
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

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    // Simulate a click on the sheet trigger to close the sheet
    if (sheetTriggerRef.current) {
      sheetTriggerRef.current.click();
    }
  };

  // Helper function to close sheet and navigate
  const closeSheetAndNavigate = (path: string) => {
    // Close the sheet first
    if (sheetTriggerRef.current) {
      sheetTriggerRef.current.click();
    }
    // Then navigate
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  // Render navigation items for both desktop and mobile
  const navItems = [
    { id: 'features', label: t.features, icon: Sparkles },
    { id: 'download-app', label: t.downloadApp, icon: Download },
    { id: 'websites', label: t.websitesTitle, icon: Globe },
  ];

  // Function to handle language change in mobile menu
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Close the sheet after language change
    if (sheetTriggerRef.current) {
      sheetTriggerRef.current.click();
    }
  };

  // Effect to handle cleanup on unmount
  useEffect(() => {
    // Function to handle cleanup when navigation happens
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    // Add listener for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/landing" className="flex items-center">
            <Image 
              src="/images/iWEDPLAN.png" 
              alt="iWEDPLAN Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className="text-2xl font-bold text-pink-500 font-playfair">iWedPlan</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)} 
                className="text-gray-600 hover:text-pink-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Right side - Auth and Language */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Language Selector */}
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
              variant="icon"
            />

            {/* Auth buttons or User dropdown for desktop */}
            <div className="hidden md:block">
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
                    <DropdownMenuItem onClick={() => router.push('/create/template')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{t.myWeddings}</span>
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
                      {t.auth.createAccount}
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  ref={sheetTriggerRef}
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[80%] sm:w-[350px] bg-gradient-to-b from-white to-pink-50 border-l-pink-100 p-0 overflow-hidden"
                onEscapeKeyDown={() => setIsMobileMenuOpen(false)}
                onInteractOutside={() => setIsMobileMenuOpen(false)}
              >
                <div className="relative h-full">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                    <FlowerIcon className="w-full h-full text-pink-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
                    <FlowerIcon className="w-full h-full text-pink-300" />
                  </div>
                  
                  {/* Background image - semi-transparent rose pattern */}
                  <div className="absolute inset-0 z-0 opacity-5">
                    <div className="h-full w-full" style={{ 
                      backgroundImage: `url('/images/auth/floral-pattern.png')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}></div>
                  </div>
                  
                  {/* Content container */}
                  <div className="relative z-10 flex flex-col space-y-6 py-6 px-4 h-full">
                    <div className="flex items-center justify-between">
                      <div className="font-script text-2xl text-pink-500">iWedPlan</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full hover:bg-pink-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <X className="h-5 w-5 text-gray-500" />
                      </Button>
                    </div>
                    
                    {/* Adding SheetTitle for accessibility */}
                    <SheetTitle className="sr-only">
                      Mobile Menu
                    </SheetTitle>
                    
                    {/* Navigation items */}
                    <div className="flex flex-col space-y-1">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          className="flex items-center px-4 py-3 hover:bg-white/60 rounded-md transition-all duration-300 hover:shadow-sm group"
                          onClick={() => scrollToSection(item.id)}
                        >
                          <Heart className="h-4 w-4 text-pink-400 mr-4 group-hover:scale-110 transition-transform duration-300" />
                          <span className="text-gray-700 group-hover:text-pink-500 transition-colors duration-300">{item.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="border-t border-pink-100 pt-4">
                      {/* Auth items for mobile */}
                      {loading ? (
                        <div className="px-4 py-3 flex items-center">
                          <div className="h-8 w-8 rounded-full bg-pink-100 animate-pulse mr-3"></div>
                          <div className="h-4 w-24 bg-pink-100 animate-pulse rounded"></div>
                        </div>
                      ) : isAuthenticated ? (
                        <div className="space-y-1">
                          {/* User info */}
                          <div className="px-4 py-3 flex items-center bg-white/40 rounded-md backdrop-blur-sm">
                            <Avatar className="h-9 w-9 mr-3 border-2 border-pink-200">
                              <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                              <AvatarFallback className="bg-pink-100 text-pink-700">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-medium truncate flex-1 text-gray-700">
                              {user?.displayName || user?.email}
                            </div>
                          </div>
                          
                          {/* User actions */}
                          <button
                            className="flex items-center w-full px-4 py-3 hover:bg-white/60 rounded-md transition-all duration-300 hover:shadow-sm group"
                            onClick={() => closeSheetAndNavigate('/create/template')}
                          >
                            <LayoutDashboard className="h-4 w-4 text-pink-400 mr-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-gray-700 group-hover:text-pink-500 transition-colors duration-300">{t.myWeddings}</span>
                          </button>
                          
                          <button
                            className="flex items-center w-full px-4 py-3 hover:bg-white/60 rounded-md transition-all duration-300 hover:shadow-sm group"
                            onClick={() => {
                              if (sheetTriggerRef.current) {
                                sheetTriggerRef.current.click();
                              }
                              setTimeout(() => {
                                handleLogout();
                              }, 100);
                            }}
                          >
                            <LogOut className="h-4 w-4 text-pink-400 mr-4 group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-gray-700 group-hover:text-pink-500 transition-colors duration-300">{t.logout}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 px-4 pt-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start border-pink-200 hover:bg-white/60 hover:text-pink-500 group transition-all duration-300"
                            onClick={() => closeSheetAndNavigate('/auth/login')}
                          >
                            <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                            {t.loginToStart}
                          </Button>
                          
                          <Button
                            className="w-full justify-start bg-pink-500 hover:bg-pink-600 group transition-all duration-300"
                            onClick={() => closeSheetAndNavigate('/auth/register')}
                          >
                            <Heart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                            {t.auth.createAccount}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Language switcher in mobile menu */}
                    <div className="border-t border-pink-100 pt-4 px-4 mt-auto">
                      <div className="text-sm font-medium mb-2 text-gray-600">
                        {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                      </div>
                      <LanguageSelector 
                        currentLanguage={language}
                        onLanguageChange={handleLanguageChange}
                        variant="horizontal"
                        className="w-full"
                      />
                      
                      {/* Wedding themed footer */}
                      <div className="mt-6 text-center text-xs text-pink-400/70 font-script">
                        <div className="flex justify-center mb-2">
                          <Heart className="h-4 w-4 animate-pulse" />
                        </div>
                        {language === 'vi' ? 'Đám cưới trong mơ bắt đầu từ đây' : 'Your Dream Wedding Begins Here'}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
} 