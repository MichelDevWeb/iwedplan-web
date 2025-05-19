"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Heart, CheckSquare, ArrowUp, Menu, X, Camera, Video, 
  BookHeart, Users, Calendar, PenSquare, CircleDollarSign, 
  Volume2, VolumeX, Download, Smartphone, Ticket, Gift,
  Sparkles
} from 'lucide-react';
import RsvpModal from '@/components/common/RsvpModal';
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from 'next/navigation';

// Re-define or import navItems if not available globally
const navItems = [
  { id: 'hero', label: 'Trang Chủ' },
  { id: 'video', label: 'Video Cưới' },
  { id: 'album', label: 'Album Ảnh' },
  { id: 'story', label: 'Chuyện Tình Yêu' },
  { id: 'bridegroom', label: 'Cô Dâu & Chú Rể' },
  { id: 'events', label: 'Sự Kiện' },
  { id: 'wishes', label: 'Sổ Lưu Bút' },
  { id: 'gift', label: 'Mừng Cưới' },
];

// Map icons to nav items
const navIcons = {
  'hero': Heart,
  'video': Video,
  'album': Camera,
  'story': BookHeart,
  'bridegroom': Users,
  'events': Calendar,
  'wishes': PenSquare,
  'gift': CircleDollarSign
};

// Page type definitions
type PageType = 'wedding' | 'landing' | 'dashboard' | 'create' | 'other';

// Define pages and their actions
const pages: { 
  type: PageType; 
  pattern: RegExp; 
  icon: React.ElementType;
  actions?: { 
    id: string; 
    label: string; 
    icon: React.ElementType;
    onClick?: () => void;
  }[];
}[] = [
  {
    type: 'wedding',
    pattern: /^\/(?!landing|create|dashboard|auth).*$/,
    icon: Heart,
    // Wedding actions are dynamically generated from navItems
  },
  {
    type: 'landing',
    pattern: /^\/landing(\/.*)?$/,
    icon: Smartphone,
    actions: [
      { 
        id: 'download-app', 
        label: 'Tải ứng dụng', 
        icon: Download 
      },
      { 
        id: 'features', 
        label: 'Tính năng', 
        icon: Sparkles 
      },
      { 
        id: 'pricing', 
        label: 'Báo giá', 
        icon: CircleDollarSign 
      }
    ]
  },
  {
    type: 'dashboard',
    pattern: /^\/dashboard(\/.*)?$/,
    icon: Menu,
    actions: [
      { 
        id: 'invites', 
        label: 'Quản lý khách mời', 
        icon: Users 
      },
      { 
        id: 'budget', 
        label: 'Ngân sách', 
        icon: CircleDollarSign 
      },
      { 
        id: 'tasks', 
        label: 'Công việc', 
        icon: CheckSquare 
      },
      { 
        id: 'settings', 
        label: 'Cài đặt', 
        icon: Ticket 
      }
    ]
  },
  {
    type: 'create',
    pattern: /^\/create(\/.*)?$/,
    icon: PenSquare,
    actions: [
      { 
        id: 'templates', 
        label: 'Mẫu thiệp', 
        icon: Ticket 
      },
      { 
        id: 'themes', 
        label: 'Giao diện', 
        icon: Sparkles 
      },
      { 
        id: 'preview', 
        label: 'Xem trước', 
        icon: Camera 
      }
    ]
  }
];

const FloatingActionButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [showVoucherNotification, setShowVoucherNotification] = useState(false);
  const [pageType, setPageType] = useState<PageType>('other');
  const [currentPage, setCurrentPage] = useState<typeof pages[0] | undefined>(undefined);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  
  // Determine the current page type
  useEffect(() => {
    // Find matching page based on URL pattern
    const matchedPage = pages.find(page => page.pattern.test(pathname));
    
    if (matchedPage) {
      setPageType(matchedPage.type);
      setCurrentPage(matchedPage);
    } else {
      setPageType('other');
      setCurrentPage(undefined);
    }
  }, [pathname]);

  // Check for voucher or affiliate code in URL
  useEffect(() => {
    if (!searchParams) return;
    
    // Get voucher from URL parameters
    const ref = searchParams.get('ref');
    const coupon = searchParams.get('coupon');
    const voucher = searchParams.get('voucher');
    const affiliate = searchParams.get('affiliate');
    
    const code = voucher || coupon || ref || affiliate;
    
    if (code) {
      setVoucherCode(code);
      setShowVoucherNotification(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setShowVoucherNotification(false);
      }, 5000);
      
      // Store the voucher code in local storage for future use
      localStorage.setItem('iwedplan_voucher', code);
    } else {
      // Check if we have a saved voucher in localStorage
      const savedVoucher = localStorage.getItem('iwedplan_voucher');
      if (savedVoucher) {
        setVoucherCode(savedVoucher);
      }
    }
  }, [searchParams]);

  // Initialize audio based on page type
  useEffect(() => {
    // Clean up previous audio instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    if (pageType === 'wedding') {
      audioRef.current = new Audio('/sounds/leduong.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    } else if (pageType === 'landing') {
      audioRef.current = new Audio('/sounds/Canon in D.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    
    if (audioRef.current) {
      const handleFirstInteraction = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(error => {
            console.log('Auto-play failed:', error);
          });
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('touchstart', handleFirstInteraction);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      };
    }
  }, [pageType]);

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.5;
        audioRef.current.play();
      } else {
        audioRef.current.volume = 0;
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

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
    if (pageType === 'wedding') {
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
          />
          
          {/* Sound Controls - Moved from top */}
          <Button
            variant="secondary"
            className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
            style={{ animationDelay: `${(navItems.length + 1) * 0.05}s` }}
            onClick={toggleMute}
            size="sm"
          >
            <span className="text-sm mr-2 font-medium">{isMuted ? "Bật nhạc" : "Tắt nhạc"}</span>
            {isMuted ? (
              <VolumeX size={16} className="text-pink-500" />
            ) : (
              <Volume2 size={16} className="text-pink-500" />
            )}
          </Button>
        </>
      );
    } else if (currentPage?.actions) {
      return (
        <>
          {currentPage.actions.map((action, index) => (
            <Button
              key={action.id}
              variant="secondary"
              className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else {
                  const section = document.getElementById(action.id);
                  if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                  }
                }
                setIsMenuOpen(false);
              }}
              size="sm"
            >
              <span className="text-sm mr-2 font-medium">{action.label}</span>
              <action.icon size={16} className="text-pink-500"/>
            </Button>
          ))}
          
          {/* Sound Controls for all pages with audio */}
          {(['landing', 'wedding'] as PageType[]).includes(pageType) && (
            <Button
              variant="secondary"
              className="rounded-full shadow-lg h-10 pl-3 pr-4 bg-white/80 hover:bg-white/90 backdrop-blur-md transform transition-all duration-300 hover:scale-110 hover:shadow-pink-200 animated fadeInRight"
              style={{ animationDelay: `${currentPage.actions.length * 0.05}s` }}
              onClick={toggleMute}
              size="sm"
            >
              <span className="text-sm mr-2 font-medium">{isMuted ? "Bật nhạc" : "Tắt nhạc"}</span>
              {isMuted ? (
                <VolumeX size={16} className="text-pink-500" />
              ) : (
                <Volume2 size={16} className="text-pink-500" />
              )}
            </Button>
          )}
        </>
      );
    }
    
    return null;
  };

  return (
    <> { /* Use Fragment to return multiple root elements */}
      {/* Voucher code notification */}
      {showVoucherNotification && voucherCode && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-pink-100 border border-pink-300 text-pink-700 px-4 py-2 rounded-full shadow-md flex items-center gap-2 animated fadeInDown">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Mã giảm giá <strong>{voucherCode}</strong> đã được áp dụng!</span>
        </div>
      )}
      
      {/* Expanded Menu Items */}
      <div
        className={cn(
          "fixed bottom-[100px] right-6 z-40 flex flex-col items-end space-y-3 transition-all duration-500 ease-out",
          isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {renderMenuItems()}
      </div>

      {/* Main FAB - Show different icons based on page */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:rotate-[360deg]",
          pageType === 'wedding' 
            ? "bg-pink-500 hover:bg-pink-600 text-white hover:shadow-pink-300/50"
            : "bg-white hover:bg-pink-100 text-pink-500 hover:shadow-pink-200"
        )}
        aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <X className="h-6 w-6 animated fadeIn" />
        ) : (
          currentPage ? <currentPage.icon className="h-6 w-6 animated fadeIn" /> : <Menu className="h-6 w-6 animated fadeIn" />
        )}
      </Button>

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