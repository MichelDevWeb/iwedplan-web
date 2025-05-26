"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Timeline } from "@/components/ui/timeline";
import { useAuth } from "@/contexts/AuthContext";
import StoryCustomizer from "@/components/wedding/StoryCustomizer";
import { defaultStoryEvents } from "@/config/templateConfig";
// Make sure this interface matches the one in StoryCustomizer
interface StoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  position?: 'left' | 'right';
}

interface StorySectionProps {
  weddingId: string;
  title?: string;
  description?: string;
  events?: StoryEvent[];
  onSaveSettings?: (settings: Record<string, any>) => void;
}

const StorySection: React.FC<StorySectionProps> = ({
  weddingId,
  title = "Câu Chuyện Tình Yêu",
  description = "Hành trình tình yêu của chúng tôi.",
  events = defaultStoryEvents,
  onSaveSettings,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Cache initial data for reset capability
  const cachedInitialData = useMemo(() => ({
    storyTitle: title,
    storyDescription: description,
    storyEvents: events
  }), [title, description, events]);
  
  // State for tracking updates
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>(events);
  
  const { isAuthenticated } = useAuth();

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
    
    const section = document.getElementById('story');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, []);

  // Handle updates from StoryCustomizer
  const handleStoryUpdate = (data: any, isPreview: boolean) => {
    if (data.storyTitle) setCurrentTitle(data.storyTitle);
    if (data.storyDescription) setCurrentDescription(data.storyDescription);
    if (data.storyEvents) setStoryEvents(data.storyEvents);
    
    // Call the parent's onSaveSettings if provided
    if (onSaveSettings && !isPreview) {
      onSaveSettings({
        title: data.storyTitle,
        description: data.storyDescription,
        events: data.storyEvents
      });
    }
  };

  return (
    <section 
      id="story" 
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
      <div className="absolute top-0 right-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(90deg)' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(270deg)' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain', transform: 'rotate(180deg)' }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="relative mb-8 text-center">
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
        </div>

        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto animated fadeInUp delay-1s font-serif italic">
          {currentDescription}
        </p>

        {/* Timeline */}
        <div className="mt-16">
          <Timeline events={storyEvents} isVisible={isVisible} />
        </div>
      </div>

      {/* Customizer */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <StoryCustomizer
            weddingId={weddingId}
            initialData={cachedInitialData}
            onUpdate={(data) => handleStoryUpdate(data, false)}
            onPreview={(data) => handleStoryUpdate(data, true)}
          />
        </div>
      )}

      {/* Add heart divider at the bottom */}
      <div className="mt-12 flex justify-center w-full">
        <div className="w-72 h-8 opacity-70 animated fadeIn delay-3s">
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

export default StorySection; 