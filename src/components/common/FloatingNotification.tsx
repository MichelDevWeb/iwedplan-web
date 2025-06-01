"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  X, Gift, Percent, Bell, AlertTriangle, Info, CheckCircle, 
  Star, Heart, Sparkles, Tag, Megaphone, Crown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface NotificationData {
  id: string;
  type: 'sale' | 'voucher' | 'system' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  dismissible?: boolean;
  duration?: number; // in milliseconds, 0 means persistent
  icon?: React.ComponentType<any>;
  priority?: 'low' | 'medium' | 'high';
}

interface FloatingNotificationProps {
  notifications?: NotificationData[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxVisible?: number;
}

// Default notifications for different scenarios
const defaultNotifications: NotificationData[] = [
  {
    id: 'sale-tet-2024',
    type: 'sale',
    title: '🎉 SALE TẾT 2024',
    message: 'Giảm giá 50% tất cả gói VIP! Chỉ còn 3 ngày cuối cùng để tận hưởng ưu đãi đặc biệt.',
    ctaText: 'Mua ngay',
    ctaLink: '#pricing',
    dismissible: true,
    duration: 0,
    priority: 'high'
  },
  {
    id: 'voucher-new-user',
    type: 'voucher',
    title: 'Voucher cho người dùng mới',
    message: 'Nhận ngay mã giảm giá 30% cho website cưới đầu tiên của bạn!',
    ctaText: 'Nhận voucher',
    ctaLink: '/create/template',
    dismissible: true,
    duration: 15000,
    priority: 'medium'
  },
  {
    id: 'system-maintenance',
    type: 'system',
    title: 'Bảo trì hệ thống',
    message: 'Hệ thống sẽ bảo trì từ 2:00 - 4:00 sáng ngày mai để nâng cấp tính năng.',
    dismissible: true,
    duration: 10000,
    priority: 'medium'
  },
  {
    id: 'feature-music',
    type: 'info',
    title: 'Tính năng mới: Nhạc nền',
    message: 'Bây giờ bạn có thể thêm nhạc nền cho website cưới của mình!',
    ctaText: 'Khám phá',
    ctaLink: '/create/template',
    dismissible: true,
    duration: 12000,
    priority: 'low'
  }
];

const getNotificationStyles = (type: NotificationData['type']) => {
  const baseStyles = "relative overflow-hidden";
  
  switch (type) {
    case 'sale':
      return {
        container: `${baseStyles} bg-gradient-to-r from-red-500 to-pink-500 text-white`,
        icon: Star,
        iconColor: 'text-yellow-300',
        accent: 'bg-yellow-300'
      };
    case 'voucher':
      return {
        container: `${baseStyles} bg-gradient-to-r from-purple-500 to-pink-500 text-white`,
        icon: Gift,
        iconColor: 'text-yellow-200',
        accent: 'bg-yellow-200'
      };
    case 'system':
      return {
        container: `${baseStyles} bg-gradient-to-r from-blue-500 to-cyan-500 text-white`,
        icon: Bell,
        iconColor: 'text-blue-100',
        accent: 'bg-blue-100'
      };
    case 'info':
      return {
        container: `${baseStyles} bg-gradient-to-r from-indigo-500 to-purple-500 text-white`,
        icon: Info,
        iconColor: 'text-indigo-100',
        accent: 'bg-indigo-100'
      };
    case 'warning':
      return {
        container: `${baseStyles} bg-gradient-to-r from-orange-500 to-red-500 text-white`,
        icon: AlertTriangle,
        iconColor: 'text-orange-100',
        accent: 'bg-orange-100'
      };
    case 'success':
      return {
        container: `${baseStyles} bg-gradient-to-r from-green-500 to-emerald-500 text-white`,
        icon: CheckCircle,
        iconColor: 'text-green-100',
        accent: 'bg-green-100'
      };
    default:
      return {
        container: `${baseStyles} bg-gradient-to-r from-gray-500 to-gray-600 text-white`,
        icon: Bell,
        iconColor: 'text-gray-100',
        accent: 'bg-gray-100'
      };
  }
};

const getPositionStyles = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'fixed top-4 right-4 z-50';
    case 'top-left':
      return 'fixed top-4 left-4 z-50';
    case 'bottom-right':
      return 'fixed bottom-4 right-4 z-50';
    case 'bottom-left':
      return 'fixed bottom-4 left-4 z-50';
    case 'top-center':
      return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
    default:
      return 'fixed top-4 right-4 z-50';
  }
};

const FloatingNotification: React.FC<FloatingNotificationProps> = ({
  notifications = defaultNotifications,
  position = 'top-right',
  maxVisible = 3
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<NotificationData[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed-notifications');
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)));
    }
  }, []);

  // Filter and sort notifications
  useEffect(() => {
    const activeNotifications = notifications
      .filter(notification => !dismissedIds.has(notification.id))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority || 'low'] - priorityOrder[a.priority || 'low']);
      })
      .slice(0, maxVisible);

    setVisibleNotifications(activeNotifications);
  }, [notifications, dismissedIds, maxVisible]);

  // Auto-dismiss notifications with duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleNotifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleNotifications]);

  const handleDismiss = (id: string) => {
    const newDismissedIds = new Set(dismissedIds);
    newDismissedIds.add(id);
    setDismissedIds(newDismissedIds);
    
    // Save to localStorage
    localStorage.setItem('dismissed-notifications', JSON.stringify(Array.from(newDismissedIds)));
  };

  const handleCTAClick = (notification: NotificationData) => {
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
    
    // Auto-dismiss after CTA click
    if (notification.dismissible) {
      handleDismiss(notification.id);
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getPositionStyles(position)}>
      <div className="space-y-3 w-80 max-w-sm">
        <AnimatePresence>
          {visibleNotifications.map((notification, index) => {
            const styles = getNotificationStyles(notification.type);
            const IconComponent = notification.icon || styles.icon;
            
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className={cn(
                  styles.container,
                  "rounded-lg shadow-lg p-4 backdrop-blur-sm border border-white/20"
                )}
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <motion.div
                    className="absolute -top-1 -right-1 w-20 h-20 bg-white/10 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <IconComponent className={cn("w-5 h-5", styles.iconColor)} />
                      </motion.div>
                      <h4 className="font-bold text-sm leading-tight">{notification.title}</h4>
                      {notification.type === 'sale' && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Crown className="w-4 h-4 text-yellow-300" />
                        </motion.div>
                      )}
                    </div>
                    
                    {notification.dismissible && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
                        onClick={() => handleDismiss(notification.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-white/90 mb-3 leading-relaxed">
                    {notification.message}
                  </p>

                  {notification.ctaText && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-200"
                        onClick={() => handleCTAClick(notification)}
                      >
                        {notification.ctaText}
                        {notification.type === 'sale' && (
                          <Sparkles className="w-3 h-3 ml-1" />
                        )}
                        {notification.type === 'voucher' && (
                          <Tag className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Priority indicator */}
                  {notification.priority === 'high' && (
                    <motion.div
                      className="absolute top-2 right-8 w-2 h-2 bg-yellow-300 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Accent border */}
                <div className={cn("absolute bottom-0 left-0 w-full h-1", styles.accent)} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FloatingNotification; 