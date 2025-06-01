"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  GripVertical, 
  Image, 
  Video, 
  Calendar, 
  MapPin, 
  Users, 
  Gift, 
  MessageSquare,
  Album,
  Music,
  Heart,
  BookHeart,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { TemplateSection } from "@/lib/firebase/weddingService";
import { defaultSections, VIP_PRICES } from "@/config/templateConfig";

interface SectionsTabProps {
  weddingId: string;
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
  musicEnabled?: boolean;
  setMusicEnabled?: (enabled: boolean) => void;
  rsvpEnabled?: boolean;
  setRsvpEnabled?: (enabled: boolean) => void;
}

// Map of default icons for each section
const defaultIconMap: Record<string, React.ComponentType<any>> = {
  hero: Image,
  video: Video,
  album: Album,
  calendar: Calendar,
  story: BookHeart,
  bridegroom: Users,
  events: Calendar,
  wishes: MessageSquare,
  gift: Gift,
  music: Music
};

export default function SectionsTab({
  weddingId,
  sections: initialSections,
  onSectionsChange,
  musicEnabled = false,
  setMusicEnabled,
  rsvpEnabled = false,
  setRsvpEnabled
}: SectionsTabProps) {
  // Add icon property to initialSections from defaultSections
  const processedSections = initialSections.map(section => ({
    ...section,
    icon: defaultIconMap[section.id] || Image
  }));
  
  const [sections, setSections] = useState<TemplateSection[]>(
    initialSections.length > 0 ? processedSections : defaultSections.map(section => ({
      ...section,
      icon: defaultIconMap[section.id] || Image
    }))
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialSections.length === 0) {
      const sectionsWithIcons = defaultSections.map(section => ({
        ...section,
        icon: defaultIconMap[section.id] || Image
      }));
      setSections(sectionsWithIcons);
      onSectionsChange(sectionsWithIcons);
    }
  }, [initialSections, onSectionsChange]);

  const handleDragEnd = async (result: any) => {
    setIsDragging(false);
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Only update local state, don't save to database
    setSections(updatedItems);
    onSectionsChange(updatedItems);
  };

  const toggleSection = async (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    
    // Only update local state, don't save to database
    setSections(updatedSections);
    onSectionsChange(updatedSections);
  };

  return (
    <div className="space-y-8">
      {/* Feature Toggles */}
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">Tính năng website</h2>
          <p className="text-gray-600 text-sm md:text-base">Chọn các tính năng bạn muốn bao gồm trong website cưới</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Music Feature Toggle */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Music className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Nhạc nền</h3>
                  <p className="text-sm text-gray-500">Thêm nhạc nền cho website</p>
                </div>
              </div>
              <Switch
                checked={musicEnabled}
                onCheckedChange={setMusicEnabled}
                disabled={!setMusicEnabled}
              />
            </div>
            
            {musicEnabled && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Tính năng VIP</span>
                  <span className="text-sm font-bold text-rose-600">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND',
                      maximumFractionDigits: 0 
                    }).format(VIP_PRICES.MUSIC)}
                  </span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Cho phép thêm nhạc nền từ file hoặc YouTube
                </p>
              </div>
            )}
          </div>

          {/* RSVP Feature Toggle */}
          <div className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Xác nhận tham dự</h3>
                  <p className="text-sm text-gray-500">Cho phép khách mời RSVP</p>
                </div>
              </div>
              <Switch
                checked={rsvpEnabled}
                onCheckedChange={setRsvpEnabled}
                disabled={!setRsvpEnabled}
              />
            </div>
            
            {rsvpEnabled && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Miễn phí</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Khách mời có thể xác nhận tham dự trực tiếp trên website
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Website Structure */}
      <div className="space-y-6">
        <div className="bg-pink-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Cấu trúc website cưới</h3>
          <p className="text-sm text-gray-600">
            Kéo thả để sắp xếp thứ tự các phần và bật/tắt các phần bạn muốn hiển thị trên website.
          </p>
        </div>

        <DragDropContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <Droppable droppableId="sections">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sections.map((section, index) => {
                  const Icon = section.icon || Image;
                  return (
                    <Draggable
                      key={section.id}
                      draggableId={section.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white rounded-lg border ${
                            isDragging ? "shadow-lg" : "shadow-sm"
                          } transition-shadow duration-200`}
                        >
                          <div className="flex items-center p-4">
                            <div
                              {...provided.dragHandleProps}
                              className="mr-4 cursor-grab"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex items-center flex-1">
                              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 mr-3">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="font-medium">{section.name}</span>
                            </div>
                            <Switch
                              checked={section.enabled}
                              onCheckedChange={() => toggleSection(section.id)}
                              className="ml-4"
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
} 