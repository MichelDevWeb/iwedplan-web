"use client"; // Need client component for modal state

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import RsvpModal from '@/components/modals/RsvpModal';
import Image from 'next/image';
import { WeddingData } from '@/lib/firebase/models';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import { 
  flowerFrames, 
  colorThemes, 
  effectOptions, 
  flowerFrameMapping
} from '@/config/templateConfig';
import { Timestamp } from 'firebase/firestore';
import ThemeCustomizer from '@/components/wedding/ThemeCustomizer';

interface HeroSectionProps {
  weddingData: WeddingData;
  onSaveSettings?: (settings: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ weddingData, onSaveSettings }) => {
  const { isAuthenticated } = useAuth();
  const [groomName, setGroomName] = useState(weddingData.groomName || "Chú Rể");
  const [brideName, setBrideName] = useState(weddingData.brideName || "Cô Dâu");
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date | null>(
    weddingData.eventDate ? weddingData.eventDate.toDate() : null
  );
  const [coverImage, setCoverImage] = useState(weddingData.heroImageUrl || "/images/album/hero.png");
  
  // Format date as string if available
  const formatWeddingDate = () => {
    if (eventDate) {
      const day = eventDate.getDate();
      const month = eventDate.getMonth() + 1;
      const year = eventDate.getFullYear();
      return `Ngày ${day} tháng ${month} năm ${year}`;
    }
    return "Ngày 04 tháng 12 năm 2023"; // Default if no date is set
  };
  
  // Update wedding date display when eventDate changes
  useEffect(() => {
    setWeddingDate(formatWeddingDate());
  }, [eventDate]);

  // Use wedding data for theme if available
  const getInitialColorTheme = () => {
    if (weddingData.color) {
      const found = colorThemes.find(theme => theme.id === weddingData.color);
      if (found) return found;
    }
    return colorThemes[0];
  };
  
  // Get initial frame from wedding data
  const getInitialFrame = () => {
    if (weddingData.flowerFrame) {
      // Convert from 'rose' format to '1' format using mapping
      const flowerFrameId = weddingData.flowerFrame as keyof typeof flowerFrameMapping;
      const frameId = flowerFrameMapping[flowerFrameId] || '1';
      const found = flowerFrames.find(frame => frame.id === frameId);
      if (found) return found;
    }
    return flowerFrames[0];
  };

  // Get initial effect from wedding data
  const getInitialEffect = () => {
    if (weddingData.effect) {
      const found = effectOptions.find(effect => effect.id === weddingData.effect);
      if (found) return found;
    }
    return effectOptions[0]; // Default: none
  };

  // State for theme options
  const [currentColorTheme, setCurrentColorTheme] = useState(getInitialColorTheme());
  const [currentFrame, setCurrentFrame] = useState(getInitialFrame());
  const [currentEffect, setCurrentEffect] = useState(getInitialEffect());
  
  // State for custom colors
  const [customStartColor, setCustomStartColor] = useState(weddingData.customColor || '#ffd6e8');
  const [customEndColor, setCustomEndColor] = useState(weddingData.customEndColor || '#d1e5ff');
  const [useCustomColors, setUseCustomColors] = useState(!!weddingData.customColor);
  const [customButtonClass, setCustomButtonClass] = useState('bg-white/20 hover:bg-white/30 border-white/50 text-rose-800');

  // Effect particles state
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; rotation: number; opacity: number; speed: number; sway: number; swayOffset: number; scale: number; rotationSpeed: number; swayFrequency: number }[]>([]);

  // Function to determine text color based on background color brightness
  const getTextColorForBackground = (color: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return 'text-gray-800';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? 'text-gray-800' : 'text-white';
  };
  
  // Function to determine button styling based on background color
  const getButtonClassForBackground = (color: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!result) return 'bg-white/20 hover:bg-white/30 border-white/50 text-white';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.6
      ? `bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 text-gray-800`
      : `bg-white/20 hover:bg-white/30 border-white/50 text-white`;
  };

  // Update text color when custom colors change
  useEffect(() => {
    if (useCustomColors) {
      const newButtonClass = getButtonClassForBackground(customStartColor);
      if (newButtonClass !== customButtonClass) {
        setCustomButtonClass(newButtonClass);
      }
    }
  }, [customStartColor, useCustomColors, customButtonClass]);

  // Apply cursor style globally
  useEffect(() => {
    if (!document) return;
    
    // Clean up previous cursor styles
    document.documentElement.classList.remove('cursor-heart', 'cursor-flower', 'cursor-ring');
    
    // Apply new cursor style
    if (currentEffect.cursorClass !== 'cursor-default') {
      document.documentElement.classList.add(currentEffect.cursorClass);
    }
    
    return () => {
      // Clean up on unmount
      document.documentElement.classList.remove('cursor-heart', 'cursor-flower', 'cursor-ring');
    };
  }, [currentEffect]);

  // Create and animate particles for effects
  useEffect(() => {
    if (currentEffect.id === 'none') {
      setParticles([]);
      return;
    }
    
    // Create new particles with smoother initial positions
    const createParticles = () => {
      if (currentEffect.id === 'none') return;
      
      const newParticle = {
        id: Math.random(),
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 50, // Start slightly above viewport
        size: Math.random() * currentEffect.maxSize + 8,
        rotation: Math.random() * 360,
        opacity: 0.7 + Math.random() * 0.3,
        speed: currentEffect.particleSpeed * (0.7 + Math.random() * 0.6),
        sway: currentEffect.sway * (0.8 + Math.random() * 0.4),
        swayOffset: Math.random() * 100,
        scale: 0.8 + Math.random() * 0.4,
        rotationSpeed: 0.1 + Math.random() * 0.2,
        swayFrequency: 0.02 + Math.random() * 0.03
      };
      
      setParticles(prev => {
        const updatedParticles = [...prev.slice(-currentEffect.particleCount), newParticle];
        return updatedParticles;
      });
    };
    
    // Move particles with smoother animation
    const moveParticles = () => {
      setParticles(prev => 
        prev.map(p => {
          const progress = p.y / window.innerHeight;
          const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
          
          return {
            ...p,
            y: p.y + p.speed * (1 + easeOut * 0.5),
            x: p.x + Math.sin((p.y + p.swayOffset) * p.swayFrequency) * p.sway * (1 - progress * 0.5),
            rotation: p.rotation + p.rotationSpeed,
            opacity: p.y > window.innerHeight * 0.8 ? p.opacity * 0.98 : p.opacity,
            scale: p.y > window.innerHeight * 0.8 ? p.scale * 0.99 : p.scale
          };
        }).filter(p => p.y < window.innerHeight && p.opacity > 0.1)
      );
    };
    
    // Set up intervals for particle creation and animation
    const createInterval = setInterval(createParticles, 150);
    const moveInterval = setInterval(moveParticles, 16);
    
    return () => {
      clearInterval(createInterval);
      clearInterval(moveInterval);
    };
  }, [currentEffect]);

  // Custom background style for the gradient
  const customBackgroundStyle = useCustomColors ? {
    background: `linear-gradient(to bottom right, ${customStartColor}, ${customEndColor})`
  } : {};

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cache initialData for ThemeCustomizer
  const initialData = useMemo(() => ({
    groomName: weddingData.groomName || "Chú Rể",
    brideName: weddingData.brideName || "Cô Dâu",
    eventDate: weddingData.eventDate,
    coverImage: weddingData.heroImageUrl || "/images/album/hero.png",
    flowerFrame: weddingData.flowerFrame,
    color: weddingData.color,
    customColor: weddingData.customColor,
    customEndColor: weddingData.customEndColor,
    effect: weddingData.effect
  }), [weddingData]);

  // Handle theme customizer updates
  const handleCustomizerUpdate = (data: any, isPreview: boolean = false) => {
    // Update local state based on the data from ThemeCustomizer
    if (data.groomName) setGroomName(data.groomName);
    if (data.brideName) setBrideName(data.brideName);
    if (data.eventDate) setEventDate(data.eventDate instanceof Timestamp ? data.eventDate.toDate() : data.eventDate);
    if (data.heroImageUrl) setCoverImage(data.heroImageUrl);
    
    if (data.color) {
      const theme = colorThemes.find(t => t.id === data.color);
      if (theme) {
        setCurrentColorTheme(theme);
        setUseCustomColors(false);
      }
    }
    
    if (data.flowerFrame) {
      const flowerFrameId = data.flowerFrame as keyof typeof flowerFrameMapping;
      const frameId = flowerFrameMapping[flowerFrameId] || '1';
      const frame = flowerFrames.find(f => f.id === frameId);
      if (frame) {
        setCurrentFrame(frame);
      }
    }
    
    if (data.effect) {
      const effect = effectOptions.find(e => e.id === data.effect);
      if (effect) {
        setCurrentEffect(effect);
        setParticles([]); // Reset particles when changing effect
      }
    }
    
    if (data.customColor) {
      setCustomStartColor(data.customColor);
      setUseCustomColors(true);
    }
    
    if (data.customEndColor) {
      setCustomEndColor(data.customEndColor);
    }
    
    // Pass the data to the parent component if needed
    if (onSaveSettings && !isPreview) {
      onSaveSettings(data);
    }
  };

  // Calculate current styles
  const currentTextColor = useCustomColors ? getTextColorForBackground(customStartColor) : currentColorTheme.textColor;
  const currentButtonClass = useCustomColors ? customButtonClass : currentColorTheme.buttonClass;

  return (
    <section
      id="hero"
      className={`relative w-full min-h-screen flex flex-col items-center justify-center text-center p-4 overflow-hidden ${!useCustomColors ? `bg-gradient-to-br ${currentColorTheme.gradientFrom} ${currentColorTheme.gradientVia} ${currentColorTheme.gradientTo}` : ''} ${currentTextColor}`}
      style={useCustomColors ? customBackgroundStyle : {}}
    >
      {/* Floating particles for effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none select-none z-[1000] transition-transform duration-300 ease-out"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            fontSize: `${particle.size}px`,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            transition: 'transform 0.3s ease-out, opacity 0.3s ease-out'
          }}
        >
          {currentEffect.emoji}
        </div>
      ))}
      
      {/* Theme Customizer - Only show if user is authenticated */}
      {isAuthenticated && (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
          <ThemeCustomizer 
            weddingId={weddingData.id}
            initialData={initialData}
            onUpdate={(data) => handleCustomizerUpdate(data, false)}
            onPreview={(data) => handleCustomizerUpdate(data, true)}
            buttonClassName={useCustomColors ? customButtonClass : currentColorTheme.buttonClass}
          />
        </div>
      )}

      {/* Main content container with vertical alignment */}
      <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto space-y-8">
        {/* Flower Frame with Image */}
        <div className="relative w-full max-w-2xl aspect-square mx-auto animated fadeIn">
          {/* Flower Frame */}
          <div className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center z-[1]" 
               style={{ backgroundImage: `url('${currentFrame.path}')` }}>
          </div>
          
          {/* Center Image inside frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`relative rounded-full overflow-hidden transform ${currentFrame.imageSize} ${currentFrame.imagePosition}`}>
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={coverImage}
                  alt={`${groomName} and ${brideName} wedding`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content below frame */}
        <div className="flex flex-col items-center space-y-6 pt-4 animated fadeInUp">
          <h1 className="text-4xl md:text-6xl font-extrabold font-script italic">
            {groomName} & {brideName}
          </h1>
          <p className="text-xl md:text-2xl animated fadeInUp delay-1s">We are getting married</p>
          <div className="relative group">
            <p className="text-lg md:text-xl font-semibold animated fadeInUp delay-2s bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
              {weddingDate}
            </p>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-800 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
          </div>
        </div>

        {/* Button group - Repositioned for desktop */}
        <div className="flex flex-col space-y-4 pt-4 animated fadeIn delay-3s md:absolute md:bottom-8 md:left-8">
          <Button
            variant="outline"
            className={cn(
              "backdrop-blur-sm hover:scale-105 transition-all duration-300 transform hover:shadow-lg",
              "border-2 border-rose-200 hover:border-rose-300",
              "bg-white/80 hover:bg-white/90",
              "text-rose-700 hover:text-rose-800",
              "px-6 py-2 rounded-full w-full md:w-auto",
              currentButtonClass
            )}
            onClick={() => scrollToSection('wishes')}
          >
            Gửi lời chúc
          </Button>
          <RsvpModal
            trigger={
              <Button 
                variant="outline" 
                className={cn(
                  "backdrop-blur-sm hover:scale-105 transition-all duration-300 transform hover:shadow-lg",
                  "border-2 border-rose-200 hover:border-rose-300",
                  "bg-white/80 hover:bg-white/90",
                  "text-rose-700 hover:text-rose-800",
                  "px-6 py-2 rounded-full w-full md:w-auto",
                  currentButtonClass
                )}
              >
                Xác nhận tham dự
              </Button>
            }
          />
          <Button
            variant="outline"
            className={cn(
              "backdrop-blur-sm hover:scale-105 transition-all duration-300 transform hover:shadow-lg",
              "border-2 border-rose-200 hover:border-rose-300",
              "bg-white/80 hover:bg-white/90",
              "text-rose-700 hover:text-rose-800",
              "px-6 py-2 rounded-full w-full md:w-auto",
              currentButtonClass
            )}
            onClick={() => scrollToSection('gift')}
          >
            Mừng cưới
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 