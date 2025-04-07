"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CalendarSection = () => {
  // Set your relationship start date here (format: YYYY-MM-DD)
  const startDate = new Date("2018-10-04");
  
  // State for the time count
  const [timeSince, setTimeSince] = useState({ years: 0, months: 0, days: 0 });
  
  // Format date for display
  const formattedStartDate = startDate.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  
  // Calculate time difference
  useEffect(() => {
    const calculateTimeSince = () => {
      const now = new Date();
      
      // Calculate years
      let years = now.getFullYear() - startDate.getFullYear();
      
      // Calculate months
      let months = now.getMonth() - startDate.getMonth();
      
      // If current month is before start month in the year, adjust years and months
      if (months < 0) {
        years--;
        months += 12;
      }
      
      // Calculate days
      let days = now.getDate() - startDate.getDate();
      
      // If current day is before start day in the month, adjust
      if (days < 0) {
        // Get last month's last day
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
        months--;
        
        // If months becomes negative after adjustment
        if (months < 0) {
          months += 12;
          years--;
        }
      }
      
      setTimeSince({ years, months, days });
    };
    
    // Calculate initially
    calculateTimeSince();
    
    // Update every day
    const timer = setInterval(calculateTimeSince, 1000 * 60 * 60 * 24);
    
    return () => clearInterval(timer);
  }, [startDate]);
  
  // Calendar days display
  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  
  // Generate calendar for the month of the start date
  const calendarMonth = startDate.getMonth();
  const calendarYear = startDate.getFullYear();
  const calendarDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  
  // Generate array of days for the calendar
  const calendarArray = [];
  
  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarArray.push(null);
  }
  
  // Add the days of the month
  for (let i = 1; i <= calendarDays; i++) {
    calendarArray.push(i);
  }
  
  return (
    <section 
      id="calendar" 
      className="w-full py-16 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, rgba(254, 242, 242, 0.8), rgba(252, 231, 243, 0.8))"
      }}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-24 h-24 opacity-60 sway">
        <Image 
          src="/images/calendar-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-60 transform rotate-90 sway delay-1s">
        <Image 
          src="/images/calendar-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 opacity-60 transform -rotate-90 sway delay-2s">
        <Image 
          src="/images/calendar-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 opacity-60 transform rotate-180 sway delay-3s">
        <Image 
          src="/images/calendar-corner.png" 
          alt="Corner decoration" 
          width={100}
          height={100}
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      {/* Main content */}
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="relative mb-8 text-center">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-8 inline-block animated fadeInDown">
            Ngày Đầu Tiên
          </h2>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 rotate-180 w-40 h-8 opacity-70">
            <Image 
              src="/images/divider-ornament.png" 
              alt="Ornament" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <p className="text-center text-gray-700 mb-10 max-w-2xl mx-auto font-serif italic animated fadeInUp delay-1s">
        &#34;Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.&#34;
        </p>
        
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center animated fadeIn delay-2s">
          {/* Calendar Card */}
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden border border-pink-200">
            {/* Calendar Header */}
            <div className="bg-rose-100 p-4 flex flex-col items-center">
              <h3 className="text-lg font-bold text-rose-700">
                {startDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h3>
              <p className="text-sm text-rose-600 font-medium">Ngày Bắt Đầu Tình Yêu</p>
            </div>
            
            {/* Calendar Grid */}
            <div className="p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="text-center text-xs font-bold text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarArray.map((day, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square flex items-center justify-center text-sm rounded-full
                      ${day === startDate.getDate() 
                        ? 'bg-rose-500 text-white font-bold ring-4 ring-rose-200 ring-opacity-50' 
                        : day ? 'hover:bg-rose-100' : ''}
                    `}
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center py-2 border-t border-pink-100">
                <p className="text-sm text-rose-600">Ngày đầu tiên: {formattedStartDate}</p>
              </div>
            </div>
          </div>
          
          {/* Time Counter */}
          <div className="w-full max-w-md">
            <div className="text-center mb-4">
              <h3 className="text-xl font-script text-rose-700 mb-2">Đã Bên Nhau</h3>
              <div className="h-0.5 w-20 bg-rose-200 mx-auto"></div>
            </div>
            
            <div className="flex justify-center gap-4 md:gap-8">
              {/* Years */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center border border-pink-200">
                  <span className="text-4xl font-bold text-rose-600 font-script">{timeSince.years}</span>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">Năm</span>
              </div>
              
              {/* Months */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center border border-pink-200">
                  <span className="text-4xl font-bold text-rose-600 font-script">{timeSince.months}</span>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">Tháng</span>
              </div>
              
              {/* Days */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-lg shadow-md flex items-center justify-center border border-pink-200">
                  <span className="text-4xl font-bold text-rose-600 font-script">{timeSince.days}</span>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700">Ngày</span>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-700 italic font-serif">
                Mỗi khoảnh khắc đã qua là một kỷ niệm đáng trân trọng
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom decoration */}
        <div className="mt-12 flex justify-center animated fadeIn delay-3s">
          <div className="w-72 h-8 opacity-70">
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

export default CalendarSection; 