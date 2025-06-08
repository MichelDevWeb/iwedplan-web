import { Heart, Flower, Snowflake, Sparkles, MousePointer2, Smartphone, Download, CircleDollarSign, Menu, Users, CheckSquare, Ticket, PenSquare, Camera, User } from 'lucide-react';

// Define frame options with specific image positioning
export const flowerFrames = [
  { 
    id: '1', 
    path: '/images/flower-frame/1.png', 
    name: 'Blush Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: '2', 
    path: '/images/flower-frame/2.png', 
    name: 'Sage Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-2' 
  },
  { 
    id: '3', 
    path: '/images/flower-frame/3.png', 
    name: 'Rose Gold Flower',
    imageSize: 'w-[75%] h-[75%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  },
  { 
    id: '4', 
    path: '/images/flower-frame/4.png', 
    name: 'Lavender Flower',
    imageSize: 'w-[85%] h-[90%]', 
    imagePosition: 'translate-x-0 translate-y-1' 
  },
  { 
    id: '5', 
    path: '/images/flower-frame/5.png', 
    name: 'Peach Flower',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0' 
  }
];

// Define theme options with wedding-appropriate colors and text colors
export const colorThemes = [
  {
    id: 'blush',
    name: 'Blush & Lavender',
    gradientFrom: 'from-pink-200',
    gradientVia: 'via-purple-100',
    gradientTo: 'to-indigo-200',
    startColor: '#fad1e6', 
    endColor: '#d6d3f0',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/50 text-rose-800'
  },
  {
    id: 'sage',
    name: 'Sage & Cream',
    gradientFrom: 'from-green-100',
    gradientVia: 'via-emerald-50',
    gradientTo: 'to-teal-100',
    startColor: '#e3f1ea', 
    endColor: '#e6f7f4',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/50 text-rose-800'
  },
  {
    id: 'rose',
    name: 'Rose & Gold',
    gradientFrom: 'from-rose-100',
    gradientVia: 'via-amber-50',
    gradientTo: 'to-yellow-100',
    startColor: '#fde4e4', 
    endColor: '#fef3c7',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/50 text-rose-800'
  },
  {
    id: 'lavender',
    name: 'Lavender & Sky',
    gradientFrom: 'from-purple-100',
    gradientVia: 'via-indigo-50',
    gradientTo: 'to-blue-100',
    startColor: '#e9e4f9', 
    endColor: '#dbeafe',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50 text-rose-800'
  },
  {
    id: 'peach',
    name: 'Peach & Ivory',
    gradientFrom: 'from-orange-100',
    gradientVia: 'via-amber-50',
    gradientTo: 'to-yellow-50',
    startColor: '#feeadd', 
    endColor: '#fefce8',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-rose-800'
  },
  {
    id: 'mint',
    name: 'Mint & Pearl',
    gradientFrom: 'from-emerald-100',
    gradientVia: 'via-teal-50',
    gradientTo: 'to-cyan-50',
    startColor: '#d1fae5', 
    endColor: '#ecfeff',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/50 text-rose-800'
  },
  {
    id: 'coral',
    name: 'Coral & Sand',
    gradientFrom: 'from-red-100',
    gradientVia: 'via-orange-50',
    gradientTo: 'to-amber-50',
    startColor: '#fee2e2', 
    endColor: '#fffbeb',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-rose-800'
  },
  {
    id: 'ocean',
    name: 'Ocean & Mist',
    gradientFrom: 'from-blue-100',
    gradientVia: 'via-sky-50',
    gradientTo: 'to-cyan-50',
    startColor: '#dbeafe', 
    endColor: '#ecfeff',   
    textColor: 'text-rose-800',
    buttonClass: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50 text-rose-800'
  }
];

// Define effects options with matching cursors
export const effectOptions = [
  { 
    id: 'none', 
    name: 'No Effects', 
    icon: MousePointer2, 
    emoji: '',
    cursorClass: 'cursor-default',
    particleCount: 0,
    particleSpeed: 0,
    sway: 0,
    maxSize: 0
  },
  { 
    id: 'hearts', 
    name: 'Floating Hearts', 
    icon: Heart, 
    emoji: '❤️',
    cursorClass: 'cursor-heart',
    particleCount: 30,
    particleSpeed: 2.5,
    sway: 1.2,
    maxSize: 15
  },
  { 
    id: 'flowers', 
    name: 'Flower Petals', 
    icon: Flower, 
    emoji: '🌸',
    cursorClass: 'cursor-flower',
    particleCount: 25,
    particleSpeed: 1.8,
    sway: 2,
    maxSize: 20
  },
  { 
    id: 'snow', 
    name: 'Falling Snowflakes', 
    icon: Snowflake, 
    emoji: '❄️',
    cursorClass: 'cursor-default',
    particleCount: 35,
    particleSpeed: 1.5,
    sway: 0.7,
    maxSize: 18
  },
  { 
    id: 'sparkles', 
    name: 'Magical Sparkles', 
    icon: Sparkles, 
    emoji: '✨',
    cursorClass: 'cursor-ring',
    particleCount: 40,
    particleSpeed: 2.2,
    sway: 1.5,
    maxSize: 16
  },
];

// Template options
export const templates = [
  {
    id: "default",
    name: "Template Mặc định",
    image: "/images/templates/default.png",
  },
  {
    id: "elegant",
    name: "Elegant",
    image: "/images/templates/elegant.png",
  },
  {
    id: "modern",
    name: "Modern",
    image: "/images/templates/modern.png",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    image: "/images/templates/minimalist.png",
  },
  {
    id: "classic",
    name: "Classic",
    image: "/images/templates/classic.png",
  },
];

// Consolidated color options - merging both representations
export const colorOptions = [
  {
    id: "blush",
    name: "Hồng Blush",
    value: "#fad1e6",
    displayName: "Blush & Lavender"
  },
  {
    id: "sage",
    name: "Xanh Sage",
    value: "#e3f1ea",
    displayName: "Sage & Cream"
  },
  {
    id: "rose",
    name: "Hồng Rose Gold",
    value: "#fde4e4",
    displayName: "Rose & Gold"
  },
  {
    id: "lavender",
    name: "Tím Lavender",
    value: "#e9e4f9",
    displayName: "Lavender & Sky"
  },
  {
    id: "peach",
    name: "Đào Peach",
    value: "#feeadd",
    displayName: "Peach & Ivory"
  },
  {
    id: "custom",
    name: "Màu tùy chỉnh",
    value: "",
    displayName: "Custom Color"
  },
];

// Consolidated flower frame options - mapping both numeric and string IDs
export const flowerFrameOptions = [
  { 
    id: 'rose',
    name: 'Blush Flower',
    image: '/images/flower-frame/1.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0'
  },
  { 
    id: 'sage',
    name: 'Sage Flower',
    image: '/images/flower-frame/2.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-2'
  },
  { 
    id: 'gold',
    name: 'Rose Gold Flower',
    image: '/images/flower-frame/3.png',
    imageSize: 'w-[75%] h-[75%]', 
    imagePosition: 'translate-x-0 translate-y-0'
  },
  { 
    id: 'lavender',
    name: 'Lavender Flower',
    image: '/images/flower-frame/4.png',
    imageSize: 'w-[85%] h-[90%]', 
    imagePosition: 'translate-x-0 translate-y-1'
  },
  { 
    id: 'peach',
    name: 'Peach Flower',
    image: '/images/flower-frame/5.png',
    imageSize: 'w-[85%] h-[85%]', 
    imagePosition: 'translate-x-0 translate-y-0'
  }
];

// Map flower frame options between different ID formats
export const flowerFrameMapping = {
  'rose': '1',
  'sage': '2',
  'gold': '3',
  'lavender': '4',
  'peach': '5'
};

// Reverse mapping (numeric to string ID)
export const reverseFlowerFrameMapping = {
  '1': 'rose',
  '2': 'sage',
  '3': 'gold',
  '4': 'lavender',
  '5': 'peach'
};

// Matching color suggestions for each frame
export const frameSuggestions: Record<string, string[]> = {
  '1': ['blush', 'lavender'],
  '2': ['sage', 'peach'],
  '3': ['rose', 'peach'],
  '4': ['lavender', 'blush'],
  '5': ['peach', 'rose']
};

// Update vip price constants
export const VIP_PRICES = {
  TEMPLATE: 0, // 150,000 VND
  FLOWER_FRAME: 0, // 100,000 VND
  COLOR: 0, // 50,000 VND
  MUSIC: 0, // 200,000 VND per song
  EFFECT: 0, // 120,000 VND for special effects
};

// Helper functions for template display
export const getTemplateName = (templateId: string = 'default') => {
  const templates: Record<string, string> = {
    'default': 'Mẫu Cơ Bản',
    'elegant': 'Mẫu Thanh Lịch',
    'modern': 'Mẫu Hiện Đại',
    'minimalist': 'Mẫu Tối Giản',
    'classic': 'Mẫu Cổ Điển'
  };
  return templates[templateId] || 'Mẫu Tùy Chỉnh';
};

export const getColorName = (colorId: string = 'blush') => {
  const colors: Record<string, string> = {
    'blush': 'Hồng Phấn',
    'sage': 'Xanh Lá Nhạt',
    'rose': 'Hồng Đỏ & Vàng Gold',
    'lavender': 'Tím Lavender',
    'peach': 'Đào & Ngà'
  };
  return colors[colorId] || 'Màu Tùy Chỉnh';
};

export const getFrameName = (frameId: string = 'rose') => {
  const frames: Record<string, string> = {
    'rose': 'Hoa Hồng',
    'sage': 'Hoa Lá Xanh',
    'gold': 'Hoa Vàng Gold',
    'lavender': 'Hoa Oải Hương',
    'peach': 'Hoa Đào'
  };
  return frames[frameId] || 'Khung Tùy Chỉnh';
};

// Function to determine text color based on background color brightness
export const getTextColorForBackground = (color: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!result) return 'text-gray-800';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? 'text-gray-800' : 'text-white';
};

