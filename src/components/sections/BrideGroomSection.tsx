import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: Replace with actual Bride & Groom data
const coupleInfo = {
  groom: {
    name: "Tên Chú Rể",
    title: "Chú Rể",
    imageSrc: "/images/iWedPlan.png", // TODO: Add groom photo
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce vitae arcu ut est finibus dignissim.",
  },
  bride: {
    name: "Tên Cô Dâu",
    title: "Cô Dâu",
    imageSrc: "/images/iWedPlan.png", // TODO: Add bride photo
    description:
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
  },
};

const BrideGroomSection = () => {
  return (
    <section id="bridegroom" className="w-full py-16 flex flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-12 text-center animated fadeInDown">Cô Dâu & Chú Rể</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-4xl">
        {/* Groom Info Card */}
        <Card className="shadow-md overflow-hidden flex flex-col items-center text-center animated fadeInLeft">
          <CardHeader className="pb-2">
             <CardTitle className="text-2xl text-pink-600">{coupleInfo.groom.title}</CardTitle>
             <CardDescription>{coupleInfo.groom.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-6 pb-6">
            <div className="mb-4 w-48 h-48 relative rounded-full overflow-hidden border-4 border-pink-100">
                <Image
                    src={coupleInfo.groom.imageSrc}
                    alt={`Ảnh ${coupleInfo.groom.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    // TODO: Add placeholder style or image
                    // style={{ background: '#eee' }}
                />
            </div>
            <p className="text-sm text-gray-600">
              {coupleInfo.groom.description}
            </p>
          </CardContent>
        </Card>

        {/* Bride Info Card */}
        <Card className="shadow-md overflow-hidden flex flex-col items-center text-center animated fadeInRight">
          <CardHeader className="pb-2">
             <CardTitle className="text-2xl text-pink-600">{coupleInfo.bride.title}</CardTitle>
             <CardDescription>{coupleInfo.bride.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center px-6 pb-6">
             <div className="mb-4 w-48 h-48 relative rounded-full overflow-hidden border-4 border-pink-100">
                 <Image
                    src={coupleInfo.bride.imageSrc}
                    alt={`Ảnh ${coupleInfo.bride.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    // TODO: Add placeholder style or image
                    // style={{ background: '#eee' }}
                />
             </div>
            <p className="text-sm text-gray-600">
              {coupleInfo.bride.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BrideGroomSection; 