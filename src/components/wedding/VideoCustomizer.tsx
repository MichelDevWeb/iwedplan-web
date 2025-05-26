"use client";

import { useState } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Video, Save, Eye, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";

interface VideoCustomizerProps {
  weddingId: string;
  initialData: {
    videoTitle?: string;
    videoDescription?: string;
    videoUrl?: string;
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function VideoCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: VideoCustomizerProps) {
  // Video info state
  const [videoTitle, setVideoTitle] = useState(initialData.videoTitle || "Video Cưới");
  const [videoDescription, setVideoDescription] = useState(
    initialData.videoDescription || 
    "Tình yêu không làm cho thế giới quay tròn. Tình yêu là những gì làm cho chuyến đi đáng giá."
  );
  const [videoUrl, setVideoUrl] = useState(
    initialData.videoUrl || 
    "https://www.youtube.com/embed/stLjM9fqH1A?si=HnsgmGwLNw-2grmR"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // Convert YouTube watch URL to embed URL if needed
  const processYoutubeUrl = (url: string): string => {
    if (!url) return url;
    
    // Check if it's already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Convert watch URL to embed URL
    const watchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
    
    let videoId;
    if (watchRegex.test(url)) {
      videoId = url.match(watchRegex)?.[1];
    } else if (shortRegex.test(url)) {
      videoId = url.match(shortRegex)?.[1];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  // Save video settings to the database
  const saveVideoSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Process YouTube URL if needed
      const processedUrl = processYoutubeUrl(videoUrl);
      
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (videoTitle && videoTitle.trim() !== '') {
        updateData.videoTitle = videoTitle.trim();
      }
      
      if (videoDescription && videoDescription.trim() !== '') {
        updateData.videoDescription = videoDescription.trim();
      }
      
      if (processedUrl && processedUrl.trim() !== '') {
        updateData.videoUrl = processedUrl.trim();
      }
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("Không có thay đổi để lưu");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Đã lưu thông tin video");
    } catch (error) {
      console.error("Error saving video settings:", error);
      setSaveError("Không thể lưu thông tin. Vui lòng thử lại.");
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add preview function
  const handlePreview = () => {
    const previewData: Record<string, any> = {};
    
    if (videoTitle && videoTitle.trim() !== '') {
      previewData.videoTitle = videoTitle.trim();
    }
    
    if (videoDescription && videoDescription.trim() !== '') {
      previewData.videoDescription = videoDescription.trim();
    }
    
    if (videoUrl && videoUrl.trim() !== '') {
      previewData.videoUrl = processYoutubeUrl(videoUrl.trim());
    }
    
    // Call preview callback
    if (onPreview) {
      onPreview(previewData);
    }
  };

  // Reset all settings to initial values
  const handleReset = () => {
    setVideoTitle(initialData.videoTitle || "Video Cưới");
    setVideoDescription(
      initialData.videoDescription || 
      "Tình yêu không làm cho thế giới quay tròn. Tình yêu là những gì làm cho chuyến đi đáng giá."
    );
    setVideoUrl(
      initialData.videoUrl || 
      "https://www.youtube.com/embed/stLjM9fqH1A?si=HnsgmGwLNw-2grmR"
    );
    
    // Use bare initialData for reset
    const resetData = {
      videoTitle: initialData.videoTitle,
      videoDescription: initialData.videoDescription,
      videoUrl: initialData.videoUrl
    };
    
    // Notify parent component of reset
    onPreview(resetData);
    
    toast.success("Đã đặt lại tất cả cài đặt");
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
              buttonClassName || "bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
            )}
          >
            <Video className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Tùy chỉnh video</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-200/50" />
          
          <div className="px-3 py-2 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="videoTitle">Tiêu đề</Label>
              <Input
                id="videoTitle"
                placeholder="Tiêu đề video"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoDescription">Mô tả</Label>
              <Textarea
                id="videoDescription"
                placeholder="Mô tả video"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="text-sm"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Đường dẫn Video</Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-8 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Hỗ trợ YouTube watch URL (https://www.youtube.com/watch?v=...) hoặc short URL (https://youtu.be/...)
              </p>
            </div>
            
            {saveError && (
              <p className="text-xs text-red-500">{saveError}</p>
            )}
          </div>

          {/* Footer with Save, Preview and Reset Buttons */}
          <div className="px-3 py-2 border-t border-pink-100 mt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
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
                onClick={saveVideoSettings}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 