"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, ExternalLink, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import EventsCustomizer from '@/components/wedding/EventsCustomizer';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { defaultEvents } from '@/config/templateConfig';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  location: string;
  address?: string;
  mapLink?: string;
  image?: string;
}

interface EventsSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  eventsList?: EventItem[];
  eventDate?: Date | null;
  address?: string;
  mapUrl?: string;
  onSaveSettings?: (settings: {
    eventsList?: EventItem[];
    title?: string;
    description?: string;
    eventDate?: Date | null;
    address?: string;
    mapUrl?: string;
    // Add other events-related settings as needed
  }) => void;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  weddingId = "",
  title = "Sự Kiện",
  description = "Những khoảnh khắc quan trọng trong ngày trọng đại.",
  eventsList = defaultEvents,
  eventDate = new Date(2023, 11, 4),
  address = "Khách sạn Mường Thanh, 78 Đường Hùng Vương, Phường 1, Tp. Vĩnh Long, Vĩnh Long",
  mapUrl = "https://maps.google.com/maps?q=Khách+sạn+Mường+Thanh+Vĩnh+Long&t=&z=13&ie=UTF8&iwloc=&output=embed",
  onSaveSettings
}) => {
  const { isAuthenticated } = useAuth();
  
  // Cache initial data for reset capability
  const cachedInitialData = useMemo(() => ({
    eventsTitle: title,
    eventsDescription: description,
    eventDate: eventDate,
    address: address,
    mapUrl: mapUrl,
    eventsList: eventsList
  }), [title, description, eventDate, address, mapUrl, eventsList]);
  
  // State for tracking updates
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentEventsList, setCurrentEventsList] = useState<EventItem[]>(eventsList);
  const [currentEventDate, setCurrentEventDate] = useState<Date | null>(eventDate);
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl);

  // Calculate days remaining
  const calculateDaysRemaining = useCallback(() => {
    if (!currentEventDate) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDay = new Date(currentEventDate);
    eventDay.setHours(0, 0, 0, 0);
    
    const timeDiff = eventDay.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }, [currentEventDate]);
  
  const daysRemaining = calculateDaysRemaining();

  // Format the date in Vietnamese
  const formatEventDate = useCallback(() => {
    if (!currentEventDate) return '';
    
    try {
      return format(currentEventDate, 'EEEE, dd MMMM yyyy', { locale: vi });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  }, [currentEventDate]);

  // Process Google Maps URL to ensure it's in embed format
  const processMapUrl = (url: string): string => {
    if (!url) return '';
    
    // Check if it's already an embed URL
    if (url.includes('google.com/maps/embed') || url.includes('output=embed')) {
      return url;
    }
    
    // Check if it's a place search URL
    if (url.includes('google.com/maps/place')) {
      // Extract coordinates or query if available
      const placeMatch = url.match(/place\/([^\/]+)/);
      if (placeMatch) {
        const placeQuery = placeMatch[1];
        return `https://maps.google.com/maps?q=${placeQuery}&output=embed`;
      }
    }
    
    // Check if it's a regular Google Maps URL
    if (url.includes('google.com/maps')) {
      // Try to extract the query parameter
      const queryMatch = url.match(/[?&]q=([^&]+)/);
      if (queryMatch) {
        const query = queryMatch[1];
        return `https://maps.google.com/maps?q=${query}&output=embed`;
      }
    }
    
    // If it's a custom URL, just add the output=embed parameter
    if (url.includes('google.com/maps')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}output=embed`;
    }
    
    // If it doesn't match any known pattern, return as is
    return url;
  };

  // Handle events settings update from customizer
  const handleEventsUpdate = (data: any, isPreview: boolean = false) => {
    const updates: Record<string, any> = {};
    
    if (data.eventsTitle) {
      updates.eventsTitle = data.eventsTitle;
      setCurrentTitle(data.eventsTitle);
    }
    
    if (data.eventsDescription) {
      updates.eventsDescription = data.eventsDescription;
      setCurrentDescription(data.eventsDescription);
    }
    
    if (data.eventDate) {
      updates.eventDate = data.eventDate;
      setCurrentEventDate(data.eventDate);
    }
    
    if (data.address) {
      updates.address = data.address;
      setCurrentAddress(data.address);
    }
    
    if (data.mapUrl) {
      updates.mapUrl = data.mapUrl;
      setCurrentMapUrl(data.mapUrl);
    }
    
    if (data.eventsList) {
      updates.eventsList = data.eventsList;
      setCurrentEventsList(data.eventsList);
    }
    
    // Call the parent's onSaveSettings if provided and not a preview
    if (onSaveSettings && !isPreview && Object.keys(updates).length > 0) {
      onSaveSettings({
        title: updates.eventsTitle,
        description: updates.eventsDescription,
        eventDate: updates.eventDate,
        address: updates.address,
        mapUrl: updates.mapUrl,
        eventsList: updates.eventsList
      });
      toast.success("Đã lưu thông tin sự kiện");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section 
      id="events" 
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

      {/* Events Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <EventsCustomizer
            weddingId={weddingId}
            initialData={cachedInitialData}
            onUpdate={(data) => handleEventsUpdate(data, false)}
            onPreview={(data) => handleEventsUpdate(data, true)}
            buttonClassName="bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
          />
        </div>
      )}

      <motion.div 
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="relative mb-8 text-center" variants={itemVariants}>
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

        {/* Add the description here */}
        <motion.p 
          className="text-center text-gray-700 mb-10 max-w-2xl mx-auto font-serif italic"
          variants={itemVariants}
        >
          {currentDescription}
        </motion.p>

        {/* Countdown and Date Section */}
        <motion.div className="mb-16" variants={itemVariants}>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-pink-100 p-6 md:p-8 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Countdown */}
              <div className="text-center md:col-span-1">
                <div className="text-5xl md:text-6xl font-bold text-rose-700 mb-2">{daysRemaining}</div>
                <div className="text-gray-700 font-medium">
                  {daysRemaining <= 0 ? 'Hôm nay là ngày cưới!' : 'Ngày còn lại'}
                </div>
              </div>
              
              {/* Divider */}
              <div className="hidden md:block h-20 w-px bg-pink-200 mx-auto"></div>
              
              {/* Date and Location */}
              <div className="md:col-span-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-2">
                  <Calendar className="h-5 w-5 text-rose-600 mr-2" />
                  <span className="text-gray-800 font-medium capitalize">{formatEventDate()}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPin className="h-5 w-5 text-rose-600 mr-2" />
                  <span className="text-gray-800">{currentAddress}</span>
                </div>
              </div>
              
              {/* Map Button */}
              <div className="text-center md:text-right">
                <a
                  href={currentMapUrl?.replace('&output=embed', '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-rose-600 text-white rounded-full text-sm font-medium hover:bg-rose-700 transition-colors duration-300"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Xem bản đồ
                </a>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Embedded Google Map */}
        <motion.div 
          className="mb-16"
          variants={itemVariants}
        >
          <div className="rounded-xl overflow-hidden shadow-xl border-4 border-white/70 max-h-[400px]">
            <iframe
              src={processMapUrl(currentMapUrl || '')}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event Location"
            ></iframe>
          </div>
        </motion.div>

        {/* Events List */}
        <motion.h3 
          className="text-2xl text-center font-script text-rose-700 mb-8"
          variants={itemVariants}
        >
          Các sự kiện chính
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {currentEventsList.map((event, index) => (
            <motion.div 
              key={event.id}
              className="relative group"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform transition-transform duration-500",
                index % 2 === 0 ? "-rotate-2 group-hover:rotate-0" : "rotate-2 group-hover:rotate-0"
              )}></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                <div className="relative w-full h-64 md:h-80 overflow-hidden transition-all duration-300">
                  <div className="rounded-lg overflow-hidden aspect-square shadow-lg">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-script text-white">{event.title}</h3>
                </div>
                <div className="p-5 relative">
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-rose-500 mr-2" />
                      <span className="text-gray-700 text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-rose-500 mr-2" />
                      <span className="text-gray-700 text-sm">{event.location}</span>
                    </div>
                    {event.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-rose-500 mr-2 mt-0.5" />
                        <span className="text-gray-700 text-sm">{event.address}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.mapLink && (
                    <div className="mt-4">
                      <motion.a 
                        href={event.mapLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-rose-600 hover:text-rose-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Xem bản đồ chi tiết
                      </motion.a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Add heart divider at the bottom */}
        <motion.div 
          className="mt-12 flex justify-center w-full"
          variants={itemVariants}
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
      </motion.div>
    </section>
  );
};

export default EventsSection; 