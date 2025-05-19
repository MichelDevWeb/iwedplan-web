"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Heart, Image as ImageIcon, MessageSquare, Users, Video, Download, Apple, Smartphone, Star, ChevronRight, LogIn, Mail, Phone, MapPin, Github, Twitter, Instagram, Facebook } from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import CreateWeddingDialog from "@/components/dialogs/CreateWeddingDialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/common/Header";
import { translations, Language } from "@/lib/translations";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('vi');
  const { isAuthenticated, loading } = useAuth();
  const t = translations[language];

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [1, 1, 0.5, 0]);

  const router = useRouter();

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setCreateDialogOpen(true);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Wedding Creation Dialog */}
      <CreateWeddingDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {/* Use the Header component */}
      <Header setLanguage={(lang) => setLanguage(lang as Language)} language={language} />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">        
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y }}
        >
          <NextImage
            src="/images/landing/hero.png"
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
            {t.heroTitle}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t.heroSubtitle}
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
              onClick={handleCreateClick}
              disabled={loading}
            >
              {loading ? (
                <>{t.loading}</>
              ) : isAuthenticated ? (
                <>{t.getStarted} <ArrowRight className="ml-2" /></>
              ) : (
                <>{t.loginToStart} <LogIn className="ml-2" /></>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-12 font-playfair"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t.featuresTitle}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.featuresList.map((feature, index) => (
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
                  {getFeatureIcon(index)}
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
                {t.downloadTitle}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t.downloadSubtitle}
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
                      {t.appStore}
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
                      {t.googlePlay}
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
            {t.websitesTitle}
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
                          {t.viewWebsite} <ChevronRight className="ml-1 h-4 w-4" />
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
              {t.readyTitle}
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              {t.readySubtitle}
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleCreateClick}
              >
                {loading ? (
                  <>{t.loading}</>
                ) : isAuthenticated ? (
                  <>{t.startNow} <ArrowRight className="ml-2" /></>
                ) : (
                  <>{t.loginToStart} <LogIn className="ml-2" /></>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-xl font-bold mb-4 font-playfair">iWedPlan</h3>
              <p className="text-gray-300 mb-4">
                {t.companyDescription}
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-300 hover:text-pink-400">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-pink-400">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-pink-400">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-gray-300 hover:text-pink-400">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.quickLinks}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-300 hover:text-pink-400">
                    {t.features}
                  </Link>
                </li>
                <li>
                  <Link href="#download-app" className="text-gray-300 hover:text-pink-400">
                    {t.downloadApp}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-gray-300 hover:text-pink-400">
                    {t.pricing}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.legal}</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-pink-400">
                    {t.termsOfUse}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-pink-400">
                    {t.privacyPolicy}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-pink-400">
                    {t.refundPolicy}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t.contact}</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-pink-400" />
                  <span className="text-gray-300">
                    {t.address}
                  </span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-pink-400" />
                  <Link href="mailto:info@iwedplan.com" className="text-gray-300 hover:text-pink-400">
                    info@iwedplan.com
                  </Link>
                </li>
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-pink-400" />
                  <Link href="tel:+84123456789" className="text-gray-300 hover:text-pink-400">
                    +84 123 456 789
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} iWedPlan. {t.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to get the appropriate feature icon
function getFeatureIcon(index: number) {
  const icons = [
    <Heart key={0} className="w-8 h-8 text-pink-500" />,
    <Calendar key={1} className="w-8 h-8 text-pink-500" />,
    <ImageIcon key={2} className="w-8 h-8 text-pink-500" />,
    <Video key={3} className="w-8 h-8 text-pink-500" />,
    <Users key={4} className="w-8 h-8 text-pink-500" />,
    <MessageSquare key={5} className="w-8 h-8 text-pink-500" />
  ];
  
  return icons[index % icons.length];
}

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