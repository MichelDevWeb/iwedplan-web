"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Calendar, MapPin, Users, DollarSign, 
  MessageSquare, CheckSquare, Lightbulb, Search,
  Bot, ArrowRight, Clock, Star, Heart
} from "lucide-react";
import { WeddingData, TodoTask, TaskAdvertisement } from "@/lib/firebase/models";
import { generateDefaultTasks, createTask } from "@/lib/firebase/todoService";
import { getTaskAdvertisements } from "@/lib/firebase/todoService";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { formatDate } from "@/lib/utils/dateUtils";
import { Timestamp } from "firebase/firestore";
import { addDays, subMonths, subWeeks } from "date-fns";

interface WeddingPlannerAgentProps {
  selectedWedding: WeddingData | null;
  onTasksCreated?: (tasks: TodoTask[]) => void;
}

interface PlanningStep {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  priority: 'high' | 'medium' | 'low';
  suggestedVendors: string[];
  estimatedCost: string;
  tips: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  actions?: {
    type: 'create_tasks' | 'suggest_vendors' | 'set_budget';
    data?: any;
  }[];
  advertisements?: TaskAdvertisement[];
}

// Thủ tục pháp lý đám cưới tại Việt Nam
const VIETNAM_WEDDING_PROCEDURES = [
  {
    id: 'registration',
    title: 'Đăng ký kết hôn',
    description: 'Thủ tục pháp lý bắt buộc để kết hôn hợp pháp tại Việt Nam',
    category: 'legal',
    timeframe: '1-2 tháng trước',
    priority: 'high' as const,
    requirements: [
      'Giấy khai sinh (bản chính hoặc bản sao có chứng thực)',
      'Chứng minh nhân dân/Căn cước công dân',
      'Giấy xác nhận tình trạng hôn nhân (nếu từng kết hôn)',
      'Giấy khám sức khỏe tiền hôn nhân',
      'Đơn đăng ký kết hôn'
    ],
    tasks: [
      'Chuẩn bị hồ sơ đăng ký kết hôn',
      'Khám sức khỏe tiền hôn nhân',
      'Nộp hồ sơ tại UBND phường/xã',
      'Nhận giấy chứng nhận kết hôn'
    ]
  },
  {
    id: 'traditional_ceremonies',
    title: 'Nghi lễ truyền thống',
    description: 'Các nghi lễ theo phong tục Việt Nam',
    category: 'other',
    timeframe: '3-6 tháng trước',
    priority: 'medium' as const,
    ceremonies: [
      {
        name: 'Lễ dạm ngõ',
        description: 'Gia đình chú rể tới tìm hiểu và xin phép gia đình cô dâu',
        timing: '6 tháng trước'
      },
      {
        name: 'Lễ hỏi cưới (Nạp tài)',
        description: 'Gia đình chú rể chính thức xin cưới và trao lễ vật',
        timing: '3-4 tháng trước'
      },
      {
        name: 'Lễ rước dâu',
        description: 'Nghi lễ đón dâu về nhà chú rể',
        timing: 'Ngày cưới'
      },
      {
        name: 'Lễ thành hôn',
        description: 'Nghi lễ chính thức thành hôn',
        timing: 'Ngày cưới'
      }
    ],
    tasks: [
      'Chọn ngày tốt theo lịch âm',
      'Chuẩn bị lễ vật cho lễ hỏi cưới',
      'Thuê xe hoa rước dâu',
      'Chuẩn bị trang phục truyền thống'
    ]
  }
];

// Danh sách vendors và dịch vụ phổ biến tại VN
const VIETNAM_WEDDING_VENDORS = {
  venue: [
    'Trung tâm tiệc cưới Sen Hồng',
    'Khách sạn Grand Palace',
    'Resort Sài Gòn Đại Nam',
    'Nhà hàng La Fourchette'
  ],
  photography: [
    'Studio Olivia',
    'Ngọc Huy Wedding',
    'Studio Ao Cưới Mỹ Lan',
    'Ảnh cưới Ánh Dương'
  ],
  attire: [
    'Thế Giới Áo Cưới',
    'Camile Bridal',
    'Áo cưới Meera Meera',
    'Studio Dressme'
  ],
  catering: [
    'Buffet Bassac',
    'Cơm Âm Phủ Bà Năm',
    'Nhà hàng Ngọc Mai',
    'Catering Sen Vàng'
  ]
};

