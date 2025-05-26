"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import RsvpModal from '@/components/modals/RsvpModal';
import { WeddingData } from '@/lib/firebase/models';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import RsvpCustomizer from '@/components/wedding/RsvpCustomizer';

interface RsvpSectionProps {
  weddingId?: string;
  rsvpTitle?: string;
  rsvpDescription?: string;
  rsvpDeadline?: string;
  onSaveSettings?: (settings: any) => void;
  isPreview?: boolean;
}

const RsvpSection: React.FC<RsvpSectionProps> = ({
  weddingId,
  rsvpTitle = "Xác nhận tham dự",
  rsvpDescription = "Hãy cho chúng tôi biết bạn có thể tham dự đám cưới của chúng tôi không. Chúng tôi rất mong được gặp bạn trong ngày đặc biệt này.",
  rsvpDeadline = "01/01/2023",
  onSaveSettings,
  isPreview = false
}) => {
  const { isAuthenticated } = useAuth();
  const [rsvpStats, setRsvpStats] = useState({
    attending: 0,
    declined: 0,
    totalGuests: 0
  });
  const [currentTitle, setCurrentTitle] = useState(rsvpTitle);
  const [currentDescription, setCurrentDescription] = useState(rsvpDescription);
  const [currentDeadline, setCurrentDeadline] = useState(rsvpDeadline);

  // Fetch RSVP stats if authenticated
  useEffect(() => {
    const fetchRsvpStats = async () => {
      if (isAuthenticated && weddingId && !isPreview) {
        try {
          const db = await getFirestore();
          const rsvpsRef = collection(db, "rsvps");
          const q = query(rsvpsRef, where("weddingId", "==", weddingId));
          const querySnapshot = await getDocs(q);
          
          let attending = 0;
          let declined = 0;
          let totalGuests = 0;
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.attending === 'yes') {
              attending++;
              totalGuests += (data.guests || 1);
            } else if (data.attending === 'no') {
              declined++;
            }
          });
          
          setRsvpStats({ attending, declined, totalGuests });
        } catch (error) {
          console.error("Error fetching RSVP stats:", error);
        }
      }
    };
    
    fetchRsvpStats();
  }, [isAuthenticated, weddingId, isPreview]);

  // Handle RSVP settings update
  const handleRsvpUpdate = (data: any) => {
    setCurrentTitle(data.rsvpTitle || rsvpTitle);
    setCurrentDescription(data.rsvpDescription || rsvpDescription);
    setCurrentDeadline(data.rsvpDeadline || rsvpDeadline);
    
    if (onSaveSettings) {
      const updatedSettings = {
        rsvpTitle: data.rsvpTitle || rsvpTitle,
        rsvpDescription: data.rsvpDescription || rsvpDescription,
        rsvpDeadline: data.rsvpDeadline || rsvpDeadline,
      };
      
      onSaveSettings(updatedSettings);
    }
  };

  return (
    <section 
      id="rsvp" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 animate-fadeInScale">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 animate-fadeInScale-delay-200 transform rotate-90">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-32 h-32 animate-fadeInScale-delay-400 transform rotate-270">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-32 h-32 animate-fadeInScale-delay-600 transform rotate-180">
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* RSVP Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-[50%] right-4 z-20">
          <RsvpCustomizer
            weddingId={weddingId}
            initialData={{
              rsvpTitle: currentTitle,
              rsvpDescription: currentDescription,
              rsvpDeadline: currentDeadline
            }}
            onUpdate={handleRsvpUpdate}
          />
        </div>
      )}

      <motion.div 
        className="max-w-5xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
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
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block">
            {currentTitle}
          </h2>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 rotate-180 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-gray-700 max-w-2xl mx-auto">{currentDescription}</p>
          <div className="flex items-center justify-center mt-4 text-rose-700">
            <Calendar className="mr-2 h-5 w-5" />
            <p className="font-medium">Hạn chót: {currentDeadline}</p>
          </div>
        </div>

        {/* RSVP Stats - Only visible to authenticated users */}
        {isAuthenticated && weddingId && (
          <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tham dự</h3>
              <p className="text-3xl font-bold text-green-600">{rsvpStats.attending}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Vắng mặt</h3>
              <p className="text-3xl font-bold text-red-600">{rsvpStats.declined}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
              <div className="flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Tổng số khách</h3>
              <p className="text-3xl font-bold text-blue-600">{rsvpStats.totalGuests}</p>
            </div>
          </div>
        )}

        {/* RSVP Button */}
        <div className="flex justify-center">
          <RsvpModal
            trigger={
              <Button 
                className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-6 rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Xác nhận tham dự ngay
              </Button>
            }
            weddingId={weddingId}
            rsvpDeadline={currentDeadline}
          />
        </div>

        {/* Bottom divider */}
        <div className="mt-12 flex justify-center">
          <div className="w-48 md:w-72 h-8 opacity-70">
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
      </motion.div>
    </section>
  );
};

export default RsvpSection; 