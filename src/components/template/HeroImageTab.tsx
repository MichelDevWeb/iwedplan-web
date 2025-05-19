"use client";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface HeroImageTabProps {
  heroImage: File | null;
  heroImagePreview: string;
  handleHeroImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedFlowerFrame: string;
  flowerFramesWithPositioning: any[];
  imageScale: number;
  setImageScale: (scale: number) => void;
  imageOffsetX: number;
  setImageOffsetX: (offset: number | ((prev: number) => number)) => void;
  imageOffsetY: number;
  setImageOffsetY: (offset: number | ((prev: number) => number)) => void;
}

export default function HeroImageTab({
  heroImage,
  heroImagePreview,
  handleHeroImageChange,
  selectedFlowerFrame,
  flowerFramesWithPositioning,
  imageScale,
  setImageScale,
  imageOffsetX,
  setImageOffsetX,
  imageOffsetY,
  setImageOffsetY
}: HeroImageTabProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ảnh bìa</h2>
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="heroImage" className="block">
              Tải lên ảnh bìa
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="heroImage"
                type="file"
                accept="image/*"
                onChange={handleHeroImageChange}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("heroImage")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Chọn ảnh
              </Button>
            </div>
            
            <div className="pt-4 border-t mt-6">
              <h3 className="font-medium mb-2">Điều chỉnh ảnh</h3>
              
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="imageScale" className="block mb-2">Kích thước ảnh: {imageScale}%</Label>
                  <Slider 
                    id="imageScale"
                    min={50} 
                    max={100} 
                    step={1}
                    value={[imageScale]}
                    onValueChange={(values: number[]) => setImageScale(values[0])} 
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-1">Vị trí ảnh:</p>
                  <div className="flex space-x-2 justify-center mb-2">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setImageOffsetY(prev => prev - 5)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setImageOffsetX(prev => prev - 5)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="text-xs"
                      onClick={() => {
                        setImageOffsetX(0);
                        setImageOffsetY(0);
                        setImageScale(85);
                      }}
                    >
                      Đặt lại
                    </Button>
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setImageOffsetX(prev => prev + 5)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Button 
                      type="button" 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setImageOffsetY(prev => prev + 5)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-2">Xem trước ảnh bìa với khung hoa:</p>
            
            {/* Preview with flower frame */}
            <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg bg-pink-50">
              {/* Flower Frame Overlay */}
              {selectedFlowerFrame && (
                <div 
                  className="absolute inset-0 w-full h-full bg-contain bg-no-repeat bg-center z-20"
                  style={{ 
                    backgroundImage: `url('${flowerFramesWithPositioning.find(f => f.id === selectedFlowerFrame)?.image || flowerFramesWithPositioning[0].image}')` 
                  }}
                ></div>
              )}
              
              {/* Hero Image with positioning */}
              {heroImagePreview ? (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div 
                    className="relative rounded-full overflow-hidden"
                    style={{ 
                      width: `${imageScale}%`, 
                      height: `${imageScale}%`,
                      transform: `translateX(${imageOffsetX}px) translateY(${imageOffsetY}px)` 
                    }}
                  >
                    <Image
                      src={heroImagePreview}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div 
                    className="relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center"
                    style={{ 
                      width: `${imageScale}%`, 
                      height: `${imageScale}%`,
                      transform: `translateX(${imageOffsetX}px) translateY(${imageOffsetY}px)` 
                    }}
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-center text-sm mt-2">
              <p className="text-gray-500">
                Điều chỉnh vị trí và kích thước ảnh để phù hợp với khung hoa
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 