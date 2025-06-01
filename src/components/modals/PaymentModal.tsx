"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Crown, 
  X,
  Loader2,
  CheckCircle
} from "lucide-react";
import Image from 'next/image';

interface VipFeature {
  name: string;
  count: number;
  price: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string, paymentData: any) => void;
  vipFeatures: VipFeature[];
  totalAmount: number;
  isLoading?: boolean;
  loadingText?: string;
}

const PAYMENT_METHODS = [
  { 
    id: 'card', 
    name: 'Thẻ tín dụng/ghi nợ', 
    icon: CreditCard,
    description: 'Visa, MasterCard, JCB'
  },
  { 
    id: 'momo', 
    name: 'Ví MoMo', 
    icon: Smartphone,
    description: 'Thanh toán qua ví điện tử MoMo'
  },
  { 
    id: 'zalopay', 
    name: 'Ví ZaloPay', 
    icon: Smartphone,
    description: 'Thanh toán qua ví điện tử ZaloPay'
  },
  { 
    id: 'bank', 
    name: 'Chuyển khoản ngân hàng', 
    icon: Building2,
    description: 'Chuyển khoản trực tiếp'
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  vipFeatures,
  totalAmount,
  isLoading = false,
  loadingText = "Đang xử lý thanh toán..."
}: PaymentModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const handleConfirm = () => {
    const paymentData = selectedPaymentMethod === 'card' ? cardData : {};
    onConfirm(selectedPaymentMethod, paymentData);
  };

  if (!isOpen) return null;

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Thanh toán VIP</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* VIP Features Summary */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Crown className="w-5 h-5 text-yellow-500 mr-2" />
              Các tính năng VIP được chọn
            </h3>
            <div className="space-y-2">
              {vipFeatures.map((feature, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">
                      {feature.name} {feature.count > 1 && `(${feature.count})`}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      maximumFractionDigits: 0 
                    }).format(feature.price * feature.count)}
                  </span>
                </div>
              ))}
              
              <div className="border-t border-yellow-300 pt-2 mt-3">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-gray-900">Tổng cộng:</span>
                  <span className="text-rose-600">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      maximumFractionDigits: 0 
                    }).format(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Chọn phương thức thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <div key={method.id} className="relative">
                  <input
                    type="radio"
                    id={method.id}
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.id}
                    className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 peer-checked:border-pink-500 peer-checked:bg-pink-50 transition-colors"
                  >
                    <method.icon className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Card Details Form */}
          {selectedPaymentMethod === 'card' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">Thông tin thẻ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Số thẻ</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData(prev => ({ ...prev, cardNumber: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Ngày hết hạn</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cardholderName">Tên chủ thẻ</Label>
                  <Input
                    id="cardholderName"
                    placeholder="Tên như trên thẻ"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Info for other methods */}
          {selectedPaymentMethod !== 'card' && selectedMethod && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-700">
                <selectedMethod.icon className="w-5 h-5" />
                <span className="font-medium">{selectedMethod.name}</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Bạn sẽ được chuyển hướng đến trang thanh toán của 
                {selectedPaymentMethod === 'momo' && ' MoMo'}
                {selectedPaymentMethod === 'zalopay' && ' ZaloPay'}
                {selectedPaymentMethod === 'bank' && ' ngân hàng'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between rounded-b-xl">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || (selectedPaymentMethod === 'card' && !cardData.cardNumber)}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {loadingText}
              </>
            ) : (
              <>
                Thanh toán {new Intl.NumberFormat('vi-VN', { 
                  style: 'currency', 
                  currency: 'VND',
                  maximumFractionDigits: 0 
                }).format(totalAmount)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 