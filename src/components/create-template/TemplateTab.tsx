"use client";

import Image from "next/image";
import { CheckCircle, Crown } from "lucide-react";

interface TemplateOption {
  id: string;
  name: string;
  image: string;
}

interface TemplateTabProps {
  templates: TemplateOption[];
  selectedTemplate: string;
  setSelectedTemplate: (id: string) => void;
  VIP_PRICES: Record<string, number>;
}

export default function TemplateTab({ 
  templates, 
  selectedTemplate, 
  setSelectedTemplate,
  VIP_PRICES
}: TemplateTabProps) {
  return (
    <div className="space-y-4">
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Chọn template</h2>
        <p className="text-gray-600 text-sm md:text-base">Chọn một mẫu thiết kế phù hợp với phong cách đám cưới của bạn</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              selectedTemplate === template.id
                ? "border-pink-500 ring-2 ring-pink-200 shadow-lg"
                : "border-gray-200 hover:border-pink-300 hover:shadow-md"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="relative h-40 md:h-48">
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1 shadow-lg animate-pulse">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              )}
              {template.id !== "default" && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg px-2 py-1 flex items-center shadow-md">
                  <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1" /> 
                  <span className="text-xs font-medium">VIP</span>
                </div>
              )}
            </div>
            <div className="p-3 md:p-4 text-center">
              <h3 className="font-medium text-sm md:text-base text-gray-800 mb-1">
                {template.name}
              </h3>
              {template.id !== "default" && (
                <div className="text-xs md:text-sm font-bold text-rose-600">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND',
                    maximumFractionDigits: 0 
                  }).format(VIP_PRICES.TEMPLATE)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 