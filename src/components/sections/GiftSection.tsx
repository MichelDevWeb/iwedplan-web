"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from 'lucide-react';
import copy from 'copy-to-clipboard';
import { toast } from "sonner"; // Import toast from sonner

// TODO: Replace with actual gift information
const giftInfo = {
  groom: {
    name: "Tên Chú Rể",
    bankName: "Ngân hàng XYZ",
    accountNumber: "1234567890",
    qrCodeSrc: "/images/iWedPlan.png", // TODO: Add QR code image
  },
  bride: {
    name: "Tên Cô Dâu",
    bankName: "Ngân hàng ABC",
    accountNumber: "0987654321",
    qrCodeSrc: "/images/iWedPlan.png", // TODO: Add QR code image
  },
};

const GiftSection = () => {

  const handleCopy = (text: string, name: string) => {
    if (copy(text)) {
      toast.success(`Đã sao chép số tài khoản của ${name}`);
    } else {
      toast.error("Sao chép thất bại!");
    }
  };

  return (
    <section id="gift" className="w-full py-16 flex flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-4 text-center animated fadeInDown">Hộp mừng cưới</h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl animated fadeInUp delay-1s">
        Thật vui vì được gặp và đón tiếp các bạn trong một dịp đặc biệt như đám cưới của chúng tôi.
        Sự hiện diện của bạn là món quà quý giá nhất. Nếu bạn muốn gửi quà mừng, thông tin dưới đây có thể hữu ích.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Groom Gift Info */}
        <Card className="shadow-md animated fadeInLeft delay-2s">
          <CardHeader>
            <CardTitle className="text-xl text-center">Mừng cưới Chú Rể</CardTitle>
            <CardDescription className="text-center">({giftInfo.groom.name})</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bank" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bank">Chuyển khoản</TabsTrigger>
                <TabsTrigger value="qr">Mã QR</TabsTrigger>
              </TabsList>
              <TabsContent value="bank" className="mt-4 space-y-2 text-sm">
                 <p><strong>Ngân hàng:</strong> {giftInfo.groom.bankName}</p>
                 <div className="flex items-center justify-between">
                    <p><strong>Số tài khoản:</strong> {giftInfo.groom.accountNumber}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(giftInfo.groom.accountNumber, giftInfo.groom.name)}
                      aria-label="Sao chép số tài khoản"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                 </div>
                 <p><strong>Chủ tài khoản:</strong> {giftInfo.groom.name}</p>
              </TabsContent>
              <TabsContent value="qr" className="mt-4 flex justify-center">
                {/* TODO: Replace with actual QR code image */}
                <Image
                    src={giftInfo.groom.qrCodeSrc}
                    alt={`QR Code mừng cưới ${giftInfo.groom.name}`}
                    width={200}
                    height={200}
                    className="object-contain"
                    // Add placeholder style if needed
                    // style={{ background: '#eee', padding: '10px' }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Bride Gift Info */}
        <Card className="shadow-md animated fadeInRight delay-2s">
          <CardHeader>
            <CardTitle className="text-xl text-center">Mừng cưới Cô Dâu</CardTitle>
            <CardDescription className="text-center">({giftInfo.bride.name})</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="bank" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bank">Chuyển khoản</TabsTrigger>
                <TabsTrigger value="qr">Mã QR</TabsTrigger>
              </TabsList>
              <TabsContent value="bank" className="mt-4 space-y-2 text-sm">
                <p><strong>Ngân hàng:</strong> {giftInfo.bride.bankName}</p>
                <div className="flex items-center justify-between">
                    <p><strong>Số tài khoản:</strong> {giftInfo.bride.accountNumber}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(giftInfo.bride.accountNumber, giftInfo.bride.name)}
                      aria-label="Sao chép số tài khoản"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p><strong>Chủ tài khoản:</strong> {giftInfo.bride.name}</p>
              </TabsContent>
              <TabsContent value="qr" className="mt-4 flex justify-center">
                {/* TODO: Replace with actual QR code image */}
                <Image
                    src={giftInfo.bride.qrCodeSrc}
                    alt={`QR Code mừng cưới ${giftInfo.bride.name}`}
                    width={200}
                    height={200}
                    className="object-contain"
                    // style={{ background: '#eee', padding: '10px' }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GiftSection; 