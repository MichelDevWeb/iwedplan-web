"use client"; // Required for react-hook-form and client-side interactions

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Heart, MessageSquare, Send, Clock } from 'lucide-react';
import {
  Timestamp,
} from 'firebase/firestore';

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự." }).max(50, { message: "Tên không được quá 50 ký tự." }),
  message: z.string().min(5, { message: "Lời chúc phải có ít nhất 5 ký tự." }).max(500, { message: "Lời chúc không được quá 500 ký tự." }),
});

// Define type for a Wish document
interface Wish {
  id: string;
  name: string;
  message: string;
  timestamp: Timestamp;
}

// Initialize Firestore
// const db = getFirestore(app);
// const wishesCollectionRef = collection(db, "wishes");

const WishesSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [wishes] = useState<Wish[]>([]);
  const [isLoadingWishes] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  // Fetch wishes in real-time
  // useEffect(() => {
  //   setIsLoadingWishes(true);
  //   // Query to get wishes ordered by timestamp descending
  //   const q = query(wishesCollectionRef, orderBy("timestamp", "desc"));

  //   // Set up real-time listener
  //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
  //     const wishesData = querySnapshot.docs.map(doc => ({
  //       id: doc.id,
  //       ...doc.data()
  //     })) as Wish[];
  //     setWishes(wishesData);
  //     setIsLoadingWishes(false);
  //   }, (error) => {
  //     console.error("Error fetching wishes: ", error);
  //     setIsLoadingWishes(false);
  //     // Handle error display if needed
  //   });

  //   // Cleanup listener on component unmount
  //   return () => unsubscribe();
  // }, []); // Empty dependency array ensures this runs only once on mount

  async function onSubmit() {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      form.reset();
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (error) {
      console.error("Error submitting wish: ", error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

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
            Sổ Lưu Bút
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

        {/* Wish Form */}
        <div className="relative group mb-16 animated fadeInUp">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform -rotate-2 group-hover:rotate-0 transition-transform duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-rose-600" />
              </div>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tên của bạn</label>
                <input
                  {...form.register("name")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
                  placeholder="Nhập tên của bạn..."
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Lời chúc</label>
                <textarea
                  {...form.register("message")}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors resize-none h-32"
                  placeholder="Để lại lời chúc của bạn tại đây..."
                />
                {form.formState.errors.message && (
                  <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Gửi lời chúc</span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center justify-center space-x-2">
                  <Heart className="w-5 h-5" />
                  <span>Cảm ơn bạn đã gửi lời chúc!</span>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center space-x-2">
                  <span>Đã xảy ra lỗi. Vui lòng thử lại.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Wishes List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-script text-rose-700 text-center mb-8 animated fadeInUp delay-1s">
            Lời chúc từ mọi người
          </h3>

          {isLoadingWishes ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : wishes.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Chưa có lời chúc nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishes.map((wish, index) => (
                <div
                  key={wish.id}
                  className="relative group animated fadeInUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl transform group-hover:rotate-0 transition-transform duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-rose-100 transform group-hover:scale-[1.02] transition-all duration-500">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">{wish.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{wish.timestamp?.toDate().toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{wish.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
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

export default WishesSection; 