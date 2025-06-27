import { useState, useEffect } from "react";
import { getTaskAdvertisements, incrementAdViewCount, incrementAdClickCount } from "@/lib/firebase/todoService";
import { TaskAdvertisement } from "@/lib/firebase/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Lightbulb } from "lucide-react";

interface TaskAdvertisementSectionProps {
  category: string;
  advertisementIds: string[];
}

export default function TaskAdvertisementSection({
  category,
  advertisementIds,
}: TaskAdvertisementSectionProps) {
  const [ads, setAds] = useState<TaskAdvertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tải các quảng cáo liên quan
  useEffect(() => {
    async function loadAds() {
      try {
        setIsLoading(true);
        
        // Tạo danh sách category để tìm kiếm quảng cáo liên quan
        const categories = [];
        
        switch (category) {
          case 'venue':
            categories.push('wedding-venue', 'reception-hall');
            break;
          case 'attire':
            categories.push('wedding-dress', 'groom-suit', 'fashion');
            break;
          case 'photography':
            categories.push('wedding-photography', 'videography', 'photography-studio');
            break;
          case 'invitation':
            categories.push('wedding-invitation', 'printing-service');
            break;
          case 'catering':
            categories.push('catering-service', 'wedding-cake', 'food');
            break;
          case 'decoration':
            categories.push('wedding-decoration', 'flowers');
            break;
          case 'music':
            categories.push('wedding-music', 'entertainment');
            break;
          case 'transportation':
            categories.push('wedding-transportation', 'car-rental');
            break;
          case 'accommodation':
            categories.push('hotel', 'accommodation');
            break;
          case 'beauty':
            categories.push('makeup-service', 'beauty-salon');
            break;
          case 'gifts':
            categories.push('wedding-gifts', 'souvenirs');
            break;
          default:
            categories.push('wedding-service');
        }
        
        // Lấy danh sách quảng cáo
        const adsData = await getTaskAdvertisements(categories);
        
        // Lọc quảng cáo để ưu tiên theo ID đã được gợi ý
        const sortedAds = [...adsData].sort((a, b) => {
          // Ưu tiên hiển thị quảng cáo đã được gợi ý
          const aInSuggested = advertisementIds.includes(a.id);
          const bInSuggested = advertisementIds.includes(b.id);
          
          if (aInSuggested && !bInSuggested) return -1;
          if (!aInSuggested && bInSuggested) return 1;
          
          // Nếu cùng trạng thái gợi ý, sắp xếp theo priority
          return b.priority - a.priority;
        });
        
        // Giới hạn số lượng quảng cáo hiển thị
        setAds(sortedAds.slice(0, 3));
        
        // Tăng viewCount cho các quảng cáo được hiển thị
        sortedAds.slice(0, 3).forEach(ad => {
          incrementAdViewCount(ad.id);
        });
      } catch (error) {
        console.error("Error loading advertisements:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadAds();
  }, [category, advertisementIds]);

  // Xử lý khi người dùng nhấp vào quảng cáo
  const handleAdClick = (ad: TaskAdvertisement) => {
    // Tăng clickCount cho quảng cáo
    incrementAdClickCount(ad.id);
    
    // Mở liên kết trong tab mới
    window.open(ad.linkUrl, '_blank');
  };

  if (isLoading) {
    return null;
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="text-amber-500" size={20} />
        <h3 className="text-lg font-medium">Gợi ý dịch vụ</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden flex flex-col">
            <div className="w-full aspect-video overflow-hidden">
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-base">{ad.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {ad.description}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="px-4 pt-0 pb-3 mt-auto">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => handleAdClick(ad)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 