// Function to determine button styling based on background color
export const getButtonClassForBackground = (color: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
  if (!result) return 'bg-white/20 hover:bg-white/30 border-white/50 text-white';
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.6
    ? `bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 text-gray-800`
    : `bg-white/20 hover:bg-white/30 border-white/50 text-white`;
};

// Navigation items configuration
export const navItems = [
  { id: 'hero', label: 'Trang Chủ' },
  { id: 'video', label: 'Video Cưới' },
  { id: 'album', label: 'Album Ảnh' },
  { id: 'calendar', label: 'Lịch Trình' },
  { id: 'story', label: 'Chuyện Tình Yêu' },
  { id: 'bridegroom', label: 'Cô Dâu & Chú Rể' },
  { id: 'events', label: 'Sự Kiện' },
  { id: 'rsvp', label: 'Xác Nhận Tham Dự' },
  { id: 'wishes', label: 'Sổ Lưu Bút' },
  { id: 'gift', label: 'Mừng Cưới' }
];

// Default music playlist
export const defaultMusic = [
  { url: '/sounds/leduong.mp3', title: 'Lê Đường' },
  { url: '/sounds/Canon in D.mp3', title: 'Canon in D' }
];

// Page type definitions
export type PageType = 'wedding' | 'landing' | 'dashboard' | 'create' | 'other' | 'auth';

