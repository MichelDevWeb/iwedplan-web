'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import CreateWeddingDialog from '@/components/modals/CreateWeddingModal';
import { getUserWeddings } from '@/lib/firebase/userService';
import LoadingScreen from '@/components/ui/loading-screen';
import { Plus } from 'lucide-react';

export default function TemplatePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [weddings, setWeddings] = useState<{id: string, groomName: string, brideName: string}[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  useEffect(() => {
    async function loadUserWeddings() {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
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
  
  if (loading) {
    return <LoadingScreen message="Đang tải dữ liệu đám cưới..." />;
  }
  
  if (redirecting) {
    return <LoadingScreen message="Đang chuyển hướng..." />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-pink-100 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 translate-x-1/2 translate-y-1/2"></div>
        
        <h1 className="text-3xl font-bold text-center mb-8 text-pink-600 relative z-10">
          Tạo mẫu website cưới
        </h1>
        
        {weddings.length > 0 ? (
          <div className="space-y-6 relative z-10">
            <h2 className="text-xl font-medium text-gray-700">Chọn đám cưới:</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Redirect to create/template button */}
              <div 
                className="border-2 border-dashed border-pink-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-pink-50 transition-all duration-300 cursor-pointer group hover:border-pink-400"
                onClick={() => router.push('/create/template')}
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mb-3 group-hover:bg-pink-200 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-lg text-pink-600 mb-1">Tạo mẫu mới</h3>
                <p className="text-sm text-gray-500 text-center group-hover:text-pink-600 transition-colors">Thiết kế website cưới từ đầu</p>
              </div>
              
              {weddings.map(wedding => (
                <div 
                  key={wedding.id}
                  className="border border-pink-100 rounded-lg p-4 hover:bg-pink-50 transition-all duration-300 cursor-pointer group hover:shadow-md"
                  onClick={() => handleSelectWedding(wedding.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-200 transition-colors">
                      <span className="text-lg">❤️</span>
                    </div>
                  <h3 className="font-medium text-lg text-pink-600">{wedding.groomName} & {wedding.brideName}</h3>
                  </div>
                  <p className="text-sm text-gray-500">ID: {wedding.id}</p>
                  <Button 
                    variant="outline" 
                    className="mt-3 w-full group-hover:bg-pink-50 group-hover:border-pink-200 transition-colors"
                  >
                    Chọn đám cưới này
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 relative z-10">
            <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
              <span className="text-3xl">❤️</span>
            </div>
            <p className="text-gray-600">
              Bạn chưa có đám cưới nào. Hãy tạo đám cưới mới để bắt đầu.
            </p>
            <Button 
              size="lg" 
              className="bg-pink-500 hover:bg-pink-600 transition-colors duration-300 shadow-md hover:shadow-lg"
              onClick={handleCreateWedding}
            >
              Tạo đám cưới mới
            </Button>
          </div>
        )}
      </div>
      
      <CreateWeddingDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
} 