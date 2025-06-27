import { Heart, Calendar, Image as ImageIcon, Video, Users, MessageSquare } from "lucide-react";
import React from "react";

// Helper function to get the appropriate feature icon
export function getFeatureIcon(index: number): React.ReactElement {
  const icons = [
    <Heart key={0} className="w-8 h-8 text-pink-500" />,
    <Calendar key={1} className="w-8 h-8 text-pink-500" />,
    <ImageIcon key={2} className="w-8 h-8 text-pink-500" />,
    <Video key={3} className="w-8 h-8 text-pink-500" />,
    <Users key={4} className="w-8 h-8 text-pink-500" />,
    <MessageSquare key={5} className="w-8 h-8 text-pink-500" />
  ];
  
  return icons[index % icons.length];
} 