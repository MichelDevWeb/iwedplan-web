"use client";

import { useState } from 'react';
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
  onSave: () => Promise<void>;
  userWedID: string;
  hasVipFeatures: boolean;
  vipFeatures: VipFeature[];
  trigger: React.ReactNode;
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
  onSave, 
  userWedID, 
  hasVipFeatures, 
  vipFeatures,
  trigger
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Discount voucher states
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [voucherError, setVoucherError] = useState("");

  // Valid voucher codes (in a real app, this would come from a database)
  const validVouchers = {
    "IWEDVIP20": 20, // 20% off
    "IWEDPLAN10": 10, // 10% off
    "VIPWED30": 30, // 30% off
    "WEDDING50": 50  // 50% off
  };

  // Try to load voucher from localStorage
  useState(() => {
    const savedVoucher = localStorage.getItem('iwedplan_voucher');
    if (savedVoucher) {
      try {
        const voucher = JSON.parse(savedVoucher);
        setAppliedVoucher(voucher);
        setVoucherCode(voucher.code);
      } catch (e) {
        localStorage.removeItem('iwedplan_voucher');
      }
    }
  });

  // Apply voucher code
  const applyVoucher = () => {
    setVoucherError("");
    setIsApplyingVoucher(true);

    // Simulate network delay
    setTimeout(() => {
      const code = voucherCode.trim().toUpperCase();
      // @ts-ignore - this is for demo purposes
      const discountPercent = validVouchers[code];
      
      if (discountPercent) {
        const voucher = { code, discount: discountPercent };
        setAppliedVoucher(voucher);
        
        // Save voucher to localStorage for persistence
        localStorage.setItem('iwedplan_voucher', JSON.stringify(voucher));
      } else {
        setVoucherError("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }
      setIsApplyingVoucher(false);
    }, 800);
  };

  // Remove applied voucher
  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    localStorage.removeItem('iwedplan_voucher');
  };

  // Calculate total price
  const calculateOriginalPrice = () => {
    return vipFeatures.reduce((sum, feature) => sum + (feature.price * feature.count), 0);
  };

  const calculateDiscountAmount = () => {
    if (!appliedVoucher) return 0;
    return Math.round(calculateOriginalPrice() * (appliedVoucher.discount / 100));
  };

  const calculateFinalPrice = () => {
    return calculateOriginalPrice() - calculateDiscountAmount();
  };
  
  const handleConfirm = async () => {
    setIsProcessing(true);
    setError("");
    
    try {
      if (hasVipFeatures) {
        // Mock payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsPaymentSuccess(true);
        
        // Wait a moment to show success message before closing
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Continue with the actual save operation
      await onSave();
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi trong quá trình xử lý");
      setIsProcessing(false);
    }
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className={`sm:max-w-[${hasVipFeatures ? '500px' : '425px'}]`}>
        <DialogHeader>
          <DialogTitle>
            {hasVipFeatures ? (
              <div className="flex items-center">
                <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                Thanh toán tính năng VIP
              </div>
            ) : (
              "Xác nhận tạo website"
            )}
          </DialogTitle>
          <DialogDescription>
            {hasVipFeatures 
              ? "Hoàn tất thanh toán để kích hoạt tính năng VIP cho website cưới của bạn."
              : "Xác nhận tạo website cưới với các tùy chỉnh đã chọn."}
          </DialogDescription>
        </DialogHeader>
        
        {hasVipFeatures && !isPaymentSuccess && (
          <div className="space-y-4 py-2">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <h3 className="font-medium text-sm mb-2 text-yellow-800">Tính năng VIP đã chọn:</h3>
              <ul className="space-y-2">
                {vipFeatures.map((feature, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span>{feature.name}{feature.count > 1 ? ` x${feature.count}` : ''}</span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(feature.price * feature.count)}</span>
                  </li>
                ))}
                
                {/* Show discount if voucher is applied */}
                {appliedVoucher && (
                  <li className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      Giảm giá ({appliedVoucher.discount}%)
                    </span>
                    <span className="font-medium">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateDiscountAmount())}</span>
                  </li>
                )}
                
                <li className="flex justify-between font-medium pt-2 border-t border-yellow-200">
                  <span>Tổng cộng</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateFinalPrice())}</span>
                </li>
              </ul>
            </div>
            
            {/* Voucher section */}
            <div className="border rounded-lg p-3">
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Ticket className="w-4 h-4 mr-1" /> Mã giảm giá
              </Label>
              
              {!appliedVoucher ? (
                <div className="flex gap-2 mt-1.5">
                  <Input 
                    placeholder="Nhập mã giảm giá" 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="text-sm flex-1"
                  />
                  <Button 
                    onClick={applyVoucher}
                    disabled={!voucherCode || isApplyingVoucher}
                    size="sm"
                  >
                    {isApplyingVoucher ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Áp dụng"
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 rounded-md p-2 mt-1.5 border border-green-200">
                  <div>
                    <div className="text-sm font-medium text-green-700 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      {appliedVoucher.code}
                    </div>
                    <p className="text-xs text-green-600">Giảm {appliedVoucher.discount}% tổng hóa đơn</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeVoucher} 
                    className="h-7 w-7 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {voucherError && (
                <p className="text-xs text-red-500 mt-1.5">{voucherError}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Chọn phương thức thanh toán:</Label>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_PAYMENT_METHODS.map(method => (
                  <div 
                    key={method.id}
                    className={`border rounded-lg p-2 flex items-center cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="w-8 h-8 relative flex-shrink-0 bg-white rounded-md flex items-center justify-center">
                      {method.icon ? (
                        <Image
                          src={method.icon}
                          alt={method.name}
                          width={24}
                          height={24}
                          className="object-contain"
                          onError={(e) => {
                            // Fallback if image doesn't exist
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="ml-2 text-sm">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {isPaymentSuccess && (
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-800">Thanh toán thành công!</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Các tính năng VIP đã được kích hoạt cho website cưới của bạn.
            </p>
          </div>
        )}
        
        {!hasVipFeatures && (
          <div className="py-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                Website cưới của bạn sẽ được tạo với các tính năng miễn phí. Bạn có thể nâng cấp lên gói VIP sau nếu muốn.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={isProcessing}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing || isPaymentSuccess}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                {hasVipFeatures ? "Đang xử lý..." : "Đang tạo..."}
              </>
            ) : (
              <>
                {hasVipFeatures ? "Thanh toán" : "Tạo website"} <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 