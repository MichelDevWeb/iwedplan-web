"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  position?: 'left' | 'right';
}

interface TimelineProps {
  events: TimelineEvent[];
  isVisible: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ events, isVisible }) => {
  // Animation variants
  const timelineItemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        delay: custom * 0.2
      }
    })
  };

  // Assign positions to events if not already specified
  const timelineEvents = events.map((event, index) => ({
    ...event,
    position: event.position || (index % 2 === 0 ? 'left' : 'right')
  }));

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-full h-full hidden md:block">
        {/* Main Timeline Line */}
        <motion.div 
          className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-rose-200 via-rose-300 to-rose-200"
          initial={{ scaleY: 0, originY: 0 }}
          animate={isVisible ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 1.5 }}
        ></motion.div>
        
        {/* Decorative Elements */}
        <motion.div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full overflow-hidden">
          {/* Floating Hearts */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <motion.div className="absolute top-0 left-0 w-full h-full">
              <motion.div 
                animate={{ y: [0, -100] }} 
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              >
                <Heart className="w-4 h-4 text-rose-400 absolute top-0 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [50, -150] }} 
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              >
                <Heart className="w-3 h-3 text-rose-300 absolute top-1/4 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [100, -100] }} 
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <Heart className="w-2 h-2 text-rose-200 absolute top-1/2 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [150, -50] }} 
                transition={{ repeat: Infinity, duration: 17, ease: "linear" }}
              >
                <Heart className="w-3 h-3 text-rose-300 absolute top-3/4 left-1/2 transform -translate-x-1/2" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Sparkles */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.div className="absolute top-0 left-0 w-full h-full">
              <motion.div 
                animate={{ y: [20, -120], rotate: [0, 180] }} 
                transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
              >
                <Sparkles className="w-2 h-2 text-rose-300 absolute top-1/8 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [80, -120], rotate: [0, 180] }} 
                transition={{ repeat: Infinity, duration: 19, ease: "linear" }}
              >
                <Sparkles className="w-2 h-2 text-rose-300 absolute top-3/8 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [120, -80], rotate: [0, 180] }} 
                transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
              >
                <Sparkles className="w-2 h-2 text-rose-300 absolute top-5/8 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div 
                animate={{ y: [180, -20], rotate: [0, 180] }} 
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <Sparkles className="w-2 h-2 text-rose-300 absolute top-7/8 left-1/2 transform -translate-x-1/2" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Timeline Events */}
      {timelineEvents.map((event, index) => (
        <motion.div 
          key={event.id}
          className={`relative mb-16 md:mb-24 last:mb-0`}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          custom={index}
          variants={timelineItemVariants}
        >
          {/* Timeline Dot */}
          <motion.div 
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full border-4 border-white shadow-lg hidden md:block"
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400 to-rose-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
          </motion.div>

          {/* Event Content */}
          <div className={`md:flex items-center ${event.position === 'left' ? 'md:flex-row-reverse' : ''}`}>
            {/* Image */}
            <motion.div 
              className={`w-full md:w-1/2 mb-4 md:mb-0 ${event.position === 'left' ? 'md:pl-4' : 'md:pr-4'}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={event.image || "/images/album/1.jpg"}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Event Details */}
            <div className={`w-full md:w-1/2 ${event.position === 'left' ? 'md:pr-8 text-left' : 'md:pl-8 text-right'}`}>
              <motion.div 
                className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-rose-100"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="inline-block mb-2 px-3 py-1 bg-rose-100 rounded-full text-sm text-rose-700 font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  {event.date}
                </motion.div>
                <h3 className="text-xl md:text-2xl font-medium text-rose-700 mb-2">{event.title}</h3>
                <p className="text-gray-600 font-serif italic">{event.description}</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 