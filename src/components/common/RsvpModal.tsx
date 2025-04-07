"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { app } from '@/lib/firebase/firebaseConfig';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Define the RSVP form schema
const rsvpFormSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự."),
  attending: z.enum(['yes', 'no'], { required_error: "Vui lòng chọn trạng thái tham dự." }),
  guests: z.coerce
    .number()
    .min(0, "Số lượng khách không hợp lệ.")
    .max(10, "Vui lòng liên hệ nếu bạn đi cùng hơn 10 người.")
    .optional(),
  notes: z.string().max(200, "Ghi chú không được quá 200 ký tự.").optional(),
}).refine(data => data.attending === 'no' || (data.attending === 'yes' && data.guests !== undefined && data.guests >= 0), {
  message: "Vui lòng nhập số lượng khách tham dự (bao gồm bạn).",
  path: ["guests"],
});

// Initialize Firestore
const db = getFirestore(app);
const rsvpCollectionRef = collection(db, "rsvps");

interface RsvpModalProps {
  trigger: React.ReactNode;
}

const RsvpModal: React.FC<RsvpModalProps> = ({ trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const form = useForm<z.infer<typeof rsvpFormSchema>>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      name: "",
      attending: undefined,
      guests: 0,
      notes: "",
    },
  });

  const attendingValue = form.watch("attending");

  async function onSubmit(values: z.infer<typeof rsvpFormSchema>) {
    setIsSubmitting(true);
    setSubmitStatus(null);
    console.log("Submitting RSVP:", values);

    const submissionData = {
        ...values,
        guests: values.attending === 'yes' ? values.guests : 0,
        timestamp: serverTimestamp(),
    };

    try {
      await addDoc(rsvpCollectionRef, submissionData);
      console.log("RSVP submitted successfully");
      setSubmitStatus('success');
      form.reset();
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus(null);
      }, 2000);
    } catch (e) {
      console.error("Error submitting RSVP: ", e);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xác nhận tham dự</DialogTitle>
          <DialogDescription>
            Vui lòng cho chúng tôi biết bạn có thể tham dự không trước ngày [RSVP Deadline Date].
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên của bạn</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên của bạn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attending"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Bạn sẽ tham dự?</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id="attending-yes"
                          value="yes"
                          checked={field.value === 'yes'}
                          onChange={field.onChange}
                          className="form-radio h-4 w-4 text-pink-600 transition duration-150 ease-in-out"
                        />
                        <Label htmlFor="attending-yes">Có, tôi sẽ tham dự</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="radio"
                          id="attending-no"
                          value="no"
                          checked={field.value === 'no'}
                          onChange={field.onChange}
                          className="form-radio h-4 w-4 text-pink-600 transition duration-150 ease-in-out"
                        />
                        <Label htmlFor="attending-no">Không, tôi rất tiếc</Label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {attendingValue === 'yes' && (
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng khách tham dự</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} min="0" />
                    </FormControl>
                    <FormDescription>
                      Bao gồm cả bạn.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Lời nhắn cho cô dâu chú rể..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitStatus === 'success' && (
              <p className="text-sm text-green-600 text-center">Cảm ơn bạn đã xác nhận!</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-sm text-red-600 text-center">Gửi xác nhận thất bại. Vui lòng thử lại.</p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                 <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-pink-500 hover:bg-pink-600 text-white">
                {isSubmitting ? 'Đang gửi...' : 'Gửi Xác Nhận'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RsvpModal; 