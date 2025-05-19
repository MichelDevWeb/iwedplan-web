"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, Upload, CheckCircle, ChevronLeft, ChevronRight, Music, 
  Link as LinkIcon, Crown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, Plus, Minus, Sparkles, Gift
} from "lucide-react";
import { getWeddingWebsite, updateWeddingWebsite, uploadImage } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";
import { Slider } from "@/components/ui/slider";
import ConfirmationModal from "@/components/ConfirmationModal";

// Import new tab components
import TemplateTab from "@/components/template/TemplateTab";
import FlowerFrameTab from "@/components/template/FlowerFrameTab";
import HeroImageTab from "@/components/template/HeroImageTab";
import ColorTab from "@/components/template/ColorTab";
import MusicTab from "@/components/template/MusicTab";

interface TemplateOption {
  id: string;
  name: string;
  image: string;
}

// Template options
const templates: TemplateOption[] = [
  {
    id: "default",
    name: "Template Mặc định",
    image: "/images/templates/default.jpg",
  },
  {
    id: "elegant",
    name: "Elegant",
    image: "/images/templates/elegant.jpg",
  },
  {
    id: "modern",
    name: "Modern",
    image: "/images/templates/modern.jpg",
  },
];

// Flower frame options from HeroSection
const flowerFrames = [
  { 
    id: 'rose',
    name: 'Blush Flower',
    image: '/images/flower-frame/1.png'
  },
  { 
    id: 'sage',
    name: 'Sage Flower',
    image: '/images/flower-frame/2.png'
  },
  { 
    id: 'gold',
    name: 'Rose Gold Flower',
    image: '/images/flower-frame/3.png'
  },
  { 
    id: 'lavender',
    name: 'Lavender Flower',
    image: '/images/flower-frame/4.png'
  },
  { 
    id: 'peach',
    name: 'Peach Flower',
    image: '/images/flower-frame/5.png'
  },
];

// Color options from HeroSection
const colorOptions = [
  {
    id: "blush",
    name: "Hồng Blush",
    value: "#fad1e6",
  },
  {
    id: "sage",
    name: "Xanh Sage",
    value: "#e3f1ea",
  },
  {
    id: "rose",
    name: "Hồng Rose Gold",
    value: "#fde4e4",
  },
  {
    id: "lavender",
    name: "Tím Lavender",
    value: "#e9e4f9",
  },
  {
    id: "peach",
    name: "Đào Peach",
    value: "#feeadd",
  },
  {
    id: "custom",
    name: "Màu tùy chỉnh",
    value: "",
  },
];

