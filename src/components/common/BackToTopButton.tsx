"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp } from 'lucide-react';
import { cn } from "@/lib/utils";

const BackToTopButton = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
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
      <ArrowUp className="h-6 w-6 text-pink-600 animated bounce" />
    </Button>
  );
};

export default BackToTopButton; 