"use client";

import { useState, useEffect } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MapPinned, Save, RefreshCw, Calendar, Eye, Clock, Map, PlusCircle, Trash, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage, getWeddingImages } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { defaultEvents } from '@/config/templateConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';

interface EventItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  location: string;
  address?: string;
  mapLink?: string;
  image?: string;
}

interface EventsCustomizerProps {
  weddingId: string;
  initialData: {
    eventsTitle?: string;
    eventsDescription?: string;
    eventDate?: Date | null;
    address?: string;
    mapUrl?: string;
    eventsList?: EventItem[];
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function EventsCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: EventsCustomizerProps) {
  // Events info state
  const [eventsTitle, setEventsTitle] = useState(initialData.eventsTitle || "Sự Kiện");
  const [eventsDescription, setEventsDescription] = useState(
    initialData.eventsDescription || 
    "Những khoảnh khắc quan trọng trong ngày trọng đại."
  );
  
  // Calendar info state (moved from CalendarCustomizer)
  const [eventDate, setEventDate] = useState<Date | null>(
    initialData.eventDate || new Date(2023, 11, 4)
  );
  const [address, setAddress] = useState(
    initialData.address || 
    "Khách sạn Mường Thanh, 78 Đường Hùng Vương, Phường 1, Tp. Vĩnh Long, Vĩnh Long"
  );
  const [mapUrl, setMapUrl] = useState(
    initialData.mapUrl || 
    "https://maps.google.com/maps?q=Khách+sạn+Mường+Thanh+Vĩnh+Long&t=&z=13&ie=UTF8&iwloc=&output=embed"
  );
  
  // Events list 
  const [eventsList, setEventsList] = useState<EventItem[]>(
    initialData.eventsList && initialData.eventsList.length > 0 
      ? initialData.eventsList 
      : defaultEvents
  );
  
  // Event editing state
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventItem | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  
  // Image selection states
  const [uploading, setUploading] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general");

  const { isAuthenticated } = useAuth();

  // Load uploaded images when component mounts
  useEffect(() => {
    if (weddingId) {
      loadUploadedImages();
    }
  }, [weddingId]);

  // Load images from Firebase storage
  const loadUploadedImages = async () => {
    if (!weddingId) return;
    
    setIsLoadingImages(true);
    try {
      const images = await getWeddingImages(weddingId);
      setUploadedImages(images);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.includes('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn (tối đa 10MB)");
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload to Firebase Storage
      const path = `weddings/${weddingId}/event-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadImage(weddingId, file, path);
      
      if (imageUrl) {
        // Update the current event
        if (currentEvent) {
          setCurrentEvent({
            ...currentEvent,
            image: imageUrl
          });
        }
        
        // Add to uploaded images list
        setUploadedImages(prev => [...prev, imageUrl]);
        
        toast.success("Ảnh đã được tải lên");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  // Format the date in Vietnamese
  const formatEventDate = (date: Date | null) => {
    if (!date) return '';
    
    try {
      return format(date, 'EEEE, dd MMMM yyyy', { locale: vi });
    } catch (error) {
      console.error("Date formatting error:", error);
      return '';
    }
  };

  // Process Google Maps URL to ensure it's in embed format
  const processMapUrl = (url: string): string => {
    if (!url) return '';
    
    // Check if it's already an embed URL
    if (url.includes('google.com/maps/embed') || url.includes('output=embed')) {
      return url;
    }
    
    // Check if it's a place search URL
    if (url.includes('google.com/maps/place')) {
      // Extract coordinates or query if available
      const placeMatch = url.match(/place\/([^\/]+)/);
      if (placeMatch) {
        const placeQuery = placeMatch[1];
        return `https://maps.google.com/maps?q=${placeQuery}&output=embed`;
      }
    }
    
    // Check if it's a regular Google Maps URL
    if (url.includes('google.com/maps')) {
      // Try to extract the query parameter
      const queryMatch = url.match(/[?&]q=([^&]+)/);
      if (queryMatch) {
        const query = queryMatch[1];
        return `https://maps.google.com/maps?q=${query}&output=embed`;
      }
    }
    
    // If it's a custom URL, just add the output=embed parameter
    if (url.includes('google.com/maps')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}output=embed`;
    }
    
    // If it doesn't match any known pattern, return as is
    return url;
  };

  // Handle selecting an image from uploaded ones
  const handleImageSelect = (imageUrl: string) => {
    if (currentEvent) {
      setCurrentEvent({
        ...currentEvent,
        image: imageUrl
      });
    }
    setShowImageSelector(false);
    toast.success("Đã chọn ảnh cho sự kiện");
  };

  // Open event dialog for editing
  const openEventDialog = (event: EventItem | null = null) => {
    if (event) {
      setCurrentEvent({...event});
      setIsNewEvent(false);
    } else {
      setCurrentEvent({
        id: uuidv4(),
        title: "Tên sự kiện mới",
        description: "Mô tả sự kiện",
        time: "12:00",
        location: "Địa điểm",
        address: "",
        mapLink: "",
        image: ""
      });
      setIsNewEvent(true);
    }
    setIsEventDialogOpen(true);
  };

  // Close event dialog
  const closeEventDialog = () => {
    setIsEventDialogOpen(false);
    setCurrentEvent(null);
  };

  // Save current event
  const saveEvent = () => {
    if (!currentEvent) return;
    
    if (isNewEvent) {
      // Add new event
      setEventsList(prev => [...prev, currentEvent]);
    } else {
      // Update existing event
      setEventsList(prev => prev.map(event => 
        event.id === currentEvent.id ? currentEvent : event
      ));
    }
    
    toast.success(`Đã ${isNewEvent ? 'thêm' : 'cập nhật'} sự kiện`);
    closeEventDialog();
  };

  // Delete an event
  const deleteEvent = (eventId: string) => {
    setEventsList(prev => prev.filter(event => event.id !== eventId));
    toast.success("Đã xóa sự kiện");
  };

  // Preview events settings (without saving to database)
  const handlePreview = () => {
    const previewData = {
      eventsTitle: eventsTitle,
      eventsDescription: eventsDescription,
      eventDate: eventDate,
      address: address,
      mapUrl: processMapUrl(mapUrl),
      eventsList: eventsList
    };
    
    onPreview(previewData);
    toast.success("Xem trước thay đổi");
  };
  
  // Reset to initial values
  const handleReset = () => {
    // Update local state
    setEventsTitle(initialData.eventsTitle || "Sự Kiện");
    setEventsDescription(initialData.eventsDescription || "Những khoảnh khắc quan trọng trong ngày trọng đại.");
    setEventDate(initialData.eventDate || new Date(2023, 11, 4));
    setAddress(initialData.address || "Khách sạn Mường Thanh, 78 Đường Hùng Vương, Phường 1, Tp. Vĩnh Long, Vĩnh Long");
    setMapUrl(initialData.mapUrl || "https://maps.google.com/maps?q=Khách+sạn+Mường+Thanh+Vĩnh+Long&t=&z=13&ie=UTF8&iwloc=&output=embed");
    setEventsList(initialData.eventsList && initialData.eventsList.length > 0 
      ? initialData.eventsList 
      : defaultEvents);
    
    // Send the reset data to parent component
    const resetData = {
      eventsTitle: initialData.eventsTitle || "Sự Kiện",
      eventsDescription: initialData.eventsDescription || "Những khoảnh khắc quan trọng trong ngày trọng đại.",
      eventDate: initialData.eventDate || new Date(2023, 11, 4),
      address: initialData.address || "Khách sạn Mường Thanh, 78 Đường Hùng Vương, Phường 1, Tp. Vĩnh Long, Vĩnh Long",
      mapUrl: initialData.mapUrl || "https://maps.google.com/maps?q=Khách+sạn+Mường+Thanh+Vĩnh+Long&t=&z=13&ie=UTF8&iwloc=&output=embed",
      eventsList: initialData.eventsList && initialData.eventsList.length > 0 
        ? initialData.eventsList 
        : defaultEvents
    };
    
    onPreview(resetData);
    toast.success("Đã đặt lại tất cả cài đặt");
  };

  // Save events settings to the database
  const saveEventsSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Process map URL if needed
      const processedMapUrl = processMapUrl(mapUrl);
      
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (eventsTitle && eventsTitle.trim() !== '') {
        updateData.eventsTitle = eventsTitle.trim();
      }
      
      if (eventsDescription && eventsDescription.trim() !== '') {
        updateData.eventsDescription = eventsDescription.trim();
      }
      
      // Add calendar fields (moved from CalendarCustomizer)
      if (eventDate) {
        updateData.eventDate = eventDate;
      }
      
      if (address && address.trim() !== '') {
        updateData.address = address.trim();
      }
      
      if (processedMapUrl && processedMapUrl.trim() !== '') {
        updateData.mapUrl = processedMapUrl.trim();
      }
      
      // Include events list if it exists
      if (eventsList && eventsList.length > 0) {
        updateData.eventsList = eventsList;
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
      
      toast.success("Đã lưu thông tin sự kiện");
    } catch (error) {
      console.error("Error saving events settings:", error);
      setSaveError("Không thể lưu thông tin. Vui lòng thử lại.");
      toast.error("Không thể lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
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
            <MapPinned className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Sự Kiện & Địa Điểm</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-pink-200/50" />
          
          <Tabs 
            defaultValue="general" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full mb-2 sticky top-12 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="general" className="text-xs">Thông tin</TabsTrigger>
              <TabsTrigger value="date-location" className="text-xs">Ngày & Địa điểm</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Sự kiện</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="eventsTitle">Tiêu đề</Label>
                <Input
                  id="eventsTitle"
                  placeholder="Tiêu đề sự kiện"
                  value={eventsTitle}
                  onChange={(e) => setEventsTitle(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventsDescription">Mô tả</Label>
                <Textarea
                  id="eventsDescription"
                  placeholder="Mô tả sự kiện"
                  value={eventsDescription}
                  onChange={(e) => setEventsDescription(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="date-location" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-rose-600" />
                  <span>Ngày cưới</span>
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate ? eventDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const dateString = e.target.value;
                    if (dateString) {
                      const newDate = new Date(dateString);
                      setEventDate(newDate);
                    } else {
                      setEventDate(null);
                    }
                  }}
                  className="h-8 text-sm"
                />
                {eventDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">Ngày đã chọn:</span> {formatEventDate(eventDate)}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1">
                  <MapPinned className="h-3.5 w-3.5 text-rose-600" />
                  <span>Địa chỉ</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Địa chỉ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mapUrl" className="flex items-center gap-1">
                  <Map className="h-3.5 w-3.5 text-rose-600" />
                  <span>Google Maps URL</span>
                </Label>
                <Input
                  id="mapUrl"
                  placeholder="Google Maps URL"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-gray-500">
                  Dán URL từ Google Maps vào đây. Hệ thống sẽ tự động chuyển đổi thành định dạng nhúng.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-3 px-3 py-2 max-h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <Label>Danh sách sự kiện</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs px-2 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-rose-600 border-pink-200"
                  onClick={() => openEventDialog()}
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>Thêm sự kiện</span>
                </Button>
              </div>
              
              {eventsList.length === 0 ? (
                <div className="text-center p-4 text-sm text-gray-500">
                  Chưa có sự kiện nào. Bấm "Thêm sự kiện" để bắt đầu.
                </div>
              ) : (
                <div className="space-y-3">
                  {eventsList.map((event) => (
                    <div 
                      key={event.id}
                      className="p-2 border border-gray-200 rounded-md bg-white flex gap-2 items-start relative group"
                    >
                      {event.image ? (
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image 
                            src={event.image} 
                            alt={event.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-md flex-shrink-0">
                          <Calendar className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-rose-400" />
                          <span className="text-xs">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPinned className="h-3 w-3 text-rose-400" />
                          <span className="text-xs line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openEventDialog(event)}
                        >
                          <PlusCircle className="h-3 w-3 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteEvent(event.id)}
                        >
                          <Trash className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
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
                  Xem trước
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                onClick={saveEventsSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="animate-spin">◌</span> 
                    Đang lưu...
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
                  Đặt lại
                </span>
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Event Editor Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isNewEvent ? "Thêm sự kiện mới" : "Chỉnh sửa sự kiện"}</DialogTitle>
          </DialogHeader>
          
          {currentEvent && (
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="event-title">Tên sự kiện</Label>
                <Input
                  id="event-title"
                  value={currentEvent.title}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  placeholder="Tên sự kiện"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-description">Mô tả</Label>
                <Textarea
                  id="event-description"
                  value={currentEvent.description || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  placeholder="Mô tả chi tiết về sự kiện"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-time" className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    <span>Thời gian</span>
                  </Label>
                  <Input
                    id="event-time"
                    value={currentEvent.time}
                    onChange={(e) => setCurrentEvent({...currentEvent, time: e.target.value})}
                    placeholder="Ví dụ: 18:00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-location" className="flex items-center gap-1">
                    <MapPinned className="h-3.5 w-3.5 text-rose-500" />
                    <span>Địa điểm</span>
                  </Label>
                  <Input
                    id="event-location"
                    value={currentEvent.location}
                    onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                    placeholder="Tên địa điểm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-address">Địa chỉ chi tiết</Label>
                <Input
                  id="event-address"
                  value={currentEvent.address || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, address: e.target.value})}
                  placeholder="Địa chỉ chi tiết (không bắt buộc)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-map-link">Link Google Maps</Label>
                <Input
                  id="event-map-link"
                  value={currentEvent.mapLink || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, mapLink: e.target.value})}
                  placeholder="Link Google Maps (không bắt buộc)"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Hình ảnh sự kiện</Label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                    {currentEvent.image ? (
                      <Image
                        src={currentEvent.image}
                        alt="Event image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => document.getElementById('event-image-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin">◌</span> Đang tải...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Upload className="h-3 w-3 mr-1" /> Tải ảnh mới
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setShowImageSelector(true)}
                        disabled={isLoadingImages}
                      >
                        {isLoadingImages ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin">◌</span> Đang tải...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3 mr-1" /> Chọn ảnh
                          </span>
                        )}
                      </Button>
                      <Input
                        id="event-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    {currentEvent.image && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500"
                        onClick={() => setCurrentEvent({...currentEvent, image: ''})}
                      >
                        <Trash className="h-3 w-3 mr-1" /> Xóa ảnh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Image Selector Modal */}
              {showImageSelector && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Chọn ảnh</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageSelector(false)}
                      >
                        <span className="sr-only">Đóng</span>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    {isLoadingImages ? (
                      <div className="text-center py-10">
                        <div className="animate-spin text-pink-500 text-2xl mb-2">◌</div>
                        <p>Đang tải danh sách ảnh...</p>
                      </div>
                    ) : uploadedImages.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <ImageIcon className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p>Chưa có ảnh nào được tải lên</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square cursor-pointer hover:ring-2 hover:ring-pink-500 rounded-md overflow-hidden"
                            onClick={() => handleImageSelect(imageUrl)}
                          >
                            <Image
                              src={imageUrl}
                              alt={`Uploaded image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="ghost" onClick={closeEventDialog}>Hủy</Button>
            <Button onClick={saveEvent} className="bg-rose-600 hover:bg-rose-700">Lưu sự kiện</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 