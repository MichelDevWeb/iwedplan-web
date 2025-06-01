"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Heart, CheckSquare, ArrowUp, Menu, X, Camera, Video, 
  BookHeart, Users, Calendar, PenSquare, CircleDollarSign, 
  Download, Smartphone, Ticket, Gift,
  Sparkles, Image, Album, MessageSquare, User, List, Clipboard,
  Home, Plus
} from 'lucide-react';
import RsvpModal from '@/components/modals/RsvpModal';
import AttendanceListModal from '@/components/modals/AttendanceListModal';
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { navItems } from '@/config/templateConfig';
import MusicFloatingButton from './MusicFloatingButton';
import { useAuth } from '@/contexts/AuthContext';
import LoadingOverlay from "@/components/ui/loading-overlay";

// Map icons to nav items
const navIcons = {
  'hero': Image,
  'video': Video,
  'album': Album,
  'calendar': Calendar,
  'story': BookHeart,
  'bridegroom': Users,
  'events': Calendar,
  'rsvp': CheckSquare,
  'wishes': MessageSquare,
  'gift': Gift
};

const FloatingActionButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const weddingId = pathname.split('/').pop();
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Check if we're on a wedding page
  const isWeddingPage = pathname.match(/^\/[^\/]+$/) && pathname !== '/landing';

  // Function to handle scrolling to a section (no navbar offset needed now)
  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false); // Close menu on navigation
    const section = document.getElementById(sectionId);
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset; // No offset

      window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
      });
    }
  };

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to handle navigation
  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    // setNavigationLoading(true);
    router.push(path);
  };

  // Effect to show/hide Back to Top button based on scroll position
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showBackToTop && window.pageYOffset > 400){ // Show after scrolling 400px
        setShowBackToTop(true)
      } else if (showBackToTop && window.pageYOffset <= 400){
        setShowBackToTop(false)
      }
    };

    window.addEventListener('scroll', checkScrollTop)
    return () => window.removeEventListener('scroll', checkScrollTop)
  }, [showBackToTop]);

  const handleModalClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click from closing the menu immediately
    // The modal trigger should handle opening the modal
  };

  // Render the appropriate menu items based on page type
  const renderMenuItems = () => {
    if (isWeddingPage) {
      return (
        <>
          {/* Navigation Items */}
          {navItems.map((item, index) => {
            const IconComponent = navIcons[item.id as keyof typeof navIcons] || Heart;
            
            return (
              <Button
                key={item.id}
                variant="secondary"
                className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => scrollToSection(item.id)}
                size="sm"
              >
                <span className="text-sm mr-2 font-medium">{item.label}</span>
                <IconComponent size={16} className="text-pink-500"/>
              </Button>
            );
          })}
          
          <RsvpModal
            trigger={
              <Button
                variant="secondary"
                className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md w-full justify-start transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
                style={{ animationDelay: `${navItems.length * 0.05}s` }}
                onClick={handleModalClick}
                size="sm"
              >
                <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium">Xác nhận tham dự</span>
              </Button>
            }
            weddingId={weddingId}
          />

          {/* Attendance list button - only visible to authenticated users */}
          {isAuthenticated && weddingId && (
            <AttendanceListModal
              trigger={
                <Button
                  variant="secondary"
                  className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md w-full justify-start transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
                  style={{ animationDelay: `${(navItems.length + 1) * 0.05}s` }}
                  onClick={handleModalClick}
                  size="sm"
                >
                  <Clipboard className="mr-2 h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium">Danh sách tham dự</span>
                </Button>
              }
              weddingId={weddingId}
            />
          )}
        </>
      );
    }
    
    return null;
  };

  return (
    <> { /* Use Fragment to return multiple root elements */}
      {/* Loading Overlay for navigation */}
      <LoadingOverlay 
        isLoading={navigationLoading}
        type="navigation"
        message="Đang chuyển trang..."
      />

      {/* Blur Overlay - only show when menu is open */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Music Control Button */}
      {((isWeddingPage && weddingId) || (!isWeddingPage && !weddingId)) && (
        <MusicFloatingButton weddingId={weddingId} />
      )}

      {isWeddingPage && (
        <>
          {/* Expanded Menu Items */}
          <div
            className={cn(
              "fixed bottom-[100px] right-6 z-40 flex flex-col items-end space-y-3 transition-all duration-500 ease-out",
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
          >
            {renderMenuItems()}
          </div>

          {/* Redirect Buttons - Left side of main FAB */}
          <div
            className={cn(
              "fixed bottom-6 right-[100px] z-40 flex flex-row items-center space-x-3 transition-all duration-500 ease-out",
              isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
            )}
          >
            <Button
              variant="secondary"
              className="rounded-full shadow-lg h-12 px-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-blue-200"
              onClick={() => handleNavigation("/landing")}
              title="Về trang chủ"
            >
              <Home className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Trang chủ</span>
            </Button>
            
            {isAuthenticated && (
            <Button
              variant="secondary"
              className="rounded-full shadow-lg h-12 px-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-green-200"
              onClick={() => handleNavigation("/create/template")}
              title="Tạo website mới"
            >
              <Plus className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Tạo mới</span>
            </Button>
            )}
          </div>

          {/* Main FAB - Show different icons based on page */}
          <Button
            size="icon"
            className={cn(
              "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:rotate-[360deg]",
              isWeddingPage ? "bg-pink-500 hover:bg-pink-600 text-white hover:shadow-pink-300/50" : "bg-white hover:bg-pink-100 text-pink-500 hover:shadow-pink-200"
            )}
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 animated fadeIn" />
            ) : (
              isWeddingPage ? <Heart className="h-6 w-6 animated fadeIn" /> : <Menu className="h-6 w-6 animated fadeIn" />
            )}
          </Button>
        </>
      )}

      {/* Back to Top Button */}
      <Button
            size="icon"
            variant="outline"
            className={cn(
              "fixed bottom-6 left-6 z-50 rounded-full w-12 h-12 bg-white/70 backdrop-blur-lg text-gray-700 shadow-md transition-all duration-500 border-white/20 hover:bg-pink-100 hover:scale-110 hover:shadow-pink-200",
              showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            )}
            aria-label="Trở về đầu trang"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-6 w-6 text-pink-500 animated bounce" />
          </Button>
    </>
  );
};

export default FloatingActionButton; 