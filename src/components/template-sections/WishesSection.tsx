"use client"; // Required for react-hook-form and client-side interactions

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Heart, MessageSquare, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addWeddingWish, getWeddingWishes } from '@/lib/firebase/wishService';
import { WeddingWish } from '@/lib/firebase/models';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import WishesCustomizer from "@/components/wedding/WishesCustomizer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }).max(50, { message: "Tên không được quá 50 ký tự." }),
  relationship: z.string().min(2, { message: "Mối quan hệ phải có ít nhất 2 ký tự." }).max(50, { message: "Mối quan hệ không được quá 50 ký tự." }),
  message: z.string().min(5, { message: "Lời chúc phải có ít nhất 5 ký tự." }).max(500, { message: "Lời chúc không được quá 500 ký tự." }),
});

interface Wish extends WeddingWish {}

interface WishesSectionProps {
  weddingId: string;
  title?: string;
  description?: string;
  wishesEnabled?: boolean;
  onSaveSettings?: (settings: Record<string, any>) => void;
}

const WishesSection: React.FC<WishesSectionProps> = ({
  weddingId,
  title = "Lời Chúc",
  description = "Gửi lời chúc mừng đến cô dâu và chú rể.",
  wishesEnabled = true,
  onSaveSettings,
}) => {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentDescription, setCurrentDescription] = useState(description);
  const [isWishesEnabled, setIsWishesEnabled] = useState(wishesEnabled);
  const [isVisible, setIsVisible] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      relationship: "",
      message: "",
    },
  });

  // Monitor when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 } // Trigger when 20% of section is visible
    );
    
    const section = document.getElementById('wishes');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.disconnect();
    };
  }, []);

  // Fetch wishes in real-time
  useEffect(() => {
    if (!weddingId) return;
    
    setIsLoadingWishes(true);
    
    // Get wishes from Firestore
    const fetchWishes = async () => {
      try {
        const allWishes = await getWeddingWishes(weddingId, {
          limit: 100
        });
        
        setWishes(allWishes);
      } catch (error) {
        console.error("Error fetching wishes:", error);
      } finally {
        setIsLoadingWishes(false);
      }
    };
    
    fetchWishes();
  }, [weddingId]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!weddingId || !isWishesEnabled) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Save wish to Firestore
      await addWeddingWish(weddingId, {
        name: data.name,
        relationship: data.relationship,
        message: data.message,
      });
      
      setSubmitStatus('success');
      form.reset();
      
      // Refresh wishes list
      const newWishes = await getWeddingWishes(weddingId, {
        limit: 100
      });
      
      // Update states with new data
      setWishes(newWishes);
      
      setTimeout(() => setSubmitStatus(null), 3000);
      toast.success("Lời chúc của bạn đã được gửi thành công!");
    } catch (error) {
      console.error("Error submitting wish: ", error);
      setSubmitStatus('error');
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle updates from WishesCustomizer
  const handleWishesUpdate = (data: any) => {
    if (data.wishesTitle) setCurrentTitle(data.wishesTitle);
    if (data.wishesDescription) setCurrentDescription(data.wishesDescription);
    if (data.wishesEnabled !== undefined) setIsWishesEnabled(data.wishesEnabled);
    
    // Call the parent's onSaveSettings if provided
    if (onSaveSettings) {
      onSaveSettings(data);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
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

  const wishItemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: { 
        delay: custom * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    })
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <section 
      id="wishes" 
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

      <motion.div 
        className="max-w-5xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
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
          <h2 className="text-3xl md:text-4xl font-script text-rose-700 font-bold relative z-10 px-4 md:px-8 inline-block">
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

        {/* Add the description here */}
        <motion.p 
          className="text-center text-gray-700 mb-10 max-w-2xl mx-auto font-serif italic"
          variants={itemVariants}
        >
          {currentDescription}
        </motion.p>
        
        {/* Wish Form - Only show if wishes are enabled */}
        {isWishesEnabled && (
          <motion.div 
            className="mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-pink-100 p-6">
              <h3 className="text-xl font-script text-rose-700 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-rose-500" />
                Gửi lời chúc
              </h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Tên của bạn</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên của bạn" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Mối quan hệ với cô dâu/chú rể</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: Bạn học, đồng nghiệp, họ hàng..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Lời chúc</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Nhập lời chúc của bạn cho đôi uyên ương..." 
                            {...field} 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button 
                      type="submit"
                      className="bg-rose-500 hover:bg-rose-600 text-white w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Clock className="animate-spin h-4 w-4 mr-2" />
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="h-4 w-4 mr-2" />
                          Gửi lời chúc
                        </span>
                      )}
                    </Button>

                    {submitStatus === 'success' && (
                      <div className="mt-3 bg-green-50 border border-green-200 p-3 rounded-md text-green-600 text-sm flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Lời chúc của bạn đã được gửi thành công!</p>
                        </div>
                      </div>
                    )}

                    {submitStatus === 'error' && (
                      <p className="text-red-600 text-sm mt-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" />
                        Có lỗi xảy ra. Vui lòng thử lại sau.
                      </p>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        )}

        {/* Display Wishes */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          {isLoadingWishes ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <p className="text-gray-500 flex items-center">
                <Clock className="animate-spin h-4 w-4 mr-2" />
                Đang tải lời chúc...
              </p>
            </div>
          ) : wishes.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <MessageSquare className="h-12 w-12 text-rose-300 mx-auto mb-2" />
              <p className="text-gray-500">
                {isWishesEnabled 
                  ? "Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc!" 
                  : "Chức năng lưu bút hiện đang bị tắt."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {wishes.map((wish, index) => (
                <motion.div 
                  key={wish.id}
                  custom={index}
                  layout
                  variants={wishItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white/90 backdrop-blur-sm rounded-lg shadow p-4 border border-pink-100 transition-all duration-300 transform hover:shadow-md hover:scale-[1.01]"
                >
                  <div className="flex items-start">
                    <div className="rounded-full p-2 mr-3 flex-shrink-0 bg-rose-100">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-800">{wish.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {wish.createdAt?.toDate() && formatDate(wish.createdAt.toDate())}
                      </p>
                      <p className="text-gray-700">{wish.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
        
        {/* Footer decorative element */}
        <div className="mt-12 flex justify-center">
          <div className="w-48 md:w-72 h-8 opacity-70">
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

      {/* Customizer */}
      {isAuthenticated && weddingId && (
        <div className="absolute top-1 right-1 z-20">
          <WishesCustomizer
            weddingId={weddingId}
            initialData={{
              wishesTitle: currentTitle,
              wishesDescription: currentDescription,
              wishesEnabled: isWishesEnabled
            }}
            onUpdate={handleWishesUpdate}
          />
        </div>
      )}
    </section>
  );
};

export default WishesSection; 