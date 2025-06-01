import { Timestamp } from '@firebase/firestore';

/**
 * User Data (users collection)
 */
export interface UserData {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  weddingIds?: string[];  // References to weddings created by this user
  subscriptionTier?: 'free' | 'premium' | 'professional';
  subscriptionStart?: Timestamp;
  subscriptionEnd?: Timestamp;
  paymentHistory?: PaymentRecord[];
  preferences?: UserPreferences;
  role?: 'user' | 'super_user'; // Role for permissions
  [key: string]: any; // For additional fields
}

/**
 * User payment record
 */
export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  date: Timestamp;
  type: 'subscription' | 'one-time';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  details?: any;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  emailNotifications?: boolean;
  language?: string;
}

/**
 * Wedding Website Data (weddings collection)
 */
export interface WeddingData {
  id: string;
  groomName: string;
  brideName: string;
  description?: string;
  subId?: string;
  createdAt: Timestamp;
  subAt?: Timestamp;
  subExp?: Timestamp;
  
  // Basic template configuration
  template?: string;
  flowerFrame?: string;
  heroImageUrl?: string;
  color?: string;
  customColor?: string;
  customEndColor?: string;
  
  // Hero Section configuration
  effect?: string;
  imageScale?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  
  // Event date and location
  eventDate?: Timestamp;
  location?: string;
  venue?: string;
  mapUrl?: string;
  
  // Wedding Features
  rsvpEnabled?: boolean;
  guestListEnabled?: boolean;
  wishesEnabled?: boolean;
  
  // RSVP Section configuration
  rsvpTitle?: string;
  rsvpDescription?: string;
  rsvpDeadline?: string;
  rsvpQuestions?: RsvpQuestion[];
  
  // Bride and Groom Information
  groomBio?: string;
  groomImage?: string;
  brideBio?: string;
  brideImage?: string;
  brideGroomTitle?: string;
  brideGroomDescription?: string;
  
  // Media content
  carouselImages?: string[];
  galleryImages?: string[];
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  albumTitle?: string;
  albumDescription?: string;
  albumImages?: AlbumImage[];
  
  // Music settings
  musics?: {
    id: string;
    name: string;
    url: string;
    type: 'file' | 'youtube';
  }[];
  musicCount?: number;
  
  // Story, Events and other sections
  storyEvents?: {
    id: string;
    date: string;
    title: string;
    description: string;
    image: string;
    position?: 'left' | 'right';
  }[];
  
  events?: {
    id: string;
    title: string;
    description?: string;
    time: string;
    location: string;
    icon?: string;
  }[];
  eventsTitle?: string;
  eventsDescription?: string;
  
  // Gift registry and bank accounts
  bankAccounts?: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    qrCode?: string;
  }[];
  
  // System fields
  ownerId?: string;
  subdomain?: string;
  isPublic?: boolean;
  viewCount?: number;
  lastViewed?: Timestamp;
  
  [key: string]: any; // For additional fields
}

/**
 * Wedding Event (events subcollection)
 */
export interface WeddingEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  location: string;
  address?: string;
  mapUrl?: string;
  order: number;
}

/**
 * Wedding Guest (guests subcollection)
 */
export interface WeddingGuest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: 'pending' | 'attending' | 'declined';
  plusOne: boolean;
  plusOneName?: string;
  group?: string;
  notes?: string;
  dietaryRestrictions?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * RSVP Response (rsvps collection)
 */
export interface RsvpResponse {
  id: string;
  weddingId: string;
  name: string;
  email?: string;
  phone?: string;
  attending: 'yes' | 'no';
  guests: number;
  notes?: string;
  additionalResponses?: {[key: string]: string};
  timestamp: Timestamp;
}

/**
 * RSVP Question for customized RSVP forms
 */
export interface RsvpQuestion {
  id: string;
  type: 'text' | 'select' | 'radio' | 'checkbox';
  question: string;
  required: boolean;
  options?: string[];
  order: number;
}

/**
 * Wedding Wish (wishes subcollection)
 */
export interface WeddingWish {
  id: string;
  name: string;
  message: string;
  createdAt: Timestamp;
  approved: boolean;
  relationship?: string;
}

/**
 * Gallery Image (gallery subcollection)
 */
export interface GalleryImage {
  id: string;
  imageUrl: string;
  thumbnail?: string;
  caption?: string;
  order?: number;
  category?: string;
  uploadedAt: Timestamp;
}

/**
 * Love Story Item (stories subcollection)
 */
export interface StoryItem {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  imageUrl?: string;
  order: number;
}

/**
 * Gift Item (gifts subcollection)
 */
export interface GiftItem {
  id: string;
  type: 'bank' | 'registry' | 'crypto';
  title: string;
  description?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  registryUrl?: string;
  cryptoAddress?: string;
  cryptoType?: string;
  order: number;
}

/**
 * Template Options
 */
export interface TemplateOption {
  id: string;
  name: string;
  image: string;
}

/**
 * Flower Frame Options
 */
export interface FlowerFrameOption {
  id: string;
  name: string;
  image: string;
}

/**
 * Color Theme Options
 */
export interface ColorOption {
  id: string;
  name: string;
  value: string;
}

/**
 * Album Image
 */
export interface AlbumImage {
  id: string;
  url: string;
  alt?: string;
} 