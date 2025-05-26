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
import { 
  MessageSquareHeart, Save
} from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

interface WishesCustomizerProps {
  weddingId: string;
  initialData: {
    wishesTitle?: string;
    wishesDescription?: string;
    wishesEnabled?: boolean;
  };
  onUpdate: (data: Record<string, unknown>) => void;
  buttonClassName?: string;
}

export default function WishesCustomizer({
  weddingId,
  initialData,
  onUpdate,
  buttonClassName
}: WishesCustomizerProps) {
  // Wishes info state
  const [wishesTitle, setWishesTitle] = useState(initialData.wishesTitle || "Lời Chúc");
  const [wishesDescription, setWishesDescription] = useState(
    initialData.wishesDescription || 
    "Gửi lời chúc mừng đến cô dâu và chú rể."
  );
  
  // Settings state
  const [wishesEnabled, setWishesEnabled] = useState(initialData.wishesEnabled !== false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // Save wishes settings to the database
  const saveWishesSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object with only defined, non-empty values
      const updateData: Record<string, unknown> = {};
      
      // Only add fields that have valid values
      if (wishesTitle && wishesTitle.trim() !== '') {
        updateData.wishesTitle = wishesTitle.trim();
      }
      
      if (wishesDescription && wishesDescription.trim() !== '') {
        updateData.wishesDescription = wishesDescription.trim();
      }
      
      // Include boolean settings
      updateData.wishesEnabled = wishesEnabled;
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("Không có thay đổi để lưu");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Đã lưu cài đặt lời chúc");
    } catch (error) {
      console.error("Error saving wishes settings:", error);
      setSaveError("Không thể lưu cài đặt. Vui lòng thử lại.");
      toast.error("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
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
              "backdrop-blur-sm hover:bg-white/30 transition-all duration-300", 
              buttonClassName || "bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
            )}
          >
            <MessageSquareHeart className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg"
        >
          <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Cài đặt lời chúc</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-200/50" />
          
          <div className="px-3 py-2 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="wishesTitle">Tiêu đề</Label>
              <Input
                id="wishesTitle"
                placeholder="Tiêu đề lời chúc"
                value={wishesTitle}
                onChange={(e) => setWishesTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wishesDescription">Mô tả</Label>
              <Textarea
                id="wishesDescription"
                placeholder="Mô tả lời chúc"
                value={wishesDescription}
                onChange={(e) => setWishesDescription(e.target.value)}
                className="text-sm"
                rows={3}
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="wishes-enabled" className="text-sm">
                  Bật mục lời chúc
                </Label>
                <p className="text-xs text-gray-500">
                  Cho phép khách gửi lời chúc
                </p>
              </div>
              <Switch 
                id="wishes-enabled" 
                checked={wishesEnabled} 
                onCheckedChange={setWishesEnabled}
              />
            </div>
            
            {saveError && (
              <p className="text-xs text-red-500 mt-2">{saveError}</p>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              className="w-full mt-4 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200"
              onClick={saveWishesSettings}
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
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 