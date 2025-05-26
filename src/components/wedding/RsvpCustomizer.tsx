"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Download, Pencil, Settings, Trash2, Users, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateWeddingWebsite } from "@/lib/firebase/weddingService";
import { toast } from "sonner";
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RsvpCustomizerProps {
  weddingId: string;
  initialData?: {
    rsvpTitle?: string;
    rsvpDescription?: string;
    rsvpDeadline?: string;
  };
  onUpdate?: (data: any) => void;
}

// Define the form schema
const formSchema = z.object({
  rsvpTitle: z.string().min(2, "Tiêu đề phải có ít nhất 2 ký tự"),
  rsvpDescription: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
  rsvpDeadline: z.string(),
});

interface RsvpData {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  guests: number;
  notes?: string;
  timestamp: any;
  weddingId?: string;
}

const RsvpCustomizer: React.FC<RsvpCustomizerProps> = ({
  weddingId,
  initialData = {},
  onUpdate,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [rsvpList, setRsvpList] = useState<RsvpData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData.rsvpDeadline 
      ? new Date(initialData.rsvpDeadline) 
      : new Date()
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rsvpTitle: initialData.rsvpTitle || "Xác nhận tham dự",
      rsvpDescription: initialData.rsvpDescription || "Hãy cho chúng tôi biết bạn có thể tham dự đám cưới của chúng tôi không. Chúng tôi rất mong được gặp bạn trong ngày đặc biệt này.",
      rsvpDeadline: initialData.rsvpDeadline || format(new Date(), "dd/MM/yyyy"),
    },
  });

  // Fetch RSVPs when the dialog opens
  useEffect(() => {
    if (isDialogOpen && activeTab === "guest-list") {
      fetchRsvps();
    }
  }, [isDialogOpen, activeTab]);

  const fetchRsvps = async () => {
    setIsLoading(true);
    try {
      const db = await getFirestore();
      const rsvpsRef = collection(db, "rsvps");
      const q = query(rsvpsRef, where("weddingId", "==", weddingId));
      const querySnapshot = await getDocs(q);
      
      const rsvps: RsvpData[] = [];
      querySnapshot.forEach((doc) => {
        rsvps.push({ id: doc.id, ...doc.data() } as RsvpData);
      });
      
      // Sort by timestamp (newest first)
      setRsvpList(rsvps.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()));
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      toast.error("Không thể tải danh sách khách mời");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRsvp = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
      try {
        const db = await getFirestore();
        await deleteDoc(doc(db, "rsvps", id));
        toast.success("Đã xóa phản hồi thành công");
        fetchRsvps(); // Refresh the list
      } catch (error) {
        console.error("Error deleting RSVP:", error);
        toast.error("Không thể xóa phản hồi");
      }
    }
  };

  const exportToCSV = () => {
    if (rsvpList.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    // Create CSV content
    const headers = ["Tên", "Tham dự", "Số lượng khách", "Ghi chú", "Thời gian"];
    const csvContent = [
      headers.join(","),
      ...rsvpList.map(rsvp => [
        `"${rsvp.name}"`,
        rsvp.attending === 'yes' ? 'Có' : 'Không',
        rsvp.guests || 0,
        `"${rsvp.notes || ''}"`,
        rsvp.timestamp ? format(rsvp.timestamp.toDate(), "dd/MM/yyyy HH:mm") : ''
      ].join(","))
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rsvp-list-${format(new Date(), "dd-MM-yyyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Update the wedding document with RSVP settings
      await updateWeddingWebsite(weddingId, {
        rsvpTitle: values.rsvpTitle,
        rsvpDescription: values.rsvpDescription,
        rsvpDeadline: values.rsvpDeadline,
      });
      
      // Notify parent component of the update
      if (onUpdate) {
        onUpdate(values);
      }
      
      toast.success("Đã lưu cài đặt RSVP thành công");
    } catch (error) {
      console.error("Error updating RSVP settings:", error);
      toast.error("Không thể cập nhật cài đặt RSVP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 bg-white shadow-md hover:bg-rose-50"
        >
          <Users className="h-5 w-5 text-rose-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tùy chỉnh RSVP</DialogTitle>
          <DialogDescription>
            Quản lý cài đặt RSVP và danh sách khách mời
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
            <TabsTrigger value="guest-list">Danh sách khách</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="rsvpTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rsvpDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Nhập mô tả..." 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rsvpDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Hạn chót xác nhận</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "dd/MM/yyyy")
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                field.onChange(format(date, "dd/MM/yyyy"));
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <span className="flex items-center gap-1">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Lưu thay đổi
                    </span>
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="guest-list">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Danh sách phản hồi</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCSV}
                  disabled={rsvpList.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Xuất CSV
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : rsvpList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có phản hồi nào
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Tên</th>
                        <th className="px-4 py-2 text-center">Tham dự</th>
                        <th className="px-4 py-2 text-center">Số khách</th>
                        <th className="px-4 py-2 text-left">Ghi chú</th>
                        <th className="px-4 py-2 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rsvpList.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">{rsvp.name}</td>
                          <td className="px-4 py-3 text-center">
                            {rsvp.attending === 'yes' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Có
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Không
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">{rsvp.guests || 0}</td>
                          <td className="px-4 py-3 truncate max-w-[150px]" title={rsvp.notes}>
                            {rsvp.notes || "-"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteRsvp(rsvp.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RsvpCustomizer; 