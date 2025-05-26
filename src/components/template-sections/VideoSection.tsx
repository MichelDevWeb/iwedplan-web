'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import VideoCustomizer from '@/components/wedding/VideoCustomizer';

interface VideoSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  onSaveSettings?: (settings: {
    videoUrl?: string;
    title?: string;
    description?: string;
    // Add other video-related settings as needed
  }) => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ 
  weddingId = "",
  title = "Video Cưới",
  description = "Tình yêu không làm cho thế giới quay tròn. Tình yêu là những gì làm cho chuyến đi đáng giá.",
  videoUrl = "https://www.youtube.com/embed/stLjM9fqH1A?si=HnsgmGwLNw-2grmR",
  onSaveSettings
}) => {
  const { isAuthenticated } = useAuth();
  // State for play animation effect when section comes into view
  const [isVisible, setIsVisible] = useState(false);
  
  // State for video content
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);

  // Monitor when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 } // Trigger when 30% of section is visible
    );
    
    const section = document.getElementById('video');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, []);

  // Convert YouTube watch URL to embed URL if needed
  const processYoutubeUrl = (url: string): string => {
    if (!url) return url;
    
    // Check if it's already an embed URL
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    // Convert watch URL to embed URL
    const watchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
    
    let videoId;
    if (watchRegex.test(url)) {
      videoId = url.match(watchRegex)?.[1];
    } else if (shortRegex.test(url)) {
      videoId = url.match(shortRegex)?.[1];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
  };

  // Handle updates from VideoCustomizer
  const handleVideoUpdate = (data: any, isPreview: boolean = false) => {
    if (data.videoTitle) setCurrentTitle(data.videoTitle);
    if (data.videoDescription) setCurrentDescription(data.videoDescription);
    if (data.videoUrl) setCurrentVideoUrl(data.videoUrl);
    
    // Call the parent's onSaveSettings if provided and not a preview
    if (onSaveSettings && !isPreview) {
      onSaveSettings({
        title: data.videoTitle,
        description: data.videoDescription,
        videoUrl: data.videoUrl
      });
    }
  };

  return (
    <section 
      id="video" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(253, 242, 248, 0.8), rgba(235, 244, 255, 0.8))"
      }}
    >
      {/* Decorative flower corners */}
      <div className="absolute top-0 left-0 w-20 h-20 md:w-32 md:h-32 opacity-60 transform rotate-[125deg] sway">
        <Image 
          src="/images/flower-corner.png" 
          alt="Flower decoration" 
          fill 
          sizes="(max-width: 768px) 80px, 128px"
          style={{ objectFit: 'contain' }} 
        />
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-60 transform rotate-[220deg] sway delay-1s">
        <Image 
          src="/images/flower-corner.png" 
          alt="Flower decoration" 
          fill 
          sizes="(max-width: 768px) 80px, 128px"
          style={{ objectFit: 'contain' }} 
        />
      </div>
      <div className="absolute bottom-0 left-0 w-20 h-20 md:w-32 md:h-32 opacity-60 transform rotate-[40deg] sway delay-2s">
        <Image 
          src="/images/flower-corner.png" 
          alt="Flower decoration" 
          fill 
          sizes="(max-width: 768px) 80px, 128px"
          style={{ objectFit: 'contain' }} 
        />
      </div>
      <div className="absolute bottom-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-60 rotate-[-40deg] sway delay-3s">
        <Image 
          src="/images/flower-corner.png" 
          alt="Flower decoration" 
          fill 
          sizes="(max-width: 768px) 80px, 128px"
          style={{ objectFit: 'contain' }} 
        />
      </div>

      {/* Video Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-[50%] right-4 z-20">
          <VideoCustomizer
            weddingId={weddingId}
            initialData={{
              videoTitle: title,
              videoDescription: description,
              videoUrl: videoUrl
            }}
            onUpdate={(data) => handleVideoUpdate(data, false)}
            onPreview={(data) => handleVideoUpdate(data, true)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center z-10 relative">
        {/* Decorative heading with ornament */}
        <div className="relative mb-8 animated fadeInDown">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill 
              sizes="160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-script text-rose-800 font-bold relative z-10 px-8 text-center">
            {currentTitle}
          </h2>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 rotate-180 w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill 
              sizes="160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        <p className="text-center text-gray-700 mb-10 max-w-2xl animated fadeInUp delay-1s font-serif italic">
          &#34;{currentDescription}&#34;
        </p>

        {/* Decorated video container */}
        <div className={`w-full max-w-3xl mx-auto relative ${isVisible ? 'animated fadeIn delay-1s' : 'opacity-0'}`}>
          {/* Ornamental frame */}
          <div className="absolute -top-3 -left-3 -right-3 -bottom-3 border-2 border-pink-200 rounded-lg"></div>
          <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border border-pink-100 rounded-lg"></div>
          
          {/* Video wrapper with pulse animation on play button */}
          <div className="relative w-full aspect-video overflow-hidden rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.1)] bg-white">
            {currentVideoUrl ? (
              <div className="relative w-full h-full">
                <iframe
                  className="w-full h-full"
                  src={processYoutubeUrl(currentVideoUrl)}
                  title="Wedding Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
                
                {/* Decorative video progress bar (purely visual) */}
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-pink-200 via-rose-300 to-pink-200"></div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500 font-serif text-center">Video đang được chuẩn bị!</p>
                <p className="text-gray-400 text-sm mt-2 font-serif text-center italic">Chúng tôi đang làm việc để mang đến những khoảnh khắc đẹp nhất</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer decorative element */}
        <div className="mt-10 w-72 h-8 opacity-70 animated fadeIn delay-3s">
          <Image 
            src="/images/heart-divider.png" 
            alt="Heart divider" 
            width={500}
            height={50}
            sizes="(max-width: 768px) 288px, 500px"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection; 