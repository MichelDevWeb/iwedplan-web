"use client";

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  type?: 'navigation' | 'api' | 'upload' | 'save' | 'delete' | 'default';
  progress?: number; // 0-100 for progress bar
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  message, 
  type = 'default',
  progress,
  className 
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case 'navigation':
        return {
          icon: <Heart className="w-8 h-8 text-pink-500" />,
          defaultMessage: "Đang chuyển trang...",
          bgColor: "bg-pink-50/80"
        };
      case 'api':
        return {
          icon: <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />,
          defaultMessage: "Đang xử lý dữ liệu...",
          bgColor: "bg-blue-50/80"
        };
      case 'upload':
        return {
          icon: <Sparkles className="w-8 h-8 text-purple-500" />,
          defaultMessage: "Đang tải lên...",
          bgColor: "bg-purple-50/80"
        };
      case 'save':
        return {
          icon: <Loader2 className="w-8 h-8 text-green-500 animate-spin" />,
          defaultMessage: "Đang lưu dữ liệu...",
          bgColor: "bg-green-50/80"
        };
      case 'delete':
        return {
          icon: <Loader2 className="w-8 h-8 text-red-500 animate-spin" />,
          defaultMessage: "Đang xoá...",
          bgColor: "bg-red-50/80"
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />,
          defaultMessage: "Đang tải...",
          bgColor: "bg-gray-50/80"
        };
    }
  };

  const content = getLoadingContent();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center",
            content.bgColor,
            "backdrop-blur-sm",
            className
          )}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center"
          >
            {/* Loading Icon */}
            <motion.div
              animate={{ 
                scale: type === 'navigation' ? [1, 1.2, 1] : 1,
                rotate: type === 'navigation' ? [0, 360] : 0
              }}
              transition={{ 
                duration: type === 'navigation' ? 2 : 0, 
                repeat: type === 'navigation' ? Infinity : 0,
                ease: "easeInOut"
              }}
              className="flex justify-center mb-4"
            >
              {content.icon}
            </motion.div>

            {/* Loading Message */}
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-gray-700 font-medium mb-4"
            >
              {message || content.defaultMessage}
            </motion.p>

            {/* Progress Bar */}
            {typeof progress === 'number' && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="w-full bg-gray-200 rounded-full h-2 mb-2"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "h-2 rounded-full",
                    type === 'navigation' ? "bg-pink-500" :
                    type === 'api' ? "bg-blue-500" :
                    type === 'upload' ? "bg-purple-500" :
                    type === 'save' ? "bg-green-500" :
                    type === 'delete' ? "bg-red-500" :
                    "bg-gray-500"
                  )}
                />
              </motion.div>
            )}

            {/* Progress Text */}
            {typeof progress === 'number' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                {Math.round(progress)}%
              </motion.p>
            )}

            {/* Animated dots for indefinite loading */}
            {typeof progress !== 'number' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center space-x-1"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      type === 'navigation' ? "bg-pink-500" :
                      type === 'api' ? "bg-blue-500" :
                      type === 'upload' ? "bg-purple-500" :
                      type === 'save' ? "bg-green-500" :
                      type === 'delete' ? "bg-red-500" :
                      "bg-gray-500"
                    )}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay; 