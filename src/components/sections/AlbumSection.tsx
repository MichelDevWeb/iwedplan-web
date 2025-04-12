"use client"; // Carousel uses client-side hooks

import React, { useState } from 'react';
import Image from 'next/image'; // Use Next.js Image component for optimization
import { ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

// TODO: Replace with your actual image data (consider fetching from storage or CMS)
const albumImages = [
  { id: 1, src: "/images/album/1.jpg", alt: "Wedding moment 1" },
  { id: 2, src: "/images/album/2.jpg", alt: "Wedding moment 2" },
  { id: 3, src: "/images/album/3.jpg", alt: "Wedding moment 3" },
  { id: 4, src: "/images/album/4.jpg", alt: "Wedding moment 4" },
  { id: 5, src: "/images/album/5.jpg", alt: "Wedding moment 5" },
  { id: 6, src: "/images/album/6.jpg", alt: "Wedding moment 6" },
  { id: 7, src: "/images/album/7.jpg", alt: "Wedding moment 7" },
  { id: 8, src: "/images/album/8.jpg", alt: "Wedding moment 8" },
  { id: 9, src: "/images/album/9.jpg", alt: "Wedding moment 9" },
  { id: 10, src: "/images/album/10.jpg", alt: "Wedding moment 10" },
];

const AlbumSection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  const displayedImages = showAllImages ? albumImages : albumImages.slice(0, 6);
  const hasMoreImages = albumImages.length > 6;

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const handlePrevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((prev) => (prev === 0 ? albumImages.length - 1 : prev! - 1));
    }
  };

  const handleNextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((prev) => (prev === albumImages.length - 1 ? 0 : prev! + 1));
    }
  };

  return (
    <section 
      id="album" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-60 transform rotate-90">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-60 transform rotate-270">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60 transform rotate-180">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="relative mb-12 text-center">
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
            Album Ảnh
          </h2>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 rotate-180 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {displayedImages.map((image, index) => (
            <div 
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group"
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-medium">{image.alt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Xem thêm Button */}
        {hasMoreImages && !showAllImages && (
          <div className="flex justify-center mt-8 animated fadeInUp">
            <Button
              variant="outline"
              className="bg-white/80 hover:bg-white/90 border-rose-200 text-rose-700 hover:text-rose-800 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setShowAllImages(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Xem thêm
            </Button>
          </div>
        )}

        {/* Image Preview Modal */}
        {isModalOpen && selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
            <button 
              className="absolute top-4 right-4 text-white hover:text-rose-200 transition-colors z-[10000]"
              onClick={handleCloseModal}
            >
              <X className="w-8 h-8" />
            </button>
            
            <button 
              className="absolute left-4 text-white hover:text-rose-200 transition-colors z-[10000]"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button 
              className="absolute right-4 text-white hover:text-rose-200 transition-colors z-[10000]"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="relative w-full max-w-4xl aspect-square z-[10000]">
              <Image
                src={albumImages[selectedImage].src}
                alt={albumImages[selectedImage].alt}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AlbumSection; 