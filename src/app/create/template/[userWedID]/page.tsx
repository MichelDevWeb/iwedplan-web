"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Sparkles, Gift } from "lucide-react";
import { getWeddingWebsite, updateWeddingWebsite, uploadImage, getTemplateSections, updateTemplateSections, TemplateSection } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import LoadingScreen from "@/components/ui/loading-screen";
import { toast } from "sonner";

// Import new tab components
import TemplateTab from "@/components/create-template/TemplateTab";
import FlowerFrameTab from "@/components/create-template/FlowerFrameTab";
import HeroImageTab from "@/components/create-template/HeroImageTab";
import ColorTab from "@/components/create-template/ColorTab";
import MusicTab from "@/components/create-template/MusicTab";
import SectionsTab from "@/components/create-template/SectionsTab";
import EffectsTab from "@/components/create-template/EffectsTab";

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
  const { userWedID } = use(params);
  const audioRef = useRef<HTMLAudioElement>(null);
  
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
  
  // Music states
  const [musicFiles, setMusicFiles] = useState<File[]>([]);
  const [musicLinks, setMusicLinks] = useState<string[]>([]);
  const [musicSource, setMusicSource] = useState<"file" | "link">("file");
  const [musicFileNames, setMusicFileNames] = useState<string[]>([]);
  const [musicPreviewUrls, setMusicPreviewUrls] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicCount, setMusicCount] = useState(1);
  
  const [activeTab, setActiveTab] = useState("template");
  
  // Add new state for sections
  const [sections, setSections] = useState<TemplateSection[]>([]);
  
  // Add new state for effects
  const [selectedEffect, setSelectedEffect] = useState("none");
  
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
          
          if (data.musicUrls && data.musicUrls.length > 0) {
            const fileUrls: string[] = [];
            const linkUrls: string[] = [];
            const fileNames: string[] = [];
            const previewUrls: string[] = [];
            
            data.musicUrls.forEach(url => {
              if (url.startsWith('http')) {
                linkUrls.push(url);
                setMusicSource("link");
              } else {
                fileUrls.push(url);
                fileNames.push(data.musicFileName || "Đã tải lên nhạc nền");
                previewUrls.push(url);
              }
            });
            
            setMusicLinks(linkUrls);
            setMusicFileNames(fileNames);
            setMusicPreviewUrls(previewUrls);
          }
          
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
  
  // Handle music file selection
  const handleMusicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          setError("File nhạc không được vượt quá 10MB");
          return false;
        }
        return true;
      });
      
      setMusicFiles(validFiles);
      setMusicFileNames(validFiles.map(file => file.name));
      setMusicSource("file");
      
      // Create preview URLs for the audio files
      const previewUrls = validFiles.map(file => URL.createObjectURL(file));
      setMusicPreviewUrls(previewUrls);
      
      return () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
      };
    }
  };
  
  // Toggle audio playback
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
  
  // Upload music file
  const uploadMusicFile = async (file: File): Promise<string> => {
    try {
      const storage = getStorage();
      const path = `weddings/${userWedID}/background-music.mp3`;
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
    try {
      await updateTemplateSections(userWedID, newSections);
      setSections(newSections);
    } catch (error) {
      console.error('Error updating sections:', error);
      toast.error('Không thể cập nhật cấu trúc website');
    }
  };
  
  // Save settings and continue
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      
      if (!weddingData) {
        throw new Error("Không tìm thấy thông tin website cưới");
      }
      
      // Upload hero image if selected
      let heroImageUrl = weddingData.heroImageUrl;
      if (heroImage) {
        const path = `weddings/${userWedID}/hero-image.jpg`;
        heroImageUrl = await uploadImage(userWedID, heroImage, path);
      }
      
      // Handle music
      let musicUrls: string[] = [];
      let musicFileName = "";
      
      if (musicSource === "file" && musicFiles.length > 0) {
        // Upload all music files
        const uploadPromises = musicFiles.map(file => uploadMusicFile(file));
        musicUrls = await Promise.all(uploadPromises);
        musicFileName = musicFiles.map(file => file.name).join(", ");
      } else if (musicSource === "link" && musicLinks.length > 0) {
        // Validate all music links
        const invalidLinks = musicLinks.filter(link => !validateMusicLink(link));
        if (invalidLinks.length > 0) {
          throw new Error("Một số link nhạc không hợp lệ. Vui lòng sử dụng link từ YouTube, SoundCloud hoặc Spotify.");
        }
        musicUrls = musicLinks;
      }
      
      // Update wedding data
      await updateWeddingWebsite(userWedID, {
        template: selectedTemplate,
        flowerFrame: selectedFlowerFrame,
        color: selectedColor,
        customColor: selectedColor === "custom" ? customColor : "",
        heroImageUrl,
        musicUrls,
        musicFileName,
        musicCount,
        imageScale,
        imageOffsetX,
        imageOffsetY,
        effect: selectedEffect
      });
      
      // Navigate to completed page
      router.push(`/create/completed/${userWedID}/`);
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
    
    // Check music count
    if (musicCount > 1) {
      vipFeatures.push({
        name: "Nhạc nền bổ sung",
        count: musicCount - 1, // First song is free
        price: VIP_PRICES.MUSIC
      });
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
    <div className="min-h-screen bg-pink-50 py-8 px-4 md:px-6">
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
            <div className="space-y-8">
              {/* Flower Frame Section */}
              <div className="border-b pb-6">
                <FlowerFrameTab 
                  flowerFrames={flowerFrameOptions}
                  selectedFlowerFrame={selectedFlowerFrame}
                  setSelectedFlowerFrame={setSelectedFlowerFrame}
                  VIP_PRICES={VIP_PRICES}
                />
              </div>
              
              {/* Color Section */}
              <div className="border-b pb-6">
                <ColorTab 
                  colorOptions={colorOptions}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  customColor={customColor}
                  setCustomColor={setCustomColor}
                  VIP_PRICES={VIP_PRICES}
                />
              </div>
              
              {/* Effects Section */}
              <div>
                <EffectsTab 
                  effectOptions={effectOptions}
                  selectedEffect={selectedEffect}
                  onEffectChange={handleEffectChange}
                  VIP_PRICES={VIP_PRICES}
                />
              </div>
            </div>
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
            />
          </TabsContent>
          
          <TabsContent value="music" className="p-4 md:p-6">
            <MusicTab 
              musicFiles={musicFiles}
              musicFileNames={musicFileNames}
              musicPreviewUrls={musicPreviewUrls}
              musicLinks={musicLinks}
              musicSource={musicSource}
              isPlaying={isPlaying}
              musicCount={musicCount}
              setMusicSource={setMusicSource}
              handleMusicFileChange={handleMusicFileChange}
              setMusicLinks={setMusicLinks}
              toggleAudio={toggleAudio}
              increaseMusicCount={increaseMusicCount}
              decreaseMusicCount={decreaseMusicCount}
              validateMusicLink={validateMusicLink}
              VIP_PRICES={VIP_PRICES}
            />
            {/* Hidden audio elements for preview */}
            {musicPreviewUrls.map((url, index) => (
              <audio 
                key={index}
                ref={audioRef}
                src={url} 
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            ))}
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
              <ConfirmationModal
                onSave={handleSave}
                userWedID={userWedID}
                hasVipFeatures={hasVipFeatures().hasVip}
                vipFeatures={hasVipFeatures().features}
                trigger={
                  <Button type="button" disabled={saving} className="text-sm md:text-base">
                    Hoàn tất
                  </Button>
                }
              />
            ) : (
              <Button type="button" onClick={nextTab} disabled={saving} className="text-sm md:text-base">
                Tiếp tục <ChevronRight className="ml-1 md:ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
} 