// Define frame options with specific image positioning for previewing
const flowerFramesWithPositioning = [
  { 
    id: 'rose',
    name: 'Blush Flower',
    image: '/images/flower-frame/1.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: 'sage',
    name: 'Sage Flower',
    image: '/images/flower-frame/2.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-2' 
  },
  { 
    id: 'gold',
    name: 'Rose Gold Flower',
    image: '/images/flower-frame/3.png',
    imageSize: 'w-[75%] h-[75%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: 'lavender',
    name: 'Lavender Flower',
    image: '/images/flower-frame/4.png',
    imageSize: 'w-[85%] h-[90%]', 
    imagePosition: 'translate-x-0 translate-y-1' 
  },
  { 
    id: 'peach',
    name: 'Peach Flower',
    image: '/images/flower-frame/5.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  }
];

// Update vip price constants
const VIP_PRICES = {
  TEMPLATE: 150000, // 150,000 VND
  FLOWER_FRAME: 100000, // 100,000 VND
  COLOR: 50000, // 50,000 VND
  MUSIC: 200000, // 200,000 VND per song
};

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
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicLink, setMusicLink] = useState("");
  const [musicSource, setMusicSource] = useState<"file" | "link">("file");
  const [musicFileName, setMusicFileName] = useState("");
  const [musicPreviewUrl, setMusicPreviewUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicCount, setMusicCount] = useState(1);
  
  const [activeTab, setActiveTab] = useState("template");
  
  const [showAffiliateBanner, setShowAffiliateBanner] = useState(true);
  const [discountCode, setDiscountCode] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  
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
          
          if (data.musicUrl) {
            if (data.musicUrl.startsWith('http')) {
              setMusicSource("link");
              setMusicLink(data.musicUrl);
            } else {
              setMusicSource("file");
              setMusicFileName(data.musicFileName || "Đã tải lên nhạc nền");
              setMusicPreviewUrl(data.musicUrl);
            }
          }
          
          // Set music count
          if (data.musicCount) {
            setMusicCount(data.musicCount > 3 ? 3 : data.musicCount);
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
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File nhạc không được vượt quá 10MB");
        return;
      }
      
      setMusicFile(file);
      setMusicFileName(file.name);
      setMusicSource("file");
      
      // Create a preview URL for the audio file
      const previewUrl = URL.createObjectURL(file);
      setMusicPreviewUrl(previewUrl);
      
      return () => {
        URL.revokeObjectURL(previewUrl);
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
        heroImageUrl = await uploadImage(heroImage, path);
      }
      
      // Handle music
      let musicUrl = weddingData.musicUrl || "";
      let musicFileName = weddingData.musicFileName || "";
      
      if (musicSource === "file" && musicFile) {
        musicUrl = await uploadMusicFile(musicFile);
        musicFileName = musicFile.name;
      } else if (musicSource === "link" && musicLink) {
        if (!validateMusicLink(musicLink)) {
          throw new Error("Link nhạc không hợp lệ. Vui lòng sử dụng link từ YouTube, SoundCloud hoặc Spotify.");
        }
        musicUrl = musicLink;
        musicFileName = "";
      }
      
      // Update wedding data
      await updateWeddingWebsite(userWedID, {
        template: selectedTemplate,
        flowerFrame: selectedFlowerFrame,
        color: selectedColor,
        customColor: selectedColor === "custom" ? customColor : "",
        heroImageUrl,
        musicUrl,
        musicFileName,
        musicCount,
        imageScale,
        imageOffsetX,
        imageOffsetY
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
    if (activeTab === "template") setActiveTab("frame");
    else if (activeTab === "frame") setActiveTab("image");
    else if (activeTab === "image") setActiveTab("color");
    else if (activeTab === "color") setActiveTab("music");
  };
  
  const prevTab = () => {
    if (activeTab === "music") setActiveTab("color");
    else if (activeTab === "color") setActiveTab("image");
    else if (activeTab === "image") setActiveTab("frame");
    else if (activeTab === "frame") setActiveTab("template");
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
    const frameIndex = flowerFrames.findIndex(frame => frame.id === selectedFlowerFrame);
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
    
    return {
      hasVip: vipFeatures.length > 0,
      features: vipFeatures
    };
  };
  
  // Generate discount code function
  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'IWED';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setDiscountCode(code);
    setShowDiscount(true);
    
    // Save the code to localStorage to persist it
    localStorage.setItem('iwedplan_discount_code', code);
    
    // Hide banner after code is generated
    setTimeout(() => {
      setShowAffiliateBanner(false);
    }, 5000);
  };
  
  // Check for existing discount code in localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem('iwedplan_discount_code');
    if (savedCode) {
      setDiscountCode(savedCode);
      setShowDiscount(true);
      setShowAffiliateBanner(false);
    }
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
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
    <div className="min-h-screen bg-pink-50 py-8 px-4">
      <style jsx global>{pulseAnimation}</style>
      
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Tùy chỉnh Website Cưới</h1>
          <p className="text-gray-500">
            {weddingData?.groomName} & {weddingData?.brideName} - {weddingData?.subdomain}.iwedplan.com
          </p>
        </div>
        
        {showAffiliateBanner && (
          <div 
            className="relative bg-gradient-to-r from-pink-100 to-purple-100 p-4 mx-4 mt-4 rounded-lg border-2 border-pink-300 cursor-pointer"
            style={{ animation: 'pulse-border 2s infinite' }}
            onClick={generateDiscountCode}
          >
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-pink-500 mr-2" />
              <p className="text-pink-800 font-medium flex-1">
                Nhấn vào đây để nhận mã giảm giá 20% cho các tính năng VIP!
              </p>
              <Gift className="h-5 w-5 text-pink-500 ml-2 animate-bounce" />
            </div>
          </div>
        )}
        
        {showDiscount && (
          <div className="bg-green-50 p-4 mx-4 mt-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-green-800 font-medium">
                  Mã giảm giá của bạn: <span className="font-bold text-green-600">{discountCode}</span>
                </p>
                <p className="text-sm text-green-600">Giảm 20% cho tất cả các tính năng VIP!</p>
              </div>
              <Button 
                size="sm" 
                className="bg-green-500 hover:bg-green-600"
                onClick={() => {
                  navigator.clipboard.writeText(discountCode);
                }}
              >
                Sao chép
              </Button>
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="frame">Khung hoa</TabsTrigger>
              <TabsTrigger value="image">Ảnh bìa</TabsTrigger>
              <TabsTrigger value="color">Màu sắc</TabsTrigger>
              <TabsTrigger value="music">Nhạc nền</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="template" className="p-6">
            <TemplateTab 
              templates={templates}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              VIP_PRICES={VIP_PRICES}
            />
          </TabsContent>
          
          <TabsContent value="frame" className="p-6">
            <FlowerFrameTab 
              flowerFrames={flowerFrames}
              selectedFlowerFrame={selectedFlowerFrame}
              setSelectedFlowerFrame={setSelectedFlowerFrame}
              VIP_PRICES={VIP_PRICES}
            />
          </TabsContent>
          
          <TabsContent value="image" className="p-6">
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
          
          <TabsContent value="color" className="p-6">
            <ColorTab 
              colorOptions={colorOptions}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              customColor={customColor}
              setCustomColor={setCustomColor}
              VIP_PRICES={VIP_PRICES}
            />
          </TabsContent>
          
          <TabsContent value="music" className="p-6">
            <MusicTab 
              musicFile={musicFile}
              musicFileName={musicFileName}
              musicPreviewUrl={musicPreviewUrl}
              musicLink={musicLink}
              musicSource={musicSource}
              isPlaying={isPlaying}
              musicCount={musicCount}
              setMusicSource={setMusicSource}
              handleMusicFileChange={handleMusicFileChange}
              setMusicLink={setMusicLink}
              toggleAudio={toggleAudio}
              increaseMusicCount={increaseMusicCount}
              decreaseMusicCount={decreaseMusicCount}
              validateMusicLink={validateMusicLink}
              VIP_PRICES={VIP_PRICES}
            />
            {/* Hidden audio element for preview */}
            {musicPreviewUrl && (
              <audio 
                ref={audioRef}
                src={musicPreviewUrl} 
                onEnded={() => setIsPlaying(false)}
                style={{ display: 'none' }}
              />
            )}
          </TabsContent>
          
          {error && (
            <div className="px-6 py-2">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="p-6 border-t flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevTab}
              disabled={activeTab === "template" || saving}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại
            </Button>
            
            {activeTab === "music" ? (
              <ConfirmationModal
                onSave={handleSave}
                userWedID={userWedID}
                hasVipFeatures={hasVipFeatures().hasVip}
                vipFeatures={hasVipFeatures().features}
                trigger={
                  <Button type="button" disabled={saving}>
                    Hoàn tất
                  </Button>
                }
              />
            ) : (
              <Button type="button" onClick={nextTab} disabled={saving}>
                Tiếp tục <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
} 