"use client"; // Carousel uses client-side hooks

import React from 'react';
import Image from 'next/image'; // Use Next.js Image component for optimization
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card"; // Use Card for item styling
import { Button } from "@/components/ui/button"; // For "Xem thêm" button

// TODO: Replace with your actual image data (consider fetching from storage or CMS)
const albumImages = [
  { id: 1, src: "/images/iWedPlan.png", alt: "Album Image 1" },
  { id: 2, src: "/images/iWedPlan.png", alt: "Album Image 2" },
  { id: 3, src: "/images/iWedPlan.png", alt: "Album Image 3" },
  { id: 4, src: "/images/iWedPlan.png", alt: "Album Image 4" },
  { id: 5, src: "/images/iWedPlan.png", alt: "Album Image 5" },
  { id: 6, src: "/images/iWedPlan.png", alt: "Album Image 6" },
];

const AlbumSection = () => {
  return (
    <section id="album" className="w-full py-16 flex flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-8 text-center animated fadeInDown">Album Hình Cưới</h2>
      <p className="text-center text-gray-600 mb-8 max-w-2xl animated fadeInUp delay-1s">
        Được ai đó yêu sâu sắc sẽ mang lại cho bạn sức mạnh, trong khi yêu ai đó sâu sắc sẽ cho bạn dũng khí.
      </p>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-5xl animated zoomIn delay-2s"
      >
        <CarouselContent>
          {albumImages.map((image) => (
            <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden"> {/* Ensure image doesn't overflow card */}
                  <CardContent className="flex aspect-square items-center justify-center p-0"> {/* Remove padding, use aspect-square */}
                    {/* Use Next.js Image component */}
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={500} // Provide appropriate width
                      height={500} // Provide appropriate height (equal to width for square)
                      className="object-cover w-full h-full" // Ensure image covers the container
                      priority={image.id <= 3} // Prioritize loading first few images
                      // TODO: Add placeholder images (e.g., using /public)
                      // For now, it might show broken images until placeholders are added
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" /> {/* Hide controls on small screens if needed */}
        <CarouselNext className="hidden sm:flex" />
      </Carousel>

      {/* TODO: Link this button to a full gallery page or modal */}
      <Button variant="outline" className="mt-8 animated fadeInUp delay-3s">
        Xem thêm
      </Button>
    </section>
  );
};

export default AlbumSection; 