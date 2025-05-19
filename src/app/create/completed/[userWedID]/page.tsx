"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { getWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";

export default function CompletedPage({
  params,
}: {
  params: Promise<{ userWedID: string }>;
}) {
  const router = useRouter();
  const { userWedID } = use(params);
  
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }
  
  if (error) {
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
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Website cưới đã được tạo thành công!</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Chúc mừng {weddingData?.groomName} & {weddingData?.brideName}! Website cưới của bạn đã sẵn sàng.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-2">Địa chỉ website của bạn</h2>
          <div className="flex items-center justify-center">
            <div className="px-4 py-2 bg-gray-100 rounded-lg text-lg font-medium">
              {weddingData?.subdomain}.iwedplan.com
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                // Copy to clipboard
                navigator.clipboard.writeText(`${weddingData?.subdomain}.iwedplan.com`);
              }}
              className="ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Button 
            className="bg-pink-500 hover:bg-pink-600"
            onClick={() => window.open(`https://${weddingData?.subdomain}.iwedplan.com`, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Xem website
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push(`/dashboard/${weddingData?.id}`)}
          >
            Đi đến bảng điều khiển
          </Button>
        </div>
        
        <div className="text-gray-500 text-sm">
          <p>
            Bạn có thể chỉnh sửa nội dung website của mình bất kỳ lúc nào trong bảng điều khiển.
          </p>
        </div>
      </div>
    </div>
  );
} 