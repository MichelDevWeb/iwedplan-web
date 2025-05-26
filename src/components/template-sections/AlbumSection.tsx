"use client"; // Carousel uses client-side hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image'; // Use Next.js Image component for optimization
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import AlbumCustomizer from '@/components/wedding/AlbumCustomizer';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { defaultAlbumImages } from '@/config/templateConfig';

// Update the images interface to match what's used in the component
interface AlbumImage {
  id: string;
  url: string;
  alt?: string;
}

interface AlbumSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  images?: AlbumImage[] | string[];
  onSaveSettings?: (settings: {
    images?: AlbumImage[];
    title?: string;
    description?: string;
    // Add other album-related settings as needed
  }) => void;
}

const AlbumSection: React.FC<AlbumSectionProps> = ({
  weddingId = "",
  title = "Album Ảnh",
  description = "Mỗi bức ảnh là một kỷ niệm, mỗi khoảnh khắc là một câu chuyện.",
  images = [],
  onSaveSettings
}) => {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [favoriteImages, setFavoriteImages] = useState<Set<string>>(new Set());

  // State for album content
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [galleryImages, setGalleryImages] = useState<AlbumImage[]>([]);

  // Initialize gallery images when props change
  useEffect(() => {
    // Transform string[] to AlbumImage[] if needed
    const processedImages: AlbumImage[] = images.map((img, index) => {
      if (typeof img === 'string') {
        return {
          id: `img-${index}`,
          url: img,
          alt: `Wedding image ${index + 1}`
        };
      }
      return img as AlbumImage;
    });

    // Use provided images or defaults
    setGalleryImages(processedImages.length > 0 ? processedImages : defaultAlbumImages as AlbumImage[]);
  }, [images]);

  // Monitor when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );
    
    const section = document.getElementById('album');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, []);

  // Reset zoom level when lightbox opens or image changes
  useEffect(() => {
    setZoomLevel(1);
  }, [isLightboxOpen, lightboxIndex]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const zoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = galleryImages[lightboxIndex].url;
    link.download = `wedding-photo-${galleryImages[lightboxIndex].id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFavorite = (imageId: string) => {
    setFavoriteImages(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(imageId)) {
        newFavorites.delete(imageId);
      } else {
        newFavorites.add(imageId);
      }
      return newFavorites;
    });
  };

  // Handle updates from AlbumCustomizer
  const handleAlbumUpdate = (data: any, isPreview: boolean = false) => {
    if (data.albumTitle) setCurrentTitle(data.albumTitle);
    if (data.albumDescription) setCurrentDescription(data.albumDescription);
    if (data.albumImages) setGalleryImages(data.albumImages);
    
    // Call the parent's onSaveSettings if provided
    if (onSaveSettings && !isPreview) {
      onSaveSettings({
        title: data.albumTitle,
        description: data.albumDescription,
        images: data.albumImages
      });
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

      {/* Album Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <AlbumCustomizer
            weddingId={weddingId}
            initialData={{
              albumTitle: title,
              albumDescription: description,
              albumImages: galleryImages
            }}
            onUpdate={(data) => handleAlbumUpdate(data, false)}
            onPreview={(data) => handleAlbumUpdate(data, true)}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 text-center"
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block">
            {currentTitle}
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
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-gray-700 mb-10 max-w-2xl font-serif italic"
        >
          {currentDescription}
        </motion.p>

        {/* Main slider / featured image */}
        {galleryImages.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto mb-6"
          >
            <div className="relative w-full aspect-[4/3] group overflow-hidden rounded-xl shadow-lg">
              <Image 
                src={galleryImages[currentSlide]?.url}
                alt={galleryImages[currentSlide]?.alt || "Wedding photo"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover transform transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Image navigation */}
              <button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={prevSlide}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                onClick={nextSlide}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
              
              {/* Favorite button */}
              <button
                className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 cursor-pointer z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={() => toggleFavorite(galleryImages[currentSlide].id)}
                aria-label="Toggle favorite"
              >
                <Heart 
                  size={24} 
                  className={cn(
                    "transition-colors duration-300",
                    favoriteImages.has(galleryImages[currentSlide].id) 
                      ? "fill-red-500 text-red-500" 
                      : "text-white"
                  )}
                />
              </button>
              
              {/* Overlay button to open lightbox */}
              <button 
                className="absolute inset-0 w-full h-full cursor-pointer z-[5]"
                onClick={() => openLightbox(currentSlide)}
                aria-label="View image in lightbox"
              >
                <span className="sr-only">Open image in lightbox</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto mb-6 text-center text-gray-500 py-12"
          >
            Chưa có ảnh nào trong album
          </motion.div>
        )}
        
        {/* Thumbnail grid */}
        {galleryImages.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 w-full max-w-4xl mx-auto"
          >
            {galleryImages.map((image, index) => (
              <button 
                key={image.id} 
                className={cn(
                  "aspect-square rounded-md overflow-hidden relative cursor-pointer transition-all duration-300 transform hover:scale-105 group",
                  index === currentSlide ? 'ring-2 ring-offset-2 ring-pink-500' : ''
                )}
                onClick={() => {
                  setCurrentSlide(index);
                  openLightbox(index);
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `Wedding photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 120px"
                  className="object-cover"
                />
                {/* Favorite indicator */}
                {favoriteImages.has(image.id) && (
                  <div className="absolute top-1 right-1 bg-black/20 rounded-full p-1">
                    <Heart size={16} className="fill-red-500 text-red-500" />
                  </div>
                )}
              </button>
            ))}
          </motion.div>
        )}
        
        {/* Footer decorative element */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex justify-center w-full"
        >
          <div className="w-72 h-8 opacity-70">
            <Image 
              src="/images/heart-divider.png" 
              alt="Heart divider" 
              width={500}
              height={50}
              sizes="(max-width: 768px) 288px, 500px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Enhanced Image Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 bg-transparent border-none shadow-2xl flex items-center justify-center">
          <DialogTitle className="hidden"></DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 z-50 transition-all duration-300 hover:rotate-90"
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
            
            {/* Lightbox content */}
            <div className="relative w-[95vw] h-[90vh] mx-auto flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ touchAction: 'none' }}
                >
                  <motion.div
                    className="relative w-full h-full"
                    style={{ 
                      scale: zoomLevel,
                      cursor: zoomLevel > 1 ? 'grab' : 'default'
                    }}
                    drag={zoomLevel > 1}
                    dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                    dragElastic={0.05}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                  >
                    <Image
                      src={galleryImages[lightboxIndex]?.url} 
                      alt={galleryImages[lightboxIndex]?.alt || "Wedding photo fullscreen"}
                      fill
                      sizes="95vw"
                      className="object-contain"
                      priority
                      draggable={false}
                      quality={100}
                    />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              
              {/* Image counter and controls */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2">
                <div className="bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm flex items-center gap-6">
                  {/* Counter */}
                  <span className="font-medium">{lightboxIndex + 1} / {galleryImages.length}</span>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-4 border-l border-white/20 pl-6">
                    <button 
                      onClick={zoomOut}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Zoom out"
                    >
                      <ZoomOut size={18} />
                    </button>
                    <button 
                      onClick={zoomIn}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Zoom in"
                    >
                      <ZoomIn size={18} />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Download image"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => toggleFavorite(galleryImages[lightboxIndex].id)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      aria-label="Toggle favorite"
                    >
                      <Heart 
                        size={18} 
                        className={cn(
                          "transition-colors duration-300",
                          favoriteImages.has(galleryImages[lightboxIndex]?.id) 
                            ? "fill-red-500 text-red-500" 
                            : "text-white"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <button 
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-5 z-50 transition-transform duration-300 hover:scale-110"
              onClick={prevLightboxImage}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-5 z-50 transition-transform duration-300 hover:scale-110"
              onClick={nextLightboxImage}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AlbumSection; 