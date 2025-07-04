"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { 
  Download, 
  X, 
  Smartphone, 
  MonitorSpeaker,
  Share,
  Plus,
  Menu
} from 'lucide-react';

interface PWAInstallBannerProps {
  className?: string;
}

export default function PWAInstallBanner({ className = '' }: PWAInstallBannerProps) {
  const { canInstall, installPWA, getInstallInstructions, isInstalled } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show banner if app can be installed and user hasn't dismissed it
    const isDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
    
    if (canInstall && !isDismissed && !isInstalled) {
      // Delay showing banner to not interrupt user experience
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // Show after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowBanner(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
    } else {
      // If automatic install fails, show manual instructions
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  const instructions = getInstallInstructions();

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Banner */}
      <Card className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md shadow-lg border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">
                Cài đặt ứng dụng iWedplan
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                Truy cập nhanh hơn, hoạt động offline và nhận thông báo!
              </p>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white h-8 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Cài đặt
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleShowInstructions}
                  className="h-8 text-xs text-gray-600"
                >
                  Hướng dẫn
                </Button>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="flex-shrink-0 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-pink-500" />
              Cách cài đặt ứng dụng
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Để cài đặt ứng dụng iWedplan trên <strong>{instructions.platform}</strong>:</p>
            </div>
            
            <div className="space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{step}</p>
                </div>
              ))}
            </div>
            
            {/* Visual guides */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 text-sm mb-2">
                Biểu tượng cần tìm:
              </h4>
              <div className="flex gap-4 justify-center">
                {instructions.platform.includes('Safari') && (
                  <div className="text-center">
                    <Share className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                    <p className="text-xs text-gray-600">Chia sẻ</p>
                  </div>
                )}
                {instructions.platform.includes('Chrome') && (
                  <div className="text-center">
                    <Menu className="h-6 w-6 mx-auto text-gray-500 mb-1" />
                    <p className="text-xs text-gray-600">Menu</p>
                  </div>
                )}
                <div className="text-center">
                  <Plus className="h-6 w-6 mx-auto text-green-500 mb-1" />
                  <p className="text-xs text-gray-600">Thêm vào</p>
                </div>
                <div className="text-center">
                  <MonitorSpeaker className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs text-gray-600">Màn hình</p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={() => setShowInstructions(false)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 