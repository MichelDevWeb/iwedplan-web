"use client";

import Image from "next/image";
import { CheckCircle, Crown } from "lucide-react";

interface FlowerFrame {
  id: string;
  name: string;
  image: string;
  imageSize?: string;
  imagePosition?: string;
}

interface FlowerFrameTabProps {
  flowerFrames: FlowerFrame[];
  selectedFlowerFrame: string;
  setSelectedFlowerFrame: (id: string) => void;
  VIP_PRICES: Record<string, number>;
}

export default function FlowerFrameTab({ 
  flowerFrames, 
  selectedFlowerFrame, 
  setSelectedFlowerFrame,
  VIP_PRICES
}: FlowerFrameTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chọn khung hoa</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {flowerFrames.map((frame, index) => (
          <div
            key={frame.id}
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedFlowerFrame === frame.id
                ? "border-pink-500 ring-2 ring-pink-200"
                : "border-gray-200 hover:border-pink-300"
            }`}
            onClick={() => setSelectedFlowerFrame(frame.id)}
          >
            <div className="relative h-48">
              <Image
                src={frame.image}
                alt={frame.name}
                fill
                className="object-contain p-2"
              />
              {selectedFlowerFrame === frame.id && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              {index > 1 && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-lg px-2 py-1 flex items-center">
                  <Crown className="w-4 h-4 mr-1" /> VIP
                </div>
              )}
            </div>
            <div className="p-3 text-center font-medium">
              {frame.name}
              {index > 1 && (
                <div className="mt-1 text-sm font-bold text-rose-600">
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
  );
} 