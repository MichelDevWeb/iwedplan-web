"use client";

import { useState } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar, Save, Clock, Eye, RefreshCw, Users } from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { TimePicker } from "@/components/ui/time-picker";

interface CalendarCustomizerProps {
  weddingId: string;
  initialData: {
    calendarTitle?: string;
    calendarDescription?: string;
    eventDate?: Date | null;
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function CalendarCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: CalendarCustomizerProps) {
  // Calendar info state
  const [calendarTitle, setCalendarTitle] = useState(initialData.calendarTitle || "Ngày Trọng Đại");
  const [calendarDescription, setCalendarDescription] = useState(
    initialData.calendarDescription || 
    "Đếm từng khoảnh khắc đến ngày hạnh phúc của chúng tôi."
  );
  const [eventDate, setEventDate] = useState<Date | null>(
    initialData.eventDate || new Date(2023, 11, 4)
  );
  const [eventTime, setEventTime] = useState<string>(
    eventDate ? `${eventDate.getHours().toString().padStart(2, '0')}:${eventDate.getMinutes().toString().padStart(2, '0')}` : "12:00"
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();

  // Handle time change
  const handleTimeChange = (time: string) => {
    setEventTime(time);
    
    // Update the event date with the new time
    if (eventDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(eventDate);
      newDate.setHours(hours, minutes);
      setEventDate(newDate);
    }
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      // Preserve the time when changing the date
      if (eventDate) {
        date.setHours(eventDate.getHours(), eventDate.getMinutes());
      }
      setEventDate(date);
    } else {
      setEventDate(null);
    }
  };

  // Save calendar settings to the database
  const saveCalendarSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (calendarTitle && calendarTitle.trim() !== '') {
        updateData.calendarTitle = calendarTitle.trim();
      }
      
      if (calendarDescription && calendarDescription.trim() !== '') {
        updateData.calendarDescription = calendarDescription.trim();
      }
      
      if (eventDate) {
        updateData.eventDate = eventDate;
      }
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("Không có thay đổi để lưu");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Đã lưu cài đặt lịch trình");
    } catch (error) {
      console.error("Error saving calendar settings:", error);
      setSaveError("Không thể lưu cài đặt. Vui lòng thử lại.");
      toast.error("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    const previewData = {
      calendarTitle,
      calendarDescription,
      eventDate
    };
    onPreview(previewData);
  };

  const handleReset = () => {
    setCalendarTitle(initialData.calendarTitle || "Ngày Trọng Đại");
    setCalendarDescription(initialData.calendarDescription || "Đếm từng khoảnh khắc đến ngày hạnh phúc của chúng tôi.");
    
    const initialEventDate = initialData.eventDate || new Date(2023, 11, 4);
    setEventDate(initialEventDate);
    
    // Update the time string based on the reset date
    const timeStr = initialEventDate 
      ? `${initialEventDate.getHours().toString().padStart(2, '0')}:${initialEventDate.getMinutes().toString().padStart(2, '0')}`
      : "12:00";
    setEventTime(timeStr);

    const resetData = {
      calendarTitle: initialData.calendarTitle,
      calendarDescription: initialData.calendarDescription,
      eventDate: initialData.eventDate
    };
    
    onPreview(resetData);
    toast.success("Đã đặt lại tất cả cài đặt");
  };

  return (
    <div className="z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "backdrop-blur-sm hover:bg-white/30 transition-all duration-300", 
              buttonClassName || "bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
            )}
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">
            Tùy chỉnh lịch trình
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-200/50" />
          
          <div className="px-3 py-3 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calendarTitle" className="text-sm">Tiêu đề</Label>
              <Input
                id="calendarTitle"
                placeholder="Tiêu đề lịch trình"
                value={calendarTitle}
                onChange={(e) => setCalendarTitle(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="calendarDescription" className="text-sm">Mô tả</Label>
              <Textarea
                id="calendarDescription"
                placeholder="Mô tả lịch trình"
                value={calendarDescription}
                onChange={(e) => setCalendarDescription(e.target.value)}
                className="text-sm min-h-[80px]"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate" className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-rose-500" />
                <span>Ngày diễn ra</span>
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate ? eventDate.toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  const dateString = e.target.value;
                  if (dateString) {
                    const newDate = new Date(dateString);
                    handleDateChange(newDate);
                  } else {
                    handleDateChange(null);
                  }
                }}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventTime" className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                <span>Giờ diễn ra</span>
              </Label>
              <TimePicker
                value={eventTime}
                onChange={handleTimeChange}
                className="w-full"
              />
            </div>
          </div>

          {/* Footer with Save, Preview and Reset Buttons */}
          <div className="px-3 py-2 border-t border-pink-100 mt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
            {saveError && (
              <p className="text-xs text-red-500 mb-2">{saveError}</p>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                onClick={handlePreview}
              >
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Xem trước</span>
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                onClick={saveCalendarSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">◌</span> 
                    <span className="text-xs">Đang lưu...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Lưu thay đổi
                  </span>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 transition-all duration-200 hover:scale-105"
                onClick={handleReset}
              >
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Đặt lại</span>
                </span>
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 