import { WeddingData } from "@/lib/firebase/models";
import { updateWeddingWebsite } from "@/lib/firebase/weddingService";

/**
 * Template utilities for managing wedding website templates
 * 
 * This module provides helper functions for managing template sections
 */

/**
 * Save template section settings to Firestore
 * 
 * @param weddingId The ID of the wedding website
 * @param sectionId The ID of the template section
 * @param settings The settings to save
 * @returns Promise that resolves when the settings are saved
 */
export const saveTemplateSectionSettings = async (
  weddingId: string,
  sectionId: string,
  settings: Record<string, any>
): Promise<void> => {
  if (!weddingId) return;
  
  try {
    // Prepare the update object based on section
    let updateData: Partial<WeddingData> = {};
    
    switch (sectionId) {
      case 'hero':
        updateData = {
          effect: settings.effect,
          customEndColor: settings.customEndColor,
          customStartColor: settings.customStartColor,
          imageScale: settings.imageScale,
          imageOffsetX: settings.imageOffsetX,
          imageOffsetY: settings.imageOffsetY,
        };
        break;
        
      case 'video':
        updateData = {
          videoUrl: settings.videoUrl,
          videoTitle: settings.title,
          videoDescription: settings.description,
        };
        break;
        
      case 'album':
        updateData = {
          albumImages: settings.images,
          albumTitle: settings.title,
          albumDescription: settings.description,
        };
        break;
        
      case 'calendar':
        updateData = {
          venue: settings.address,
          mapUrl: settings.mapUrl,
        };
        break;
        
      case 'story':
        updateData = {
          storyEvents: settings.storyEvents,
        };
        break;
        
      case 'brideGroom':
        updateData = {
          groomBio: settings.groom?.bio,
          groomImage: settings.groom?.image,
          brideBio: settings.bride?.bio,
          brideImage: settings.bride?.image,
          brideGroomTitle: settings.title,
          brideGroomDescription: settings.description,
        };
        break;
        
      case 'events':
        updateData = {
          events: settings.eventsList,
          eventsTitle: settings.title,
          eventsDescription: settings.description,
        };
        break;
        
      case 'gift':
        updateData = {
          bankAccounts: settings.bankAccounts,
          giftTitle: settings.title,
          giftDescription: settings.description,
        };
        break;
        
      case 'wishes':
        updateData = {
          wishesEnabled: settings.wishesEnabled,
        };
        break;
        
      case 'music':
        updateData = {
          musicUrls: settings.musicUrls || [],
          musicTitle: settings.title,
          musicDescription: settings.description,
        };
        break;
        
      default:
        // General settings or unknown section
        break;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await updateWeddingWebsite(weddingId, updateData);
      console.log(`Updated ${sectionId} section settings`);
      return;
    }
    
    console.log(`No changes to update for ${sectionId} section`);
  } catch (error) {
    console.error(`Error saving ${sectionId} settings:`, error);
    throw error;
  }
};

// Transform gallery images to objects with id, url, alt
const processGalleryImages = (weddingData: WeddingData) => {
  // First check for albumImages array (new format)
  if (weddingData.albumImages && Array.isArray(weddingData.albumImages)) {
    return weddingData.albumImages;
  }
  
  // Fall back to galleryImages string array (old format)
  return (weddingData.galleryImages || []).map((url, index) => ({
    id: `img-${index}`,
    url,
    alt: `Wedding photo ${index + 1}`
  }));
};

/**
 * Transform template data for rendering
 * 
 * @param weddingData The wedding data from Firestore
 * @returns Processed template data for each section
 */
export const processTemplateData = (weddingData: WeddingData) => {
  // Process gallery images
  const galleryImages = processGalleryImages(weddingData);
  
  return {
    hero: {
      groomName: weddingData.groomName || "",
      brideName: weddingData.brideName || "",
      date: weddingData.eventDate ? weddingData.eventDate.toDate() : null,
      coverImage: weddingData.heroImageUrl || "/images/default-cover.jpg",
      venue: weddingData.venue || "",
      effect: weddingData.effect || "hearts",
      imageScale: weddingData.imageScale || 85,
      imageOffsetX: weddingData.imageOffsetX || 0,
      imageOffsetY: weddingData.imageOffsetY || 0,
    },
    video: {
      title: weddingData.videoTitle || "Video Cưới",
      description: weddingData.videoDescription || "Tình yêu không làm cho thế giới quay tròn. Tình yêu là những gì làm cho chuyến đi đáng giá.",
      videoUrl: weddingData.videoUrl || ""
    },
    album: {
      title: weddingData.albumTitle || "Album Ảnh",
      description: weddingData.albumDescription || "Mỗi bức ảnh là một kỷ niệm, mỗi khoảnh khắc là một câu chuyện.",
      images: galleryImages
    },
    calendar: {
      title: weddingData.eventsTitle || "Lịch Trình",
      description: weddingData.eventsDescription || "Chúng tôi rất mong được gặp bạn trong ngày đặc biệt này.",
      date: weddingData.eventDate ? weddingData.eventDate.toDate() : null,
      address: weddingData.venue || "",
      mapUrl: weddingData.mapUrl || ""
    },
    story: {
      title: weddingData.storyTitle || "Chuyện Tình Yêu",
      description: weddingData.storyDescription || "Mỗi tình yêu đều có một câu chuyện riêng.",
      storyEvents: weddingData.storyEvents || []
    },
    brideGroom: {
      title: weddingData.brideGroomTitle || "Cô Dâu & Chú Rể",
      description: weddingData.brideGroomDescription || "Hai con người, một tình yêu, một cuộc đời.",
      groom: {
        name: weddingData.groomName || "",
        bio: weddingData.groomBio || "",
        image: weddingData.groomImage || "/images/album/groom.png"
      },
      bride: {
        name: weddingData.brideName || "",
        bio: weddingData.brideBio || "",
        image: weddingData.brideImage || "/images/album/bride.png"
      }
    },
    events: {
      title: weddingData.eventsTitle || "Sự Kiện",
      description: weddingData.eventsDescription || "Những khoảnh khắc quan trọng trong ngày trọng đại.",
      eventsList: weddingData.events || []
    },
    wishes: {
      title: weddingData.wishesTitle || "Sổ Lưu Bút",
      description: weddingData.wishesDescription || "Hãy để lại lời chúc cho đôi uyên ương.",
      weddingId: weddingData.id,
      enabled: weddingData.wishesEnabled !== false
    },
    gift: {
      title: weddingData.giftTitle || "Mừng Cưới",
      description: weddingData.giftDescription || "Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi.",
      bankAccounts: weddingData.bankAccounts || []
    },
    music: {
      title: weddingData.musicTitle || "Nhạc Nền",
      description: weddingData.musicDescription || "Âm nhạc cho ngày đặc biệt của chúng tôi.",
      musicUrls: weddingData.musicUrls || []
    }
  };
};