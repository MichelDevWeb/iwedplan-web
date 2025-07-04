"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, PlusCircle, CalendarDays, Settings, ArrowLeft, AlertCircle, Trash2,
  CheckSquare, FileText, Users, CircleDollarSign, Sparkles
} from "lucide-react";
import { getUserWeddingWebsites, deleteWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
import LoadingScreen from "@/components/ui/loading-screen";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateWeddingDialog from "@/components/modals/CreateWeddingModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import MusicFloatingButton from "@/components/common/MusicFloatingButton";
import WeddingPlannerAgent from "@/components/dashboard/WeddingPlannerAgent";
import GuestManagement from "@/components/dashboard/GuestManagement";

export default function Dashboard() {
  const [weddings, setWeddings] = useState<WeddingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [weddingToDelete, setWeddingToDelete] = useState<WeddingData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedWedding, setSelectedWedding] = useState<WeddingData | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  // Kiểm tra kích thước màn hình để điều chỉnh giao diện
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    
    // Kiểm tra khi component mount
    checkScreenSize();
    
    // Thêm event listener để kiểm tra khi resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchWeddings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userWeddings = await getUserWeddingWebsites(user.uid);
        setWeddings(userWeddings);
        
        // Kiểm tra xem có đám cưới đã chọn trước đó không
        const savedSelection = localStorage.getItem('selectedWedding');
        if (savedSelection) {
          try {
            const parsedSelection = JSON.parse(savedSelection);
            const matchingWedding = userWeddings.find(w => w.id === parsedSelection.id);
            if (matchingWedding) {
              setSelectedWedding(matchingWedding);
            } else if (userWeddings.length > 0) {
              setSelectedWedding(userWeddings[0]);
              localStorage.setItem('selectedWedding', JSON.stringify(userWeddings[0]));
            }
          } catch (error) {
            // Nếu có lỗi parse, chọn đám cưới đầu tiên
            if (userWeddings.length > 0) {
              setSelectedWedding(userWeddings[0]);
              localStorage.setItem('selectedWedding', JSON.stringify(userWeddings[0]));
            }
          }
        } else if (userWeddings.length > 0) {
          // Nếu không có selection trước đó, chọn đám cưới đầu tiên
          setSelectedWedding(userWeddings[0]);
          localStorage.setItem('selectedWedding', JSON.stringify(userWeddings[0]));
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đám cưới:", err);
        setError("Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (isAuthenticated) {
        fetchWeddings();
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const handleNavigation = (path: string) => {
    setNavigationLoading(true);
    router.push(path);
  };

  const handleDeleteWedding = async () => {
    if (!weddingToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteWeddingWebsite(weddingToDelete.id);
      
      // Update the weddings list
      setWeddings(weddings.filter(w => w.id !== weddingToDelete.id));
      
      // Nếu đám cưới bị xóa là đám cưới đang được chọn
      if (selectedWedding && selectedWedding.id === weddingToDelete.id) {
        setSelectedWedding(weddings.length > 1 ? weddings.find(w => w.id !== weddingToDelete.id) || null : null);
      }
      
      setDeleteDialogOpen(false);
      setWeddingToDelete(null);
    } catch (err) {
      console.error("Lỗi khi xóa website cưới:", err);
      setError("Không thể xóa website cưới. Vui lòng thử lại sau.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectWedding = (wedding: WeddingData) => {
    setSelectedWedding(wedding);
    // Lưu vào localStorage để các component khác sử dụng
    localStorage.setItem('selectedWedding', JSON.stringify(wedding));
    // Trên mobile, tự động scroll xuống phần nội dung
    if (isMobileView) {
      setTimeout(() => {
        const contentElement = document.getElementById('wedding-content');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const getTimeToWedding = (wedding: WeddingData) => {
    if (!wedding.eventDate) return "Chưa có ngày cưới";
    
    const today = new Date();
    const weddingDate = wedding.eventDate.toDate();
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Đã diễn ra";
    if (diffDays === 0) return "Hôm nay";
    return `Còn ${diffDays} ngày`;
  };

  if (loading || authLoading) {
    return <LoadingScreen message="Đang tải..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="ghost" onClick={() => router.push('/')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Navigation Loading */}
      {navigationLoading && (
        <LoadingScreen 
          message="Đang chuyển hướng..."
        />
      )}
      
      {/* Create Wedding Dialog */}
      <CreateWeddingDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />

      {/* Delete Wedding Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Sẽ xóa vĩnh viễn website "{weddingToDelete?.groomName} & {weddingToDelete?.brideName}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWedding}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Dashboard Content */}
      <div className="container px-4 py-6 mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              🌸 Kế hoạch cưới
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Quản lý đám cưới của bạn
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-pink-500 hover:bg-pink-600 flex items-center gap-2 shadow-lg"
            >
              <PlusCircle className="h-4 w-4" /> Tạo mới
            </Button>
          </div>
        </div>
        
        {weddings.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-pink-100">
            <Heart className="mx-auto h-12 w-12 md:h-16 md:w-16 text-pink-300 mb-4" />
            <h2 className="text-xl md:text-2xl font-medium text-gray-700 mb-2">Chưa có đám cưới</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm md:text-base">
              Tạo website đám cưới đầu tiên của bạn
            </p>
            <Button 
              onClick={() => setCreateDialogOpen(true)}
              className="bg-pink-500 hover:bg-pink-600 shadow-lg"
            >
              Bắt đầu ngay
            </Button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${isMobileView ? '' : 'lg:grid-cols-4'} gap-4 md:gap-6`}>
            {/* Danh sách đám cưới */}
            <div className={`${isMobileView ? 'order-1' : 'lg:col-span-1'}`}>
              <Card className={`${isMobileView ? '' : 'sticky top-20'} bg-white/80 backdrop-blur-sm border-pink-200`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Đám cưới
                  </CardTitle>
                  <CardDescription>Chọn để quản lý</CardDescription>
                </CardHeader>
                <CardContent className={`space-y-1 ${isMobileView ? 'max-h-[250px]' : 'max-h-[400px]'} overflow-y-auto`}>
                  {weddings.map((wedding) => (
                    <div 
                      key={wedding.id} 
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        selectedWedding?.id === wedding.id 
                          ? "bg-pink-50 border-l-4 border-pink-500 shadow-sm" 
                          : "hover:bg-pink-25"
                      }`}
                      onClick={() => handleSelectWedding(wedding)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm md:text-base">
                            {wedding.groomName} & {wedding.brideName}
                          </h3>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {wedding.eventDate 
                                ? formatDate(wedding.eventDate.toDate()) 
                                : "Chưa có ngày"}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              wedding.eventDate && getTimeToWedding(wedding) !== "Đã diễn ra"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {wedding.eventDate ? getTimeToWedding(wedding) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-pink-200 hover:bg-pink-50" 
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Thêm mới
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Nội dung chính */}
            <div id="wedding-content" className={`${isMobileView ? 'order-2' : 'lg:col-span-3'}`}>
              {selectedWedding ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {selectedWedding.groomName} & {selectedWedding.brideName}
                      </h2>
                      <p className="text-gray-500 flex items-center text-sm">
                        <CalendarDays className="h-4 w-4 mr-1" />
                        {selectedWedding.eventDate 
                          ? `${formatDate(selectedWedding.eventDate.toDate())} (${getTimeToWedding(selectedWedding)})`
                          : "Chưa có ngày cưới"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-pink-200 hover:bg-pink-50"
                        onClick={() => handleNavigation(`/${selectedWedding.id}/template`)}
                      >
                        Xem website
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                        onClick={() => {
                          setWeddingToDelete(selectedWedding);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Tính năng chính với Tabs */}
                  <Tabs defaultValue="planner" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                      <TabsTrigger value="planner" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Planner
                      </TabsTrigger>
                      <TabsTrigger value="tools" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Công cụ
                      </TabsTrigger>
                      <TabsTrigger value="guests" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Khách mời
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="planner">
                      <WeddingPlannerAgent selectedWedding={selectedWedding} />
                    </TabsContent>
                    
                    <TabsContent value="tools">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Quản lý công việc */}
                        <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-pink-200 hover:border-pink-300">
                          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                              <CheckSquare className="h-5 w-5 text-pink-600" /> Công việc
                            </CardTitle>
                            <CardDescription>
                              Lập kế hoạch chuẩn bị
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="mb-4 text-sm md:text-base text-gray-600">
                              Theo dõi tiến độ chuẩn bị đám cưới
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={() => handleNavigation(`/${selectedWedding.id}/todo`)}
                              className="w-full bg-pink-500 hover:bg-pink-600 transition-all shadow-md"
                            >
                              Quản lý
                            </Button>
                          </CardFooter>
                        </Card>
                        
                        {/* Thiệp mời điện tử */}
                        <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-300">
                          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                              <FileText className="h-5 w-5 text-purple-600" /> Thiệp mời
                            </CardTitle>
                            <CardDescription>
                              Tạo thiệp điện tử
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="mb-4 text-sm md:text-base text-gray-600">
                              Thiết kế thiệp mời đẹp mắt
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              onClick={() => handleNavigation(`/create/template/${selectedWedding.id}`)}
                              className="w-full bg-purple-500 hover:bg-purple-600 transition-all shadow-md"
                            >
                              Thiết kế
                            </Button>
                          </CardFooter>
                        </Card>

                        {/* Quản lý thu chi */}
                        <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200">
                          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                              <CircleDollarSign className="h-5 w-5 text-gray-500" /> Thu chi
                            </CardTitle>
                            <CardDescription>
                              Theo dõi chi phí
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="mb-4 text-sm md:text-base text-gray-600">
                              Sắp ra mắt
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full bg-gray-400 cursor-not-allowed"
                              disabled
                            >
                              Sắp có
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="guests">
                      <GuestManagement selectedWedding={selectedWedding} />
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="text-center py-12 md:py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-pink-100">
                  <Heart className="mx-auto h-12 w-12 md:h-16 md:w-16 text-pink-300 mb-4" />
                  <h2 className="text-xl md:text-2xl font-medium text-gray-700 mb-2">Chọn đám cưới</h2>
                  <p className="text-gray-500 max-w-md mx-auto text-sm md:text-base">
                    Chọn một đám cưới để bắt đầu quản lý
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <FloatingActionButton page="dashboard" />
      <MusicFloatingButton position="top-left" />
    </div>
  );
} 