"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  WifiOff, 
  RefreshCw, 
  Home, 
  Heart, 
  Calendar,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const offlineFeatures = [
    {
      icon: <Calendar className="h-5 w-5 text-pink-500" />,
      title: "Xem kế hoạch đám cưới",
      description: "Kiểm tra timeline và checklist đã lưu"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      title: "Cập nhật công việc",
      description: "Đánh dấu hoàn thành các task"
    },
    {
      icon: <Users className="h-5 w-5 text-blue-500" />,
      title: "Danh sách khách mời",
      description: "Xem thông tin khách đã lưu"
    },
    {
      icon: <Heart className="h-5 w-5 text-red-500" />,
      title: "Album ảnh cưới",
      description: "Xem ảnh đã tải về máy"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Status Card */}
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                {isOnline ? (
                  <RefreshCw className="h-8 w-8 text-green-600" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
            <CardTitle className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'Đã kết nối lại!' : 'Không có kết nối internet'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {isOnline 
                ? 'Tuyệt! Bạn đã kết nối lại internet. Có thể làm mới trang để xem nội dung mới nhất.'
                : 'Bạn đang ở chế độ offline, nhưng vẫn có thể sử dụng một số tính năng cơ bản.'
              }
            </p>
            
            <div className="flex gap-2 justify-center">
              {isOnline ? (
                <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Làm mới trang
                </Button>
              ) : (
                <Button onClick={handleGoHome} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Về trang chủ
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Offline Features */}
        {!isOnline && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-gray-800">
                Tính năng có thể sử dụng offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offlineFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium text-blue-800 mb-2">💡 Mẹo sử dụng</h3>
              <p className="text-blue-700 text-sm">
                Để có trải nghiệm tốt nhất, hãy kết nối WiFi hoặc dữ liệu di động. 
                Ứng dụng sẽ tự động đồng bộ khi có kết nối.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>iWedplan - Wedding Planning App</p>
          <p>Version 1.0.0 • PWA Mode</p>
        </div>
      </div>
    </div>
  );
} 