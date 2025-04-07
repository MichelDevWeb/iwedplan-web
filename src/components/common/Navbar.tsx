"use client"; // Required for Sheet state

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription, // Import SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Heart } from 'lucide-react'; // Icons

// Vietnamese navigation items
const navItems = [
  { id: 'hero', label: 'Trang Chủ' },
  { id: 'video', label: 'Video Cưới' },
  { id: 'album', label: 'Album Ảnh' },
  { id: 'story', label: 'Chuyện Tình Yêu' },
  { id: 'bridegroom', label: 'Cô Dâu & Chú Rể' },
  { id: 'events', label: 'Sự Kiện' },
  { id: 'wishes', label: 'Sổ Lưu Bút' }, // Wishes
  { id: 'gift', label: 'Mừng Cưới' }, // Gift Box
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to handle closing the sheet after clicking a link
  const handleLinkClick = (sectionId: string) => {
    setIsOpen(false);
    // Use setTimeout to allow the sheet to close before scrolling
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
            // Calculate offset needed for the fixed navbar height (adjust if necessary)
            const navbarHeight = 60; // Example height, match your actual navbar/header height
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, 150); // Small delay for sheet close animation
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm h-[60px] flex items-center justify-between px-4 md:px-6">
      {/* Left side - Couple's Names or Logo (Optional) */}
      <div className="text-lg font-semibold text-pink-600">
         {/* Replace with actual names or logo */}
         CD <Heart size={16} className="inline fill-pink-500 text-pink-500 mx-1"/> CR
      </div>

      {/* Right side - Sidebar Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6 text-gray-700" />
            <span className="sr-only">Mở menu</span> {/* Screen reader text */}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] sm:w-[300px]"> {/* Adjust width as needed */}
          <SheetHeader className="mb-6 text-left">
            <SheetTitle className="flex items-center">
               <Heart className="mr-2 h-5 w-5 text-pink-500 fill-pink-500 animate-pulse"/> {/* Animated Heart */}
               Điều hướng
            </SheetTitle>
            {/* Add SheetDescription for accessibility */}
            <SheetDescription className="sr-only"> {/* Hide visually but available for screen readers */}
                Menu chính để điều hướng các phần của trang web đám cưới.
            </SheetDescription>
          </SheetHeader>
          <ul className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                 {/* Use SheetClose to close on click, handle scroll separately */}
                <SheetClose asChild>
                    <button
                        onClick={() => handleLinkClick(item.id)}
                        className="w-full text-left flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-150 group"
                    >
                       <Heart size={14} className="mr-3 text-pink-300 group-hover:text-pink-500 group-hover:fill-pink-500 transition-all duration-200 group-hover:scale-110" /> {/* Subtle heart animation */}
                       {item.label}
                    </button>
                </SheetClose>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar; 