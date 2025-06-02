"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Sparkles, Gift, ArrowLeft, Home, Trash2, Music } from "lucide-react";
import { getWeddingWebsite, updateWeddingWebsite, uploadImage, getTemplateSections, updateTemplateSections, TemplateSection, deleteWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import PaymentModal from "@/components/modals/PaymentModal";
import LoadingScreen from "@/components/ui/loading-screen";
import HeaderNotificationBar from "@/components/common/HeaderNotificationBar";
import { toast } from "sonner";

// Import new tab components
import TemplateTab from "@/components/create-template/TemplateTab";
import DesignTab from "@/components/create-template/DesignTab";
import HeroImageTab from "@/components/create-template/HeroImageTab";
import MusicTab from "@/components/create-template/MusicTab";
import SectionsTab from "@/components/create-template/SectionsTab";

// Import from templateConfig
import { 
  templates, 
  flowerFrameOptions, 
  colorOptions, 
  VIP_PRICES,
  effectOptions
} from "@/config/templateConfig";

// No longer need this since flowerFrameOptions now includes the positioning
// Define frame options with specific image positioning for previewing
const flowerFramesWithPositioning = flowerFrameOptions;

// Add CSS for animation
const pulseAnimation = `
  @keyframes pulse-border {
    0% {
      border-color: rgba(244, 114, 182, 0.5);
      box-shadow: 0 0 0 0 rgba(244, 114, 182, 0.5);
    }
    70% {
      border-color: rgba(244, 114, 182, 0);
      box-shadow: 0 0 0 10px rgba(244, 114, 182, 0);
    }
    100% {
      border-color: rgba(244, 114, 182, 0);
      box-shadow: 0 0 0 0 rgba(244, 114, 182, 0);
    }
  }
`;

export default function TemplatePage({
  params,
}: {
  params: Promise<{ userWedID: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { userWedID } = use(params);
  
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [selectedFlowerFrame, setSelectedFlowerFrame] = useState("rose");
  const [selectedColor, setSelectedColor] = useState("blush");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Image positioning states
  const [imageScale, setImageScale] = useState(85);
  const [imageOffsetX, setImageOffsetX] = useState(0);
  const [imageOffsetY, setImageOffsetY] = useState(0);
  
  // Music states - simplified to new structure
  const [musicSource, setMusicSource] = useState<"file" | "link">("file");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicCount, setMusicCount] = useState(1);
  
  const [activeTab, setActiveTab] = useState("template");
  
  // Add new state for sections
  const [sections, setSections] = useState<TemplateSection[]>([]);
  
  // Add new state for effects
  const [selectedEffect, setSelectedEffect] = useState("none");
  
  // Modal states
  const [showNavigationWarning, setShowNavigationWarning] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // New states for music and RSVP
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [rsvpEnabled, setRsvpEnabled] = useState(false);
  const [musics, setMusics] = useState<{id: string, name: string, url: string, type: 'file' | 'youtube'}[]>([]);
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Define tabs array for easy mapping
  const tabs = [
    { id: "template", label: "Template" },
    { id: "design", label: "Thiết kế" },
    { id: "image", label: "Ảnh bìa" },
    { id: "sections", label: "Cấu trúc" },
    { id: "music", label: "Nhạc nền" },
  ];
  
  // Load existing wedding data
  useEffect(() => {
    async function loadWeddingData() {
      try {
        const data = await getWeddingWebsite(userWedID);
        if (data) {
          setWeddingData(data);
          setSelectedTemplate(data.template || "default");
          setSelectedFlowerFrame(data.flowerFrame || "rose");
          setSelectedColor(data.color || "blush");
          setCustomColor(data.customColor || "#ffffff");
          
          // Load image positioning if available
          if (data.imageScale) setImageScale(data.imageScale);
          if (data.imageOffsetX) setImageOffsetX(data.imageOffsetX);
          if (data.imageOffsetY) setImageOffsetY(data.imageOffsetY);
          
          if (data.heroImageUrl) {
            setHeroImagePreview(data.heroImageUrl);
          }
          
          // Load music data with new structure
          if (data.musics && data.musics.length > 0) {
            setMusics(data.musics);
            setMusicEnabled(true);
            // Set music source based on first music type
            if (data.musics[0]?.type === 'youtube') {
              setMusicSource("link");
            } else {
              setMusicSource("file");
            }
          }
          
          // Load RSVP setting
          setRsvpEnabled(data.rsvpEnabled || false);
          
          // Set music count
          if (data.musicCount) {
            setMusicCount(data.musicCount > 3 ? 3 : data.musicCount);
          }
          
          // Set effect if available
          if (data.effect) {
            setSelectedEffect(data.effect);
          }
        } else {
          setError("Không tìm thấy thông tin website cưới");
        }
      } catch (err) {
        setError("Đã xảy ra lỗi khi tải thông tin");
      } finally {
        setLoading(false);
      }
    }
    
    loadWeddingData();
  }, [userWedID]);
  
  // Load sections when component mounts
  useEffect(() => {
    async function loadSections() {
      try {
        const loadedSections = await getTemplateSections(userWedID);
        setSections(loadedSections);
      } catch (error) {
        console.error('Error loading sections:', error);
      }
    }
    loadSections();
  }, [userWedID]);
  
  // Handle hero image selection
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle music count changes
  const increaseMusicCount = () => {
    if (musicCount < 3) {
      setMusicCount(prev => prev + 1);
    }
  };
  
  const decreaseMusicCount = () => {
    if (musicCount > 1) {
      setMusicCount(prev => prev - 1);
    }
  };
  
  // Validate music link
  const validateMusicLink = (link: string) => {
    // Basic validation for common music platforms
    const validDomains = ['youtube.com', 'youtu.be', 'soundcloud.com', 'spotify.com'];
    try {
      const url = new URL(link);
      return validDomains.some(domain => url.hostname.includes(domain));
    } catch (e) {
      return false;
    }
  };
  
  // Upload music file to Firebase Storage
  const uploadMusicFileToStorage = async (file: File): Promise<string> => {
    try {
      const storage = getStorage();
      const path = `weddings/${userWedID}/music/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const uploadResult = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error("Error uploading music:", error);
      throw new Error("Không thể tải lên nhạc. Vui lòng thử lại sau.");
    }
  };
  
  // Handle sections change
  const handleSectionsChange = async (newSections: TemplateSection[]) => {
    setSections(newSections);
  };
  
  // Handle navigation with warning
  const handleNavigation = (path: string) => {
    setPendingNavigation(path);
    setShowNavigationWarning(true);
  };
  
  // Confirm navigation
  const confirmNavigation = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };
  
  // Cancel navigation
  const cancelNavigation = () => {
    setShowNavigationWarning(false);
    setPendingNavigation(null);
  };
  
  // Handle delete wedding template
  const handleDeleteWedding = async () => {
    try {
      setSaving(true);
      await deleteWeddingWebsite(userWedID, user?.uid);
      toast.success("Đã xoá website cưới thành công");
      router.push("/create/template");
    } catch (error) {
      console.error("Error deleting wedding:", error);
      toast.error("Không thể xoá website cưới. Vui lòng thử lại.");
    } finally {
      setSaving(false);
      setShowDeleteWarning(false);
    }
  };
  
  // Handle payment confirmation
  const handlePaymentConfirm = async (paymentMethod: string, paymentData: any) => {
    try {
      setPaymentLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save wedding data after successful payment
      await saveWeddingData();
      
      toast.success("Thanh toán thành công! Website cưới đã được tạo.");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      setPaymentLoading(false);
    }
  };
  
  // Save wedding data
  const saveWeddingData = async () => {
    if (!weddingData) {
      throw new Error("Không tìm thấy thông tin website cưới");
    }

    // Upload hero image if selected
    let heroImageUrl = weddingData.heroImageUrl;
    if (heroImage) {
      const path = `weddings/${userWedID}/hero-image.jpg`;
      heroImageUrl = await uploadImage(userWedID, heroImage, path);
    }

    // Process music uploads
    const processedMusics = await Promise.all(
      musics.map(async (music) => {
        if (music.type === 'file' && music.url.startsWith('blob:')) {
          // Convert blob URL to file and upload
          const response = await fetch(music.url);
          const blob = await response.blob();
          const file = new File([blob], music.name, { type: blob.type });
          const uploadedUrl = await uploadMusicFileToStorage(file);
          return { ...music, url: uploadedUrl };
        }
        return music;
      })
    );

    // Update wedding data
    await updateWeddingWebsite(userWedID, {
      template: selectedTemplate,
      flowerFrame: selectedFlowerFrame,
      color: selectedColor,
      customColor: selectedColor === "custom" ? customColor : "",
      heroImageUrl,
      musics: musicEnabled ? processedMusics : [],
      musicCount: musicEnabled ? musicCount : 0,
      rsvpEnabled,
      imageScale,
      imageOffsetX,
      imageOffsetY,
      effect: selectedEffect
    });

    // Save sections data
    await updateTemplateSections(userWedID, sections);

    // Navigate to completed page
    router.push(`/create/completed/${userWedID}/`);
  };
  
  // Save settings and continue
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      // Check VIP features
      const vipData = hasVipFeatures();
      if (vipData.hasVip) {
        setShowPaymentModal(true);
        return;
      }
      
      // Save directly if no VIP features
      await saveWeddingData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };
  
  // Handle tab navigation
  const nextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };
  
  const prevTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };
  
  // Check if user has selected VIP features
  const hasVipFeatures = () => {
    const vipFeatures = [];
    
    // Check template
    if (selectedTemplate !== "default") {
      vipFeatures.push({
        name: "Template VIP",
        count: 1,
        price: VIP_PRICES.TEMPLATE
      });
    }
    
    // Check flower frame
    const frameIndex = flowerFrameOptions.findIndex(frame => frame.id === selectedFlowerFrame);
    if (frameIndex > 1) { // VIP frames start after index 1
      vipFeatures.push({
        name: "Khung hoa VIP",
        count: 1,
        price: VIP_PRICES.FLOWER_FRAME
      });
    }
    
    // Check color
    const colorIndex = colorOptions.findIndex(color => color.id === selectedColor);
    if (colorIndex > 2) { // VIP colors start after index 2
      vipFeatures.push({
        name: "Màu sắc VIP",
        count: 1,
        price: VIP_PRICES.COLOR
      });
    }
    
    // Check music feature
    if (musicEnabled) {
      vipFeatures.push({
        name: "Nhạc nền",
        count: 1,
        price: VIP_PRICES.MUSIC
      });
      
      // Check additional music count
      if (musicCount > 1) {
        vipFeatures.push({
          name: "Nhạc nền bổ sung",
          count: musicCount - 1, // First song is included in music feature
          price: VIP_PRICES.MUSIC
        });
      }
    }
    
    // Check effect
    if (selectedEffect !== 'none' && selectedEffect !== 'hearts') {
      vipFeatures.push({
        name: "Hiệu ứng đặc biệt",
        count: 1,
        price: VIP_PRICES.EFFECT
      });
    }
    
    return {
      hasVip: vipFeatures.length > 0,
      features: vipFeatures
    };
  };
  
  // Handle effect change
  const handleEffectChange = (effectId: string) => {
    setSelectedEffect(effectId);
  };
  
  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu mẫu..." size="md" />;
  }
  
  if (error && !weddingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/landing")}>
          Quay lại trang chủ
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header Notification Bar */}
      <HeaderNotificationBar />
      
      <div className="py-8 px-4 md:px-6">
        <style jsx global>{`
          ${pulseAnimation}
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("/create/template")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Quay lại
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("/landing")}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Trang chủ
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteWarning(true)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Xoá website
              </Button>
            </div>
            
            <h1 className="text-xl md:text-2xl font-bold">Tùy chỉnh Website Cưới</h1>
            <p className="text-gray-500 text-sm md:text-base">
              {weddingData?.groomName} & {weddingData?.brideName} - {weddingData?.subdomain}.iwedplan.com
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 md:px-6 pt-4">
              {/* Mobile: Horizontal scrollable tabs */}
              <div className="md:hidden overflow-x-auto scrollbar-hide">
                <TabsList className="flex w-max min-w-full gap-1 p-1">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="text-xs py-2 px-3 whitespace-nowrap flex-shrink-0 min-w-[80px]"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {/* Desktop: Grid layout */}
              <div className="hidden md:block">
                <TabsList className="w-full grid grid-cols-5 gap-2">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id} 
                      className="text-sm py-2 px-3"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
            
            <TabsContent value="template" className="p-4 md:p-6">
              <TemplateTab 
                templates={templates}
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                VIP_PRICES={VIP_PRICES}
              />
            </TabsContent>
            
            <TabsContent value="design" className="p-4 md:p-6">
              <DesignTab 
                flowerFrames={flowerFrameOptions}
                selectedFlowerFrame={selectedFlowerFrame}
                setSelectedFlowerFrame={setSelectedFlowerFrame}
                colorOptions={colorOptions}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                customColor={customColor}
                setCustomColor={setCustomColor}
                effectOptions={effectOptions}
                selectedEffect={selectedEffect}
                onEffectChange={handleEffectChange}
                VIP_PRICES={VIP_PRICES}
              />
            </TabsContent>
            
            <TabsContent value="image" className="p-4 md:p-6">
              <HeroImageTab 
                heroImage={heroImage}
                heroImagePreview={heroImagePreview}
                handleHeroImageChange={handleHeroImageChange}
                selectedFlowerFrame={selectedFlowerFrame}
                flowerFramesWithPositioning={flowerFramesWithPositioning}
                imageScale={imageScale}
                setImageScale={setImageScale}
                imageOffsetX={imageOffsetX}
                setImageOffsetX={setImageOffsetX}
                imageOffsetY={imageOffsetY}
                setImageOffsetY={setImageOffsetY}
              />
            </TabsContent>
            
            <TabsContent value="sections" className="p-4 md:p-6">
              <SectionsTab 
                weddingId={userWedID}
                sections={sections}
                onSectionsChange={handleSectionsChange}
                musicEnabled={musicEnabled}
                setMusicEnabled={setMusicEnabled}
                rsvpEnabled={rsvpEnabled}
                setRsvpEnabled={setRsvpEnabled}
              />
            </TabsContent>
            
            <TabsContent value="music" className="p-4 md:p-6">
              {musicEnabled ? (
                <MusicTab 
                  musics={musics}
                  setMusics={setMusics}
                  musicSource={musicSource}
                  isPlaying={isPlaying}
                  musicCount={musicCount}
                  setMusicSource={setMusicSource}
                  increaseMusicCount={increaseMusicCount}
                  decreaseMusicCount={decreaseMusicCount}
                  VIP_PRICES={VIP_PRICES}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Music className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nhạc nền chưa được bật
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Hãy bật tính năng nhạc nền trong tab Cấu trúc để thêm nhạc cho website cưới của bạn.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {error && (
              <div className="px-4 md:px-6 py-2">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <div className="p-4 md:p-6 border-t flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevTab}
                disabled={activeTab === tabs[0].id || saving}
                className="text-sm md:text-base"
              >
                <ChevronLeft className="mr-1 md:mr-2 h-4 w-4" /> Quay lại
              </Button>
              
              {activeTab === tabs[tabs.length - 1].id ? (
                <Button type="button" disabled={saving} className="text-sm md:text-base" onClick={handleSave}>
                  Hoàn tất
                </Button>
              ) : (
                <Button type="button" onClick={nextTab} disabled={saving} className="text-sm md:text-base">
                  Tiếp tục <ChevronRight className="ml-1 md:ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </Tabs>
        </div>
        
        {/* Navigation Warning Modal */}
        <ConfirmationModal
          isOpen={showNavigationWarning}
          onClose={cancelNavigation}
          onConfirm={confirmNavigation}
          title="Cảnh báo"
          message="Bạn có muốn rời khỏi trang này không?"
          confirmText="Rời khỏi"
          cancelText="Hủy"
          variant="default"
        />
        
        {/* Delete Warning Modal */}
        <ConfirmationModal
          isOpen={showDeleteWarning}
          onClose={() => setShowDeleteWarning(false)}
          onConfirm={handleDeleteWedding}
          title="Xác nhận xoá"
          message="Bạn có chắc chắn muốn xoá website cưới này không? Hành động này không thể hoàn tác."
          confirmText="Xoá website"
          cancelText="Hủy"
          variant="destructive"
          isLoading={saving}
          loadingText="Đang xoá..."
        />

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
          vipFeatures={hasVipFeatures().features}
          totalAmount={hasVipFeatures().features.reduce((sum, f) => sum + (f.price * f.count), 0)}
          isLoading={paymentLoading}
          loadingText="Đang xử lý thanh toán..."
        />
      </div>
    </div>
  );
} 