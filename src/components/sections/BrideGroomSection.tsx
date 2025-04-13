"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

// TODO: Replace with actual Bride & Groom data
const coupleInfo = {
  groom: {
    name: "Tên Chú Rể",
    title: "Chú Rể",
    imageSrc: "/images/album/groom.png",
    description: "Một người đàn ông với trái tim ấm áp và tình yêu vô bờ bến. Anh ấy luôn biết cách làm cho cuộc sống trở nên đặc biệt và ngọt ngào hơn. Với nụ cười ấm áp và sự chân thành, anh ấy là người bạn đời hoàn hảo để cùng nhau xây dựng tổ ấm.",
    social: {
      instagram: "#",
      facebook: "#",
      twitter: "#"
    }
  },
  bride: {
    name: "Tên Cô Dâu",
    title: "Cô Dâu",
    imageSrc: "/images/album/bride.png",
    description: "Một người phụ nữ xinh đẹp với trái tim nhân hậu và tâm hồn lãng mạn. Cô ấy mang đến niềm vui và hạnh phúc cho mọi người xung quanh. Với nụ cười tỏa nắng và sự dịu dàng, cô ấy là người bạn đời lý tưởng để cùng nhau viết nên câu chuyện tình yêu đẹp nhất.",
    social: {
      instagram: "#",
      facebook: "#",
      twitter: "#"
    }
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 }
};

const BrideGroomSection = () => {
  return (
    <section 
      id="bridegroom" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-32 h-32"
      >
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-0 right-0 w-32 h-32 transform rotate-90"
      >
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute bottom-0 left-0 w-32 h-32 transform rotate-270"
      >
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-0 right-0 w-32 h-32 transform rotate-180"
      >
        <Image 
          src="/images/album-corner.png" 
          alt="Corner decoration" 
          width={150}
          height={150}
          style={{ objectFit: 'contain' }}
        />
      </motion.div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          className="relative mb-16 text-center"
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
          <h2 className="text-2xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block animated fadeInDown">
            Cô Dâu & Chú Rể
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

        {/* Couple Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Groom Card */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative w-48 h-48 mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full transform rotate-45 group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={coupleInfo.bride.imageSrc}
                      alt={`Ảnh ${coupleInfo.bride.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-wedding text-rose-700 mb-2">{coupleInfo.bride.title}</h3>
                <h4 className="text-xl font-medium text-gray-800 mb-4">{coupleInfo.bride.name}</h4>
                <p className="text-gray-600 mb-6 font-serif italic">{coupleInfo.bride.description}</p>
                <div className="flex space-x-4">
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.bride.social.instagram} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.bride.social.facebook} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.bride.social.twitter} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bride Card */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
              <div className="flex flex-col items-center text-center">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative w-48 h-48 mb-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-rose-300 rounded-full transform -rotate-45 group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={coupleInfo.groom.imageSrc}
                      alt={`Ảnh ${coupleInfo.groom.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-wedding text-rose-700 mb-2">{coupleInfo.groom.title}</h3>
                <h4 className="text-xl font-medium text-gray-800 mb-4">{coupleInfo.groom.name}</h4>
                <p className="text-gray-600 mb-6 font-serif italic">{coupleInfo.groom.description}</p>
                <div className="flex space-x-4">
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.groom.social.instagram} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.groom.social.facebook} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.2 }}
                    href={coupleInfo.groom.social.twitter} 
                    className="text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Decoration */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 flex justify-center"
        >
          <div className="w-48 md:w-72 h-8 opacity-70">
            <Image 
              src="/images/heart-divider.png" 
              alt="Heart divider" 
              width={500}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrideGroomSection; 