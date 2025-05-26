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
  BookHeart
} from "lucide-react";
import { toast } from "sonner";
import { TemplateSection } from "@/lib/firebase/weddingService";

interface SectionsTabProps {
  weddingId: string;
  sections: TemplateSection[];
  onSectionsChange: (sections: TemplateSection[]) => void;
}

const defaultSections: TemplateSection[] = [
  { id: "hero", name: "Ảnh bìa", enabled: true, order: 0, icon: Image },
  { id: "video", name: "Video cưới", enabled: true, order: 1, icon: Video },
  { id: "album", name: "Album ảnh", enabled: true, order: 2, icon: Album },
  { id: "calendar", name: "Lịch trình", enabled: true, order: 3, icon: Calendar },
  { id: "story", name: "Chuyện tình yêu", enabled: true, order: 4, icon: BookHeart },
  { id: "bridegroom", name: "Cô dâu & Chú rể", enabled: true, order: 5, icon: Users },
  { id: "events", name: "Sự kiện", enabled: true, order: 6, icon: Calendar },
  { id: "wishes", name: "Sổ lưu bút", enabled: true, order: 7, icon: MessageSquare },
  { id: "gift", name: "Mừng cưới", enabled: true, order: 8, icon: Gift },
  { id: "music", name: "Nhạc nền", enabled: true, order: 9, icon: Music }
];

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
}: SectionsTabProps) {
  // Add icon property to initialSections from defaultSections
  const processedSections = initialSections.map(section => ({
    ...section,
    icon: defaultIconMap[section.id] || Image
  }));
  
  const [sections, setSections] = useState<TemplateSection[]>(
    initialSections.length > 0 ? processedSections : defaultSections
  );
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialSections.length === 0) {
      onSectionsChange(defaultSections);
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

    try {
      setSections(updatedItems);
      await onSectionsChange(updatedItems);
      toast.success('Đã cập nhật thứ tự các phần');
    } catch (error) {
      console.error('Error updating sections order:', error);
      toast.error('Không thể cập nhật thứ tự các phần');
      // Revert to previous state
      setSections(sections);
    }
  };

  const toggleSection = async (sectionId: string) => {
    const updatedSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, enabled: !section.enabled }
        : section
    );
    
    try {
      setSections(updatedSections);
      await onSectionsChange(updatedSections);
      toast.success('Đã cập nhật trạng thái phần');
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Không thể cập nhật trạng thái phần');
      // Revert to previous state
      setSections(sections);
    }
  };

  return (
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
  );
} 