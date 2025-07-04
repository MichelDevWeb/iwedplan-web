"use client";

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (iOS Safari)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check for PWA mode (Android Chrome)
      const isPWA = (window.navigator as any).standalone || isStandalone;
      
      setIsInstalled(isPWA);
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      console.log('PWA was installed');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Initial check
    checkIfInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  };

  const canInstall = () => {
    return isInstallable && !isInstalled;
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      // iOS Safari
      return {
        platform: 'iOS Safari',
        steps: [
          'Nhấn vào nút "Chia sẻ" ở dưới cùng',
          'Chọn "Thêm vào Màn hình chính"',
          'Nhấn "Thêm" để cài đặt ứng dụng'
        ]
      };
    } else if (userAgent.includes('chrome')) {
      // Chrome (Android/Desktop)
      return {
        platform: 'Chrome',
        steps: [
          'Nhấn vào menu (3 chấm) ở góc trên bên phải',
          'Chọn "Cài đặt ứng dụng" hoặc "Add to Home screen"',
          'Nhấn "Cài đặt" để hoàn tất'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      // Firefox
      return {
        platform: 'Firefox',
        steps: [
          'Nhấn vào menu (3 gạch) ở góc trên bên phải',
          'Chọn "Cài đặt ứng dụng web"',
          'Nhấn "Cài đặt" để hoàn tất'
        ]
      };
    } else {
      // Other browsers
      return {
        platform: 'Trình duyệt khác',
        steps: [
          'Tìm tùy chọn "Cài đặt ứng dụng" trong menu trình duyệt',
          'Hoặc thêm trang web vào màn hình chính',
          'Theo hướng dẫn của trình duyệt để cài đặt'
        ]
      };
    }
  };

  return {
    isInstallable,
    isInstalled,
    canInstall: canInstall(),
    installPWA,
    getInstallInstructions,
  };
}; 