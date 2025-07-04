"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, Calendar, Users, DollarSign, 
  Bot, Clock, Heart, Target, CheckCircle, 
  AlertTriangle, TrendingUp, Zap, Brain
} from "lucide-react";
import { WeddingData, TodoTask } from "@/lib/firebase/models";
import LoadingScreen from "@/components/ui/loading-screen";
import { formatDate } from "@/lib/utils/dateUtils";
import AIChatTab from "@/components/dashboard/AIChatTab";
import weddingPlannerConfig from "@/config/weddingPlannerConfig.json";

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
  status?: 'pending' | 'in-progress' | 'completed';
}

interface SmartAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  prompt: string;
  category: string;
}

export default function WeddingPlannerAgent({ selectedWedding, onTasksCreated }: WeddingPlannerAgentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'timeline'>('overview');
  const [planningSteps, setPlanningSteps] = useState<PlanningStep[]>([]);
  const [planningProgress, setPlanningProgress] = useState(0);
  const [smartActions, setSmartActions] = useState<SmartAction[]>([]);

  // Calculate planning progress
  useEffect(() => {
    if (selectedWedding) {
      let progress = 0;
      const checks = [
        { condition: selectedWedding.eventDate, points: 20 },
        { condition: selectedWedding.venue, points: 25 },
        { condition: selectedWedding.brideName && selectedWedding.groomName, points: 15 },
        { condition: selectedWedding.groomPhone || selectedWedding.bridePhone, points: 10 },
        { condition: selectedWedding.templateId, points: 20 },
        { condition: selectedWedding.budgetRange, points: 10 }
      ];

      checks.forEach(check => {
        if (check.condition) progress += check.points;
      });

      setPlanningProgress(Math.min(progress, 100));
    }
  }, [selectedWedding]);

  // Generate smart actions based on wedding context
  useEffect(() => {
    if (selectedWedding) {
      generateSmartActions();
      generatePlanningSteps();
    }
  }, [selectedWedding]);

  const generateSmartActions = () => {
    if (!selectedWedding) return;

    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const actions: SmartAction[] = [];

    // Time-based actions
    if (timeLeft && timeLeft > 0) {
      actions.push({
        id: 'analyze_timeline',
        label: 'Phân tích timeline',
        description: `Còn ${timeLeft} ngày - tạo kế hoạch ưu tiên`,
        icon: 'clock',
        prompt: `Còn ${timeLeft} ngày đến ngày cưới, hãy phân tích và đưa ra kế hoạch ưu tiên cho tôi`,
        category: 'timeline'
      });
    }

    // Budget-based actions
    if (!selectedWedding.budgetRange || planningProgress < 50) {
      actions.push({
        id: 'budget_calculator',
        label: 'Tính toán ngân sách',
        description: 'Lập kế hoạch ngân sách thông minh',
        icon: 'calculator',
        prompt: 'Giúp tôi lập kế hoạch ngân sách chi tiết và hợp lý cho đám cưới',
        category: 'budget'
      });
    }

    // Vendor-based actions
    if (!selectedWedding.venue) {
      actions.push({
        id: 'vendor_matcher',
        label: 'Tìm nhà cung cấp',
        description: 'AI gợi ý vendors phù hợp',
        icon: 'users',
        prompt: 'Gợi ý cho tôi các nhà cung cấp dịch vụ đám cưới phù hợp với ngân sách và phong cách',
        category: 'vendors'
      });
    }

    // Emergency planning for urgent cases
    if (timeLeft && timeLeft < 60) {
      actions.push({
        id: 'emergency_planning',
        label: 'Kế hoạch khẩn cấp',
        description: 'Hướng dẫn chuẩn bị nhanh',
        icon: 'zap',
        prompt: 'Tôi cần tổ chức đám cưới gấp, hãy đưa ra kế hoạch ưu tiên nhất',
        category: 'emergency'
      });
    }

    setSmartActions(actions.slice(0, 6));
  };

  const generatePlanningSteps = () => {
    if (!selectedWedding) return;

    const timeLeft = selectedWedding.eventDate 
      ? Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const steps: PlanningStep[] = [
      {
        id: 'legal_registration',
        title: 'Đăng ký kết hôn',
        description: 'Hoàn tất thủ tục pháp lý bắt buộc',
        category: 'legal',
        timeframe: timeLeft && timeLeft < 30 ? 'KHẨN CẤP' : '1-2 tháng trước',
        priority: 'high',
        suggestedVendors: ['UBND phường/xã', 'Trung tâm y tế'],
        estimatedCost: '500K - 1tr',
        tips: ['Chuẩn bị giấy tờ đầy đủ', 'Đặt lịch khám sức khỏe sớm'],
        status: 'pending'
      },
      {
        id: 'venue_booking',
        title: 'Đặt địa điểm tổ chức',
        description: selectedWedding.venue ? 'Đã có venue: ' + selectedWedding.venue : 'Chọn và đặt venue phù hợp',
        category: 'venue',
        timeframe: timeLeft && timeLeft < 180 ? 'GẤP' : '6-9 tháng trước',
        priority: selectedWedding.venue ? 'low' : 'high',
        suggestedVendors: weddingPlannerConfig.vendors.venue.slice(0, 3),
        estimatedCost: '80-300tr',
        tips: ['Book sớm giá tốt', 'Thử menu trước', 'Đọc kỹ hợp đồng'],
        status: selectedWedding.venue ? 'completed' : 'pending'
      },
      {
        id: 'photography',
        title: 'Nhiếp ảnh & Video',
        description: 'Chọn photographer phù hợp với style',
        category: 'photography',
        timeframe: '4-6 tháng trước',
        priority: 'medium',
        suggestedVendors: weddingPlannerConfig.vendors.photography.slice(0, 3),
        estimatedCost: '20-80tr',
        tips: ['Xem portfolio kỹ', 'Gặp photographer trước', 'Thỏa thuận bản quyền'],
        status: 'pending'
      },
      {
        id: 'attire',
        title: 'Trang phục cưới',
        description: 'Áo cưới và vest cho cặp đôi',
        category: 'attire',
        timeframe: '3-4 tháng trước',
        priority: 'medium',
        suggestedVendors: weddingPlannerConfig.vendors.attire.slice(0, 3),
        estimatedCost: '20-50tr',
        tips: ['Thử và đặt may sớm', 'Chuẩn bị nhiều lựa chọn'],
        status: 'pending'
      }
    ];

    setPlanningSteps(steps);
  };

  const handleSmartAction = (action: SmartAction) => {
    setActiveTab('chat');
    // This will automatically send the prompt to the chat
    setTimeout(() => {
      const chatTab = document.querySelector('[data-state="active"] .ai-chat-input') as HTMLInputElement;
      if (chatTab) {
        chatTab.value = action.prompt;
        chatTab.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTimeLeftInfo = () => {
    if (!selectedWedding?.eventDate) return null;
    
    const timeLeft = Math.ceil((selectedWedding.eventDate.toDate().getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (timeLeft < 0) return { text: 'Đã kết thúc', color: 'text-gray-500', urgency: 'completed' };
    if (timeLeft === 0) return { text: 'Hôm nay!', color: 'text-green-600', urgency: 'today' };
    if (timeLeft <= 7) return { text: `${timeLeft} ngày nữa`, color: 'text-red-600', urgency: 'urgent' };
    if (timeLeft <= 30) return { text: `${timeLeft} ngày nữa`, color: 'text-orange-600', urgency: 'soon' };
    if (timeLeft <= 90) return { text: `${timeLeft} ngày nữa`, color: 'text-blue-600', urgency: 'normal' };
    return { text: `${timeLeft} ngày nữa`, color: 'text-green-600', urgency: 'plenty' };
  };

  const renderOverview = () => {
    const timeInfo = getTimeLeftInfo();

    return (
      <div className="space-y-6">
        {selectedWedding ? (
          <>
            {/* Wedding Status Card */}
            <Card className="relative overflow-hidden border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50"></div>
              <CardContent className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {selectedWedding.brideName} & {selectedWedding.groomName}
                      </h2>
                      <p className="text-gray-600">
                        {selectedWedding.eventDate ? formatDate(selectedWedding.eventDate.toDate()) : 'Chưa xác định ngày'}
                      </p>
                    </div>
                  </div>
                  {timeInfo && (
                    <div className="text-right">
                      <p className={`text-lg font-bold ${timeInfo.color}`}>{timeInfo.text}</p>
                      <p className="text-sm text-gray-500">đến ngày cưới</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Tiến độ chuẩn bị</span>
                    <span className="text-sm font-bold text-gray-800">{planningProgress}%</span>
                  </div>
                  <div className="relative">
                    <Progress value={planningProgress} className="h-3" />
                    <div className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor(planningProgress)}`} 
                         style={{ width: `${planningProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Bắt đầu</span>
                    <span>Hoàn thành</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Actions */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Hành động thông minh
                </CardTitle>
                <CardDescription>
                  AI đề xuất các hành động ưu tiên dựa trên tình hình hiện tại
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {smartActions.map((action) => (
                    <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-400">
                      <CardContent className="p-4" onClick={() => handleSmartAction(action)}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            {action.icon === 'clock' && <Clock className="h-5 w-5 text-purple-600" />}
                            {action.icon === 'calculator' && <DollarSign className="h-5 w-5 text-purple-600" />}
                            {action.icon === 'users' && <Users className="h-5 w-5 text-purple-600" />}
                            {action.icon === 'zap' && <Zap className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">{action.label}</h3>
                            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{Math.round(planningProgress)}%</p>
                  <p className="text-sm text-gray-600">Đã hoàn thành</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{planningSteps.filter(s => s.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Công việc còn lại</p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-4">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{planningSteps.filter(s => s.priority === 'high' && s.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Ưu tiên cao</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có đám cưới nào được chọn</h3>
              <p className="text-gray-500">Vui lòng chọn một đám cưới để bắt đầu sử dụng AI Assistant.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderTimeline = () => (
    <div className="space-y-4">
      {planningSteps.length > 0 ? (
        <div className="space-y-4">
          {planningSteps.map((step, index) => (
            <Card key={step.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-md ${
              step.status === 'completed' ? 'bg-green-50 border-green-200' : 
              step.priority === 'high' ? 'border-l-4 border-l-red-400' : 
              'border-l-4 border-l-blue-400'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.priority === 'high' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle className="h-5 w-5" /> : index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800">{step.title}</h3>
                      <Badge variant={
                        step.priority === 'high' ? 'destructive' : 
                        step.priority === 'medium' ? 'default' : 
                        'secondary'
                      }>
                        {step.priority === 'high' ? 'Ưu tiên cao' : 
                         step.priority === 'medium' ? 'Ưu tiên vừa' : 
                         'Ưu tiên thấp'}
                      </Badge>
                      {step.status === 'completed' && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Hoàn thành
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600">{step.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Thời gian: {step.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Chi phí: {step.estimatedCost}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {step.suggestedVendors.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700 text-xs">Gợi ý:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.suggestedVendors.slice(0, 2).map((vendor) => (
                                <Badge key={vendor} variant="outline" className="text-xs">
                                  {vendor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {step.tips.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <span className="font-medium text-blue-800 text-sm flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Mẹo hay:
                        </span>
                        <ul className="list-disc list-inside text-xs text-blue-700 mt-1 space-y-1">
                          {step.tips.slice(0, 2).map((tip, tipIndex) => (
                            <li key={tipIndex}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có kế hoạch nào</h3>
            <p className="text-gray-500 mb-4">Sử dụng AI để tạo kế hoạch chi tiết cho đám cưới của bạn.</p>
            <Button onClick={generatePlanningSteps} disabled={!selectedWedding}>
              Tạo kế hoạch tự động
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <>
      {isLoading && (
        <LoadingScreen 
          message="Đang xử lý..." 
          size="lg"
          fullScreen={false}
        />
      )}
      
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wedding AI Assistant
              </span>
              <p className="text-sm font-normal text-gray-600 mt-1">
                Trợ lý AI thông minh cho đám cưới hoàn hảo
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                <Bot className="h-4 w-4 mr-2" />
                Tư vấn AI
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500">
                <Calendar className="h-4 w-4 mr-2" />
                Kế hoạch
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              {renderOverview()}
            </TabsContent>
            
            <TabsContent value="chat">
              <AIChatTab 
                selectedWedding={selectedWedding} 
                onTasksCreated={onTasksCreated}
              />
            </TabsContent>
            
            <TabsContent value="timeline">
              {renderTimeline()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
} 