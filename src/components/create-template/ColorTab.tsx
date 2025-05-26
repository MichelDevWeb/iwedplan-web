"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Crown } from "lucide-react";

interface ColorOption {
  id: string;
  name: string;
  value: string;
  displayName?: string;
}

interface ColorTabProps {
  colorOptions: ColorOption[];
  selectedColor: string;
  setSelectedColor: (id: string) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  VIP_PRICES: Record<string, number>;
}

export default function ColorTab({ 
  colorOptions, 
  selectedColor, 
  setSelectedColor,
  customColor,
  setCustomColor,
  VIP_PRICES
}: ColorTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Màu sắc</h2>
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
  );
} 