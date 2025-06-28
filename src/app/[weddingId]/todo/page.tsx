"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TodoTask } from "@/lib/firebase/models";
import { 
  getWeddingTasks, 
  updateTask, 
  deleteTask, 
  createTask, 
  generateDefaultTasks 
} from "@/lib/firebase/todoService";
import { getWeddingWebsite } from "@/lib/firebase/weddingService";
import LoadingScreen from "@/components/ui/loading-screen";
import TaskListView from "@/components/todo/TaskListView";
import TaskDetailsDialog from "@/components/todo/TaskDetailsDialog";
import TaskFilters, { FilterOptions } from "@/components/todo/TaskFilters";
import NewTaskDialog from "@/components/todo/NewTaskDialog";
import { Button } from "@/components/ui/button";
import { PlusIcon, Calendar, Clock, ArrowLeft, CheckCircle, AlertCircle, CalendarDays, ChevronDown } from "lucide-react";
import { formatDistanceToNow, differenceInDays, isAfter, isBefore, addMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDate, formatLongDate } from "@/lib/utils/dateUtils";

export default function TodoPage() {
  const params = useParams<{ weddingId: string }>();
  const weddingId = params?.weddingId || '';
  const router = useRouter();

  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TodoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TodoTask | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [weddingName, setWeddingName] = useState<string>("");
  const [filterOptions, setFilterOptions] = useState({
    status: 'all',
    category: 'all',
    assignedTo: 'all',
    timeframe: 'all',
  });
  const [activeTab, setActiveTab] = useState("all");
  const [isMobileView, setIsMobileView] = useState(false);

  // Kiểm tra kích thước màn hình để điều chỉnh giao diện
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Kiểm tra khi component mount
    checkScreenSize();
    
    // Thêm event listener để kiểm tra khi resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Tính toán các thống kê
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const urgentTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = task.dueDate.toDate();
    const today = new Date();
    const daysLeft = differenceInDays(dueDate, today);
    return daysLeft <= 7 && daysLeft >= 0;
  });
  
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = task.dueDate.toDate();
    const today = new Date();
    return isBefore(dueDate, today);
  });

  // Tải dữ liệu ban đầu
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        
        // Tải thông tin về đám cưới để biết ngày cưới
        const weddingData = await getWeddingWebsite(weddingId);
        if (weddingData?.eventDate) {
          setWeddingDate(weddingData.eventDate.toDate());
        }
        
        if (weddingData) {
          setWeddingName(`${weddingData.groomName} & ${weddingData.brideName}`);
        }
        
        // Tải danh sách các task
        const tasksData = await getWeddingTasks(weddingId);
        setTasks(tasksData);
        setFilteredTasks(tasksData);
      } catch (error) {
        console.error("Error loading todo data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (weddingId) {
      loadData();
    }
  }, [weddingId]);

  // Xử lý khi người dùng thay đổi bộ lọc
  useEffect(() => {
    let filtered = [...tasks];
    
    // Lọc theo tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = task.dueDate.toDate();
        const today = new Date();
        const daysLeft = differenceInDays(dueDate, today);
        return daysLeft >= 0 && daysLeft <= 30 && task.status !== 'completed';
      });
    } else if (activeTab === 'overdue') {
      filtered = filtered.filter(task => {
        if (!task.dueDate || task.status === 'completed') return false;
        const dueDate = task.dueDate.toDate();
        const today = new Date();
        return isBefore(dueDate, today);
      });
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(task => task.status === 'completed');
    }
    
    // Lọc theo trạng thái
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(task => task.status === filterOptions.status);
    }
    
    // Lọc theo danh mục
    if (filterOptions.category !== 'all') {
      filtered = filtered.filter(task => task.category === filterOptions.category);
    }
    
    // Lọc theo người được giao
    if (filterOptions.assignedTo !== 'all') {
      filtered = filtered.filter(task => task.assignedTo === filterOptions.assignedTo);
    }
    
    // Lọc theo thời gian
    if (filterOptions.timeframe !== 'all') {
      const today = new Date();
      
      if (filterOptions.timeframe === 'thisWeek') {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = task.dueDate.toDate();
          const daysLeft = differenceInDays(dueDate, today);
          return daysLeft >= 0 && daysLeft <= 7;
        });
      } else if (filterOptions.timeframe === 'thisMonth') {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = task.dueDate.toDate();
          const nextMonth = addMonths(today, 1);
          return isAfter(dueDate, today) && isBefore(dueDate, nextMonth);
        });
      } else if (filterOptions.timeframe === 'nextMonth') {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = task.dueDate.toDate();
          const nextMonth = addMonths(today, 1);
          const twoMonths = addMonths(today, 2);
          return isAfter(dueDate, nextMonth) && isBefore(dueDate, twoMonths);
        });
      }
    }
    
    setFilteredTasks(filtered);
  }, [tasks, filterOptions, activeTab]);

  // Xử lý khi người dùng tạo task mới
  const handleCreateTask = async (newTask: Omit<TodoTask, 'id'>) => {
    try {
      const createdTask = await createTask(newTask);
      setTasks(prevTasks => [...prevTasks, createdTask]);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  // Xử lý khi người dùng cập nhật task
  const handleUpdateTask = async (updatedTask: TodoTask) => {
    try {
      const task = await updateTask(updatedTask);
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === task.id ? task : t)
      );
      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Xử lý khi người dùng xóa task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(weddingId, taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      setIsDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Xử lý khi người dùng xóa nhiều task
  const handleDeleteMultipleTasks = async (taskIds: string[]) => {
    try {
      // Xóa từng task một cách tuần tự để đảm bảo tính nhất quán
      await Promise.all(taskIds.map(taskId => deleteTask(weddingId, taskId)));
      
      // Cập nhật state để loại bỏ các task đã xóa
      setTasks(prevTasks => prevTasks.filter(task => !taskIds.includes(task.id)));
    } catch (error) {
      console.error('Error deleting multiple tasks:', error);
      throw error;
    }
  };

  // Xử lý khi người dùng muốn tạo tự động các task mặc định
  const handleGenerateDefaultTasks = async () => {
    try {
      const defaultTasks = await generateDefaultTasks(weddingId);
      setTasks(prevTasks => [...prevTasks, ...defaultTasks]);
    } catch (error) {
      console.error('Error generating default tasks:', error);
    }
  };

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(prev => ({
      ...prev,
      ...newFilters,
    }));
  };

  // if (isLoading) {
  //   return <LoadingScreen />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 text-gray-500 hover:bg-pink-100"
              onClick={() => router.push(`/dashboard`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Quay lại</span>
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">📝 Công việc chuẩn bị</h1>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-lg font-medium text-gray-700">
                <span>{weddingName}</span>
              </div>
              {weddingDate && (
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span>
                    {formatLongDate(weddingDate)} ({formatDistanceToNow(weddingDate, { addSuffix: true, locale: vi })})
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {tasks.length === 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleGenerateDefaultTasks}
                  disabled={!weddingDate}
                  className="border-pink-200 hover:bg-pink-50 text-xs md:text-sm"
                  size={isMobileView ? "sm" : "default"}
                >
                  <Calendar className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Tạo kế hoạch</span>
                  <span className="sm:hidden">Auto</span>
                </Button>
              )}
              <Button 
                onClick={() => setIsNewTaskOpen(true)}
                className="bg-pink-500 hover:bg-pink-600 shadow-lg text-xs md:text-sm"
                size={isMobileView ? "sm" : "default"}
              >
                <PlusIcon className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Thêm công việc</span>
                <span className="sm:hidden">Thêm</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-gray-800 flex items-center">
                <CheckCircle className="h-4 w-4 text-pink-500 mr-2" />
                Tiến độ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{completedTasks}/{totalTasks} việc</span>
                <span className="text-sm font-medium text-pink-600">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-gray-100" indicatorClassName="bg-pink-500" />
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-gray-800 flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                Gấp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-amber-600">{urgentTasks.length}</div>
              <div className="text-sm text-gray-500">trong 7 ngày</div>
            </CardContent>
          </Card>
          
          <Card className={`bg-white/80 backdrop-blur-sm border-red-200 ${isMobileView ? "col-span-full sm:col-span-2 md:col-span-1" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg text-gray-800 flex items-center">
                <Clock className="h-4 w-4 text-red-500 mr-2" />
                Quá hạn
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-red-600">{overdueTasks.length}</div>
              <div className="text-sm text-gray-500">cần xử lý</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs và bộ lọc */}
        <div className="mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <TabsList className="h-9 bg-white/80 backdrop-blur-sm border border-pink-200">
                <TabsTrigger value="all" className="text-xs md:text-sm data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">Tất cả</TabsTrigger>
                <TabsTrigger value="upcoming" className="text-xs md:text-sm data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">Sắp tới</TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs md:text-sm data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">Quá hạn</TabsTrigger>
                <TabsTrigger value="completed" className="text-xs md:text-sm data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700">Hoàn thành</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 border-pink-200 hover:bg-pink-50">
                      <Clock className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="text-xs md:text-sm">Thời gian</span>
                      <ChevronDown className="h-3 w-3 ml-1 md:ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setFilterOptions(prev => ({ ...prev, timeframe: 'all' }))}
                      className={filterOptions.timeframe === 'all' ? 'bg-pink-50' : ''}
                    >
                      Tất cả
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterOptions(prev => ({ ...prev, timeframe: 'thisWeek' }))}
                      className={filterOptions.timeframe === 'thisWeek' ? 'bg-pink-50' : ''}
                    >
                      Tuần này
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterOptions(prev => ({ ...prev, timeframe: 'thisMonth' }))}
                      className={filterOptions.timeframe === 'thisMonth' ? 'bg-pink-50' : ''}
                    >
                      Tháng này
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setFilterOptions(prev => ({ ...prev, timeframe: 'nextMonth' }))}
                      className={filterOptions.timeframe === 'nextMonth' ? 'bg-pink-50' : ''}
                    >
                      Tháng sau
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <TaskFilters 
                  onFilterChange={handleFilterChange}
                  filterOptions={filterOptions}
                  isMobileView={isMobileView}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <TabsContent value="all">
                {renderTaskList()}
              </TabsContent>
              <TabsContent value="upcoming">
                {renderTaskList("Sắp tới trong 30 ngày")}
              </TabsContent>
              <TabsContent value="overdue">
                {renderTaskList("Quá hạn")}
              </TabsContent>
              <TabsContent value="completed">
                {renderTaskList("Đã hoàn thành")}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {selectedTask && (
          <TaskDetailsDialog
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            task={selectedTask}
            onUpdate={handleUpdateTask}
            onDelete={() => handleDeleteTask(selectedTask.id)}
          />
        )}

        <NewTaskDialog
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          onCreateTask={handleCreateTask}
          weddingId={weddingId}
          weddingDate={weddingDate}
        />
      </div>
    </div>
  );
  
  function renderTaskList(title?: string) {
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-8 md:py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100">
          <CheckCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto text-pink-300 mb-3" />
          <h2 className="text-lg md:text-xl font-medium text-gray-700">Chưa có công việc</h2>
          <p className="text-gray-500 mt-2">
            {activeTab === 'all' ? 'Hãy thêm công việc mới hoặc tạo kế hoạch tự động' : 'Không có công việc nào phù hợp'}
          </p>
          {activeTab === 'all' && tasks.length === 0 && (
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => setIsNewTaskOpen(true)}
                className="bg-pink-500 hover:bg-pink-600 mr-2"
              >
                Thêm công việc
              </Button>
              {weddingDate && (
                <Button 
                  variant="outline" 
                  onClick={handleGenerateDefaultTasks}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  Tạo kế hoạch tự động
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-100 overflow-hidden">
        {title && (
          <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
            <h3 className="font-medium text-gray-800">{title}</h3>
          </div>
        )}
        <TaskListView
          tasks={filteredTasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setIsDetailsOpen(true);
          }}
          onStatusChange={handleUpdateTask}
          onDeleteMultiple={handleDeleteMultipleTasks}
          isMobileView={isMobileView}
        />
      </div>
    );
  }
} 