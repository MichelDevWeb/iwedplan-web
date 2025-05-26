"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Clock, Calendar as CalendarIcon, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CalendarCustomizer from '@/components/wedding/CalendarCustomizer';

interface CalendarSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  date?: Date | null;
  onSaveSettings?: (settings: {
    title?: string;
    description?: string;
    date?: Date | null;
  }) => void;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ 
  weddingId = "",
  title: initialTitle = "Kỷ niệm",
  description: initialDescription = "Đếm từng khoảnh khắc đến ngày hạnh phúc của chúng tôi.",
  date: initialDate = new Date(2023, 11, 4),
  onSaveSettings
}) => {
  const controls = useAnimation();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  // Cache initialData for reset capability
  const cachedInitialData = useMemo(() => ({
    calendarTitle: initialTitle,
    calendarDescription: initialDescription,
    eventDate: initialDate
  }), [initialTitle, initialDescription, initialDate]);
  
  // State for tracking updates from customizer
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [date, setDate] = useState<Date | null>(initialDate);
  
  // Set event date - use provided date or default to a fallback
  const eventDate = useMemo(() => {
    if (!date) return new Date(2023, 11, 4);
    return date instanceof Date ? date : new Date(date);
  }, [date]);
  
  // Format date parts for display
  const dateParts = useMemo(() => {
    return {
      year: format(eventDate, "yyyy"),
      month: format(eventDate, "MM"),
      monthName: format(eventDate, "MMMM", { locale: vi }),
      day: format(eventDate, "dd"),
      dayName: format(eventDate, "EEEE", { locale: vi }),
      hour: format(eventDate, "HH"),
      minute: format(eventDate, "mm"),
      dayOfYear: format(eventDate, "ddd", { locale: vi }),
      weekDay: format(eventDate, "EEE", { locale: vi }),
      weekOfYear: format(eventDate, "w")
    };
  }, [eventDate]);
  
  // Calculate time difference data
  const timeData = useMemo(() => {
    const now = new Date();
    const diffInDays = differenceInDays(eventDate, now);
    const isPast = diffInDays < 0;
    const absDiffInDays = Math.abs(diffInDays);
    
    const years = Math.floor(absDiffInDays / 365);
    const months = Math.floor((absDiffInDays % 365) / 30);
    const days = absDiffInDays % 30;
    
    // Calculate countdown or passed time for display
    const formattedTimeDiff = [];
    if (years > 0) formattedTimeDiff.push(`${years} năm`);
    if (months > 0) formattedTimeDiff.push(`${months} tháng`);
    if (days > 0) formattedTimeDiff.push(`${days} ngày`);
    
    const timeString = formattedTimeDiff.join(' ');
    
    return {
      years,
      months,
      days,
      isPast,
      absDiffInDays,
      timeString
    };
  }, [eventDate]);

  // Monitor when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          controls.start("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    const section = document.getElementById('calendar');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, [controls]);

  // Handle calendar settings update
  const handleCalendarUpdate = (data: any, isPreview: boolean = false) => {
    if (data.calendarTitle) {
      setTitle(data.calendarTitle);
    }
    
    if (data.calendarDescription) {
      setDescription(data.calendarDescription);
    }
    
    if (data.eventDate) {
      setDate(data.eventDate);
    }
    
    if (onSaveSettings && !isPreview) {
      const updatedSettings = {
        title: data.calendarTitle,
        description: data.calendarDescription,
        date: data.eventDate
      };
      
      onSaveSettings(updatedSettings);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const dateContainerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section 
      id="calendar" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 opacity-60">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration"
          fill
          sizes="(max-width: 768px) 96px, 128px"
          style={{ objectFit: 'contain', transform: 'rotate(125deg)' }}
        />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-60">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration"
          fill
          sizes="(max-width: 768px) 96px, 128px"
          style={{ objectFit: 'contain', transform: 'rotate(220deg)' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 opacity-60">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration"
          fill
          sizes="(max-width: 768px) 96px, 128px"
          style={{ objectFit: 'contain', transform: 'rotate(40deg)' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-60">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration"
          fill
          sizes="(max-width: 768px) 96px, 128px"
          style={{ objectFit: 'contain', transform: 'rotate(-40deg)' }}
        />
      </div>
      
      <motion.div 
        className="absolute top-10 left-10 text-rose-200 opacity-20"
        animate={{ 
          rotate: 360
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Clock size={80} strokeWidth={1} />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-10 right-10 text-rose-200 opacity-20"
        animate={{ 
          rotate: -360
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <CalendarIcon size={80} strokeWidth={1} />
      </motion.div>
      
      {/* Calendar Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-4 right-4 z-20">
          <CalendarCustomizer
            weddingId={weddingId}
            initialData={cachedInitialData}
            onUpdate={(data) => handleCalendarUpdate(data, false)}
            onPreview={(data) => handleCalendarUpdate(data, true)}
          />
        </div>
      )}

      {/* Main content */}
      <motion.div 
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {/* Decorative heading with ornament */}
        <motion.div className="relative mb-8 text-center" variants={itemVariants}>
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
            {title}
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
        </motion.div>
        
        <motion.p 
          className="text-center text-gray-700 mb-12 max-w-2xl mx-auto font-serif italic"
          variants={itemVariants}
        >
          &#34;{description}&#34;
        </motion.p>
        
        {/* Wedding Date Display */}
        <motion.div 
          className="mb-12 p-6 md:p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl border border-rose-100"
          variants={dateContainerVariants}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="inline-block px-6 py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full shadow-lg mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              variants={itemVariants}
            >
              <h3 className="text-xl md:text-2xl font-medium">
                {dateParts.dayName}, {dateParts.day} {dateParts.monthName} {dateParts.year}
              </h3>
            </motion.div>
            
            <motion.div 
              className="text-sm text-gray-500 italic"
              variants={itemVariants}
            >
              {timeData.isPast ? (
                <span className="text-rose-600 font-bold">
                  Đã {timeData.timeString}
                </span>
              ) : (
                <span>
                  Còn {timeData.timeString}
                </span>
              )}
            </motion.div>
          </div>

          {/* Countdown boxes */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={itemVariants}
          >
            {/* Day counter */}
            <CountdownBox 
              number={timeData.days} 
              label="ngày" 
              animate={isVisible}
            />
            
            {/* Hour counter */}
            <CountdownBox 
              number={parseInt(dateParts.hour)} 
              label="giờ" 
              animate={isVisible}
            />
            
            {/* Month counter */}
            <CountdownBox 
              number={timeData.months} 
              label="tháng" 
              animate={isVisible}
            />
            
            {/* Year counter */}
            <CountdownBox 
              number={timeData.years} 
              label="năm" 
              animate={isVisible}
            />
          </motion.div>
          
          {/* Additional date info */}
          <motion.div 
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={itemVariants}
          >
            <InfoCard 
              icon={<CalendarIcon className="h-5 w-5 text-rose-500" />}
              title="Ngày trong tuần" 
              value={dateParts.weekDay}
            />
            
            <InfoCard 
              icon={<Clock className="h-5 w-5 text-rose-500" />}
              title="Thời gian" 
              value={`${dateParts.hour}:${dateParts.minute}`}
            />
            
            <InfoCard 
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              title={timeData.isPast ? "Đã hạnh phúc" : "Đến ngày vui"} 
              value={timeData.timeString}
              highlight
            />
          </motion.div>
        </motion.div>
        
        {/* Romantic Quote with animation */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <blockquote className="relative italic text-gray-700 font-serif p-6">
            <div className="absolute top-0 left-0 text-4xl text-rose-300 opacity-50">"</div>
            <p className="relative z-10">
              Tình yêu không đếm thời gian, nhưng thời gian luôn đếm ngược đến ngày ta thuộc về nhau.
            </p>
            <div className="absolute bottom-0 right-0 text-4xl text-rose-300 opacity-50">"</div>
          </blockquote>
        </div>
        
        {/* Add heart divider at the bottom */}
        <div className="mt-10 flex justify-center w-full">
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
      </motion.div>
    </section>
  );
};

// Animated countdown box component
const CountdownBox = ({ number, label, animate }: { number: number, label: string, animate: boolean }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 shadow-inner p-4 flex flex-col items-center justify-center"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <motion.div 
        className="text-3xl md:text-4xl font-bold text-rose-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={animate ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 15,
          delay: 0.3
        }}
      >
        {number}
      </motion.div>
      <span className="text-sm text-gray-500 mt-1 font-medium">{label}</span>
    </motion.div>
  );
};

// Info card component
const InfoCard = ({ icon, title, value, highlight = false }: { 
  icon: React.ReactNode, 
  title: string, 
  value: string,
  highlight?: boolean
}) => {
  return (
    <div className={`flex items-center p-3 rounded-lg ${highlight ? 'bg-rose-50' : 'bg-white/50'} border border-rose-100`}>
      <div className="mr-3">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{title}</div>
        <div className={`text-sm font-medium ${highlight ? 'text-rose-600' : 'text-gray-700'}`}>{value}</div>
      </div>
    </div>
  );
};

export default CalendarSection; 