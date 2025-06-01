"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  X, Gift, Percent, Bell, AlertTriangle, Info, 
  Star, Sparkles, Tag, Megaphone, Crown, Timer
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface HeaderNotificationData {
  id: string;
  type: 'sale' | 'voucher' | 'system' | 'info' | 'warning';
  title: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  dismissible?: boolean;
  expiresAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  backgroundColor?: string;
  textColor?: string;
}

interface HeaderNotificationBarProps {
  notifications?: HeaderNotificationData[];
  autoRotate?: boolean;
  rotateInterval?: number; // in milliseconds
  animationDuration?: number;
}

// Default header notifications
const defaultHeaderNotifications: HeaderNotificationData[] = [
  {
    id: 'sale-tet-2024',
    type: 'sale',
    title: '🎉 FLASH SALE TẾT 2024',
    message: 'Giảm ngay 50% tất cả gói VIP! Chỉ còn 48 giờ cuối cùng - Số lượng có hạn!',
    ctaText: 'Mua ngay',
    ctaLink: '#pricing',
    dismissible: true,
    expiresAt: new Date('2024-02-15'),
    priority: 'high',
    backgroundColor: 'bg-gradient-to-r from-red-600 to-pink-600',
    textColor: 'text-white'
  },
  {
    id: 'voucher-valentine',
    type: 'voucher',
    title: '💝 VALENTINE SPECIAL',
    message: 'Nhận ngay voucher 300K cho cặp đôi đăng ký mới - Miễn phí giao hàng toàn quốc!',
    ctaText: 'Nhận voucher',
    ctaLink: '/create/template',
    dismissible: true,
    priority: 'high',
    backgroundColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
    textColor: 'text-white'
  },
  {
    id: 'system-maintenance',
    type: 'system',
    title: '🔧 Thông báo bảo trì',
    message: 'Hệ thống sẽ bảo trì từ 02:00 - 04:00 ngày mai để nâng cấp tính năng mới',
    dismissible: true,
    priority: 'medium',
    backgroundColor: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    textColor: 'text-white'
  },
  {
    id: 'feature-ai-suggest',
    type: 'info',
    title: '✨ Tính năng mới',
    message: 'AI đề xuất template tự động dựa trên phong cách cưới của bạn - Hãy thử ngay!',
    ctaText: 'Khám phá',
    ctaLink: '/create/template',
    dismissible: true,
    priority: 'low',
    backgroundColor: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    textColor: 'text-white'
  }
];

const getNotificationIcon = (type: HeaderNotificationData['type']) => {
  switch (type) {
    case 'sale':
      return <Star className="w-5 h-5" />;
    case 'voucher':
      return <Gift className="w-5 h-5" />;
    case 'system':
      return <Bell className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Megaphone className="w-5 h-5" />;
  }
};

const HeaderNotificationBar: React.FC<HeaderNotificationBarProps> = ({
  notifications = defaultHeaderNotifications,
  autoRotate = true,
  rotateInterval = 8000,
  animationDuration = 500
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(true);

  // Filter out dismissed and expired notifications
  const activeNotifications = notifications.filter(notification => {
    if (dismissedIds.has(notification.id)) return false;
    if (notification.expiresAt && new Date() > notification.expiresAt) return false;
    return true;
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
  });

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed-header-notifications');
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }
  }, []);

  // Auto-rotate notifications
  useEffect(() => {
    if (!autoRotate || activeNotifications.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, activeNotifications.length]);

  // Reset index if it exceeds array length
  useEffect(() => {
    if (currentIndex >= activeNotifications.length && activeNotifications.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, activeNotifications.length]);

  const handleDismiss = (id: string) => {
    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(id);
    setDismissedIds(newDismissedIds);
    
    // Save to localStorage
    localStorage.setItem('dismissed-header-notifications', JSON.stringify(Array.from(newDismissedIds)));
  };

  const handleCTAClick = (notification: HeaderNotificationData) => {
    if (notification.ctaLink) {
      if (notification.ctaLink.startsWith('#')) {
        // Scroll to section
        const element = document.querySelector(notification.ctaLink);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Navigate to page
        window.location.href = notification.ctaLink;
      }
    }
  };

  const hideBar = () => {
    setIsVisible(false);
  };

  if (!isVisible || activeNotifications.length === 0) {
    return null;
  }

  const currentNotification = activeNotifications[currentIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentNotification?.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: animationDuration / 1000 }}
        className={cn(
          "relative w-full overflow-hidden",
          currentNotification?.backgroundColor || "bg-gradient-to-r from-pink-600 to-purple-600"
        )}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-2 -right-10 w-20 h-20 bg-white/10 rounded-full"
            animate={{
              x: [0, 20, 0],
              y: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-10 w-16 h-16 bg-white/10 rounded-full"
            animate={{
              x: [0, -15, 0],
              y: [0, 10, 0],
              scale: [1.1, 1, 1.1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <div className={cn(
          "relative z-10 px-4 py-3",
          currentNotification?.textColor || "text-white"
        )}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Icon with animation */}
              <motion.div
                animate={{ 
                  rotate: currentNotification?.type === 'sale' ? [0, 10, -10, 0] : 0,
                  scale: currentNotification?.type === 'sale' ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  duration: currentNotification?.type === 'sale' ? 2 : 0, 
                  repeat: currentNotification?.type === 'sale' ? Infinity : 0 
                }}
                className="flex-shrink-0"
              >
                {getNotificationIcon(currentNotification?.type)}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center sm:space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-sm sm:text-base">
                      {currentNotification?.title}
                    </h4>
                    {currentNotification?.priority === 'high' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Crown className="w-4 h-4 text-yellow-300" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm sm:text-base opacity-90 truncate">
                    {currentNotification?.message}
                  </p>
                </motion.div>
              </div>

              {/* CTA Button */}
              {currentNotification?.ctaText && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 border-white/30 hover:border-white/50 text-white font-medium"
                    onClick={() => handleCTAClick(currentNotification)}
                  >
                    {currentNotification.ctaText}
                    {currentNotification.type === 'sale' && (
                      <Sparkles className="w-3 h-3 ml-1" />
                    )}
                    {currentNotification.type === 'voucher' && (
                      <Tag className="w-3 h-3 ml-1" />
                    )}
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Navigation dots for multiple notifications */}
            {activeNotifications.length > 1 && (
              <div className="hidden sm:flex items-center space-x-1 mx-4">
                {activeNotifications.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-200",
                      index === currentIndex 
                        ? "bg-white" 
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            )}

            {/* Close buttons */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {currentNotification?.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
                  onClick={() => handleDismiss(currentNotification.id)}
                  title="Ẩn thông báo này"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
                onClick={hideBar}
                title="Ẩn thanh thông báo"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar for auto-rotation */}
        {autoRotate && activeNotifications.length > 1 && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/30"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: rotateInterval / 1000,
              ease: "linear",
              repeat: Infinity
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HeaderNotificationBar; 