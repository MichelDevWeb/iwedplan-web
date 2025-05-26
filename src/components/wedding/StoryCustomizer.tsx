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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { BookOpen, Save, Upload, PlusCircle, Trash2, Calendar, Edit, ImageIcon, Eye, RefreshCw, X } from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage, getWeddingImages } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import Image from 'next/image';

interface StoryEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
  position?: 'left' | 'right';
}

interface StoryCustomizerProps {
  weddingId: string;
  initialData: {
    storyTitle?: string;
    storyDescription?: string;
    storyEvents?: StoryEvent[];
  };
  onUpdate: (data: any) => void;
  onPreview: (data: any) => void;
  buttonClassName?: string;
}

export default function StoryCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: StoryCustomizerProps) {
  // Story info state
  const [storyTitle, setStoryTitle] = useState(initialData.storyTitle || "Câu Chuyện Tình Yêu");
  const [storyDescription, setStoryDescription] = useState(
    initialData.storyDescription || 
    "Hành trình tình yêu của chúng tôi."
  );
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>(initialData.storyEvents || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [currentTab, setCurrentTab] = useState("general");
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const { isAuthenticated } = useAuth();

  // Load uploaded images on component mount
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

  // Save story settings to the database
  const saveStorySettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object with only defined, non-empty values
      const updateData: Record<string, any> = {};
      
      // Only add fields that have valid values
      if (storyTitle && storyTitle.trim() !== '') {
        updateData.storyTitle = storyTitle.trim();
      }
      
      if (storyDescription && storyDescription.trim() !== '') {
        updateData.storyDescription = storyDescription.trim();
      }
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("No changes to save");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Story settings saved successfully");
    } catch (error) {
      console.error("Error saving story settings:", error);
      setSaveError("Couldn't save story settings. Please try again.");
      toast.error("Couldn't save story settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save timeline events to the database
  const saveTimelineEvents = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updateData = {
        storyEvents: storyEvents
      };
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Timeline events saved successfully");
      setEditingEvent(null); // Close editing mode
    } catch (error) {
      console.error("Error saving timeline events:", error);
      setSaveError("Couldn't save timeline events. Please try again.");
      toast.error("Couldn't save timeline events. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new event to the timeline
  const addNewEvent = () => {
    const newEvent: StoryEvent = {
      id: `event-${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN'),
      title: "Sự kiện mới",
      description: "Mô tả sự kiện của bạn tại đây.",
      image: "/images/album/1.jpg"
    };
    
    setStoryEvents([...storyEvents, newEvent]);
    setEditingEvent(newEvent);
    setCurrentTab("timeline");
  };

  // Update an existing event
  const updateEvent = (updatedEvent: StoryEvent) => {
    const updatedEvents = storyEvents.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setStoryEvents(updatedEvents);
  };

  // Delete an event from the timeline
  const deleteEvent = (eventId: string) => {
    const updatedEvents = storyEvents.filter(event => event.id !== eventId);
    setStoryEvents(updatedEvents);
    if (editingEvent?.id === eventId) {
      setEditingEvent(null);
    }
  };

  // Handle image upload for a story event
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.includes('image/')) {
      toast.error("Please select an image file.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size too large (max 10MB).");
      return;
    }
    
    setUploading(true);
    
    try {
      // Upload the image to Firebase storage
      const uploadedImageUrl = await uploadImage(weddingId, file);
      
      // Update the event with the new image URL
      const updatedEvents = storyEvents.map(event => {
        if (event.id === eventId) {
          return { ...event, image: uploadedImageUrl };
        }
        return event;
      });
      
      setStoryEvents(updatedEvents);
      
      // Add to uploaded images list
      setUploadedImages(prev => [...prev, uploadedImageUrl]);
      
      // If we're editing this event, update the editing state too
      if (editingEvent?.id === eventId) {
        setEditingEvent({ ...editingEvent, image: uploadedImageUrl });
      }
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Couldn't upload image. Please try again.");
    } finally {
      setUploading(false);
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  // Handle selecting an existing image
  const handleImageSelect = (imageUrl: string) => {
    if (!editingEvent) return;
    
    // Update the editing event with the selected image
    setEditingEvent({ ...editingEvent, image: imageUrl });
    
    // Close the image selector
    setShowImageSelector(false);
  };

  // Preview functionality
  const handlePreview = () => {
    if (!onPreview) return;
    
    const previewData = {
      storyTitle,
      storyDescription,
      storyEvents
    };
    
    onPreview(previewData);
    toast.success("Previewing changes");
  };

  // Reset functionality
  const handleReset = () => {
    setStoryTitle(initialData.storyTitle || "Câu Chuyện Tình Yêu");
    setStoryDescription(
      initialData.storyDescription || 
      "Hành trình tình yêu của chúng tôi."
    );
    setStoryEvents(initialData.storyEvents || []);
    setEditingEvent(null);
    
    // Use preview to show reset state
    if (onPreview) {
      onPreview({
        storyTitle: initialData.storyTitle,
        storyDescription: initialData.storyDescription,
        storyEvents: initialData.storyEvents
      });
    }
    
    toast.success("All settings reset to initial values");
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
            <BookOpen className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-2">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Story Settings</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Tiêu đề</Label>
                  <Input
                    id="storyTitle"
                    placeholder="Tiêu đề câu chuyện"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyDescription">Mô tả</Label>
                  <Textarea
                    id="storyDescription"
                    placeholder="Mô tả câu chuyện"
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                </div>
                
                {saveError && (
                  <p className="text-xs text-red-500">{saveError}</p>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200"
                  onClick={saveStorySettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">◌</span> Đang lưu...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Lưu thay đổi
                    </span>
                  )}
                </Button>
              </div>
            </TabsContent>
            
            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-2">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg">Timeline Events</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2">
                {/* List of existing events */}
                {storyEvents.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No timeline events yet.</p>
                    <p>Add your first event below.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {storyEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className={`p-2 rounded-md border ${editingEvent?.id === event.id ? 'border-pink-300 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => setEditingEvent(event)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" 
                              onClick={() => deleteEvent(event.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Event editing form */}
                {editingEvent && (
                  <div className="mt-3 p-3 border border-pink-200 rounded-md bg-pink-50/50">
                    <h4 className="font-medium text-sm mb-2">Edit Event</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="eventTitle" className="text-xs">Title</Label>
                        <Input
                          id="eventTitle"
                          value={editingEvent.title}
                          onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                          className="h-7 text-xs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="eventDate" className="text-xs">Date</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={editingEvent.date}
                          onChange={(e) => {
                            const dateValue = e.target.value;
                            setEditingEvent({...editingEvent, date: dateValue});
                          }}
                          className="h-7 text-xs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="eventDescription" className="text-xs">Description</Label>
                        <Textarea
                          id="eventDescription"
                          value={editingEvent.description}
                          onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs flex justify-between">
                          <span>Image</span>
                          {editingEvent.image && (
                            <button 
                              className="text-red-500 hover:text-red-700 text-xs"
                              onClick={() => setEditingEvent({...editingEvent, image: ""})}
                            >
                              Remove
                            </button>
                          )}
                        </Label>
                        
                        {editingEvent.image ? (
                          <div className="relative h-20 w-full rounded overflow-hidden mb-2">
                            <Image
                              src={editingEvent.image}
                              alt={editingEvent.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded p-2 flex items-center justify-center h-20 bg-white/50">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-1/2 h-7 text-xs"
                            onClick={() => document.getElementById(`uploadEventImage-${editingEvent.id}`)?.click()}
                            disabled={uploading}
                          >
                            {uploading ? (
                              <span className="flex items-center gap-1">
                                <span className="animate-spin">◌</span> Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Upload className="h-3 w-3 mr-1" /> Upload
                              </span>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-1/2 h-7 text-xs"
                            onClick={() => setShowImageSelector(true)}
                            disabled={isLoadingImages}
                          >
                            {isLoadingImages ? (
                              <span className="flex items-center gap-1">
                                <span className="animate-spin">◌</span> Loading...
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3 mr-1" /> Choose
                              </span>
                            )}
                          </Button>
                          <input
                            id={`uploadEventImage-${editingEvent.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, editingEvent.id)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setEditingEvent(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 h-7 text-xs bg-pink-500 hover:bg-pink-600"
                          onClick={() => {
                            updateEvent(editingEvent);
                            setEditingEvent(null);
                          }}
                        >
                          Save Event
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Image Selector Modal */}
                {showImageSelector && editingEvent && (
                  <div className="absolute inset-0 bg-white rounded-lg p-4 z-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium">Choose image</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowImageSelector(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {uploadedImages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>No images uploaded yet</p>
                        <p className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setShowImageSelector(false);
                              document.getElementById(`uploadEventImage-${editingEvent.id}`)?.click();
                            }}
                          >
                            Upload an image
                          </Button>
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                        {uploadedImages.map((imageUrl, index) => (
                          <div
                            key={index}
                            className="relative aspect-square cursor-pointer hover:ring-2 hover:ring-pink-500 rounded-lg overflow-hidden"
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
                )}
                
                <div className="mt-3 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={addNewEvent}
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add Event
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200"
                    onClick={saveTimelineEvents}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1">
                        <span className="animate-spin">◌</span> Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Save className="h-3 w-3 mr-1" />
                        Save Timeline
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Footer with Preview and Reset buttons */}
          <div className="px-3 py-2 border-t border-pink-100 mt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
            <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                  onClick={handlePreview}
                >
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Preview</span>
                  </span>
                </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 transition-all duration-200 hover:scale-105"
                onClick={handleReset}
              >
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Reset</span>
                </span>
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 