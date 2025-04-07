import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // For potential map links
import { Calendar, Clock, MapPin } from 'lucide-react'; // Import icons

// TODO: Replace with actual event data
const events = [
  {
    id: 'ceremony',
    title: 'Lễ Thành Hôn',
    date: 'Thứ Bảy, Ngày DD tháng MM năm YYYY',
    time: '9:00 sáng',
    location: 'Nhà thờ ABC / Địa điểm XYZ',
    address: '123 Đường ABC, Phường X, Quận Y, Thành phố Z',
    mapLink: '#' // TODO: Add Google Maps link
  },
  {
    id: 'reception',
    title: 'Tiệc Chiêu Đãi',
    date: 'Thứ Bảy, Ngày DD tháng MM năm YYYY',
    time: '6:00 chiều',
    location: 'Trung tâm Hội nghị Tiệc cưới ABC',
    address: '456 Đường DEF, Phường U, Quận V, Thành phố W',
    mapLink: '#' // TODO: Add Google Maps link
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="w-full py-16 flex flex-col items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-4 text-center animated fadeInDown">Sự Kiện Cưới</h2>
      <p className="text-center text-gray-600 mb-12 max-w-2xl animated fadeInUp delay-1s">
        Cảm ơn bạn rất nhiều vì đã gửi những lời chúc mừng tốt đẹp nhất đến đám cưới của chúng tôi!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {events.map((event, index) => (
          <Card
            key={event.id}
            className="shadow-md animated fadeInUp"
            style={{ animationDelay: `${index * 0.2 + 1.5}s` }}
          >
            <CardHeader>
              <CardTitle className="text-2xl text-center text-pink-600">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{event.date}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-medium">{event.time}</span>
              </div>
              <div className="flex items-start justify-center md:justify-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-semibold">{event.location}</p>
                  <p className="text-sm text-gray-500">{event.address}</p>
                </div>
              </div>
              {/* Optional: Button to link to Google Maps */}
              {event.mapLink && event.mapLink !== '#' && (
                 <div className="pt-2 text-center md:text-left">
                    <Button variant="link" asChild className="p-0 h-auto text-pink-600">
                        <a href={event.mapLink} target="_blank" rel="noopener noreferrer">
                            Xem bản đồ
                        </a>
                    </Button>
                 </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* TODO: Add Calendar graphic if desired */}
    </section>
  );
};

export default EventsSection; 