"use client";

import { useState, useEffect } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  ImageIcon, Save, Eye, RefreshCw, Upload, 
  Image as ImageIcon2, Trash2, X
} from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage, getWeddingImages, deleteImage } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import Image from 'next/image';

interface AlbumImage {
  id: string;
  url: string;
  alt?: string;
}

interface AlbumCustomizerProps {
  weddingId: string;
  initialData: {
    albumTitle?: string;
    albumDescription?: string;
    albumImages?: AlbumImage[];
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function AlbumCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: AlbumCustomizerProps) {
  // Album info state
  const [albumTitle, setAlbumTitle] = useState(initialData.albumTitle || "Album Ảnh");
  const [albumDescription, setAlbumDescription] = useState(
    initialData.albumDescription || 
    "Mỗi bức ảnh là một kỷ niệm, mỗi khoảnh khắc là một câu chuyện."
  );
  const [albumImages, setAlbumImages] = useState<AlbumImage[]>(initialData.albumImages || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { isAuthenticated } = useAuth();


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

  // Save album settings to the database
  const saveAlbumSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (albumTitle && albumTitle.trim() !== '') {
        updateData.albumTitle = albumTitle.trim();
      }
      
      if (albumDescription && albumDescription.trim() !== '') {
        updateData.albumDescription = albumDescription.trim();
      }
      
      if (albumImages.length > 0) {
        updateData.albumImages = albumImages;
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
      
      toast.success("Đã lưu thông tin album");
    } catch (error) {
      console.error("Error saving album settings:", error);
      setSaveError("Không thể lưu thông tin. Vui lòng thử lại.");
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Modify handleImageUpload to check for max images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    // Check if we've reached the maximum number of images
    if (albumImages.length >= 12) {
      toast.error("Chỉ có thể chọn tối đa 12 ảnh cho album");
      return;
    }
    
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
      const path = `weddings/${weddingId}/album-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadImage(weddingId, file, path);
      
      if (imageUrl) {
        // Create a new album image object
        const newImage: AlbumImage = {
          id: `img-${Date.now()}`,
          url: imageUrl,
          alt: file.name.split('.')[0] || "Wedding photo"
        };
        
        // Update local state
        setAlbumImages(prev => [...prev, newImage]);
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
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  // Handle image deletion - only remove from album state
  const handleDeleteImage = (imageId: string) => {
    // Update local state to remove the image from album
    setAlbumImages(prev => prev.filter(img => img.id !== imageId));
    toast.success("Đã xóa ảnh khỏi album");
  };

  // Modify handleImageSelect to check for max images
  const handleImageSelect = (imageUrl: string) => {
    // Check if we've reached the maximum number of images
    if (albumImages.length >= 12) {
      toast.error("Chỉ có thể chọn tối đa 12 ảnh cho album");
      return;
    }

    const newImage: AlbumImage = {
      id: `img-${Date.now()}`,
      url: imageUrl,
      alt: "Wedding photo"
    };
    
    setAlbumImages(prev => [...prev, newImage]);
    setShowImageSelector(false);
    toast.success("Đã thêm ảnh vào album");
  };

  // Add preview function
  const handlePreview = () => {
    const previewData: Record<string, any> = {};
    
    if (albumTitle && albumTitle.trim() !== '') {
      previewData.albumTitle = albumTitle.trim();
    }
    
    if (albumDescription && albumDescription.trim() !== '') {
      previewData.albumDescription = albumDescription.trim();
    }
    
    if (albumImages.length > 0) {
      previewData.albumImages = albumImages;
    }
    
    // Call preview callback
    if (onPreview) {
      onPreview(previewData);
    }
  };

  // Reset all settings to initial values
  const handleReset = () => {
    setAlbumTitle(initialData.albumTitle || "Album Ảnh");
    setAlbumDescription(
      initialData.albumDescription || 
      "Mỗi bức ảnh là một kỷ niệm, mỗi khoảnh khắc là một câu chuyện."
    );
    setAlbumImages(initialData.albumImages || []);
    
    // Use bare initialData for reset
    const resetData = {
      albumTitle: initialData.albumTitle,
      albumDescription: initialData.albumDescription,
      albumImages: initialData.albumImages
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
              "backdrop-blur-sm hover:bg-white/30 transition-all duration-300", 
              buttonClassName || "bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
            )}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <Tabs defaultValue="info" className="w-full flex flex-col h-auto">
            <TabsList className="grid grid-cols-2 w-full mb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <ImageIcon2 className="h-3.5 w-3.5" />
                <span>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-1">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Hình ảnh</span>
                {albumImages.length > 0 && (
                  <span className="ml-1 text-xs bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded-full">
                    {albumImages.length}/12
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Info Tab */}
            <TabsContent value="info" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Thông tin album</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="albumTitle">Tiêu đề</Label>
                  <Input
                    id="albumTitle"
                    placeholder="Tiêu đề album"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="albumDescription">Mô tả</Label>
                  <Textarea
                    id="albumDescription"
                    placeholder="Mô tả album"
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Images Tab */}
            <TabsContent value="images" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Quản lý hình ảnh</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <Label className="flex justify-between items-center">
                    <span>Hình ảnh</span>
                    <span className="text-xs text-gray-500">{albumImages.length}/12 ảnh</span>
                  </Label>
                  
                  {/* Upload buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "flex-1 h-8 text-xs",
                        albumImages.length >= 12 && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => document.getElementById('uploadAlbumImage')?.click()}
                      disabled={uploading || albumImages.length >= 12}
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
                      className={cn(
                        "flex-1 h-8 text-xs",
                        albumImages.length >= 12 && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => setShowImageSelector(true)}
                      disabled={isLoadingImages || albumImages.length >= 12}
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
                      id="uploadAlbumImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {/* Image grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 max-h-[300px] overflow-y-auto">
                    {albumImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border border-gray-200 relative">
                          <Image
                            src={img.url}
                            alt={img.alt || "Wedding photo"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Image Selector Modal */}
                  {showImageSelector && (
                    <div className="absolute inset-0 bg-white rounded-lg p-4 z-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Chọn ảnh đã tải</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowImageSelector(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={cn(
                              "relative aspect-square cursor-pointer hover:ring-2 hover:ring-pink-500 rounded-lg overflow-hidden",
                              albumImages.length >= 12 && "opacity-50 cursor-not-allowed"
                            )}
                            onClick={() => albumImages.length < 12 && handleImageSelect(imageUrl)}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={imageUrl}
                                alt={`Uploaded image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Footer with Save, Preview and Reset Buttons */}
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
                  onClick={saveAlbumSettings}
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