"use client";

import React from 'react';
import Image from 'next/image';
import { Copy, QrCode, CreditCard } from 'lucide-react';
import { toast } from "sonner";

const giftInfo = {
  groom: {
    name: "Tên Chú Rể",
    bankName: "Ngân hàng XYZ",
    accountNumber: "1234567890",
    qrCodeSrc: "/images/album/hero.png",
  },
  bride: {
    name: "Tên Cô Dâu",
    bankName: "Ngân hàng ABC",
    accountNumber: "0987654321",
    qrCodeSrc: "/images/album/hero.png",
  },
};

const GiftSection = () => {
  const handleCopy = (text: string, name: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`Đã sao chép số tài khoản của ${name}`);
    }).catch(() => {
      toast.error("Sao chép thất bại!");
    });
  };

  return (
    <section 
      id="gift" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="hidden md:block absolute top-0 left-0 w-24 h-24 opacity-60 sway">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="hidden md:block absolute top-0 right-0 w-24 h-24 opacity-60 transform rotate-90 sway delay-1s">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="relative mb-16 text-center">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block animated fadeInDown">
            Hộp Mừng Cưới
          </h2>
          <p className="text-center text-gray-600 mt-6 max-w-2xl mx-auto animated fadeInUp delay-1s">
            Thật vui vì được gặp và đón tiếp các bạn trong một dịp đặc biệt như đám cưới của chúng tôi.
            Sự hiện diện của bạn là món quà quý giá nhất. Nếu bạn muốn gửi quà mừng, thông tin dưới đây có thể hữu ích.
          </p>
          <div className="absolute left-1/2 transform -translate-x-1/2 rotate-180 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Gift Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Groom Card */}
          <div className="relative group animated fadeInLeft">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-script text-rose-700 mb-2">Mừng Cưới Chú Rể</h3>
                <p className="text-gray-600 mb-6">({giftInfo.groom.name})</p>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Ngân hàng</span>
                    <span className="font-medium text-gray-800">{giftInfo.groom.bankName}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Số tài khoản</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{giftInfo.groom.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(giftInfo.groom.accountNumber, giftInfo.groom.name)}
                        className="p-1 rounded-full hover:bg-rose-100 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Chủ tài khoản</span>
                    <span className="font-medium text-gray-800">{giftInfo.groom.name}</span>
                  </div>

                  <div className="mt-6 p-4 bg-rose-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <QrCode className="w-5 h-5 text-rose-600" />
                      <span className="text-gray-600">Quét mã QR</span>
                    </div>
                    <div className="relative w-48 h-48 mx-auto">
                      <Image
                        src={giftInfo.groom.qrCodeSrc}
                        alt={`QR Code mừng cưới ${giftInfo.groom.name}`}
                        fill
                        sizes="192px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bride Card */}
          <div className="relative group animated fadeInRight">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 mb-6 rounded-full bg-rose-100 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-script text-rose-700 mb-2">Mừng Cưới Cô Dâu</h3>
                <p className="text-gray-600 mb-6">({giftInfo.bride.name})</p>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Ngân hàng</span>
                    <span className="font-medium text-gray-800">{giftInfo.bride.bankName}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Số tài khoản</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{giftInfo.bride.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(giftInfo.bride.accountNumber, giftInfo.bride.name)}
                        className="p-1 rounded-full hover:bg-rose-100 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                    <span className="text-gray-600">Chủ tài khoản</span>
                    <span className="font-medium text-gray-800">{giftInfo.bride.name}</span>
                  </div>

                  <div className="mt-6 p-4 bg-rose-50 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <QrCode className="w-5 h-5 text-rose-600" />
                      <span className="text-gray-600">Quét mã QR</span>
                    </div>
                    <div className="relative w-48 h-48 mx-auto">
                      <Image
                        src={giftInfo.bride.qrCodeSrc}
                        alt={`QR Code mừng cưới ${giftInfo.bride.name}`}
                        fill
                        sizes="192px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decoration */}
        <div className="mt-16 flex justify-center">
          <div className="w-48 md:w-72 h-8 opacity-70">
            <Image 
              src="/images/heart-divider.png" 
              alt="Heart divider" 
              width={500}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftSection; 