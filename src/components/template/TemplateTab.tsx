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
    <div>
      <h2 className="text-xl font-semibold mb-4">Chọn template</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "border-pink-500 ring-2 ring-pink-200"
                : "border-gray-200 hover:border-pink-300"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="relative h-48">
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-1">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
              {template.id !== "default" && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white rounded-lg px-2 py-1 flex items-center">
                  <Crown className="w-4 h-4 mr-1" /> VIP
                </div>
              )}
            </div>
            <div className="p-3 text-center font-medium">
              {template.name}
              {template.id !== "default" && (
                <div className="mt-1 text-sm font-bold text-rose-600">
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