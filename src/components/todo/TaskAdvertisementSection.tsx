import { useState, useEffect } from "react";
import { getTaskAdvertisements, incrementAdViewCount, incrementAdClickCount } from "@/lib/firebase/todoService";
import { TaskAdvertisement } from "@/lib/firebase/models";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Tạo dữ liệu mẫu ads dựa trên category
  const getSampleAds = (category: string): TaskAdvertisement[] => {
    const baseAds: TaskAdvertisement[] = [];
    
    switch (category) {
      case 'venue':
        baseAds.push(
          {
            id: 'venue-1',
            title: 'Nhà hàng tiệc cưới Riverside',
            description: 'Không gian sang trọng bên sông, phù hợp tổ chức tiệc cưới cao cấp',
            imageUrl: '/images/templates/classic.png',
            linkUrl: 'https://example.com/riverside-venue',
            categories: ['wedding-venue'],
            priority: 5,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 150,
            clickCount: 25
          },
          {
            id: 'venue-2', 
            title: 'Trung tâm hội nghị Diamond',
            description: 'Sảnh tiệc rộng 500 khách, âm thanh ánh sáng hiện đại',
            imageUrl: '/images/templates/elegant.png',
            linkUrl: 'https://example.com/diamond-hall',
            categories: ['reception-hall'],
            priority: 4,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 120,
            clickCount: 18
          }
        );
        break;
      case 'attire':
        baseAds.push(
          {
            id: 'attire-1',
            title: 'Áo cưới Bella Bridal',
            description: 'Thiết kế độc quyền, may đo theo size, chất liệu cao cấp',
            imageUrl: '/images/templates/modern.png',
            linkUrl: 'https://example.com/bella-bridal',
            categories: ['wedding-dress'],
            priority: 5,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 200,
            clickCount: 35
          },
          {
            id: 'attire-2',
            title: 'Vest cưới nam Antoine',
            description: 'Vest nam công sở và dạ hội, phong cách Âu - Á',
            imageUrl: '/images/templates/minimalist.png',
            linkUrl: 'https://example.com/antoine-suits',
            categories: ['groom-suit'],
            priority: 4,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 180,
            clickCount: 28
          }
        );
        break;
      case 'photography':
        baseAds.push(
          {
            id: 'photo-1',
            title: 'Studio ảnh cưới Moment',
            description: 'Chụp ảnh cưới phong cách Hàn Quốc, concept độc đáo',
            imageUrl: '/images/album/bride.png',
            linkUrl: 'https://example.com/moment-studio',
            categories: ['wedding-photography'],
            priority: 5,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 300,
            clickCount: 45
          },
          {
            id: 'photo-2',
            title: 'Quay phim cưới Cinematic',
            description: 'Quay phim cưới chuyên nghiệp, kỹ thuật 4K HDR',
            imageUrl: '/images/album/groom.png',
            linkUrl: 'https://example.com/cinematic-video',
            categories: ['videography'],
            priority: 4,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 250,
            clickCount: 38
          }
        );
        break;
      case 'catering':
        baseAds.push(
          {
            id: 'catering-1',
            title: 'Dịch vụ tiệc cưới Golden',
            description: 'Thực đơn đa dạng Á - Âu, phục vụ chuyên nghiệp',
            imageUrl: '/images/templates/classic.png',
            linkUrl: 'https://example.com/golden-catering',
            categories: ['catering-service'],
            priority: 5,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 180,
            clickCount: 30
          },
          {
            id: 'catering-2',
            title: 'Bánh cưới Sweet Wedding',
            description: 'Bánh cưới handmade, thiết kế theo yêu cầu',
            imageUrl: '/images/templates/elegant.png',
            linkUrl: 'https://example.com/sweet-wedding',
            categories: ['wedding-cake'],
            priority: 4,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 160,
            clickCount: 25
          }
        );
        break;
      default:
        baseAds.push(
          {
            id: 'general-1',
            title: 'Dịch vụ cưới hỏi toàn diện',
            description: 'Tư vấn và tổ chức đám cưới trọn gói chuyên nghiệp',
            imageUrl: '/images/templates/modern.png',
            linkUrl: 'https://example.com/wedding-planner',
            categories: ['wedding-service'],
            priority: 5,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 400,
            clickCount: 60
          },
          {
            id: 'general-2',
            title: 'Trang trí tiệc cưới Luxury',
            description: 'Trang trí backdrop, hoa tươi và đạo cụ cao cấp',
            imageUrl: '/images/templates/minimalist.png',
            linkUrl: 'https://example.com/luxury-decor',
            categories: ['wedding-decoration'],
            priority: 4,
            isActive: true,
            startDate: new Date() as any,
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) as any,
            viewCount: 220,
            clickCount: 32
          }
        );
    }
    
    return baseAds;
  };

  // Tải các quảng cáo liên quan
  useEffect(() => {
    async function loadAds() {
      try {
        setIsLoading(true);
        
        // Thử tải ads từ Firebase trước
        try {
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
          
          // Lấy danh sách quảng cáo từ Firebase
          const adsData = await getTaskAdvertisements(categories);
          
          if (adsData.length > 0) {
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
          } else {
            // Nếu không có ads từ Firebase, sử dụng dữ liệu mẫu
            const sampleAds = getSampleAds(category);
            setAds(sampleAds.slice(0, 3));
          }
        } catch (firebaseError) {
          console.log("Firebase ads not available, using sample data:", firebaseError);
          // Fallback to sample data
          const sampleAds = getSampleAds(category);
          setAds(sampleAds.slice(0, 3));
        }
      } catch (error) {
        console.error("Error loading advertisements:", error);
        // Fallback to sample data in case of any error
        const sampleAds = getSampleAds(category);
        setAds(sampleAds.slice(0, 3));
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
    <div className="mt-8 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-md">
          <Lightbulb className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Gợi ý dịch vụ</h3>
          <p className="text-sm text-gray-600">Các dịch vụ phù hợp cho công việc này</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <Card key={ad.id} className="overflow-hidden flex flex-col bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-amber-300">
            <div className="w-full aspect-video overflow-hidden relative">
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            <CardHeader className="px-4 py-4 bg-gradient-to-r from-white to-gray-50">
              <CardTitle className="text-base font-bold text-gray-800 line-clamp-1">{ad.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm text-gray-600">
                {ad.description}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="px-4 pt-0 pb-4 mt-auto">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300" 
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