"use client";

import { useState, useEffect } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Palette, Sparkles, Users, Upload, Save, 
  RefreshCw, Image as ImageIcon2, Eye
} from 'lucide-react';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage, getWeddingImages } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  flowerFrames, 
  colorThemes, 
  effectOptions, 
  frameSuggestions,
  flowerFrameMapping
} from '@/config/templateConfig';

// Type definitions
type ColorTheme = typeof colorThemes[0];
type FlowerFrame = typeof flowerFrames[0];
type Effect = typeof effectOptions[0];

interface ThemeCustomizerProps {
  weddingId: string;
  initialData: {
    groomName: string;
    brideName: string;
    eventDate?: Timestamp;
    coverImage: string;
    flowerFrame?: string;
    color?: string;
    customColor?: string;
    customEndColor?: string;
    effect?: string;
    isPublic?: boolean;
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function ThemeCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: ThemeCustomizerProps) {
  // Couple info state
  const [groomName, setGroomName] = useState(initialData.groomName || "Chú Rể");
  const [brideName, setBrideName] = useState(initialData.brideName || "Cô Dâu");
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [eventDate, setEventDate] = useState<Date | null>(
    initialData.eventDate ? initialData.eventDate.toDate() : null
  );
  const [coverImage, setCoverImage] = useState(initialData.coverImage || "/images/album/hero.png");
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Theme state
  const getInitialColorTheme = () => {
    if (initialData.color) {
      const found = colorThemes.find(theme => theme.id === initialData.color);
      if (found) return found;
    }
    return colorThemes[0];
  };
  
  const getInitialFrame = () => {
    if (initialData.flowerFrame) {
      // Convert from 'rose' format to '1' format using mapping
      const flowerFrameId = initialData.flowerFrame as keyof typeof flowerFrameMapping;
      const frameId = flowerFrameMapping[flowerFrameId] || '1';
      const found = flowerFrames.find(frame => frame.id === frameId);
      if (found) return found;
    }
    return flowerFrames[0];
  };
  
  const getInitialEffect = () => {
    if (initialData.effect) {
      const found = effectOptions.find(effect => effect.id === initialData.effect);
      if (found) return found;
    }
    return effectOptions[0]; // Default: hearts
  };

  // State for theme options
  const [currentColorTheme, setCurrentColorTheme] = useState(getInitialColorTheme());
  const [currentFrame, setCurrentFrame] = useState(getInitialFrame());
  const [currentEffect, setCurrentEffect] = useState(getInitialEffect());
  
  // State for custom colors
  const [customStartColor, setCustomStartColor] = useState(initialData.customColor || '#ffd6e8');
  const [customEndColor, setCustomEndColor] = useState(initialData.customEndColor || '#d1e5ff');
  const [useCustomColors, setUseCustomColors] = useState(!!initialData.customColor);
  const [customButtonClass, setCustomButtonClass] = useState('bg-white/20 hover:bg-white/30 border-white/50 text-rose-800');
  const [isPublic, setIsPublic] = useState(initialData.isPublic || false);

  const { isAuthenticated } = useAuth();
  
  // Format wedding date
  const formatWeddingDate = () => {
    if (eventDate) {
      const day = eventDate.getDate();
      const month = eventDate.getMonth() + 1;
      const year = eventDate.getFullYear();
      return `Ngày ${day} tháng ${month} năm ${year}`;
    }
    return "Ngày 04 tháng 12 năm 2023"; // Default
  };
  
  // Update wedding date display when eventDate changes
  useEffect(() => {
    setWeddingDate(formatWeddingDate());
  }, [eventDate]);
  
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

  // Load uploaded images on component mount
  useEffect(() => {
    if (weddingId) {
      loadUploadedImages();
    }
  }, [weddingId]);

  // Load images from Firebase storage
  const loadUploadedImages = async () => {
    if (!weddingId) return;
    
    setIsLoadingImages(true);
    try {
      const images = await getWeddingImages(weddingId);
      setUploadedImages(images);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  // Handle cover image upload
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.includes('image/')) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn (tối đa 10MB).");
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload to Firebase Storage
      const path = `weddings/${weddingId}/hero-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadImage(weddingId, file, path);
      
      if (imageUrl) {
        setCoverImage(imageUrl);
        // Add to uploaded images list
        setUploadedImages(prev => [...prev, imageUrl]);
        toast.success("Ảnh đã được tải lên");
      } else {
        throw new Error("Image URL is empty after upload");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  // Handle date change in ISO format from input
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value;
    if (dateString) {
      const newDate = new Date(dateString);
      setEventDate(newDate);
    } else {
      setEventDate(null);
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
  };

  const applyCustomColors = () => {
    setUseCustomColors(true);
  };

  // Calculate current styles for the button
  const currentButtonClass = useCustomColors ? customButtonClass : currentColorTheme.buttonClass;

  // Add this new function after the existing handlers
  const saveAllSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updateData: Record<string, any> = {};
      
      // Couple info
      if (groomName && groomName.trim() !== '') {
        updateData.groomName = groomName.trim();
      }
      if (brideName && brideName.trim() !== '') {
        updateData.brideName = brideName.trim();
      }
      if (eventDate) {
        updateData.eventDate = Timestamp.fromDate(eventDate);
      }
      if (coverImage) {
        updateData.heroImageUrl = coverImage;
      }
      
      // Theme settings
      if (useCustomColors) {
        // Only include custom colors if both are set
        if (customStartColor && customEndColor) {
          updateData.customColor = customStartColor;
          updateData.customEndColor = customEndColor;
          // Remove the default color theme when using custom colors
          updateData.color = null;
        }
      } else if (currentColorTheme?.id) {
        updateData.color = currentColorTheme.id;
        // Remove custom colors when using a theme
        updateData.customColor = null;
        updateData.customEndColor = null;
      }
      
      // Frame settings
      if (currentFrame?.id) {
        const frameNameEntry = Object.entries(flowerFrameMapping).find(([_, id]) => id === currentFrame.id);
        if (frameNameEntry) {
          updateData.flowerFrame = frameNameEntry[0];
        }
      }
      
      // Effect settings - Always include the current effect
      updateData.effect = currentEffect?.id || 'none';
      
      // Public visibility setting
      updateData.isPublic = isPublic;
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("Không có thay đổi để lưu");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Tất cả thông tin đã được lưu");
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError("Không thể lưu thông tin. Vui lòng thử lại.");
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Select image from uploaded images
  const handleImageSelect = (imageUrl: string) => {
    setCoverImage(imageUrl);
    setShowImageSelector(false);
  };

  // Reset all settings to initial values
  const handleReset = () => {
    setGroomName(initialData.groomName || "Chú Rể");
    setBrideName(initialData.brideName || "Cô Dâu");
    setEventDate(initialData.eventDate ? initialData.eventDate.toDate() : null);
    setCoverImage(initialData.coverImage || "/images/album/hero.png");
    
    // Reset theme settings
    const initialTheme = getInitialColorTheme();
    setCurrentColorTheme(initialTheme);
    setCurrentFrame(getInitialFrame());
    setCurrentEffect(getInitialEffect());
    setUseCustomColors(!!initialData.customColor);
    setCustomStartColor(initialData.customColor || '#ffd6e8');
    setCustomEndColor(initialData.customEndColor || '#d1e5ff');
    setIsPublic(initialData.isPublic || false);
    
    // Use bare initialData for reset
    const resetData = {
      groomName: initialData.groomName,
      brideName: initialData.brideName,
      eventDate: initialData.eventDate,
      heroImageUrl: initialData.coverImage,
      color: initialData.color,
      customColor: initialData.customColor,
      customEndColor: initialData.customEndColor,
      flowerFrame: initialData.flowerFrame,
      effect: initialData.effect,
      isPublic: initialData.isPublic
    };
    
    // Notify parent component of reset
    onPreview(resetData);
    
    toast.success("Đã đặt lại tất cả cài đặt");
  };

  // Add preview function
  const handlePreview = () => {
    const previewData: Record<string, any> = {};
    
    // Couple info
    if (groomName && groomName.trim() !== '') {
      previewData.groomName = groomName.trim();
    }
    if (brideName && brideName.trim() !== '') {
      previewData.brideName = brideName.trim();
    }
    if (eventDate) {
      previewData.eventDate = Timestamp.fromDate(eventDate);
    }
    if (coverImage) {
      previewData.heroImageUrl = coverImage;
    }
    
    // Theme settings
    if (useCustomColors) {
      if (customStartColor && customEndColor) {
        previewData.customColor = customStartColor;
        previewData.customEndColor = customEndColor;
        previewData.color = null;
      }
    } else if (currentColorTheme?.id) {
      previewData.color = currentColorTheme.id;
      previewData.customColor = null;
      previewData.customEndColor = null;
    }
    
    // Frame settings
    if (currentFrame?.id) {
      const frameNameEntry = Object.entries(flowerFrameMapping).find(([_, id]) => id === currentFrame.id);
      if (frameNameEntry) {
        previewData.flowerFrame = frameNameEntry[0];
      }
    }
    
    // Effect settings
    previewData.effect = currentEffect?.id || 'none';
    
    // Public visibility setting
    previewData.isPublic = isPublic;
    
    // Call preview callback
    if (onPreview) {
      onPreview(previewData);
    }
  };

  return (
    <div className="z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "backdrop-blur-sm hover:bg-white/30", 
              buttonClassName || (useCustomColors ? customButtonClass : currentButtonClass)
            )}
          >
            <Palette className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <Tabs defaultValue="info" className="w-full flex flex-col h-auto">
            <TabsList className="grid grid-cols-2 w-full mb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" />
                <span>Giao diện</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Info Tab - Combined Couple Info and Effects */}
            <TabsContent value="info" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Thông tin cưới</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="groomName">Chú Rể</Label>
                  <Input
                    id="groomName"
                    placeholder="Tên chú rể"
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brideName">Cô Dâu</Label>
                  <Input
                    id="brideName"
                    placeholder="Tên cô dâu"
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Ngày Cưới</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    value={eventDate ? eventDate.toISOString().split('T')[0] : ''}
                    onChange={handleDateChange}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="isPublic">Hiển thị công khai</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="isPublic"
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                    />
                    <Label htmlFor="isPublic" className="text-sm text-gray-700">
                      Cho phép mọi người xem website này
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Khi bật, website của bạn sẽ hiển thị trong danh sách công khai
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Ảnh Cưới</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                      <div className="relative h-full w-full">
                        <Image 
                          src={coverImage} 
                          alt="Cover" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => document.getElementById('uploadCoverImage')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin">◌</span> Đang tải...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Upload className="h-3 w-3" /> Tải ảnh mới
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setShowImageSelector(true)}
                        disabled={isLoadingImages}
                      >
                        {isLoadingImages ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin">◌</span> Đang tải...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ImageIcon2 className="h-3 w-3" /> Chọn ảnh đã tải
                          </span>
                        )}
                      </Button>
                      <input
                        id="uploadCoverImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverImageUpload}
                      />
                    </div>
                  </div>
                  
                  {/* Image Selector Modal */}
                  {showImageSelector && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Chọn ảnh đã tải</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowImageSelector(false)}
                          >
                            Đóng
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {uploadedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              className="relative aspect-square cursor-pointer hover:ring-2 hover:ring-pink-500 rounded-lg overflow-hidden"
                              onClick={() => handleImageSelect(imageUrl)}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Uploaded image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Style Tab - Combined Colors, Frames and Effects */}
            <TabsContent value="style" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm py-2">Tùy chỉnh giao diện</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-4">
                {/* Color Themes */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Màu sắc</Label>
                  <div className="grid grid-cols-2 gap-2 pr-1">
                    {colorThemes.map((theme) => (
                      <Button 
                        key={theme.id}
                        variant="outline"
                        size="sm"
                        className={`flex flex-col items-center gap-2 p-2 transition-all duration-200 ${
                          currentColorTheme.id === theme.id && !useCustomColors 
                            ? 'bg-pink-50 border-pink-200 scale-105 ring-2 ring-pink-200' 
                            : 'hover:scale-105 hover:bg-pink-50/50'
                        }`}
                        onClick={() => handleThemeChange(theme)}
                      >
                        <div className="w-full h-8 rounded-md overflow-hidden" style={{
                          background: `linear-gradient(to bottom right, ${theme.startColor}, ${theme.endColor})`
                        }}>
                          <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-medium">{theme.name}</span>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.startColor }}></div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.endColor }}></div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Màu tùy chỉnh</Label>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-700">Màu chính:</label>
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
                    <label className="text-xs text-gray-700">Màu phụ:</label>
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
                    Áp dụng màu tùy chỉnh
                  </Button>
                </div>

                {/* Frames */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Khung ảnh</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {flowerFrames.map((frame) => (
                      <div 
                        key={frame.id}
                        className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${currentFrame.id === frame.id ? 'bg-pink-50 ring-1 ring-pink-200' : 'hover:bg-pink-50'}`}
                        onClick={() => handleFrameChange(frame)}
                      >
                        <div className="h-16 w-16 mb-1 relative bg-white/60 rounded-md overflow-hidden">
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
                </div>

                {/* Effects */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hiệu ứng đặc biệt</Label>
                  <div className="space-y-2">
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
                </div>
              </div>
            </TabsContent>

            {/* Footer with Save and Reset Buttons */}
            <div className="px-3 py-2 border-t border-pink-100 mt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
              {saveError && (
                <p className="text-xs text-red-500 mb-2">{saveError}</p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                  onClick={handlePreview}
                >
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Xem trước
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                  onClick={saveAllSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">◌</span> Đang lưu...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Lưu thay đổi
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 transition-all duration-200 hover:scale-105"
                  onClick={handleReset}
                >
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  </span>
                </Button>
              </div>
            </div>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 