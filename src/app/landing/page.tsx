"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Heart, Image as ImageIcon, MessageSquare, Users, Video, Download, Apple, Smartphone, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0.5, 0]);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <NextImage
            src="/images/landing-hero.jpg"
            alt="Wedding Planner Hero"
            fill
            className="object-cover"
            priority={true}
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"
            style={{ opacity }}
          />
        </motion.div>
        
        <motion.div 
          className="relative z-10 text-center px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 1,
            ease: [0.6, -0.05, 0.01, 0.99]
          }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6 font-playfair"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            iWedPlan
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Tạo website cưới đẹp mắt và chuyên nghiệp trong vài phút
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/create">
                Bắt đầu tạo website cưới <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-playfair"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Tính năng nổi bật
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  rotate: [0, -2, 2, -2, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <motion.div 
                  className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold mb-4"
                  whileHover={{ color: "#ec4899" }}
                >
                  {feature.title}
                </motion.h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section id="download-app" className="py-20 bg-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="flex-1"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 font-playfair">
                Tải ứng dụng iWedPlan
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Quản lý website cưới của bạn mọi lúc, mọi nơi
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-black hover:bg-gray-900 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="#">
                      <Apple className="mr-2 h-6 w-6" />
                      Tải trên App Store
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-black hover:bg-gray-900 text-white px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    asChild
                  >
                    <Link href="#">
                      <Smartphone className="mr-2 h-6 w-6" />
                      Tải trên Google Play
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <NextImage
                src="/images/app-preview.png"
                alt="App Preview"
                width={500}
                height={800}
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Public Wedding Websites Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-playfair"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Website cưới nổi bật
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weddingWebsites.map((website, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <motion.div 
                  className="relative h-48"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <NextImage
                    src={website.image}
                    alt={website.title}
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <div className="p-6">
                  <motion.h3 
                    className="text-xl font-semibold mb-2"
                    whileHover={{ color: "#ec4899" }}
                  >
                    {website.title}
                  </motion.h3>
                  <p className="text-gray-600 mb-4">{website.description}</p>
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-gray-600">{website.rating}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                    >
                      <Button
                        variant="ghost"
                        className="text-pink-500 hover:text-pink-600"
                        asChild
                      >
                        <Link href={website.url}>
                          Xem website <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 font-playfair"
              whileHover={{ scale: 1.05 }}
            >
              Sẵn sàng tạo website cưới của bạn?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              Tạo website cưới đẹp mắt và chuyên nghiệp chỉ trong vài phút
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link href="/create">
                  Bắt đầu ngay <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <Heart className="w-8 h-8 text-pink-500" />,
    title: "Thiết kế đẹp mắt",
    description: "Giao diện sang trọng, tinh tế với nhiều mẫu thiết kế phù hợp cho đám cưới của bạn"
  },
  {
    icon: <Calendar className="w-8 h-8 text-pink-500" />,
    title: "Quản lý sự kiện",
    description: "Dễ dàng thêm và quản lý các sự kiện trong đám cưới của bạn"
  },
  {
    icon: <ImageIcon className="w-8 h-8 text-pink-500" />,
    title: "Album ảnh",
    description: "Trưng bày những khoảnh khắc đẹp nhất của bạn với album ảnh chất lượng cao"
  },
  {
    icon: <Video className="w-8 h-8 text-pink-500" />,
    title: "Video cưới",
    description: "Chia sẻ video cưới của bạn với bạn bè và người thân"
  },
  {
    icon: <Users className="w-8 h-8 text-pink-500" />,
    title: "Thông tin cô dâu chú rể",
    description: "Giới thiệu đôi uyên ương với thiết kế trang nhã và chuyên nghiệp"
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-pink-500" />,
    title: "Sổ lưu bút",
    description: "Lưu giữ những lời chúc mừng từ bạn bè và người thân"
  }
];

const weddingWebsites = [
  {
    title: "Minh & Linh",
    description: "Một đám cưới đầy màu sắc và niềm vui",
    image: "/images/weddings/minh-linh.jpg",
    rating: "4.9",
    url: "https://minh-linh.iwedplan.com"
  },
  {
    title: "Hùng & Mai",
    description: "Đám cưới truyền thống với nét hiện đại",
    image: "/images/weddings/hung-mai.jpg",
    rating: "4.8",
    url: "https://hung-mai.iwedplan.com"
  },
  {
    title: "Tuấn & Hương",
    description: "Đám cưới lãng mạn bên bờ biển",
    image: "/images/weddings/tuan-huong.jpg",
    rating: "4.9",
    url: "https://tuan-huong.iwedplan.com"
  }
]; 