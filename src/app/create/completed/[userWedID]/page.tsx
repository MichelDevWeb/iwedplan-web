"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, ExternalLink, Copy, QrCode, Palette, Music, ImageIcon } from "lucide-react";
import { getWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import HeaderNotificationBar from "@/components/common/HeaderNotificationBar";
import LoadingOverlay from "@/components/ui/loading-overlay";
import LoadingScreen from "@/components/ui/loading-screen";
import { getTemplateName, getColorName, getFrameName } from "@/config/templateConfig";

export default function CompletedPage({
  params,
}: {
  params: Promise<{ userWedID: string }>;
}) {
  const router = useRouter();
  const { userWedID } = use(params);
  
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  // Load wedding website data
  useEffect(() => {
    async function loadWeddingData() {
      try {
        const data = await getWeddingWebsite(userWedID);
        if (data) {
          setWeddingData(data);
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

  const copyToClipboard = () => {
    if (!weddingData?.id) return;
    const weddingUrl = `${window.location.origin}/${weddingData.id}`;
    navigator.clipboard.writeText(weddingUrl);
    toast.success("Đã sao chép địa chỉ website");
  };

  const toggleQRCode = () => {
    setShowQR(prev => !prev);
  };

  const handleNavigate = (path: string) => {
    setNavigationLoading(true);
    router.push(path);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (loading) {
    return <LoadingScreen message="Đang tải thông tin website cưới..." />;
  }
  
  if (redirecting) {
    return <LoadingScreen message="Đang chuyển hướng..." />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => handleNavigate("/landing")}>
          Quay lại trang chủ
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header Notification Bar */}
      <HeaderNotificationBar />
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoading={navigationLoading}
        type="navigation"
        message="Đang chuyển trang..."
      />
      
      <motion.div 
        className="flex items-center justify-center p-4 relative overflow-hidden min-h-screen"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-rose-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/4 right-0 w-24 h-24 bg-pink-200 rounded-full opacity-30 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-25 translate-y-1/2"></div>
        
        <motion.div 
          className="max-w-4xl w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-4 md:p-8 text-center relative border border-white/20"
          variants={itemVariants}
        >
          <motion.div 
            className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5 }}
          />
          
          <motion.div 
            className="inline-flex items-center justify-center p-3 md:p-4 bg-green-100 rounded-full mb-4 md:mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <CheckCircle className="w-8 h-8 md:w-12 md:h-12 text-green-500" strokeWidth={1.5} />
          </motion.div>
          
          <motion.h1 
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-gray-800"
            variants={itemVariants}
          >
            Website cưới đã được tạo thành công!
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-2"
            variants={itemVariants}
          >
            Chúc mừng <span className="font-semibold text-pink-600">{weddingData?.groomName}</span> & <span className="font-semibold text-pink-600">{weddingData?.brideName}</span>! 
            <br className="hidden sm:block" />
            Website cưới của bạn đã sẵn sàng.
          </motion.p>

          {/* Template Settings Overview */}
          <motion.div
            className="bg-gradient-to-r from-gray-50 to-pink-50 p-4 md:p-6 rounded-xl mb-6 md:mb-8 border border-pink-100"
            variants={itemVariants}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Cài đặt mẫu của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white p-3 md:p-4 rounded-xl border border-pink-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 md:p-3 bg-pink-50 rounded-full mb-2">
                  <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />
                </div>
                <h3 className="font-medium text-sm md:text-base text-gray-800">Mẫu Website</h3>
                <p className="text-pink-600 mt-1 text-sm md:text-base font-medium">{getTemplateName(weddingData?.template)}</p>
              </div>
              
              <div className="bg-white p-3 md:p-4 rounded-xl border border-pink-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 md:p-3 bg-pink-50 rounded-full mb-2">
                  <Palette className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />
                </div>
                <h3 className="font-medium text-sm md:text-base text-gray-800">Màu sắc chủ đạo</h3>
                <p className="text-pink-600 mt-1 text-sm md:text-base font-medium">
                  {weddingData?.customColor ? 'Màu Tùy Chỉnh' : getColorName(weddingData?.color)}
                </p>
              </div>
              
              <div className="bg-white p-3 md:p-4 rounded-xl border border-pink-100 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="p-2 md:p-3 bg-pink-50 rounded-full mb-2">
                  <Music className="h-4 w-4 md:h-5 md:w-5 text-pink-500" />
                </div>
                <h3 className="font-medium text-sm md:text-base text-gray-800">Nhạc nền</h3>
                <p className="text-pink-600 mt-1 text-sm md:text-base font-medium">{weddingData?.musicUrls?.length ? 'Đã cài đặt' : 'Chưa cài đặt'}</p>
              </div>
            </div>
          </motion.div>
          
          {/* Website URL */}
          <motion.div 
            className="bg-gradient-to-r from-gray-50 to-pink-50 p-4 md:p-6 rounded-xl mb-6 md:mb-8 border border-pink-100"
            variants={itemVariants}
          >
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">Địa chỉ website của bạn</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2">
              <motion.div 
                className="px-3 md:px-4 py-2 md:py-3 bg-white rounded-xl text-sm md:text-lg font-medium border-2 border-pink-100 shadow-sm break-all text-center"
                whileHover={{ y: -2 }}
              >
                {window.location.origin}/{weddingData?.id}
              </motion.div>
              <div className="flex gap-2">
                <motion.button 
                  className="p-2 md:p-3 hover:bg-pink-50 rounded-full text-gray-600 border border-gray-200 shadow-sm"
                  onClick={copyToClipboard}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Sao chép địa chỉ"
                >
                  <Copy size={18} />
                </motion.button>
                <motion.button 
                  className="p-2 md:p-3 hover:bg-pink-50 rounded-full text-gray-600 border border-gray-200 shadow-sm"
                  onClick={toggleQRCode}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Hiển thị mã QR"
                >
                  <QrCode size={18} />
                </motion.button>
              </div>
            </div>
            
            {showQR && (
              <motion.div 
                className="flex flex-col items-center my-4 md:my-6"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-gray-500 mb-4">Quét mã QR để truy cập website</p>
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-2 border-pink-100">
                  <QRCodeSVG 
                    value={`${window.location.origin}/${weddingData?.id}`} 
                    size={window.innerWidth < 768 ? 150 : 200}
                    level="H"
                    includeMargin={true}
                    bgColor={"#FFFFFF"}
                    fgColor={"#F43F5E"}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center px-4">Chia sẻ mã QR này với khách mời của bạn</p>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-4 md:mb-6"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full sm:w-auto text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.open(`/${weddingData?.id}`, "_blank")}
                size="lg"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Xem website
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button 
                variant="outline"
                className="w-full sm:w-auto border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-300"
                onClick={() => handleNavigate("/landing")}
                size="lg"
              >
                Đi đến trang chủ
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2"
            variants={itemVariants}
          >
            <p>
              Bạn có thể chỉnh sửa nội dung website của mình bất kỳ lúc nào trong bảng điều khiển.
              Hãy chia sẻ địa chỉ website hoặc mã QR với khách mời của bạn.
            </p>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-pink-300 via-pink-500 to-pink-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
} 