'use client';

import { MousePointer2, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

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

interface EffectsTabProps {
  effectOptions: Effect[];
  selectedEffect: string;
  onEffectChange: (effectId: string) => void;
  VIP_PRICES: Record<string, number>;
}

export default function EffectsTab({
  effectOptions,
  selectedEffect,
  onEffectChange,
  VIP_PRICES
}: EffectsTabProps) {
  // Sample particles for preview
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Hiệu ứng trang trí</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Chọn hiệu ứng trang trí để thêm các yếu tố ma thuật vào trang web đám cưới của bạn.
            Mỗi hiệu ứng bao gồm cả kiểu con trỏ chuột phù hợp.
          </p>
          
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
                        <div className="bg-yellow-500 text-white text-xs rounded-lg px-2 py-0.5 flex items-center ml-2">
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
                      }).format(VIP_PRICES.EFFECT || 150000)}
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
  );
} 