"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import BrideGroomCustomizer from '@/components/wedding/BrideGroomCustomizer';
import { toast } from 'sonner';

interface PersonInfo {
  name: string;
  bio: string;
  image: string;
  social?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

interface BrideGroomSectionProps {
  weddingId?: string;
  title?: string;
  description?: string;
  groom?: PersonInfo;
  bride?: PersonInfo;
  onSaveSettings?: (settings: {
    groom?: {
      bio?: string;
      image?: string;
    };
    bride?: {
      bio?: string;
      image?: string;
    };
    title?: string;
    description?: string;
    // Add other settings as needed
  }) => void;
}

const BrideGroomSection: React.FC<BrideGroomSectionProps> = ({
  weddingId = "",
  title = "Cô Dâu & Chú Rể",
  description = "Hai con người, một tình yêu, một cuộc đời.",
  groom = {
    name: "Tên Chú Rể",
    bio: "Một người đàn ông với trái tim ấm áp và tình yêu vô bờ bến. Anh ấy luôn biết cách làm cho cuộc sống trở nên đặc biệt và ngọt ngào hơn. Với nụ cười ấm áp và sự chân thành, anh ấy là người bạn đời hoàn hảo để cùng nhau xây dựng tổ ấm.",
    image: "/images/album/groom.png",
    social: {
      instagram: "#",
      facebook: "#",
      twitter: "#"
    }
  },
  bride = {
    name: "Tên Cô Dâu",
    bio: "Một người phụ nữ xinh đẹp với trái tim nhân hậu và tâm hồn lãng mạn. Cô ấy mang đến niềm vui và hạnh phúc cho mọi người xung quanh. Với nụ cười tỏa nắng và sự dịu dàng, cô ấy là người bạn đời lý tưởng để cùng nhau viết nên câu chuyện tình yêu đẹp nhất.",
    image: "/images/album/bride.png",
    social: {
      instagram: "#",
      facebook: "#",
      twitter: "#"
    }
  },
  onSaveSettings
}) => {
  const { isAuthenticated } = useAuth();
  
  // Cache initial data for reset capability
  const cachedInitialData = useMemo(() => ({
    title: title,
    description: description,
    groomBio: groom.bio,
    brideBio: bride.bio,
    groomImage: groom.image,
    brideImage: bride.image
  }), [title, description, groom.bio, bride.bio, groom.image, bride.image]);
  
  // State for tracking updates
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [currentGroomBio, setCurrentGroomBio] = useState(groom.bio);
  const [currentBrideBio, setCurrentBrideBio] = useState(bride.bio);
  const [currentGroomImage, setCurrentGroomImage] = useState(groom.image);
  const [currentBrideImage, setCurrentBrideImage] = useState(bride.image);

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

  // Handle bride/groom settings update
  const handleBrideGroomUpdate = (data: any, isPreview: boolean = false) => {
    // Map brideGroomTitle/Description to title/description for compatibility
    if (data.brideGroomTitle) {
      setCurrentTitle(data.brideGroomTitle);
    }
    
    if (data.brideGroomDescription) {
      setCurrentDescription(data.brideGroomDescription);
    }
    
    if (data.groomBio) {
      setCurrentGroomBio(data.groomBio);
    }
    
    if (data.brideBio) {
      setCurrentBrideBio(data.brideBio);
    }
    
    if (data.groomImage) {
      setCurrentGroomImage(data.groomImage);
    }
    
    if (data.brideImage) {
      setCurrentBrideImage(data.brideImage);
    }
    
    if (onSaveSettings && !isPreview) {
      const updatedSettings = {
        title: data.brideGroomTitle,
        description: data.brideGroomDescription,
        groom: {
          bio: data.groomBio,
          image: data.groomImage
        },
        bride: {
          bio: data.brideBio,
          image: data.brideImage
        }
      };
      
      onSaveSettings(updatedSettings);
      toast.success("Đã lưu thông tin cô dâu & chú rể");
    }
  };

  return (
    <section 
      id="bridegroom" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative elements */}
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

      {/* BrideGroom Customizer - Only visible to authenticated users */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <BrideGroomCustomizer
            weddingId={weddingId}
            initialData={{
              title: cachedInitialData.title,
              description: cachedInitialData.description,
              groomBio: cachedInitialData.groomBio,
              brideBio: cachedInitialData.brideBio,
              groomImage: cachedInitialData.groomImage,
              brideImage: cachedInitialData.brideImage
            }}
            onUpdate={(data) => handleBrideGroomUpdate(data, false)}
            onPreview={(data) => handleBrideGroomUpdate(data, true)}
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
          <h2 className="text-2xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block">
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

        {currentDescription && (
          <motion.p 
            className="text-center text-gray-700 mb-10 max-w-2xl mx-auto font-serif italic"
            variants={itemVariants}
          >
            {currentDescription}
          </motion.p>
        )}

        {/* Couple Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Bride Card */}
          <motion.div 
            className="relative group"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  className="relative w-48 h-48 mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full transform rotate-45 group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={currentBrideImage}
                      alt={`Ảnh Cô Dâu - ${bride.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-wedding text-rose-700 mb-2">Cô Dâu</h3>
                <h4 className="text-xl font-medium text-gray-800 mb-4">{bride.name}</h4>
                <p className="text-gray-600 mb-6 font-serif italic">{currentBrideBio}</p>
                {bride.social && (
                  <div className="flex space-x-4">
                    {bride.social.instagram && (
                      <motion.a 
                        href={bride.social.instagram} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    )}
                    {bride.social.facebook && (
                      <motion.a 
                        href={bride.social.facebook} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: -5 }}
                      >
                        <Facebook className="w-5 h-5" />
                      </motion.a>
                    )}
                    {bride.social.twitter && (
                      <motion.a 
                        href={bride.social.twitter} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Twitter className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Groom Card */}
          <motion.div 
            className="relative group"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  className="relative w-48 h-48 mb-6"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full transform -rotate-45 group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={currentGroomImage}
                      alt={`Ảnh Chú Rể - ${groom.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-wedding text-rose-700 mb-2">Chú Rể</h3>
                <h4 className="text-xl font-medium text-gray-800 mb-4">{groom.name}</h4>
                <p className="text-gray-600 mb-6 font-serif italic">{currentGroomBio}</p>
                {groom.social && (
                  <div className="flex space-x-4">
                    {groom.social.instagram && (
                      <motion.a 
                        href={groom.social.instagram} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Instagram className="w-5 h-5" />
                      </motion.a>
                    )}
                    {groom.social.facebook && (
                      <motion.a 
                        href={groom.social.facebook} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: -5 }}
                      >
                        <Facebook className="w-5 h-5" />
                      </motion.a>
                    )}
                    {groom.social.twitter && (
                      <motion.a 
                        href={groom.social.twitter} 
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <Twitter className="w-5 h-5" />
                      </motion.a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer decorative element */}
        <div className="mt-12 w-72 h-8 opacity-70 mx-auto animated fadeIn delay-3s">
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
    </section>
  );
};

export default BrideGroomSection;