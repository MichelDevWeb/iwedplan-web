'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Bell, Palette, Settings, Users, BarChart3, Home } from 'lucide-react';
import { isUserAdmin } from '@/lib/firebase/adminService';
import LoadingScreen from '@/components/ui/loading-screen';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { toast } from 'sonner';
import HeaderNotificationBar from '@/components/common/HeaderNotificationBar';

// Import admin components
import NotificationManagement from '@/components/admin/NotificationManagement';
import TemplateConfigManagement from '@/components/admin/TemplateConfigManagement';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Check admin permissions
  useEffect(() => {
    async function checkAdminPermissions() {
      if (!authLoading && isAuthenticated && user?.uid) {
        try {
          setLoading(true);
          const adminStatus = await isUserAdmin(user.uid);
          if (!adminStatus) {
            toast.error('Bạn không có quyền truy cập trang quản trị');
            router.push('/landing');
            return;
          }
          setIsAdmin(true);
        } catch (error) {
          console.error('Error checking admin permissions:', error);
          toast.error('Không thể xác thực quyền truy cập');
          router.push('/landing');
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !isAuthenticated) {
        toast.error('Vui lòng đăng nhập để truy cập trang quản trị');
        router.push('/auth/login');
      }
    }

    checkAdminPermissions();
  }, [user, isAuthenticated, authLoading, router]);

  const handleNavigation = (path: string) => {
    setNavigationLoading(true);
    router.push(path);
  };

  if (authLoading || loading) {
    return <LoadingScreen message="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAdmin) {
    return <LoadingScreen message="Đang chuyển hướng..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Notification Bar */}
      <HeaderNotificationBar />
      
      {/* Loading Overlay */}
      <LoadingOverlay 
        isLoading={navigationLoading}
        type="navigation"
        message="Đang chuyển trang..."
      />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-100 rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation('/landing')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Trang chủ
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Admin Panel
                </div>
              </div>
            </div>
            
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-blue-600">
                Bảng điều khiển quản trị
              </h1>
              <p className="text-gray-600">
                Quản lý thông báo và cấu hình template cho hệ thống iWedPlan
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 gap-2 p-1">
              <TabsTrigger value="overview" className="text-sm py-2 px-3">
                <BarChart3 className="w-4 h-4 mr-2" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-sm py-2 px-3">
                <Bell className="w-4 h-4 mr-2" />
                Thông báo
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-sm py-2 px-3">
                <Palette className="w-4 h-4 mr-2" />
                Template Config
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="p-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Thông báo đang hoạt động
                    </CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">
                      Hiển thị trên header
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Template VIP
                    </CardTitle>
                    <Palette className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">
                      Template cao cấp
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tổng config
                    </CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">
                      Tất cả cấu hình
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Người dùng
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                    <p className="text-xs text-muted-foreground">
                      Tổng số người dùng
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Hành động nhanh</CardTitle>
                    <CardDescription>
                      Các tác vụ thường dùng trong quản trị hệ thống
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Button 
                      onClick={() => setActiveTab('notifications')}
                      className="h-20 flex flex-col gap-2"
                    >
                      <Plus className="h-6 w-6" />
                      Tạo thông báo mới
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('templates')}
                      className="h-20 flex flex-col gap-2"
                    >
                      <Plus className="h-6 w-6" />
                      Thêm template config
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <NotificationManagement />
            </TabsContent>
            
            <TabsContent value="templates">
              <TemplateConfigManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 