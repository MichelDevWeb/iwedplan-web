"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Crown } from "lucide-react";

interface ColorOption {
  id: string;
  name: string;
  value: string;
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Màu sắc</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {colorOptions.map((color, index) => (
            <div
              key={color.id}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                selectedColor === color.id
                  ? "border-pink-500 ring-2 ring-pink-200"
                  : "border-gray-200 hover:border-pink-300"
              }`}
              onClick={() => setSelectedColor(color.id)}
            >
              <div 
                className="h-16 w-full relative" 
                style={{ 
                  backgroundColor: color.id === "custom" ? customColor : color.value 
                }}
              >
                {index > 2 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-lg px-2 py-1 flex items-center text-xs">
                    <Crown className="w-3 h-3 mr-1" /> VIP
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <div className="text-sm font-medium">{color.name}</div>
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
          <div className="mt-4">
            <Label htmlFor="customColor" className="block mb-2">
              Chọn màu tùy chỉnh
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="customColor"
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-32"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 