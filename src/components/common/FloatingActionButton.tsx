"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, CheckSquare, ArrowUp, Menu, X, Camera, Video, BookHeart, Users, Calendar, PenSquare, CircleDollarSign, Volume2, VolumeX, Download, Smartphone } from 'lucide-react';
import RsvpModal from '@/components/common/RsvpModal'; // Import the RSVP modal
import { cn } from "@/lib/utils"; // For conditional classes
import { usePathname } from 'next/navigation';

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

const FloatingActionButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const isLandingPage = pathname === '/landing/';

  // Initialize audio
  useEffect(() => {
    if (!isLandingPage) {
      audioRef.current = new Audio('/sounds/leduong.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;

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
      };
    } else {
      audioRef.current = new Audio('/sounds/Canon in D.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;

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
      };
    }
  }, [isLandingPage]);

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

  const handleRsvpClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click from closing the menu immediately
    // The RsvpModal trigger should handle opening the modal
  };

  return (
    <> { /* Use Fragment to return multiple root elements */}
      {/* Mute Button - Only show on wedding pages */}
      {!isLandingPage && (
        <Button
          size="icon"
          variant="outline"
          className={cn(
            "fixed top-6 left-6 z-50 rounded-full w-12 h-12 bg-white/70 backdrop-blur-lg text-gray-700 shadow-md transition-all duration-500 border-white/20 hover:bg-pink-100 hover:scale-110 hover:shadow-pink-200",
            "animated fadeIn"
          )}
          aria-label={isMuted ? "Bật nhạc" : "Tắt nhạc"}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-6 w-6 text-pink-500" />
          ) : (
            <Volume2 className="h-6 w-6 text-pink-500" />
          )}
        </Button>
      )}

      {/* Download App Button - Only show on landing page */}
      {isLandingPage && (
        <Button
          size="icon"
          variant="outline"
          className={cn(
            "fixed top-6 right-6 z-50 rounded-full w-12 h-12 bg-white/70 backdrop-blur-lg text-gray-700 shadow-md transition-all duration-500 border-white/20 hover:bg-pink-100 hover:scale-110 hover:shadow-pink-200",
            "animated fadeIn"
          )}
          aria-label="Tải ứng dụng"
          onClick={() => {
            const appSection = document.getElementById('download-app');
            if (appSection) {
              appSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <Download className="h-6 w-6 text-pink-500" />
        </Button>
      )}

      {/* Expanded Menu Items */}
      {!isLandingPage && (
        <div
          className={cn(
            "fixed bottom-[100px] right-6 z-40 flex flex-col items-end space-y-3 transition-all duration-500 ease-out",
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}
        >
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
                      onClick={handleRsvpClick}
                      size="sm"
                    >
                      <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                      <span className="text-sm font-medium">Xác nhận tham dự</span>
                   </Button>
               }
            />
        </div>
      )}

      {/* Main FAB - Show different icons based on page */}
      <Button
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:rotate-[360deg]",
          isLandingPage 
            ? "bg-white hover:bg-pink-100 text-pink-500 hover:shadow-pink-200" 
            : "bg-pink-500 hover:bg-pink-600 text-white hover:shadow-pink-300/50"
        )}
        aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isLandingPage ? (
          <Smartphone className="h-6 w-6 animated fadeIn" />
        ) : isMenuOpen ? (
          <X className="h-6 w-6 animated fadeIn" />
        ) : (
          <Menu className="h-6 w-6 animated fadeIn" />
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