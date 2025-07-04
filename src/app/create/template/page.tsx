'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Home, Crown, User, FileText } from 'lucide-react';
import CreateWeddingDialog from '@/components/modals/CreateWeddingModal';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import HeaderNotificationBar from '@/components/common/HeaderNotificationBar';
import LoadingScreen from '@/components/ui/loading-screen';
import { getUserWeddings, isSuperUser } from '@/lib/firebase/userService';
import { deleteWeddingWebsite } from '@/lib/firebase/weddingService';
import { toast } from 'sonner';

interface WeddingItem {
  id: string;
  groomName: string;
  brideName: string;
  ownerId?: string;
  createdAt?: any;
}

export default function TemplatePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [weddings, setWeddings] = useState<WeddingItem[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isSuper, setIsSuper] = useState(false);
  
  useEffect(() => {
    async function loadUserWeddings() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        
        // Check if user is super user
        const superStatus = await isSuperUser(user.uid);
        setIsSuper(superStatus);
        
        const userWeddings = await getUserWeddings(user.uid);
        setWeddings(userWeddings);
      } catch (error) {
        console.error('Error loading user weddings:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAuthenticated) {
      loadUserWeddings();
    }
  }, [user, isAuthenticated, router]);
  
  const handleCreateWedding = () => {
    setShowCreateDialog(true);
  };
  
  const handleSelectWedding = (weddingId: string) => {
    setRedirecting(true);
    setTimeout(() => {
      router.push(`/create/template/${weddingId}`);
    }, 300); // Small delay for loading animation
  };

  const handleDeleteWedding = async () => {
    if (!showDeleteModal) return;
    
    try {
      setDeleting(showDeleteModal);
      await deleteWeddingWebsite(showDeleteModal, user?.uid);
      
      // Remove from local state
      setWeddings(prev => prev.filter(w => w.id !== showDeleteModal));
      
      toast.success('Đã xoá website cưới thành công');
    } catch (error) {
      console.error('Error deleting wedding:', error);
      toast.error('Không thể xoá website cưới. Vui lòng thử lại.');
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const confirmDelete = (weddingId: string) => {
    setShowDeleteModal(weddingId);
  };

  const handleGoHome = () => {
    setNavigationLoading(true);
    router.push('/landing');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };
  
  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu đám cưới..." />;
  }
  
  if (redirecting) {
    return <LoadingScreen message="Đang chuyển hướng..." />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* Header Notification Bar */}
      <HeaderNotificationBar />
      
      {/* Loading Screens */}
      {navigationLoading && (
        <LoadingScreen 
          message="Đang chuyển về trang chủ..."
        />
      )}
      
      {deleting !== null && (
        <LoadingScreen 
          message="Đang xoá website cưới..."
        />
      )}
      
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with navigation */}
          <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-pink-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
            
            {/* Navigation buttons */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoHome}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Trang chủ
                </Button>
                
                {isSuper && (
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    <Crown className="h-3 w-3 mr-1" />
                    Super User
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleCreateWedding}
                className="bg-pink-500 hover:bg-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo thiệp mới
              </Button>
            </div>
            
            <div className="text-center relative z-10">
              <h1 className="text-3xl font-bold mb-2 text-pink-600">
                Quản lý Thiệp mời
              </h1>
              <p className="text-gray-600">
                {isSuper ? 'Tạo và quản lý tất cả thiệp mời trong hệ thống' : 'Tạo và quản lý thiệp mời điện tử của bạn'}
              </p>
            </div>
          </div>

          {/* Wedding Templates Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-pink-500" />
                <h2 className="text-xl font-semibold text-gray-800">
                  {isSuper ? `Tất cả thiệp mời (${weddings.length})` : `Thiệp mời của bạn (${weddings.length})`}
                </h2>
              </div>
              {weddings.length === 0 && (
                <Button 
                  onClick={handleCreateWedding}
                  variant="outline"
                  className="text-pink-600 border-pink-300 hover:bg-pink-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo thiệp đầu tiên
                </Button>
              )}
            </div>
            
            {weddings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weddings.map(wedding => (
                  <div 
                    key={wedding.id}
                    className="border border-pink-100 rounded-lg p-4 hover:bg-pink-50 transition-all duration-300 group hover:shadow-md relative"
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(wedding.id);
                      }}
                      disabled={deleting === wedding.id}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors z-10"
                    >
                      {deleting === wedding.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleSelectWedding(wedding.id)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 pr-8">
                          <h3 className="font-medium text-lg text-pink-600 truncate">
                            {wedding.groomName} & {wedding.brideName}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {wedding.id}</p>
                          {wedding.createdAt && (
                            <p className="text-xs text-gray-400">
                              Tạo: {formatDate(wedding.createdAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Super User: Show owner info */}
                      {isSuper && wedding.ownerId && (
                        <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
                          <div className="flex items-center text-blue-700">
                            <User className="h-3 w-3 mr-1" />
                            <span className="font-medium">Owner:</span>
                            <span className="ml-1 truncate">{wedding.ownerId}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 group-hover:bg-pink-50 group-hover:border-pink-200 transition-colors"
                        >
                          Chỉnh sửa thiệp
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/${wedding.id}`, '_blank');
                          }}
                        >
                          Xem trước
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
                  <FileText className="h-10 w-10" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isSuper ? 'Chưa có thiệp mời nào trong hệ thống' : 'Bạn chưa có thiệp mời nào'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isSuper ? 'Hệ thống chưa có thiệp mời nào được tạo.' : 'Hãy tạo thiệp mời đầu tiên của bạn để bắt đầu.'}
                </p>
                <Button 
                  size="lg" 
                  className="bg-pink-500 hover:bg-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                  onClick={handleCreateWedding}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Tạo thiệp mời
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateWeddingDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteWedding}
        title="Xác nhận xoá"
        message="Bạn có chắc chắn muốn xoá thiệp mời này không? Hành động này không thể hoàn tác và sẽ xoá tất cả dữ liệu liên quan."
        confirmText="Xoá thiệp"
        cancelText="Hủy"
        variant="destructive"
        isLoading={!!deleting}
        loadingText="Đang xoá..."
      />
    </div>
  );
} 