"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, Users, MessageSquare, Send, Lightbulb, 
  Sparkles, ArrowRight, Clock, Star, Zap, Brain
} from "lucide-react";
import { WeddingData, TodoTask, TaskAdvertisement } from "@/lib/firebase/models";
import { createTask } from "@/lib/firebase/todoService";
import { Timestamp } from "firebase/firestore";
import { addDays, subMonths, subWeeks } from "date-fns";
import weddingPlannerConfig from "@/config/weddingPlannerConfig.json";

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
  advertisements?: TaskAdvertisement[];
  quickReplies?: string[];
  smartActions?: SmartActionButton[];
}

interface ActionButton {
  type: string;
  label: string;
  description: string;
  data?: any;
}

interface SmartActionButton {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: string;
}

interface AIChatTabProps {
  selectedWedding: WeddingData | null;
  onTasksCreated?: (tasks: TodoTask[]) => void;
}

export default function AIChatTab({ selectedWedding, onTasksCreated }: AIChatTabProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat and other methods
  useEffect(() => {
    initializeChat();
  }, [selectedWedding]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Generate smart suggestions
  useEffect(() => {
    generateSmartSuggestions();
  }, [selectedWedding, chatMessages]);

  // Auto-trigger prompt from smart actions
  useEffect(() => {
    if (inputMessage && inputRef.current) {
      // Auto-submit if this is from a smart action
      const isSmartAction = inputMessage.includes('Còn ') && inputMessage.includes('ngày đến ngày cưới');
      if (isSmartAction) {
        setTimeout(() => {
          handleSendMessage();
        }, 500);
      }
    }
  }, [inputMessage]);

  const initializeChat = () => {
    if (!selectedWedding) return;

    const weddingInfo = `${selectedWedding.brideName} & ${selectedWedding.groomName}`;
    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    let welcomeContent = `Xin chào! Tôi là Wedding AI Assistant 🤖✨

Tôi hiểu bạn đang lập kế hoạch cho đám cưới của **${weddingInfo}**`;

    if (timeLeft) {
      if (timeLeft > 0) {
        welcomeContent += `\nCòn **${timeLeft} ngày** đến ngày cưới! ⏰`;
      } else if (timeLeft === 0) {
        welcomeContent += `\n🎉 **Hôm nay là ngày cưới!** Chúc mừng bạn!`;
      } else {
        welcomeContent += `\n🎊 Đám cưới đã diễn ra cách đây ${Math.abs(timeLeft)} ngày!`;
      }
    }

    welcomeContent += `

💫 **Tôi có thể giúp bạn:**
• Tạo kế hoạch chi tiết từ A-Z
• Tự động tạo công việc cần làm
• Gợi ý nhà cung cấp uy tín
• Tư vấn ngân sách hợp lý
• Hướng dẫn thủ tục pháp lý
• Tư vấn nghi lễ truyền thống

Hãy hỏi tôi bất cứ điều gì về đám cưới! 💬`;

    const smartActions = generateSmartActions();
    const quickReplies = generateInitialQuickReplies();

    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'agent',
      content: welcomeContent,
      timestamp: new Date(),
      smartActions,
      quickReplies
    };

    setChatMessages([welcomeMessage]);
  };

  const generateSmartActions = (): SmartActionButton[] => {
    if (!selectedWedding) return [];

    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const actions: SmartActionButton[] = [];

    // Get smart actions from config
    const configActions = weddingPlannerConfig.smartActions;
    
    // Time-based actions
    if (timeLeft && timeLeft > 0) {
      actions.push({
        id: 'analyze_timeline',
        label: configActions.analyze_timeline.label,
        description: `Còn ${timeLeft} ngày - cần phân tích ưu tiên`,
        icon: configActions.analyze_timeline.icon,
        prompt: configActions.analyze_timeline.prompt
      });
    }

    // Budget actions
    if (!selectedWedding.budgetRange) {
      actions.push({
        id: 'budget_calculator',
        label: configActions.budget_calculator.label,
        description: configActions.budget_calculator.description,
        icon: configActions.budget_calculator.icon,
        prompt: configActions.budget_calculator.prompt
      });
    }

    // Vendor actions
    if (!selectedWedding.venue) {
      actions.push({
        id: 'vendor_matcher',
        label: configActions.vendor_matcher.label,
        description: configActions.vendor_matcher.description,
        icon: configActions.vendor_matcher.icon,
        prompt: configActions.vendor_matcher.prompt
      });
    }

    return actions.slice(0, 4);
  };

  const generateInitialQuickReplies = (): string[] => {
    if (!selectedWedding) return [];

    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const replies = [];

    if (timeLeft && timeLeft < 60) {
      replies.push("Tôi cần tổ chức cưới gấp!");
    }
    
    replies.push(
      "Tạo kế hoạch toàn diện",
      "Tôi cần bao nhiều tiền?",
      "Thủ tục pháp lý như thế nào?",
      "Gợi ý địa điểm đám cưới"
    );

    return replies.slice(0, 4);
  };

  const generateSmartSuggestions = () => {
    if (!selectedWedding) return;

    const suggestions: string[] = [];
    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    // Context-based suggestions
    if (timeLeft && timeLeft > 365) {
      suggestions.push("Chọn ngày cưới như thế nào?", "Ngân sách bao nhiều là đủ?");
    } else if (timeLeft && timeLeft > 180) {
      suggestions.push("Tìm địa điểm tổ chức", "Chụp ảnh cưới khi nào?");
    } else if (timeLeft && timeLeft > 30) {
      suggestions.push("Chuẩn bị gì cho tuần cuối?", "Checklist ngày cưới");
    } else if (timeLeft && timeLeft <= 30) {
      suggestions.push("Cần làm gì gấp?", "Checklist phút chót");
    }

    // Missing info suggestions
    if (!selectedWedding.venue) {
      suggestions.push("Gợi ý địa điểm tổ chức");
    }

    setSuggestions(suggestions.slice(0, 3));
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await generateIntelligentResponse(inputMessage);
      
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.content,
        timestamp: new Date(),
        advertisements: response.ads,
        actions: response.actions,
        quickReplies: response.quickReplies,
        smartActions: response.smartActions
      };
      
      setChatMessages(prev => [...prev, agentResponse]);

      // Create tasks if response includes them
      if (response.tasks && response.tasks.length > 0 && selectedWedding?.id) {
        await createTasksFromResponse(response.tasks);
      }
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const generateIntelligentResponse = async (message: string) => {
    const intent = analyzeIntent(message);
    const response = await getResponseByIntent(intent, message);
    return response;
  };

  const analyzeIntent = (message: string) => {
    const msg = message.toLowerCase();
    
    // Check for patterns in new config
    const patterns = weddingPlannerConfig.chatPatterns;
    
    for (const [intentKey, pattern] of Object.entries(patterns)) {
      if (pattern.keywords.some(keyword => msg.includes(keyword))) {
        return intentKey;
      }
    }

    // Existing intent analysis
    if (msg.includes('ngân sách') || msg.includes('tiền') || msg.includes('chi phí')) {
      return 'budget';
    }
    if (msg.includes('gấp') || msg.includes('khẩn cấp') || msg.includes('nhanh')) {
      return 'emergency';
    }
    if (msg.includes('địa điểm') || msg.includes('venue') || msg.includes('nhà hàng')) {
      return 'venue';
    }
    if (msg.includes('thủ tục') || msg.includes('đăng ký') || msg.includes('pháp lý')) {
      return 'legal';
    }
    if (msg.includes('truyền thống') || msg.includes('nghi lễ') || msg.includes('phong tục')) {
      return 'traditional';
    }
    if (msg.includes('chụp ảnh') || msg.includes('nhiếp ảnh') || msg.includes('photography')) {
      return 'photography';
    }
    if (msg.includes('âm nhạc') || msg.includes('nhạc') || msg.includes('dj')) {
      return 'music';
    }
    if (msg.includes('khách mời') || msg.includes('thiệp') || msg.includes('guest')) {
      return 'guest_management';
    }
    if (msg.includes('tuần trăng mật') || msg.includes('honeymoon') || msg.includes('du lịch')) {
      return 'honeymoon';
    }
    if (msg.includes('toàn diện') || msg.includes('a-z') || msg.includes('đầy đủ')) {
      return 'comprehensive_plan';
    }

    return 'general';
  };

  const getResponseByIntent = async (intent: string, originalMessage: string) => {
    // Check if intent exists in config responses
    const responses = weddingPlannerConfig.responses as Record<string, any>;
    if (responses[intent]) {
      const configResponse = responses[intent];
      
      const tasks = await createTasksFromConfig(intent, selectedWedding?.id || '', selectedWedding?.eventDate?.toDate() || new Date());
      const ads = await getAdvertisementsFromConfig(configResponse.advertisements || []);
      const smartActions = generateContextualSmartActions(intent);
      const quickReplies = generateQuickReplies(intent);

      return {
        content: configResponse.content,
        tasks,
        ads,
        actions: configResponse.actions || [],
        smartActions,
        quickReplies
      };
    }

    // Handle pattern-based responses
    const patterns = weddingPlannerConfig.chatPatterns as Record<string, any>;
    if (patterns[intent]) {
      return {
        content: patterns[intent].response,
        tasks: [],
        ads: [],
        actions: [],
        smartActions: generateSmartActions(),
        quickReplies: generateInitialQuickReplies()
      };
    }

    // Fallback for unrecognized intents
    return generateContextualResponse(originalMessage);
  };

  const generateContextualResponse = (message: string) => {
    const timeLeft = selectedWedding?.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    let content = `Tôi hiểu bạn đang quan tâm đến: "${message}"\n\n`;
    
    if (timeLeft && timeLeft > 0) {
      if (timeLeft < 30) {
        content += `⏰ Với ${timeLeft} ngày còn lại, tôi khuyên bạn nên tập trung vào những việc ưu tiên cao nhất!\n\n`;
      }
    }

    content += `💡 **Tôi có thể giúp bạn:**
• Tạo kế hoạch chi tiết dựa trên thời gian còn lại
• Gợi ý các nhà cung cấp uy tín
• Tư vấn ngân sách hợp lý
• Hướng dẫn thủ tục cần thiết

Hãy hỏi cụ thể hơn về những gì bạn cần!`;

    return {
      content,
      tasks: [],
      ads: [],
      actions: [],
      smartActions: generateSmartActions(),
      quickReplies: [
        "Tạo kế hoạch ưu tiên",
        "Gợi ý nhà cung cấp",
        "Tư vấn ngân sách",
        "Hướng dẫn thủ tục"
      ]
    };
  };

  const generateContextualSmartActions = (intent: string): SmartActionButton[] => {
    const actions: SmartActionButton[] = [];
    
    if (intent === 'budget') {
      actions.push({
        id: 'budget_calculator',
        label: 'Tính toán chi tiết',
        description: 'Phân tích ngân sách từng hạng mục',
        icon: 'calculator',
        prompt: 'Tạo bảng phân tích ngân sách chi tiết cho từng hạng mục'
      });
    }

    if (intent === 'venue') {
      actions.push({
        id: 'venue_comparison',
        label: 'So sánh venue',
        description: 'Bảng so sánh chi tiết các địa điểm',
        icon: 'users',
        prompt: 'Tạo bảng so sánh các địa điểm tổ chức đám cưới'
      });
    }

    return actions;
  };

  const generateQuickReplies = (intent: string): string[] => {
    switch (intent) {
      case 'budget':
        return ['Phân bổ chi tiết', 'Mẹo tiết kiệm', 'So sánh gói dịch vụ'];
      case 'venue':
        return ['So sánh địa điểm', 'Lên lịch tham quan', 'Tính chi phí venue'];
      case 'legal':
        return ['Checklist giấy tờ', 'Đặt lịch khám', 'Timeline thủ tục'];
      case 'emergency':
        return ['Kế hoạch 1 tháng', 'Vendors khẩn cấp', 'Checklist tối thiểu'];
      default:
        return ['Tìm hiểu thêm', 'Tạo task', 'Gợi ý khác'];
    }
  };

  const createTasksFromConfig = async (responseKey: string, weddingId: string, weddingDate: Date): Promise<TodoTask[]> => {
    const responses = weddingPlannerConfig.responses as Record<string, any>;
    if (!weddingId || !responses[responseKey]?.tasks) return [];

    const configTasks = responses[responseKey].tasks;
    const createdTasks: TodoTask[] = [];

    for (const taskConfig of configTasks) {
      try {
        let dueDate = new Date(weddingDate);
        
        // Parse milestone to calculate due date
        if (taskConfig.milestone.includes('tháng trước')) {
          const months = parseInt(taskConfig.milestone.match(/\d+/)?.[0] || '1');
          dueDate = subMonths(weddingDate, months);
        } else if (taskConfig.milestone.includes('tuần trước')) {
          const weeks = parseInt(taskConfig.milestone.match(/\d+/)?.[0] || '1');
          dueDate = subWeeks(weddingDate, weeks);
        } else if (taskConfig.milestone.includes('ngày trước') || taskConfig.milestone.includes('ngày')) {
          const days = parseInt(taskConfig.milestone.match(/\d+/)?.[0] || '7');
          dueDate = new Date(weddingDate.getTime() - (days * 24 * 60 * 60 * 1000));
        }

        const newTask: Omit<TodoTask, 'id'> = {
          title: taskConfig.title,
          description: taskConfig.description,
          category: taskConfig.category as any,
          priority: taskConfig.priority as any,
          status: 'pending' as any,
          milestone: taskConfig.milestone,
          dueDate: Timestamp.fromDate(dueDate),
          weddingId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          notes: taskConfig.notes,
          assignedTo: '',
          assigneeName: '',
          isDefault: false,
          reminderSent: false
        };

        const createdTask = await createTask(newTask);
        if (createdTask) {
          createdTasks.push(createdTask);
        }
      } catch (error) {
        console.error('Error creating task:', error);
      }
    }

    if (createdTasks.length > 0 && onTasksCreated) {
      onTasksCreated(createdTasks);
    }

    return createdTasks;
  };

  const createTasksFromResponse = async (tasks: any[]) => {
    // This would create tasks and call onTasksCreated
    if (onTasksCreated) {
      onTasksCreated(tasks);
    }
  };

  const getAdvertisementsFromConfig = async (categories: string[]): Promise<TaskAdvertisement[]> => {
    try {
      const ads: TaskAdvertisement[] = [];
      const advertisements = weddingPlannerConfig.advertisements as Record<string, any>;
      
      if (categories.length > 0) {
        categories.forEach(category => {
          const categoryAds = advertisements[category];
          if (categoryAds) {
            categoryAds.forEach((ad: any, index: number) => {
              ads.push({
                id: `${category}-${index}`,
                title: ad.title,
                description: ad.description,
                imageUrl: '',
                linkUrl: '#',
                categories: [category],
                priority: 1,
                isActive: true,
                startDate: Timestamp.now(),
                endDate: Timestamp.fromDate(addDays(new Date(), 30)),
                clickCount: 0,
                viewCount: 0
              });
            });
          }
        });
      }
      
      return ads.slice(0, 2);
    } catch (error) {
      console.error('Error getting advertisements:', error);
      return [];
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
  };

  const handleSmartAction = (action: SmartActionButton) => {
    setInputMessage(action.prompt);
  };

  const handleActionClick = async (action: ActionButton) => {
    const actionMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: `[Đã chọn: ${action.label}]`,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, actionMessage]);
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await getResponseByIntent(action.type, action.label);
      
      const agentResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.content,
        timestamp: new Date(),
        advertisements: response.ads,
        actions: response.actions,
        quickReplies: response.quickReplies,
        smartActions: response.smartActions
      };
      
      setChatMessages(prev => [...prev, agentResponse]);
    } catch (error) {
      console.error('Error handling action:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Message bubble */}
              <div
                className={`p-4 rounded-2xl whitespace-pre-line shadow-sm ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {message.content}
              </div>

              {/* Smart Actions */}
              {message.smartActions && message.smartActions.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    Hành động thông minh:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {message.smartActions.map((action) => (
                      <Button
                        key={action.id}
                        size="sm"
                        variant="outline"
                        onClick={() => handleSmartAction(action)}
                        className="justify-start h-auto p-3 text-left border-purple-200 hover:bg-purple-50"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                            {action.icon === 'clock' && <Clock className="h-3 w-3 text-purple-600" />}
                            {action.icon === 'calculator' && <Sparkles className="h-3 w-3 text-purple-600" />}
                            {action.icon === 'users' && <Users className="h-3 w-3 text-purple-600" />}
                            {action.icon === 'zap' && <Zap className="h-3 w-3 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-xs">{action.label}</div>
                            <div className="text-xs text-gray-600">{action.description}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs rounded-full border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Action buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {message.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      onClick={() => handleActionClick(action)}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <div>
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-gray-600">{action.description}</div>
                      </div>
                      <ArrowRight className="h-3 w-3 ml-auto flex-shrink-0" />
                    </Button>
                  ))}
                </div>
              )}

              {/* Advertisements */}
              {message.advertisements && message.advertisements.length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    Dịch vụ được đề xuất
                  </h4>
                  <div className="space-y-2">
                    {message.advertisements.map((ad) => (
                      <Card key={ad.id} className="bg-white/80 border-yellow-200">
                        <CardContent className="p-3">
                          <div className="font-medium text-sm text-yellow-800">{ad.title}</div>
                          <div className="text-xs text-yellow-700 mt-1">{ad.description}</div>
                          <div className="text-xs text-yellow-600 mt-1">
                            Danh mục: {ad.categories?.join(', ') || 'Dịch vụ cưới'}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2 text-xs border-yellow-300 hover:bg-yellow-50"
                            onClick={() => window.open(ad.linkUrl, '_blank')}
                          >
                            Xem chi tiết
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className={`flex-shrink-0 ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
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

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestions bar */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
            <Sparkles className="h-3 w-3" />
            Gợi ý cho bạn:
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                size="sm"
                variant="ghost"
                onClick={() => handleQuickReply(suggestion)}
                className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-full"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Hỏi AI về lập kế hoạch đám cưới..."
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1 rounded-full border-gray-300 focus:border-pink-400 focus:ring-pink-400 ai-chat-input"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isTyping}
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 