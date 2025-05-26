"use client";

import { useState, useEffect } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Users, Save, Upload, Image as ImageIcon, Eye, RefreshCw, X, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage, getWeddingImages, deleteImage } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import Image from 'next/image';

interface BrideGroomCustomizerProps {
  weddingId: string;
  initialData: {
    title?: string;
    description?: string;
    groomBio?: string;
    brideBio?: string;
    groomImage?: string;
    brideImage?: string;
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function BrideGroomCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: BrideGroomCustomizerProps) {
  // Bride/Groom info state
  const [title, setTitle] = useState(initialData.title || "Cô Dâu & Chú Rể");
  const [description, setDescription] = useState(
    initialData.description || 
    "Hai con người, một tình yêu, một cuộc đời."
  );
  const [groomBio, setGroomBio] = useState(
    initialData.groomBio || 
    "Một người đàn ông với trái tim ấm áp và tình yêu vô bờ bến. Anh ấy luôn biết cách làm cho cuộc sống trở nên đặc biệt và ngọt ngào hơn. Với nụ cười ấm áp và sự chân thành, anh ấy là người bạn đời hoàn hảo để cùng nhau xây dựng tổ ấm."
  );
  const [brideBio, setBrideBio] = useState(
    initialData.brideBio || 
    "Một người phụ nữ xinh đẹp với trái tim nhân hậu và tâm hồn lãng mạn. Cô ấy mang đến niềm vui và hạnh phúc cho mọi người xung quanh. Với nụ cười tỏa nắng và sự dịu dàng, cô ấy là người bạn đời lý tưởng để cùng nhau viết nên câu chuyện tình yêu đẹp nhất."
  );
  const [groomImage, setGroomImage] = useState(initialData.groomImage || "/images/album/groom.png");
  const [brideImage, setBrideImage] = useState(initialData.brideImage || "/images/album/bride.png");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'bride' | 'groom'>('content');
  
  // Image selection states
  const [uploading, setUploading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState<'bride' | 'groom' | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

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

  // Handle file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'bride' | 'groom') => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.includes('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn (tối đa 10MB)");
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload the image to Firebase storage
      const path = `weddings/${weddingId}/${type}-${Date.now()}.${file.name.split('.').pop()}`;
      const uploadedImageUrl = await uploadImage(weddingId, file, path);
      
      // Update state based on type
      if (type === 'bride') {
        setBrideImage(uploadedImageUrl);
      } else {
        setGroomImage(uploadedImageUrl);
      }
      
      // Add to uploaded images list
      setUploadedImages(prev => [...prev, uploadedImageUrl]);
      
      toast.success(`Đã tải ảnh ${type === 'bride' ? 'cô dâu' : 'chú rể'} thành công`);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên ảnh. Vui lòng thử lại");
    } finally {
      setUploading(false);
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  // Handle selecting an existing image
  const handleImageSelect = (imageUrl: string) => {
    if (!showImageSelector) return;
    
    if (showImageSelector === 'bride') {
      setBrideImage(imageUrl);
    } else {
      setGroomImage(imageUrl);
    }
    
    setShowImageSelector(null);
    toast.success(`Đã chọn ảnh ${showImageSelector === 'bride' ? 'cô dâu' : 'chú rể'}`);
  };

  // Save bride/groom settings to the database
  const saveBrideGroomSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (title && title.trim() !== '') {
        updateData.brideGroomTitle = title.trim();
      }
      
      if (description && description.trim() !== '') {
        updateData.brideGroomDescription = description.trim();
      }
      
      if (groomBio && groomBio.trim() !== '') {
        updateData.groomBio = groomBio.trim();
      }
      
      if (brideBio && brideBio.trim() !== '') {
        updateData.brideBio = brideBio.trim();
      }

      if (groomImage) {
        updateData.groomImage = groomImage;
      }

      if (brideImage) {
        updateData.brideImage = brideImage;
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
      
      toast.success("Đã lưu thành công");
    } catch (error) {
      console.error("Error saving bride/groom settings:", error);
      setSaveError("Không thể lưu thông tin. Vui lòng thử lại.");
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Preview functionality
  const handlePreview = () => {
    const previewData = {
      brideGroomTitle: title,
      brideGroomDescription: description,
      groomBio: groomBio,
      brideBio: brideBio,
      groomImage: groomImage,
      brideImage: brideImage
    };
    
    onPreview(previewData);
    toast.success("Xem trước thay đổi");
  };

  // Reset functionality
  const handleReset = () => {
    setTitle(initialData.title || "Cô Dâu & Chú Rể");
    setDescription(initialData.description || "Hai con người, một tình yêu, một cuộc đời.");
    setGroomBio(initialData.groomBio || "Một người đàn ông với trái tim ấm áp và tình yêu vô bờ bến. Anh ấy luôn biết cách làm cho cuộc sống trở nên đặc biệt và ngọt ngào hơn. Với nụ cười ấm áp và sự chân thành, anh ấy là người bạn đời hoàn hảo để cùng nhau xây dựng tổ ấm.");
    setBrideBio(initialData.brideBio || "Một người phụ nữ xinh đẹp với trái tim nhân hậu và tâm hồn lãng mạn. Cô ấy mang đến niềm vui và hạnh phúc cho mọi người xung quanh. Với nụ cười tỏa nắng và sự dịu dàng, cô ấy là người bạn đời lý tưởng để cùng nhau viết nên câu chuyện tình yêu đẹp nhất.");
    setGroomImage(initialData.groomImage || "/images/album/groom.png");
    setBrideImage(initialData.brideImage || "/images/album/bride.png");
    
    // Use preview to reset in parent component
    const resetData = {
      brideGroomTitle: initialData.title,
      brideGroomDescription: initialData.description,
      groomBio: initialData.groomBio,
      brideBio: initialData.brideBio,
      groomImage: initialData.groomImage,
      brideImage: initialData.brideImage
    };
    
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
            <Users className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Cô Dâu & Chú Rể</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-200/50" />
          
          <Tabs 
            defaultValue="content" 
            className="w-full"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'content' | 'bride' | 'groom')}
          >
            <TabsList className="grid grid-cols-3 w-full mb-2 sticky top-12 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="content" className="text-xs">
                Nội dung
              </TabsTrigger>
              <TabsTrigger value="bride" className="text-xs">
                Cô Dâu
              </TabsTrigger>
              <TabsTrigger value="groom" className="text-xs">
                Chú Rể
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  placeholder="Tiêu đề mục"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chung"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="bride" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="brideBio">Tiểu sử cô dâu</Label>
                <Textarea
                  id="brideBio"
                  placeholder="Thông tin về cô dâu"
                  value={brideBio}
                  onChange={(e) => setBrideBio(e.target.value)}
                  className="text-sm"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between items-center">
                  <span>Ảnh cô dâu</span>
                  {brideImage && brideImage !== "/images/album/bride.png" && (
                    <button 
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => setBrideImage("/images/album/bride.png")}
                    >
                      Reset
                    </button>
                  )}
                </Label>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-pink-200 group">
                  <Image
                    src={brideImage}
                    alt="Bride"
                    fill
                    className="object-cover"
                  />
                  {brideImage && brideImage !== "/images/album/bride.png" && (
                    <button
                      onClick={() => setBrideImage("/images/album/bride.png")}
                      className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Reset image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => document.getElementById(`bride-image-upload`)?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">◌</span> Đang tải...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Upload className="h-3 w-3 mr-1" /> Tải ảnh mới
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowImageSelector('bride')}
                    disabled={isLoadingImages}
                  >
                    {isLoadingImages ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">◌</span> Đang tải...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 mr-1" /> Chọn ảnh
                      </span>
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'bride')}
                    className="hidden"
                    id="bride-image-upload"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="groom" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="groomBio">Tiểu sử chú rể</Label>
                <Textarea
                  id="groomBio"
                  placeholder="Thông tin về chú rể"
                  value={groomBio}
                  onChange={(e) => setGroomBio(e.target.value)}
                  className="text-sm"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between items-center">
                  <span>Ảnh chú rể</span>
                  {groomImage && groomImage !== "/images/album/groom.png" && (
                    <button 
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => setGroomImage("/images/album/groom.png")}
                    >
                      Reset
                    </button>
                  )}
                </Label>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-pink-200 group">
                  <Image
                    src={groomImage}
                    alt="Groom"
                    fill
                    className="object-cover"
                  />
                  {groomImage && groomImage !== "/images/album/groom.png" && (
                    <button
                      onClick={() => setGroomImage("/images/album/groom.png")}
                      className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Reset image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => document.getElementById(`groom-image-upload`)?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">◌</span> Đang tải...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Upload className="h-3 w-3 mr-1" /> Tải ảnh mới
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => setShowImageSelector('groom')}
                    disabled={isLoadingImages}
                  >
                    {isLoadingImages ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">◌</span> Đang tải...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3 mr-1" /> Chọn ảnh
                      </span>
                    )}
                  </Button>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'groom')}
                    className="hidden"
                    id="groom-image-upload"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Image Selector Modal */}
          {showImageSelector && (
            <div className="absolute inset-0 bg-white rounded-lg p-4 z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">
                  Chọn ảnh cho {showImageSelector === 'bride' ? 'cô dâu' : 'chú rể'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageSelector(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoadingImages ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-pink-500 text-2xl mb-2">◌</div>
                  <p className="text-sm text-gray-500">Đang tải danh sách ảnh...</p>
                </div>
              ) : uploadedImages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Chưa có ảnh được tải lên</p>
                  <p className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setShowImageSelector(null);
                        document.getElementById(`${showImageSelector}-image-upload`)?.click();
                      }}
                    >
                      Tải ảnh mới
                    </Button>
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
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
              )}
            </div>
          )}
          
          {/* Footer with action buttons */}
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
                onClick={saveBrideGroomSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">◌</span> 
                    Đang lưu...
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
                  Đặt lại
                </span>
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 