// Define pages and their actions
export const pages: { 
  type: PageType; 
  pattern: RegExp; 
  icon: React.ElementType;
  actions?: { 
    id: string; 
    label: string; 
    icon: React.ElementType;
    onClick?: () => void;
  }[];
}[] = [
  {
    type: 'wedding',
    pattern: /^\/(?!landing|create|dashboard|auth).*$/,
    icon: Heart,
  },
  {
    type: 'landing',
    pattern: /^\/landing(\/.*)?$/,
    icon: Smartphone,
    actions: [
      { 
        id: 'download-app', 
        label: 'Tải ứng dụng', 
        icon: Download 
      },
      { 
        id: 'features', 
        label: 'Tính năng', 
        icon: Sparkles 
      },
      { 
        id: 'pricing', 
        label: 'Báo giá', 
        icon: CircleDollarSign 
      }
    ]
  },
  {
    type: 'dashboard',
    pattern: /^\/dashboard(\/.*)?$/,
    icon: Menu,
    actions: [
      { 
        id: 'invites', 
        label: 'Quản lý khách mời', 
        icon: Users 
      },
      { 
        id: 'budget', 
        label: 'Ngân sách', 
        icon: CircleDollarSign 
      },
      { 
        id: 'tasks', 
        label: 'Công việc', 
        icon: CheckSquare 
      },
      { 
        id: 'settings', 
        label: 'Cài đặt', 
        icon: Ticket 
      }
    ]
  },
  {
    type: 'create',
    pattern: /^\/create(\/.*)?$/,
    icon: PenSquare,
    actions: [
      { 
        id: 'templates', 
        label: 'Mẫu thiệp', 
        icon: Ticket 
      },
      { 
        id: 'themes', 
        label: 'Giao diện', 
        icon: Sparkles 
      },
      { 
        id: 'preview', 
        label: 'Xem trước', 
        icon: Camera 
      }
    ]
  },
  {
    type: 'auth',
    pattern: /^\/auth(\/.*)?$/,
    icon: User
  }
]; 

export const defaultAlbumImages = [
  {
    id: "1",
    url: "/images/album/1.jpg",
    alt: "Wedding photo"
  },
  {
    id: "2",
    url: "/images/album/2.jpg",
    alt: "Wedding photo"
  },
  {
    id: "3",
    url: "/images/album/3.jpg",
    alt: "Wedding photo"
  },
  {
    id: "4",
    url: "/images/album/4.jpg",
    alt: "Wedding photo"
  },
  {
    id: "5",
    url: "/images/album/5.jpg",
    alt: "Wedding photo"
  },
  {
    id: "7",
    url: "/images/album/7.jpg",
    alt: "Wedding photo"
  },
  {
    id: "8",
    url: "/images/album/8.jpg",
    alt: "Wedding photo"
  },
  {
    id: "9",
    url: "/images/album/9.jpg",
    alt: "Wedding photo"
  },
  {
    id: "10",
    url: "/images/album/10.jpg",
    alt: "Wedding photo"
  },
];

