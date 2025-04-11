"use client";

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';

const StorySection = () => {
  const timelineEvents = [
    {
      id: 1,
      date: "Ngày 04/10/2018",
      title: "Ngày Đầu Tiên",
      description: "Chúng tôi gặp nhau trong một buổi hẹn hò ngẫu nhiên. Ngay từ cái nhìn đầu tiên, tôi đã biết rằng cô ấy là người đặc biệt.",
      image: "/images/album/hero.png",
      position: "left"
    },
    {
      id: 2,
      date: "Ngày 14/02/2019",
      title: "Valentine Đầu Tiên",
      description: "Chúng tôi đã có buổi hẹn hò Valentine đầu tiên. Đó là khoảnh khắc tôi nhận ra mình đã yêu cô ấy.",
      image: "/images/album/hero.png",
      position: "right"
    },
    {
      id: 3,
      date: "Ngày 20/12/2020",
      title: "Cùng Nhau Vượt Qua",
      description: "Chúng tôi đã cùng nhau vượt qua những thử thách đầu tiên trong cuộc sống. Mỗi khó khăn chỉ làm tình yêu của chúng tôi thêm bền chặt.",
      image: "/images/album/hero.png",
      position: "left"
    },
    {
      id: 4,
      date: "Ngày 15/06/2023",
      title: "Lời Cầu Hôn",
      description: "Dưới ánh hoàng hôn, tôi đã quỳ xuống và cầu hôn cô ấy. Và cô ấy đã nói 'Có'!",
      image: "/images/album/hero.png",
      position: "right"
    }
  ];

  return (
    <section 
      id="story" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="hidden md:block absolute top-0 left-0 w-24 h-24 opacity-60 sway">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="hidden md:block absolute top-0 right-0 w-24 h-24 opacity-60 transform rotate-90 sway delay-1s">
        <Image 
          src="/images/flower-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
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
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block animated fadeInDown">
            Chuyện Tình Yêu
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

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-rose-200 to-rose-300 hidden md:block"></div>

          {/* Timeline Events */}
          {timelineEvents.map((event, index) => (
            <div 
              key={event.id}
              className={`relative mb-16 md:mb-24 last:mb-0 animated fadeInUp delay-${index + 1}s`}
            >
              {/* Timeline Dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg hidden md:block"></div>

              {/* Event Content */}
              <div className={`md:flex items-center ${event.position === 'left' ? 'md:flex-row-reverse' : ''}`}>
                {/* Image */}
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                  <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl transform hover:scale-[1.02] transition-transform duration-300">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className={`w-full md:w-1/2 ${event.position === 'left' ? 'md:pr-8' : 'md:pl-8'}`}>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-rose-100">
                    <div className="flex items-center mb-2">
                      <Heart className="w-5 h-5 text-rose-500 mr-2" />
                      <span className="text-rose-600 font-medium">{event.date}</span>
                    </div>
                    <h3 className="text-xl font-script text-rose-700 mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Decoration */}
        <div className="mt-16 flex justify-center">
          <div className="w-48 md:w-72 h-8 opacity-70">
            <Image 
              src="/images/heart-divider.png" 
              alt="Heart divider" 
              width={500}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection; 