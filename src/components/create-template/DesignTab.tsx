"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { CheckCircle, Crown, MousePointer2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card';

interface FlowerFrame {
  id: string;
  name: string;
  image: string;
  imageSize?: string;
  imagePosition?: string;
}

interface ColorOption {
  id: string;
  name: string;
  value: string;
  displayName?: string;
}

interface Effect {
  id: string;
  name: string;
  icon: any;
  emoji: string;
  cursorClass: string;
  particleCount: number;
  particleSpeed: number;
  sway: number;
  maxSize: number;
}

interface DesignTabProps {
  // Flower Frame props
  flowerFrames: FlowerFrame[];
  selectedFlowerFrame: string;
  setSelectedFlowerFrame: (id: string) => void;
  
  // Color props
  colorOptions: ColorOption[];
  selectedColor: string;
  setSelectedColor: (id: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  
  // Effects props
  effectOptions: Effect[];
  selectedEffect: string;
  onEffectChange: (effectId: string) => void;
  
  VIP_PRICES: Record<string, number>;
}

export default function DesignTab({
  flowerFrames,
  selectedFlowerFrame,
  setSelectedFlowerFrame,
  colorOptions,
  selectedColor,
  setSelectedColor,
  customColor,
  setCustomColor,
  effectOptions,
  selectedEffect,
  onEffectChange,
  VIP_PRICES
}: DesignTabProps) {
  // Sample particles for effects preview
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string; size: number; rotation: number; opacity: number }[]>([]);
  const [previewEffect, setPreviewEffect] = useState<Effect | null>(null);

  // When hovering over an effect, show a preview
  const handleEffectHover = (effect: Effect) => {
    if (effect.id === 'none') {
      setParticles([]);
      setPreviewEffect(null);
      return;
    }
    
    setPreviewEffect(effect);
    
    // Create sample particles
    const newParticles = Array.from({ length: 10 }).map((_, index) => ({
      id: index,
      x: 50 + Math.random() * 250,
      y: 50 + Math.random() * 150,
      emoji: effect.emoji,
      size: 10 + Math.random() * effect.maxSize,
      rotation: Math.random() * 360,
      opacity: 0.5 + Math.random() * 0.5
    }));
    
    setParticles(newParticles);
  };

  // Clear preview when not hovering
  const handleEffectLeave = () => {
    setParticles([]);
    setPreviewEffect(null);
  };