export const defaultEvents = [
  {
    id: '1',
    title: 'Lễ Cưới Nhà Gái',
    description: 'Lễ cưới tại nhà gái với sự tham gia của gia đình, họ hàng và bạn bè.',
    time: '8:00 AM',
    location: 'Nhà Gái',
    address: '123 Đường Lê Lợi, Quận 1, TP HCM',
    mapLink: 'https://maps.google.com',
    image: '/images/wedding-female.jpg'
  },
  {
    id: '2',
    title: 'Lễ Cưới Nhà Trai',
    description: 'Lễ cưới tại nhà trai với sự tham gia của gia đình, họ hàng và bạn bè.',
    time: '11:00 AM',
    location: 'Nhà Trai',
    address: '456 Đường Nguyễn Huệ, Quận 1, TP HCM',
    mapLink: 'https://maps.google.com',
    image: '/images/wedding-male.jpg'
  },
  {
    id: '3',
    title: 'Tiệc Cưới',
    description: 'Tiệc cưới với đầy đủ gia đình, họ hàng và bạn bè hai bên.',
    time: '6:00 PM',
    location: 'Trung Tâm Tiệc Cưới',
    address: '789 Đường Lê Duẩn, Quận 1, TP HCM',
    mapLink: 'https://maps.google.com',
    image: '/images/wedding-reception.jpg'
  }
];

export const defaultAccounts = [
  {
    id: "1",
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    accountNumber: "1234567890",
    accountName: "NGUYEN VAN A",
    qrCode: "/images/qr-sample.png"
  },
  {
    id: "2",
    bankName: "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)",
    accountNumber: "0987654321",
    accountName: "TRAN THI B",
    qrCode: "/images/qr-sample2.png"
  }
];

export const defaultStoryEvents = [
  {
    id: "1",
    date: "01/01/2020",
    title: "Lần đầu gặp gỡ",
    description:
      "Chúng tôi gặp nhau lần đầu tiên tại một buổi tiệc của bạn chung. Đó là một khoảnh khắc đặc biệt mà cả hai không thể nào quên.",
    image: "/images/story-1.jpg",
  },
  {
    id: "2",
    date: "15/06/2020",
    title: "Hẹn hò đầu tiên",
    description:
      "Buổi hẹn hò đầu tiên của chúng tôi tại một quán cà phê nhỏ. Chúng tôi đã nói chuyện suốt nhiều giờ và không muốn kết thúc buổi hẹn.",
    image: "/images/story-2.jpg",
  },
  {
    id: "3",
    date: "25/12/2021",
    title: "Cầu hôn",
    description:
      "Dưới ánh nến lung linh và bầu trời đầy sao, anh đã quỳ gối cầu hôn. Và tất nhiên, câu trả lời là 'Có!'",
    image: "/images/story-3.jpg",
  },
  {
    id: "4",
    date: "04/12/2023",
    title: "Ngày cưới",
    description:
      "Ngày trọng đại của chúng tôi - khi chúng tôi trao lời thề nguyện và bắt đầu cuộc sống mới cùng nhau.",
    image: "/images/story-4.jpg",
  },
];

// Default sections configuration for template structure
export const defaultSections = [
  { id: "hero", name: "Ảnh bìa", enabled: true, order: 0 },
  { id: "video", name: "Video cưới", enabled: true, order: 1 },
  { id: "album", name: "Album ảnh", enabled: true, order: 2 },
  { id: "calendar", name: "Lịch trình", enabled: true, order: 3 },
  { id: "story", name: "Chuyện tình yêu", enabled: true, order: 4 },
  { id: "bridegroom", name: "Cô dâu & Chú rể", enabled: true, order: 5 },
  { id: "events", name: "Sự kiện", enabled: true, order: 6 },
  { id: "wishes", name: "Sổ lưu bút", enabled: true, order: 7 },
  { id: "gift", name: "Mừng cưới", enabled: true, order: 8 },
];

// Map of default icons for each section
export const defaultIconMap = {
  hero: 'Image',
  video: 'Video', 
  album: 'Album',
  calendar: 'Calendar',
  story: 'BookHeart',
  bridegroom: 'Users',
  events: 'Calendar',
  wishes: 'MessageSquare',
  gift: 'Gift',
};