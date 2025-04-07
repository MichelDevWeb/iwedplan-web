"use client"; // Required for react-hook-form and client-side interactions

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { app } from '@/lib/firebase/firebaseConfig';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
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
const db = getFirestore(app);
const wishesCollectionRef = collection(db, "wishes");

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setSubmitStatus(null);
    console.log("Submitting wish:", values);

    try {
      const docRef = await addDoc(wishesCollectionRef, {
        name: values.name,
        message: values.message,
        timestamp: serverTimestamp(),
      });
      console.log("Document written with ID: ", docRef.id);
      setSubmitStatus('success');
      form.reset();
      // Clear success message after a few seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (e) {
      console.error("Error adding document: ", e);
      setSubmitStatus('error');
      // Clear error message after a few seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="wishes" className="w-full py-16 flex flex-col items-center justify-center bg-white px-4 overflow-hidden">
      <h2 className="text-3xl font-bold mb-8 text-center animated fadeInDown">Sổ Lưu Bút</h2>

      {/* --- Wish Submission Form --- */}
      <Card className="w-full max-w-lg mb-12 shadow-md animated fadeInUp delay-1s">
        <CardHeader>
          <CardTitle className="text-center">Gửi lời chúc</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên của bạn</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên của bạn..." {...field} />
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
                    <FormLabel>Lời chúc</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Để lại lời chúc của bạn tại đây..."
                        className="resize-none h-28"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                {isSubmitting ? 'Đang gửi...' : 'Gửi lời chúc'}
              </Button>

              {submitStatus === 'success' && (
                <p className="text-sm text-green-600 text-center">Cảm ơn bạn đã gửi lời chúc!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-sm text-red-600 text-center">Đã xảy ra lỗi. Vui lòng thử lại.</p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- Display Submitted Wishes --- */}
      <div className="w-full max-w-lg">
        <h3 className="text-2xl font-semibold mb-6 text-center animated fadeInUp delay-2s">Lời chúc từ mọi người</h3>
        {isLoadingWishes ? (
          <p className="text-center text-gray-500 animated fadeIn delay-3s">Đang tải lời chúc...</p>
        ) : wishes.length === 0 ? (
          <p className="text-center text-gray-500 animated fadeIn delay-3s">Chưa có lời chúc nào.</p>
        ) : (
          <div className="space-y-4">
            {wishes.map((wish, index) => (
              <Card
                key={wish.id}
                className="shadow-sm animated fadeInUp"
                style={{ animationDelay: `${index * 0.1 + 2.5}s` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{wish.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{wish.message}</p>
                </CardContent>
                <CardFooter className="text-xs text-gray-500 pt-2">
                  {/* Format timestamp if needed */}
                  {wish.timestamp?.toDate().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WishesSection; 