  return (
    <div className="space-y-8">
      {/* Flower Frame Section */}
      <div className="border-b pb-6">
        <div className="text-center md:text-left mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Khung hoa trang trí</h2>
          <p className="text-gray-600 text-sm md:text-base">Chọn khung hoa để trang trí cho ảnh bìa của bạn</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {flowerFrames.map((frame, index) => (
            <div
              key={frame.id}
              className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                selectedFlowerFrame === frame.id
                  ? "border-pink-500 ring-2 ring-pink-200 shadow-lg"
                  : "border-gray-200 hover:border-pink-300 hover:shadow-md"
              }`}
              onClick={() => setSelectedFlowerFrame(frame.id)}
            >
              <div className="relative h-40 md:h-48">
                <Image
                  src={frame.image}
                  alt={frame.name}
                  fill
                  className="object-contain p-2"
                />
                {selectedFlowerFrame === frame.id && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1 shadow-lg animate-pulse">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                )}
                {index > 1 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg px-2 py-1 flex items-center shadow-md">
                    <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1" /> 
                    <span className="text-xs font-medium">VIP</span>
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 text-center">
                <h3 className="font-medium text-sm md:text-base text-gray-800 mb-1">
                  {frame.name}
                </h3>
                {index > 1 && (
                  <div className="text-xs md:text-sm font-bold text-rose-600">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      maximumFractionDigits: 0 
                    }).format(VIP_PRICES.FLOWER_FRAME)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Color Section */}
      <div className="border-b pb-6">
        <div className="text-center md:text-left mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Màu sắc chủ đạo</h2>
          <p className="text-gray-600 text-sm md:text-base">Chọn bảng màu chủ đạo cho website cưới của bạn</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {colorOptions.map((color, index) => (
              <div
                key={color.id}
                className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  selectedColor === color.id
                    ? "border-pink-500 ring-2 ring-pink-200 shadow-lg"
                    : "border-gray-200 hover:border-pink-300 hover:shadow-md"
                }`}
                onClick={() => setSelectedColor(color.id)}
              >
                <div 
                  className="h-12 md:h-16 w-full relative" 
                  style={{ 
                    backgroundColor: color.id === "custom" ? customColor : color.value 
                  }}
                >
                  {index > 2 && (
                    <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg px-1.5 py-0.5 md:px-2 md:py-1 flex items-center text-xs shadow-md">
                      <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" /> 
                      <span className="text-xs font-medium">VIP</span>
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3 text-center">
                  <div className="text-xs md:text-sm font-medium text-gray-800">{color.name}</div>
                  {index > 2 && (
                    <div className="text-xs font-bold text-rose-600 mt-1">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND',
                        maximumFractionDigits: 0 
                      }).format(VIP_PRICES.COLOR)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedColor === "custom" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <Label htmlFor="customColor" className="block mb-3 text-sm md:text-base font-medium">
                Chọn màu tùy chỉnh
              </Label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-3">
                  <Input
                    id="customColor"
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-12 h-10 md:w-14 md:h-12 p-1 rounded-lg border-2 border-gray-300"
                  />
                  <span className="text-sm text-gray-600">Chọn màu</span>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#ffffff"
                    className="w-full sm:w-32 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Effects Section */}
      <div>
        <div className="text-center md:text-left mb-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Hiệu ứng trang trí</h2>
          <p className="text-gray-600 text-sm md:text-base">Chọn hiệu ứng trang trí để thêm các yếu tố ma thuật vào website cưới</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="space-y-3">
              {effectOptions.map((effect, index) => (
                <Card
                  key={effect.id}
                  className={`cursor-pointer transition-all overflow-hidden ${
                    selectedEffect === effect.id ? "ring-2 ring-pink-500 border-pink-200" : "hover:border-pink-300"
                  }`}
                  onMouseEnter={() => handleEffectHover(effect)}
                  onMouseLeave={handleEffectLeave}
                  onClick={() => onEffectChange(effect.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-pink-50 p-1.5 rounded-full">
                          <effect.icon className="h-4 w-4 text-pink-500" />
                        </div>
                        <span className="font-medium">{effect.name}</span>
                        {index > 0 && index < effectOptions.length - 1 && (
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs rounded-lg px-2 py-0.5 flex items-center ml-2">
                            <Crown className="w-3 h-3 mr-1" /> VIP
                          </div>
                        )}
                      </div>
                      <div className="text-xl">{effect.emoji}</div>
                    </div>
                    
                    {index > 0 && index < effectOptions.length - 1 && (
                      <div className="mt-2 text-xs font-bold text-rose-600">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND',
                          maximumFractionDigits: 0 
                        }).format(VIP_PRICES.EFFECT)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border border-pink-100 p-4 h-64 relative overflow-hidden">
              <div className="text-center mb-4 font-medium text-pink-700">Xem trước hiệu ứng</div>
              
              {/* Preview area with particles */}
              {particles.map(particle => (
                <div
                  key={particle.id}
                  className="absolute pointer-events-none select-none z-[1000]"
                  style={{
                    left: `${particle.x}px`,
                    top: `${particle.y}px`,
                    fontSize: `${particle.size}px`,
                    opacity: particle.opacity,
                    transform: `rotate(${particle.rotation}deg)`,
                  }}
                >
                  {particle.emoji}
                </div>
              ))}
              
              {/* Message when no effect is selected */}
              {!previewEffect && particles.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <p>Di chuột qua hiệu ứng để xem trước</p>
                </div>
              )}
              
              {/* Preview of cursor style */}
              {previewEffect && (
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Con trỏ chuột:</span>
                    <div className={`h-8 w-8 border border-gray-200 rounded-full flex items-center justify-center ${previewEffect.cursorClass} bg-white`}>
                      <MousePointer2 className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-700 mb-2">Mẹo sử dụng:</h3>
              <ul className="text-sm text-blue-600 space-y-1 list-disc pl-5">
                <li>Hiệu ứng chỉ xuất hiện ở trang chủ của website cưới</li>
                <li>Hiệu ứng "Không có hiệu ứng" giúp tăng tốc độ tải trang</li>
                <li>Con trỏ chuột được cá nhân hóa sẽ hiển thị trên toàn bộ trang web</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 