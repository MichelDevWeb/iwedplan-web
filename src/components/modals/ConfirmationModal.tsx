"use client";

import { useState, ReactNode } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Crown, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  Ticket,
  X,
  Tag
} from "lucide-react";
import Image from 'next/image';

interface VipFeature {
  name: string;
  count: number;
  price: number;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  loadingText?: string;
}

const MOCK_PAYMENT_METHODS = [
  { id: 'card', name: 'Thẻ tín dụng/ghi nợ', icon: '/images/payment/visa-mastercard.png' },
  { id: 'momo', name: 'Ví MoMo', icon: '/images/payment/momo.png' },
  { id: 'vnpay', name: 'VNPay', icon: '/images/payment/vnpay.png' },
  { id: 'bank', name: 'Chuyển khoản ngân hàng', icon: '/images/payment/bank.png' },
];

// For demo purposes, these images don't need to exist in the actual project
// The modal will still render with placeholders

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
  isLoading = false,
  loadingText = "Đang xử lý..."
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className={`text-lg font-semibold mb-4 ${
          variant === "destructive" ? "text-red-600" : "text-gray-900"
        }`}>
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {loadingText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 