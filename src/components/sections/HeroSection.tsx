"use client"; // Need client component for modal state

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import RsvpModal from '@/components/common/RsvpModal';
import Image from 'next/image';
import { WeddingData } from '@/lib/firebase/models';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Sparkles, ImageIcon, PaintBucket, MousePointer2, Snowflake, Heart, Flower } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Define frame options with specific image positioning
const flowerFrames = [
  { 
    id: '1', 
    path: '/images/flower-frame/1.png', 
    name: 'Blush Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: '2', 
    path: '/images/flower-frame/2.png', 
    name: 'Sage Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-2' 
  },
  { 
    id: '3', 
    path: '/images/flower-frame/3.png', 
    name: 'Rose Gold Flower',
    imageSize: 'w-[75%] h-[75%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: '4', 
    path: '/images/flower-frame/4.png', 
    name: 'Lavender Flower',
    imageSize: 'w-[85%] h-[90%]', 
    imagePosition: 'translate-x-0 translate-y-1' 
  },
  { 
    id: '5', 
    path: '/images/flower-frame/5.png', 
    name: 'Peach Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  }
];

// Define theme options with wedding-appropriate colors and text colors
const colorThemes = [
  {
    id: 'blush',
    name: 'Blush & Lavender',
    gradientFrom: 'from-pink-200',
    gradientVia: 'via-purple-100',
    gradientTo: 'to-indigo-200',
    startColor: '#fad1e6', 
    endColor: '#d6d3f0',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50 text-rose-800'
  },
  {
    id: 'sage',
    name: 'Sage & Cream',
    gradientFrom: 'from-green-100',
    gradientVia: 'via-emerald-50',
    gradientTo: 'to-teal-100',
    startColor: '#e3f1ea', 
    endColor: '#e6f7f4',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-rose-800'
  },
  {
    id: 'rose',
    name: 'Rose & Gold',
    gradientFrom: 'from-rose-100',
    gradientVia: 'via-amber-50',
    gradientTo: 'to-yellow-100',
    startColor: '#fde4e4', 
    endColor: '#fef3c7',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50 text-rose-800'
  },
  {
    id: 'lavender',
    name: 'Lavender & Sky',
    gradientFrom: 'from-purple-100',
    gradientVia: 'via-indigo-50',
    gradientTo: 'to-blue-100',
    startColor: '#e9e4f9', 
    endColor: '#dbeafe',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50 text-rose-800'
  },
  {
    id: 'peach',
    name: 'Peach & Ivory',
    gradientFrom: 'from-orange-100',
    gradientVia: 'via-amber-50',
    gradientTo: 'to-yellow-50',
    startColor: '#feeadd', 
    endColor: '#fefce8',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-rose-800'
  }
];

// Define effects options with matching cursors
const effectOptions = [
  { 
    id: 'hearts', 
    name: 'Floating Hearts', 
    icon: Heart, 
    emoji: '❤️',
    cursorClass: 'cursor-heart',
    particleCount: 30,
    particleSpeed: 2.5,
    sway: 1.2,
    maxSize: 15
  },
  { 
    id: 'flowers', 
    name: 'Flower Petals', 
    icon: Flower, 
    emoji: '🌸',
    cursorClass: 'cursor-flower',
    particleCount: 25,
    particleSpeed: 1.8,
    sway: 2,
    maxSize: 20
  },
  { 
    id: 'snow', 
    name: 'Falling Snowflakes', 
    icon: Snowflake, 
    emoji: '❄️',
    cursorClass: 'cursor-default',
    particleCount: 35,
    particleSpeed: 1.5,
    sway: 0.7,
    maxSize: 18
  },
  { 
    id: 'sparkles', 
    name: 'Magical Sparkles', 
    icon: Sparkles, 
    emoji: '✨',
    cursorClass: 'cursor-ring',
    particleCount: 40,
    particleSpeed: 2.2,
    sway: 1.5,
    maxSize: 16
  },
  { 
    id: 'none', 
    name: 'No Effects', 
    icon: MousePointer2, 
    emoji: '',
    cursorClass: 'cursor-default',
    particleCount: 0,
    particleSpeed: 0,
    sway: 0,
    maxSize: 0
  }
];

// Define types
type ColorTheme = typeof colorThemes[0];
type FlowerFrame = typeof flowerFrames[0];
type Effect = typeof effectOptions[0];

// Matching color suggestions for each frame
const frameSuggestions: Record<string, string[]> = {
  '1': ['blush', 'lavender'],
  '2': ['sage', 'peach'],
  '3': ['rose', 'peach'],
  '4': ['lavender', 'blush'],
  '5': ['peach', 'rose']
};

interface HeroSectionProps {
  weddingData: WeddingData;
}

const HeroSection: React.FC<HeroSectionProps> = ({ weddingData }) => {
  const groomName = weddingData.groomName || "Chú Rể";
  const brideName = weddingData.brideName || "Cô Dâu";
  
  // Format date as string if available
  const formatWeddingDate = () => {
    if (weddingData.eventDate) {
      const date = weddingData.eventDate.toDate();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `Ngày ${day} tháng ${month} năm ${year}`;
    }
    return "Ngày 04 tháng 12 năm 2023"; // Default if no date is set
  };
  
  const weddingDate = formatWeddingDate();
  
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
      const frameId = weddingData.flowerFrame.replace('rose', '1')
        .replace('sage', '2')
        .replace('gold', '3')
        .replace('lavender', '4')
        .replace('peach', '5');
      
      const found = flowerFrames.find(frame => frame.id === frameId);
      if (found) return found;
    }
    return flowerFrames[0];
  };
  
  // State for theme options
  const [currentColorTheme, setCurrentColorTheme] = useState(getInitialColorTheme());
  const [currentFrame, setCurrentFrame] = useState(getInitialFrame());
  const [currentEffect, setCurrentEffect] = useState(effectOptions[0]); // Default: hearts
  
  // State for custom colors
  const [customStartColor, setCustomStartColor] = useState(weddingData.customColor || '#ffd6e8');
  const [customEndColor, setCustomEndColor] = useState('#d1e5ff');
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
        scale: 0.8 + Math.random() * 0.4, // Add scale variation
        rotationSpeed: 0.1 + Math.random() * 0.2, // Add rotation speed variation
        swayFrequency: 0.02 + Math.random() * 0.03 // Add sway frequency variation
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
            y: p.y + p.speed * (1 + easeOut * 0.5), // Gradually increase speed
            x: p.x + Math.sin((p.y + p.swayOffset) * p.swayFrequency) * p.sway * (1 - progress * 0.5), // Reduce sway as particle falls
            rotation: p.rotation + p.rotationSpeed,
            opacity: p.y > window.innerHeight * 0.8 ? p.opacity * 0.98 : p.opacity, // Smoother fade out
            scale: p.y > window.innerHeight * 0.8 ? p.scale * 0.99 : p.scale // Slight scale reduction near bottom
          };
        }).filter(p => p.y < window.innerHeight && p.opacity > 0.1)
      );
    };
    
    // Set up intervals for particle creation and animation
    const createInterval = setInterval(createParticles, 150); // Slightly faster creation
    const moveInterval = setInterval(moveParticles, 16); // 60fps animation
    
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

  // Theme handlers
  const handleThemeChange = (theme: ColorTheme) => {
    setCurrentColorTheme(theme);
    setUseCustomColors(false);
  };

  const handleFrameChange = (frame: FlowerFrame) => {
    setCurrentFrame(frame);
    
    // Suggest matching color theme
    if (frameSuggestions[frame.id] && frameSuggestions[frame.id].length > 0) {
      const suggestedThemeId = frameSuggestions[frame.id][0];
      const suggestedTheme = colorThemes.find(theme => theme.id === suggestedThemeId);
      if (suggestedTheme && !useCustomColors) {
        setCurrentColorTheme(suggestedTheme);
      }
    }
  };

  const handleEffectChange = (effect: Effect) => {
    setCurrentEffect(effect);
    setParticles([]); // Reset particles when changing effect
  };

  const applyCustomColors = () => {
    setUseCustomColors(true);
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
      
      {/* Theme Customizer */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className={cn("backdrop-blur-sm hover:bg-white/30", useCustomColors ? customButtonClass : currentColorTheme.buttonClass)}>
              <Palette className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg">
            <Tabs defaultValue="colors" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-2">
                <TabsTrigger value="colors" className="flex items-center gap-1">
                  <PaintBucket className="h-3.5 w-3.5" />
                  <span>Colors</span>
                </TabsTrigger>
                <TabsTrigger value="frames" className="flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Frame</span>
                </TabsTrigger>
                <TabsTrigger value="effects" className="flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Effects</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-2">
                <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Color Themes</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-pink-200/50" />
                
                {colorThemes.map((theme) => (
                  <DropdownMenuItem 
                    key={theme.id}
                    className={`flex items-center gap-2 cursor-pointer ${currentColorTheme.id === theme.id && !useCustomColors ? 'bg-pink-50' : 'hover:bg-pink-50'}`}
                    onClick={() => handleThemeChange(theme)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full" style={{
                        background: `linear-gradient(to bottom right, ${theme.startColor}, ${theme.endColor})`
                      }}></div>
                    </div>
                    <span className="font-medium">{theme.name}</span>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator className="bg-pink-200/50" />
                <DropdownMenuLabel className="font-script text-pink-600 text-center">Custom Colors</DropdownMenuLabel>
                
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Start Color:</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={customStartColor}
                        onChange={(e) => setCustomStartColor(e.target.value)}
                        className="w-6 h-6 rounded border border-gray-300"
                      />
                      <input 
                        type="text" 
                        value={customStartColor}
                        onChange={(e) => setCustomStartColor(e.target.value)}
                        className="w-16 text-xs border border-gray-200 rounded px-1 py-0.5"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">End Color:</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={customEndColor}
                        onChange={(e) => setCustomEndColor(e.target.value)}
                        className="w-6 h-6 rounded border border-gray-300"
                      />
                      <input 
                        type="text" 
                        value={customEndColor}
                        onChange={(e) => setCustomEndColor(e.target.value)}
                        className="w-16 text-xs border border-gray-200 rounded px-1 py-0.5"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-2 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200"
                    onClick={applyCustomColors}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Apply Custom Colors
                  </Button>
                </div>
              </TabsContent>
              
              {/* Frames Tab */}
              <TabsContent value="frames" className="space-y-2">
                <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Flower Frames</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-pink-200/50" />
                
                <div className="grid grid-cols-2 gap-2 px-2 py-1">
                  {flowerFrames.map((frame) => (
                    <div 
                      key={frame.id}
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${currentFrame.id === frame.id ? 'bg-pink-50 ring-1 ring-pink-200' : 'hover:bg-pink-50'}`}
                      onClick={() => handleFrameChange(frame)}
                    >
                      <div className="h-20 w-20 mb-1 relative bg-white/60 rounded-md overflow-hidden">
                        {/* Frame preview */}
                        <div className="absolute inset-0" style={{ 
                          backgroundImage: `url('${frame.path}')`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                         }}></div>
                      </div>
                      <span className="text-xs font-medium text-center">{frame.name}</span>
                    </div>
                  ))}
                </div>
                
                <DropdownMenuSeparator className="bg-pink-200/50" />
                <div className="px-3 py-2">
                  <div className="text-xs text-gray-500 mb-2">
                    {currentFrame && 
                      <>
                        <p className="font-medium mb-1">Color suggestions for this frame:</p>
                        <div className="flex flex-wrap gap-1">
                          {frameSuggestions[currentFrame.id]?.map((suggestionId: string) => {
                            const theme = colorThemes.find(t => t.id === suggestionId);
                            return theme ? (
                              <Button 
                                key={suggestionId} 
                                variant="outline" 
                                size="sm" 
                                className="h-6 text-xs py-0 px-2"
                                onClick={() => handleThemeChange(theme)}
                              >
                                <div className="w-3 h-3 rounded-full mr-1" style={{
                                  background: `linear-gradient(to bottom right, ${theme.startColor}, ${theme.endColor})`
                                }}></div>
                                {theme.name}
                              </Button>
                            ) : null;
                          })}
                        </div>
                      </>
                    }
                  </div>
                </div>
              </TabsContent>
              
              {/* Effects & Cursor Tab (Combined) */}
              <TabsContent value="effects" className="space-y-2">
                <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Special Effects</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-pink-200/50" />
                
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-500 mb-2 text-center">
                    Choose an effect to add magical elements to your wedding site. 
                    Each effect includes a matching cursor style.
                  </p>
                  
                  <div className="space-y-2 mt-3">
                    {effectOptions.map((effect) => (
                      <Button
                        key={effect.id}
                        variant="outline"
                        className={`w-full flex justify-between items-center text-sm ${currentEffect.id === effect.id ? 'bg-pink-50 border-pink-200' : ''}`}
                        onClick={() => handleEffectChange(effect)}
                      >
                        <span className="flex items-center gap-1">
                          <effect.icon className="h-4 w-4 mr-1" />
                          {effect.name}
                        </span>
                        <span className="text-base">
                          {effect.emoji || ''}
                        </span>
                      </Button>
                    ))}
                  </div>
                  
                  {currentEffect.id !== 'none' && (
                    <div className="mt-4 space-y-2 p-3 bg-pink-50/50 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Effect:</span>
                        <span className="text-xl">{currentEffect.emoji}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Cursor:</span>
                        <div className={`h-7 w-7 border border-gray-200 rounded-full flex items-center justify-center ${currentEffect.cursorClass} bg-white`}>
                          <MousePointer2 className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                  src="/images/album/hero.png"
                  alt="Hero background"
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