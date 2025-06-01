"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import HeroSection from "@/components/template-sections/HeroSection";
import VideoSection from "@/components/template-sections/VideoSection";
import AlbumSection from "@/components/template-sections/AlbumSection";
import CalendarSection from "@/components/template-sections/CalendarSection";
import StorySection from "@/components/template-sections/StorySection";
import BrideGroomSection from "@/components/template-sections/BrideGroomSection";
import EventsSection from "@/components/template-sections/EventsSection";
import WishesSection from "@/components/template-sections/WishesSection";
import GiftSection from "@/components/template-sections/GiftSection";
import Footer from "@/components/common/Footer";
import HeaderNotificationBar from "@/components/common/HeaderNotificationBar";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { getWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import { QRCodeSVG } from "qrcode.react";
import LoadingScreen from "@/components/ui/loading-screen";
import {
  saveTemplateSectionSettings,
  processTemplateData,
} from "@/lib/utils/templateUtils";

export default function WeddingPage() {
  const router = useRouter();
  const params = useParams<{ weddingId: string }>();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  // Set the base URL once when component mounts
  useEffect(() => {
    // Get the base URL for generating QR code and links
    const protocol = window.location.protocol;
    const host = window.location.host;
    setBaseUrl(`${protocol}//${host}`);
  }, []);

  // Wedding data fetching function
  const fetchWeddingData = useCallback(
    async (weddingId: string) => {
      try {
        const data = await getWeddingWebsite(weddingId);
        if (data) {
          setWeddingData(data);
        } else {
          // Wedding not found, redirect to landing
          setNavigationLoading(true);
          router.push("/landing");
        }
      } catch (error) {
        console.error("Error loading wedding data:", error);
        setNavigationLoading(true);
        router.push("/landing");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Load wedding data on initial render and when weddingId changes
  useEffect(() => {
    const weddingId = params?.weddingId;

    if (!weddingId) {
      setNavigationLoading(true);
      router.push("/landing");
      return;
    }

    fetchWeddingData(weddingId);
  }, [params?.weddingId, router, fetchWeddingData]);

  // Generate QR code value
  const qrCodeValue = weddingData ? `${baseUrl}/${weddingData.id}` : "";

  // Save template settings function using the utility
  const handleSaveSettings = async (
    sectionId: string,
    settings: Record<string, any>
  ) => {
    if (!weddingData || !weddingData.id) return;

    try {
      await saveTemplateSectionSettings(weddingData.id, sectionId, settings);
    } catch (error) {
      console.error(`Error saving ${sectionId} settings:`, error);
    }
  };

  // Memoize template data
  const templateData = useMemo(() => {
    if (!weddingData) return null;
    return processTemplateData(weddingData);
  }, [weddingData]);

  // Memoize sections
  const sections = useMemo(() => {
    if (!weddingData?.templateSections || !templateData) {
      return null;
    }

    // Sort sections by order
    const sortedSections = [...weddingData.templateSections].sort(
      (a, b) => a.order - b.order
    );

    return sortedSections.map((section) => {
      if (!section.enabled) return null;

      switch (section.id) {
        case "hero":
          return (
            <HeroSection
              key="hero"
              weddingData={weddingData}
              onSaveSettings={(settings) =>
                handleSaveSettings("hero", settings)
              }
            />
          );
        case "video":
          return (
            <VideoSection
              weddingId={weddingData.id}
              key="video"
              title={templateData.video.title}
              description={templateData.video.description}
              videoUrl={templateData.video.videoUrl}
              onSaveSettings={(settings) =>
                handleSaveSettings("video", settings)
              }
            />
          );
        case "album":
          return (
            <AlbumSection
              weddingId={weddingData.id}
              key="album"
              title={templateData.album.title}
              description={templateData.album.description}
              images={templateData.album.images}
              onSaveSettings={(settings) =>
                handleSaveSettings("album", settings)
              }
            />
          );
        case "calendar":
          return (
            <CalendarSection
              weddingId={weddingData.id}
              key="calendar"
              title={templateData.calendar.title}
              description={templateData.calendar.description}
              date={templateData.calendar.date}
              onSaveSettings={(settings) =>
                handleSaveSettings("calendar", settings)
              }
            />
          );
        case "story":
          return (
            <StorySection
              weddingId={weddingData.id}
              key="story"
              title={templateData.story.title}
              description={templateData.story.description}
              events={templateData.story.storyEvents}
              onSaveSettings={(settings) =>
                handleSaveSettings("story", settings)
              }
            />
          );
        case "bridegroom":
          return (
            <BrideGroomSection
              weddingId={weddingData.id}
              key="bridegroom"
              title={templateData.brideGroom.title}
              description={templateData.brideGroom.description}
              groom={templateData.brideGroom.groom}
              bride={templateData.brideGroom.bride}
              onSaveSettings={(settings) =>
                handleSaveSettings("brideGroom", settings)
              }
            />
          );
        case "events":
          return (
            <EventsSection
              weddingId={weddingData.id}
              key="events"
              title={templateData.events.title}
              description={templateData.events.description}
              eventsList={templateData.events.eventsList}
              onSaveSettings={(settings) =>
                handleSaveSettings("events", settings)
              }
            />
          );
        case "wishes":
          return (
            <WishesSection
              weddingId={weddingData.id}
              key="wishes"
              title={templateData.wishes.title}
              description={templateData.wishes.description}
              onSaveSettings={(settings) =>
                handleSaveSettings("wishes", settings)
              }
            />
          );
        case "gift":
          return (
            <GiftSection
              weddingId={weddingData.id}
              key="gift"
              title={templateData.gift.title}
              description={templateData.gift.description}
              bankAccounts={templateData.gift.bankAccounts}
              onSaveSettings={(settings) =>
                handleSaveSettings("gift", settings)
              }
            />
          );
        default:
          return null;
      }
    });
  }, [weddingData, templateData, handleSaveSettings]);

  if (loading) {
    return <LoadingScreen message="Đang tải website cưới..." />;
  }

  if (!weddingData || !templateData || !sections) {
    return <LoadingScreen message="Đang tải nội dung..." />;
  }

  return (
    <>
      {/* Header Notification Bar */}
      <HeaderNotificationBar />
      
      {/* Loading Overlay for navigation */}
      <LoadingOverlay 
        isLoading={navigationLoading}
        type="navigation"
        message="Đang chuyển về trang chủ..."
      />
      
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow pt-0">
          {sections}

          {/* QR Code Section */}
          <section
            id="qrcode"
            className="py-12 md:py-16 px-4 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-rose-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-1/4 right-0 w-20 h-20 md:w-24 md:h-24 bg-pink-200 rounded-full opacity-30 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-1/4 w-16 h-16 md:w-20 md:h-20 bg-purple-200 rounded-full opacity-25 translate-y-1/2"></div>
            <div className="absolute bottom-1/4 right-1/4 w-12 h-12 md:w-16 md:h-16 bg-rose-300 rounded-full opacity-20"></div>
            
            <div className="max-w-6xl mx-auto text-center relative z-10">
              {/* Header with wedding rings icon */}
              <div className="flex flex-col sm:flex-row items-center justify-center mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center mb-3 sm:mb-0 sm:mr-4">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H9V3H13.5L18.5 8H21M7.5 8H10V9H7.5C6.1 9 5 10.1 5 11.5S6.1 14 7.5 14H10V15H7.5C5.6 15 4 13.4 4 11.5S5.6 8 7.5 8M16.5 9C18.4 9 20 10.6 20 12.5S18.4 16 16.5 16H14V15H16.5C17.9 15 19 13.9 19 12.5S17.9 10 16.5 10H14V9H16.5Z"/>
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-script text-rose-800 text-center">
                  Chia sẻ niềm hạnh phúc
                </h2>
              </div>
              
              <p className="text-gray-700 mb-8 md:mb-10 text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-2">
                Hãy chia sẻ trang cưới của chúng tôi với bạn bè và người thân để cùng chung vui trong ngày trọng đại này
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* QR Code */}
                <div className="order-2 lg:order-1">
                  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl inline-block mb-6 relative border-4 border-rose-100" id="qr-container">
                    {/* Decorative corners */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 md:w-6 md:h-6 bg-rose-400 rounded-full"></div>
                    <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-pink-400 rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 md:w-6 md:h-6 bg-purple-400 rounded-full"></div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-rose-400 rounded-full"></div>
                    
                    <QRCodeSVG 
                      value={qrCodeValue} 
                      size={window.innerWidth < 768 ? 180 : 220} 
                      bgColor="#ffffff"
                      fgColor="#be185d"
                      level="M"
                      includeMargin={true}
                    />
                    
                    {/* Wedding couple names overlay */}
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                      {weddingData?.groomName} ❤️ {weddingData?.brideName}
                    </div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-6 border border-rose-100 max-w-md mx-auto">
                    <p className="text-gray-600 text-sm font-medium mb-2">Đường dẫn website:</p>
                    <p className="text-rose-600 font-mono text-xs md:text-sm break-all">{qrCodeValue}</p>
                  </div>
                </div>
                
                {/* Share buttons */}
                <div className="order-1 lg:order-2">
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 md:mb-8">Chia sẻ qua</h3>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto lg:max-w-none">
                    {/* Download QR button */}
                    <button 
                      onClick={() => {
                        // Create a canvas element
                        const canvas = document.createElement("canvas");
                        const svg = document.querySelector("#qr-container svg");
                        if (!svg) return;
                        
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const img = new Image();
                        
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          
                          // Fill with white background
                          ctx.fillStyle = "white";
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, 0, 0);
                          
                          // Create download link
                          const a = document.createElement("a");
                          a.download = "wedding-qrcode.png";
                          a.href = canvas.toDataURL("image/png");
                          a.click();
                        };
                        
                        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
                      }}
                      className="group py-4 md:py-5 px-4 md:px-6 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium flex flex-col items-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                          <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                        </svg>
                      </div>
                      <span className="text-sm md:text-base">Tải QR Code</span>
                    </button>

                    {/* Facebook share button */}
                    <button 
                      onClick={() => {
                        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrCodeValue)}`;
                        window.open(shareUrl, "_blank", "width=600,height=400");
                      }}
                      className="group py-4 md:py-5 px-4 md:px-6 bg-[#1877f2] rounded-xl text-white font-medium flex flex-col items-center gap-3 hover:bg-[#166fe5] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                        </svg>
                      </div>
                      <span className="text-sm md:text-base">Facebook</span>
                    </button>

                    {/* Zalo share button */}
                    <button 
                      onClick={() => {
                        const shareUrl = `https://zalo.me/zaloapp?action=share&url=${encodeURIComponent(qrCodeValue)}`;
                        window.open(shareUrl, "_blank", "width=600,height=400");
                      }}
                      className="group py-4 md:py-5 px-4 md:px-6 bg-[#0068ff] rounded-xl text-white font-medium flex flex-col items-center gap-3 hover:bg-[#0056d6] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M301.566 165.596C308.237 165.586 313.644 170.984 313.629 177.8C313.614 184.458 308.196 189.826 301.51 189.839C294.667 189.853 289.196 184.461 289.213 177.659C289.23 170.999 294.74 165.606 301.566 165.596ZM256 95.997C167.635 95.997 95.997 160.044 95.997 239.583C95.997 278.952 113.594 314.385 142.423 339.5C144.703 341.439 146.009 344.429 145.886 347.544C145.465 357.146 144.331 371.041 138.652 381.005C137.931 382.329 137.745 383.877 138.126 385.326C138.507 386.776 139.427 388.024 140.712 388.832C142.209 389.779 143.965 390.263 145.755 390.213C147.545 390.164 149.267 389.583 150.707 388.55C162.447 380.388 179.553 365.712 186.816 359.016C187.747 358.127 188.907 357.487 190.176 357.161C191.446 356.834 192.779 356.832 194.05 357.155C213.282 361.711 234.068 363.996 256 364C344.368 364 416 299.953 416 220.414C416 140.874 344.368 95.997 256 95.997ZM211.777 165.596C218.448 165.586 223.855 170.984 223.84 177.8C223.825 184.458 218.407 189.826 211.721 189.839C204.878 189.853 199.407 184.461 199.424 177.659C199.441 170.999 204.951 165.606 211.777 165.596ZM213.295 227.254H209.341C204.512 227.254 200.453 230.87 200.453 235.693V298.324C200.453 303.146 204.455 307.134 209.284 307.134H213.238C218.067 307.134 222.126 303.518 222.126 298.696V235.693C222.185 230.87 218.124 227.254 213.295 227.254ZM301.423 227.254H297.469C292.64 227.254 288.581 230.87 288.581 235.693V271.752L262.626 235.32C262.329 234.819 261.948 234.369 261.501 233.988C261.082 233.71 260.634 233.472 260.163 233.28C259.567 232.98 258.922 232.788 258.258 232.713C257.698 232.619 257.128 232.583 256.557 232.607H253.173C248.344 232.607 244.285 236.224 244.285 241.046V303.677C244.285 308.5 248.287 312.488 253.116 312.488H257.07C261.899 312.488 265.958 308.871 265.958 304.049V267.992L291.968 304.421C292.254 304.904 292.622 305.336 293.056 305.701C293.426 306.003 293.831 306.26 294.261 306.466C294.811 306.767 295.405 306.984 296.022 307.112C296.643 307.269 297.282 307.347 297.923 307.345H301.423C306.252 307.345 310.311 303.728 310.311 298.906V235.693C310.311 230.87 306.252 227.254 301.423 227.254Z"/>
                        </svg>
                      </div>
                      <span className="text-sm md:text-base">Zalo</span>
                    </button>

                    {/* Copy URL button */}
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(qrCodeValue).then(() => {
                          // Create a toast notification
                          const toast = document.createElement('div');
                          toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
                          toast.textContent = 'Đã sao chép đường dẫn!';
                          document.body.appendChild(toast);
                          setTimeout(() => {
                            toast.style.opacity = '0';
                            setTimeout(() => document.body.removeChild(toast), 300);
                          }, 2000);
                        });
                      }}
                      className="group py-4 md:py-5 px-4 md:px-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium flex flex-col items-center gap-3 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                        </svg>
                      </div>
                      <span className="text-sm md:text-base">Sao chép URL</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <FloatingActionButton />
      </div>
    </>
  );
}
