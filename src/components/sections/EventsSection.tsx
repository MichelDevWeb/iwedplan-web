"use client";

import React from 'react';
import Image from 'next/image';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';

const events = [
  {
    id: 'ceremony',
    title: 'Lễ Thành Hôn',
    date: 'Thứ Bảy, Ngày DD tháng MM năm YYYY',
    time: '9:00 sáng',
    location: 'Nhà thờ ABC / Địa điểm XYZ',
    address: '123 Đường ABC, Phường X, Quận Y, Thành phố Z',
    mapLink: 'https://www.google.com/maps/place/10.762622,106.660172', // Example coordinates for Ho Chi Minh City
    image: '/images/album/hero.png'
  },
  {
    id: 'reception',
    title: 'Tiệc Chiêu Đãi',
    date: 'Thứ Bảy, Ngày DD tháng MM năm YYYY',
    time: '6:00 chiều',
    location: 'Trung tâm Hội nghị Tiệc cưới ABC',
    address: '456 Đường DEF, Phường U, Quận V, Thành phố W',
    mapLink: 'https://www.google.com/maps/place/10.762622,106.660172', // Example coordinates for Ho Chi Minh City
    image: '/images/album/hero.png'
  },
];

const EventsSection = () => {
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
            Sự Kiện Cưới
          </h2>
          <div className="absolute left-1/2 transform -translate-x-1/2 rotate-180 w-32 md:w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              sizes="(max-width: 768px) 128px, 160px"
              style={{ objectFit: 'contain' }}
            />
          </div>
          <p className="text-center text-gray-600 mt-10 max-w-2xl mx-auto animated fadeInUp delay-1s">
            Cảm ơn bạn rất nhiều vì đã gửi những lời chúc mừng tốt đẹp nhất đến đám cưới của chúng tôi!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {events.map((event, index) => (
            <div 
              key={event.id}
              className="relative group animated fadeInUp"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
                <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-script text-white">{event.title}</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-100 rounded-full">
                      <Calendar className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày</p>
                      <p className="font-medium text-gray-800">{event.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-rose-100 rounded-full">
                      <Clock className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Giờ</p>
                      <p className="font-medium text-gray-800">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-rose-100 rounded-full mt-1">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-medium text-gray-800">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.address}</p>
                      <a 
                        href={event.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-2 text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        <span className="text-sm">Xem trên Google Maps</span>
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </div>
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

export default EventsSection; 