export default function WeddingPlannerAgent({ selectedWedding, onTasksCreated }: WeddingPlannerAgentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'timeline'>('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [planningSteps, setPlanningSteps] = useState<PlanningStep[]>([]);
  const [generatedTasks, setGeneratedTasks] = useState<TodoTask[]>([]);
  const [planningProgress, setPlanningProgress] = useState(0);

  // Khởi tạo tin nhắn chào mừng
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'agent',
      content: `Xin chào! Tôi là Wedding AI Assistant - trợ lý AI chuyên về lập kế hoạch đám cưới. 

Tôi có thể giúp bạn:
🎯 Tạo kế hoạch chi tiết từ A-Z cho đám cưới
📝 Tự động tạo danh sách công việc cần làm
🏪 Gợi ý nhà cung cấp dịch vụ phù hợp
💰 Ước tính ngân sách cho từng hạng mục
⏰ Sắp xếp timeline thực hiện hợp lý

Hãy cho tôi biết về đám cưới của bạn để tôi có thể tư vấn tốt nhất!`,
      timestamp: new Date(),
      actions: [
        {
          type: 'create_tasks',
          data: { message: 'Tạo kế hoạch cơ bản' }
        }
      ]
    };

    setChatMessages([welcomeMessage]);
  }, []);

  // Tính toán progress dựa trên selected wedding
  useEffect(() => {
    if (selectedWedding) {
      // Simulate progress calculation based on wedding data
      let progress = 0;
      if (selectedWedding.eventDate) progress += 20;
      if (selectedWedding.venue) progress += 20;
      if (selectedWedding.brideName && selectedWedding.groomName) progress += 10;
      // Add more conditions as needed
      setPlanningProgress(Math.min(progress, 100));
    }
  }, [selectedWedding]);

  // Tạo tasks cụ thể cho đám cưới Việt Nam
  const createVietnameseWeddingTasks = async (weddingId: string, weddingDate: Date) => {
    const tasks: Omit<TodoTask, 'id'>[] = [];
    
    // Tasks cho đăng ký kết hôn
    const legalTasks = [
      {
        title: 'Chuẩn bị hồ sơ đăng ký kết hôn',
        description: 'Thu thập đầy đủ giấy tờ: giấy khai sinh, CMND/CCCD, giấy xác nhận tình trạng hôn nhân',
        category: 'legal',
        milestone: '2 tháng trước',
        dueDate: Timestamp.fromDate(subMonths(weddingDate, 2)),
        priority: 'high' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Liên hệ UBND phường/xã để biết thêm yêu cầu cụ thể'
      },
      {
        title: 'Khám sức khỏe tiền hôn nhân',
        description: 'Đăng ký khám tại trung tâm y tế có thẩm quyền',
        category: 'legal',
        milestone: '6 tuần trước',
        dueDate: Timestamp.fromDate(subWeeks(weddingDate, 6)),
        priority: 'high' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Giấy khám có hiệu lực 6 tháng'
      }
    ];

    // Tasks cho nghi lễ truyền thống
    const traditionalTasks = [
      {
        title: 'Chọn ngày tốt theo lịch âm',
        description: 'Tham khảo lịch âm và phong thủy để chọn ngày tốt cho lễ hỏi và ngày cưới',
        category: 'other',
        milestone: '4 tháng trước',
        dueDate: Timestamp.fromDate(subMonths(weddingDate, 4)),
        priority: 'high' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Thống nhất với cả hai gia đình'
      },
      {
        title: 'Chuẩn bị lễ vật hỏi cưới',
        description: 'Mua sắm và chuẩn bị lễ vật theo phong tục: trầu cau, rượu, bánh, hoa quả...',
        category: 'other',
        milestone: '1 tuần trước lễ hỏi',
        dueDate: Timestamp.fromDate(subMonths(weddingDate, 3)),
        priority: 'medium' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Số lượng lẻ, tráng số chẵn theo phong tục'
      }
    ];

    // Tasks cơ bản khác
    const basicTasks = [
      {
        title: 'Đặt địa điểm tổ chức tiệc cưới',
        description: 'Tìm hiểu và book địa điểm phù hợp với ngân sách và số lượng khách',
        category: 'venue',
        milestone: '6 tháng trước',
        dueDate: Timestamp.fromDate(subMonths(weddingDate, 6)),
        priority: 'high' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Nên đặt cọc sớm để có giá tốt'
      },
      {
        title: 'Thuê dịch vụ chụp ảnh cưới',
        description: 'Chọn studio ảnh cưới và photographer cho ngày cưới',
        category: 'photography',
        milestone: '4 tháng trước',
        dueDate: Timestamp.fromDate(subMonths(weddingDate, 4)),
        priority: 'high' as const,
        assignedTo: '',
        assigneeName: '',
        notes: 'Nên chụp ảnh cưới trước 2-3 tháng'
      }
    ];

    // Kết hợp tất cả tasks
    const allTasks = [...legalTasks, ...traditionalTasks, ...basicTasks];
    
    // Tạo tasks trong Firebase
    const createdTasks: TodoTask[] = [];
    for (const taskData of allTasks) {
      try {
        const task = await createTask({
          ...taskData,
          weddingId,
          status: 'pending',
          isDefault: true,
          reminderSent: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        createdTasks.push(task);
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }
    
    return createdTasks;
  };

  // Lấy ads liên quan đến các category
  const getRelevantAdvertisements = async (categories: string[]): Promise<TaskAdvertisement[]> => {
    try {
      const allAds: TaskAdvertisement[] = [];
      
      for (const category of categories) {
        const ads = await getTaskAdvertisements([category]);
        allAds.push(...ads);
      }
      
      // Lấy tối đa 3 ads ngẫu nhiên
      const shuffled = allAds.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3);
    } catch (error) {
      console.error('Error getting advertisements:', error);
      return [];
    }
  };

  // Tạo kế hoạch cơ bản tự động theo thủ tục Việt Nam
  const generateBasicPlan = async () => {
    if (!selectedWedding) return;

    setIsLoading(true);
    try {
      const weddingDate = selectedWedding.eventDate?.toDate();
      
      // Tạo các bước kế hoạch dựa trên thủ tục Việt Nam và thông tin đám cưới
      const steps: PlanningStep[] = [
        // Thủ tục pháp lý bắt buộc
        {
          id: 'legal_registration',
          title: 'Đăng ký kết hôn (Bắt buộc)',
          description: 'Thủ tục pháp lý để kết hôn hợp pháp tại Việt Nam',
          category: 'legal',
          timeframe: '1-2 tháng trước',
          priority: 'high',
          suggestedVendors: ['UBND phường/xã', 'Trung tâm y tế'],
          estimatedCost: '500,000 - 1,000,000 VNĐ',
          tips: [
            'Chuẩn bị đầy đủ giấy tờ theo quy định',
            'Khám sức khỏe tiền hôn nhân sớm',
            'Nộp hồ sơ trước 15 ngày làm việc'
          ]
        },
        // Nghi lễ truyền thống
        {
          id: 'traditional_ceremony',
          title: 'Lễ hỏi cưới truyền thống',
          description: 'Nghi lễ xin cưới theo phong tục Việt Nam',
          category: 'other',
          timeframe: '3-4 tháng trước',
          priority: 'high',
          suggestedVendors: ['Cửa hàng lễ vật', 'Thầy cúng', 'Xe hoa'],
          estimatedCost: '10-30 triệu VNĐ',
          tips: [
            'Chọn ngày tốt theo lịch âm',
            'Chuẩn bị lễ vật theo phong tục',
            'Thống nhất nghi thức với hai gia đình'
          ]
        },
        // Địa điểm tổ chức
        {
          id: 'venue',
          title: 'Chọn địa điểm tổ chức',
          description: 'Tìm và book địa điểm phù hợp với ngân sách và số lượng khách',
          category: 'venue',
          timeframe: '6-8 tháng trước',
          priority: 'high',
          suggestedVendors: VIETNAM_WEDDING_VENDORS.venue,
          estimatedCost: '80-300 triệu VNĐ',
          tips: [
            'Book sớm để có giá tốt và nhiều lựa chọn',
            'Kiểm tra menu và dịch vụ',
            'Đặt cọc để giữ chỗ'
          ]
        },
        // Nhiếp ảnh
        {
          id: 'photography',
          title: 'Chụp ảnh cưới & ngày cưới',
          description: 'Thuê photographer chuyên nghiệp',
          category: 'photography',
          timeframe: '4-6 tháng trước',
          priority: 'high',
          suggestedVendors: VIETNAM_WEDDING_VENDORS.photography,
          estimatedCost: '20-80 triệu VNĐ',
          tips: [
            'Xem portfolio và style ảnh',
            'Chụp thử ảnh cưới trước',
            'Thỏa thuận về bản quyền ảnh'
          ]
        },
        // Trang phục
        {
          id: 'attire',
          title: 'Trang phục cưới',
          description: 'Váy cưới, vest và áo dài truyền thống',
          category: 'attire',
          timeframe: '3-5 tháng trước',
          priority: 'medium',
          suggestedVendors: VIETNAM_WEDDING_VENDORS.attire,
          estimatedCost: '15-60 triệu VNĐ',
          tips: [
            'Thuê hoặc mua tùy ngân sách',
            'Chuẩn bị áo dài cho lễ vu quy',
            'Đặt trước thời gian may sửa'
          ]
        },
        // Ẩm thực
        {
          id: 'catering',
          title: 'Menu tiệc cưới',
          description: 'Lên menu phù hợp với khẩu vị Việt Nam',
          category: 'catering',
          timeframe: '2-3 tháng trước',
          priority: 'medium',
          suggestedVendors: VIETNAM_WEDDING_VENDORS.catering,
          estimatedCost: '800,000 - 1,500,000 VNĐ/bàn',
          tips: [
            'Cân bằng món mặn, ngọt, chay',
            'Chuẩn bị rượu cần, bánh cưới',
            'Tính thêm 10% số lượng khách'
          ]
        }
      ];

      setPlanningSteps(steps);

      // Tạo tasks tự động dựa trên thủ tục VN
      if (selectedWedding.id && weddingDate) {
        const vietnamTasks = await createVietnameseWeddingTasks(selectedWedding.id, weddingDate);
        setGeneratedTasks(vietnamTasks);
        onTasksCreated?.(vietnamTasks);
      }

      // Lấy ads liên quan
      const ads = await getRelevantAdvertisements(['legal', 'venue', 'photography', 'attire']);

      // Thêm tin nhắn phản hồi với ads
      const responseMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: `🎉 Tôi đã tạo kế hoạch cưới theo phong tục Việt Nam cho ${selectedWedding.brideName} & ${selectedWedding.groomName}!

📅 Ngày cưới: ${selectedWedding.eventDate ? formatDate(selectedWedding.eventDate.toDate()) : 'Chưa xác định'}

🎯 **Kế hoạch bao gồm:**
• ${steps.length} bước kế hoạch chính
• Thủ tục đăng ký kết hôn hợp pháp
• Nghi lễ truyền thống Việt Nam
• ${generatedTasks.length} công việc cụ thể

✨ **Đặc biệt:** Tôi đã tích hợp đầy đủ thủ tục pháp lý và phong tục truyền thống của Việt Nam để đảm bảo đám cưới của bạn vừa ý nghĩa, vừa hợp pháp!

Xem chi tiết trong tab **Kế hoạch** và các công việc đã được thêm vào **Todo list**.`,
        timestamp: new Date(),
        advertisements: ads
      };

      setChatMessages(prev => [...prev, responseMessage]);

    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi tin nhắn chat
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    
    // Generate AI response
    try {
      const responseContent = await generateAIResponse(currentMessage);
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: responseContent,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu. Vui lòng thử lại!',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorResponse]);
    }
  };

  // Tạo phản hồi AI thông minh với khả năng tạo tasks và ads
  const generateAIResponse = async (message: string): Promise<string> => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('ngân sách') || lowerMessage.includes('chi phí')) {
      // Tạo task về lập ngân sách nếu chưa có
      if (selectedWedding?.id) {
        try {
          await createTask({
            weddingId: selectedWedding.id,
            title: 'Lập bảng ngân sách chi tiết đám cưới',
            description: 'Phân bổ ngân sách theo các hạng mục: venue (40-50%), photo (10-15%), attire (10-15%), decoration (8-10%), music (5-8%), invitation (2-3%), khác (10-15%)',
            category: 'other',
            milestone: '6 tháng trước',
            dueDate: Timestamp.fromDate(selectedWedding.eventDate ? subMonths(selectedWedding.eventDate.toDate(), 6) : addDays(new Date(), 30)),
            status: 'pending',
            priority: 'high',
            assignedTo: '',
            assigneeName: '',
            notes: 'Nên dành 10-20% ngân sách dự phòng cho các chi phí phát sinh',
            isDefault: false,
            reminderSent: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } catch (error) {
          console.error('Error creating budget task:', error);
        }
      }

      return `💰 **Hướng dẫn phân bổ ngân sách đám cưới tại Việt Nam:**

📊 **Tỷ lệ khuyến nghị:**
• Địa điểm và tiệc cưới: 40-50% (80-200 triệu)
• Nhiếp ảnh/quay phim: 10-15% (20-60 triệu)
• Trang phục cưới: 10-15% (20-50 triệu) 
• Trang trí hoa: 8-10% (15-40 triệu)
• Nhạc và MC: 5-8% (10-30 triệu)
• Thiệp mời: 2-3% (5-12 triệu)
• Thủ tục pháp lý: 1-2% (2-5 triệu)
• Dự phòng: 10-15%

✅ **Tôi đã tạo task "Lập bảng ngân sách chi tiết" vào Todo list của bạn!**

💡 **Mẹo tiết kiệm:** Tổ chức vào mùa thấp điểm (tháng 3-5, 9-11), book sớm để có giá tốt, và cân nhắc package deal.`;
    }
    
    if (lowerMessage.includes('địa điểm') || lowerMessage.includes('venue') || lowerMessage.includes('nhà hàng')) {
      // Tạo task về tìm venue
      if (selectedWedding?.id) {
        try {
          await createTask({
            weddingId: selectedWedding.id,
            title: 'Khảo sát và đặt địa điểm tổ chức',
            description: 'Tìm hiểu ít nhất 3-5 địa điểm, so sánh giá cả, menu, dịch vụ và đặt cọc địa điểm ưng ý nhất',
            category: 'venue',
            milestone: '6 tháng trước',
            dueDate: Timestamp.fromDate(selectedWedding.eventDate ? subMonths(selectedWedding.eventDate.toDate(), 6) : addDays(new Date(), 60)),
            status: 'pending',
            priority: 'high',
            assignedTo: '',
            assigneeName: '',
            notes: 'Kiểm tra availability, menu tasting, policy hủy bỏ',
            isDefault: false,
            reminderSent: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
        } catch (error) {
          console.error('Error creating venue task:', error);
        }
      }

      return `🏛️ **Gợi ý địa điểm tổ chức đám cưới tại Việt Nam:**

🌟 **Theo loại hình:**
• **Khách sạn 5 sao:** Sang trọng, dịch vụ chuyên nghiệp (1.2-2M/bàn)
• **Trung tâm tiệc cưới:** Chuyên biệt, giá hợp lý (800K-1.5M/bàn)
• **Resort/Villa:** Không gian riêng tư, chụp ảnh đẹp (1-1.8M/bàn)
• **Nhà hàng:** Linh hoạt, menu đa dạng (700K-1.2M/bàn)

📋 **Checklist khi chọn venue:**
✓ Sức chứa phù hợp với số khách
✓ Menu thử và chất lượng món ăn  
✓ Âm thanh, ánh sáng, trang trí
✓ Bãi đậu xe, vị trí thuận tiện
✓ Policy và điều khoản hợp đồng

✅ **Đã tạo task "Khảo sát địa điểm" vào Todo list!**

🎯 Bạn dự kiến bao nhiêu khách và ngân sách venue khoảng bao nhiêu?`;
    }

    if (lowerMessage.includes('thủ tục') || lowerMessage.includes('pháp lý') || lowerMessage.includes('đăng ký')) {
      // Tạo task về thủ tục pháp lý
      if (selectedWedding?.id) {
        try {
          const legalTasks = [
            {
              title: 'Chuẩn bị hồ sơ đăng ký kết hôn',
              description: 'Giấy khai sinh, CMND/CCCD, giấy xác nhận độc thân, đơn đăng ký kết hôn',
              category: 'legal',
              milestone: '2 tháng trước',
              dueDate: Timestamp.fromDate(selectedWedding.eventDate ? subMonths(selectedWedding.eventDate.toDate(), 2) : addDays(new Date(), 60)),
              priority: 'high' as const
            },
            {
              title: 'Khám sức khỏe tiền hôn nhân',
              description: 'Đăng ký khám tại trung tâm y tế, giấy khám có hiệu lực 6 tháng',
              category: 'legal', 
              milestone: '6 tuần trước',
              dueDate: Timestamp.fromDate(selectedWedding.eventDate ? subWeeks(selectedWedding.eventDate.toDate(), 6) : addDays(new Date(), 30)),
              priority: 'high' as const
            }
          ];

          for (const taskData of legalTasks) {
            await createTask({
              ...taskData,
              weddingId: selectedWedding.id,
              status: 'pending',
              assignedTo: '',
              assigneeName: '',
              notes: '',
              isDefault: false,
              reminderSent: false,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
        } catch (error) {
          console.error('Error creating legal tasks:', error);
        }
      }

      return `📋 **Thủ tục pháp lý đăng ký kết hôn tại Việt Nam:**

📝 **Hồ sơ cần thiết:**
• Giấy khai sinh (bản chính hoặc sao y)
• CMND/CCCD (bản chính)
• Giấy xác nhận tình trạng hôn nhân 
• Giấy khám sức khỏe tiền hôn nhân
• Đơn đăng ký kết hôn (tại UBND)

⏰ **Quy trình và thời gian:**
1. **Chuẩn bị hồ sơ** (2 tháng trước)
2. **Khám sức khỏe** (6 tuần trước) 
3. **Nộp hồ sơ** tại UBND (15 ngày trước)
4. **Nhận giấy kết hôn** (trong 15 ngày)

⚠️ **Lưu ý quan trọng:**
• Giấy khám có hiệu lực 6 tháng
• Phải đăng ký tại nơi thường trú của một bên
• Mang theo 2 nhân chứng khi làm thủ tục

✅ **Đã tạo 2 tasks về thủ tục pháp lý vào Todo list!**`;
    }

    if (lowerMessage.includes('truyền thống') || lowerMessage.includes('phong tục') || lowerMessage.includes('lễ hỏi')) {
      return `🏮 **Nghi lễ đám cưới truyền thống Việt Nam:**

🎭 **Các nghi lễ chính:**
1. **Lễ dạm ngõ** (6 tháng trước): Tìm hiểu, xin phép
2. **Lễ hỏi cưới** (3-4 tháng trước): Chính thức xin cưới  
3. **Lễ rước dâu** (ngày cưới): Đón dâu về nhà chú rể
4. **Lễ thành hôn** (ngày cưới): Nghi thức kết hôn

🎁 **Lễ vật hỏi cưới (số lẻ):**
• Trầu cau (1 khay)
• Rượu cần (1 bình) 
• Bánh phu thê (1 đôi)
• Hoa quả (5-7 loại)
• Trang sức vàng
• Tiền mừng (phong bì đỏ)

📅 **Chọn ngày tốt:**
• Tham khảo lịch âm
• Tránh tháng cô hồn (tháng 7 âm)
• Thống nhất với cả hai gia đình

💡 **Mẹo quan trọng:** Thảo luận trước nghi thức với đại diện hai gia đình để tránh hiểu lầm!`;
    }

    // Default response
    return `🤖 Cảm ơn bạn đã chia sẻ! Tôi hiểu bạn quan tâm về "${message}". 

📋 **Để tư vấn chính xác nhất, bạn có thể cho tôi biết:**
• Số lượng khách mời dự kiến
• Ngân sách tổng thể
• Phong cách đám cưới mong muốn  
• Khu vực tổ chức
• Những ưu tiên hàng đầu

💬 **Hoặc hỏi tôi về:**
• "Ngân sách" - Phân bổ chi phí hợp lý
• "Địa điểm" - Gợi ý venue phù hợp
• "Thủ tục pháp lý" - Đăng ký kết hôn
• "Truyền thống" - Nghi lễ Việt Nam
• "Lịch trình" - Timeline chuẩn bị

🎯 Tôi sẽ tự động tạo tasks và gợi ý dịch vụ phù hợp cho bạn!`;
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {selectedWedding ? (
        <>
          {/* Wedding Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-pink-500" />
                Thông tin đám cưới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Cô dâu & Chú rể</p>
                  <p className="font-medium">{selectedWedding.brideName} & {selectedWedding.groomName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày cưới</p>
                  <p className="font-medium">
                    {selectedWedding.eventDate ? formatDate(selectedWedding.eventDate.toDate()) : 'Chưa xác định'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa điểm</p>
                  <p className="font-medium">{selectedWedding.venue || 'Chưa chọn'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tiến độ lập kế hoạch</p>
                  <div className="flex items-center gap-2">
                    <Progress value={planningProgress} className="flex-1" />
                    <span className="text-sm text-gray-600">{planningProgress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Hành động nhanh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={generateBasicPlan}
                  disabled={isLoading}
                  className="h-auto p-4 justify-start"
                  variant="outline"
                >
                  <div className="text-left">
                    <div className="font-medium">Tạo kế hoạch tự động</div>
                    <div className="text-sm text-gray-600">Tạo todo list và timeline chi tiết</div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button 
                  className="h-auto p-4 justify-start"
                  variant="outline"
                  onClick={() => setActiveTab('chat')}
                >
                  <div className="text-left">
                    <div className="font-medium">Tư vấn với AI</div>
                    <div className="text-sm text-gray-600">Hỏi đáp về lập kế hoạch đám cưới</div>
                  </div>
                  <MessageSquare className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Vui lòng chọn một đám cưới để bắt đầu lập kế hoạch.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render chat tab
  const renderChat = () => (
    <div className="space-y-4">
      {/* Chat messages */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-lg whitespace-pre-line ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 border'
                }`}
              >
                {message.content}
              </div>
              
              {/* Action buttons */}
              {message.actions && (
                <div className="mt-2 space-y-2">
                  {message.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (action.type === 'create_tasks') {
                          generateBasicPlan();
                        }
                      }}
                    >
                      {action.data?.message || 'Thực hiện'}
                    </Button>
                  ))}
                </div>
              )}

              {/* Advertisement section */}
              {message.advertisements && message.advertisements.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Dịch vụ được đề xuất
                  </h4>
                                     <div className="space-y-2">
                     {message.advertisements.map((ad) => (
                       <div key={ad.id} className="text-xs text-yellow-700 p-2 bg-white rounded border">
                         <div className="font-medium">{ad.title}</div>
                         <div className="text-yellow-600">{ad.description}</div>
                         <div className="mt-1">
                           <Button
                             size="sm"
                             variant="outline"
                             className="text-xs"
                             onClick={() => window.open(ad.linkUrl, '_blank')}
                           >
                             Xem chi tiết
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
            <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {message.type === 'user' ? (
                  <Users className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Hỏi AI về lập kế hoạch đám cưới..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
          Gửi
        </Button>
      </div>
    </div>
  );

  // Render timeline tab
  const renderTimeline = () => (
    <div className="space-y-4">
      {planningSteps.length > 0 ? (
        planningSteps.map((step, index) => (
          <Card key={step.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{step.title}</h3>
                    <Badge variant={step.priority === 'high' ? 'destructive' : 'secondary'}>
                      {step.priority === 'high' ? 'Ưu tiên cao' : 'Ưu tiên thường'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {step.timeframe}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {step.estimatedCost}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Gợi ý nhà cung cấp:</p>
                    <div className="flex flex-wrap gap-1">
                      {step.suggestedVendors.map((vendor) => (
                        <Badge key={vendor} variant="outline" className="text-xs">
                          {vendor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {step.tips.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Lightbulb className="h-3 w-3" />
                        Mẹo hay:
                      </p>
                      <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                        {step.tips.map((tip, tipIndex) => (
                          <li key={tipIndex}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Chưa có kế hoạch nào được tạo.</p>
            <Button onClick={generateBasicPlan} disabled={!selectedWedding}>
              Tạo kế hoạch tự động
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <>
      <LoadingOverlay isLoading={isLoading} type="api" message="Đang tạo kế hoạch..." />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-500" />
            Wedding AI Assistant
          </CardTitle>
          <CardDescription>
            Trợ lý AI giúp bạn lập kế hoạch đám cưới hoàn hảo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="chat">Tư vấn AI</TabsTrigger>
              <TabsTrigger value="timeline">Kế hoạch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              {renderOverview()}
            </TabsContent>
            
            <TabsContent value="chat" className="mt-6">
              {renderChat()}
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              {renderTimeline()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
} 