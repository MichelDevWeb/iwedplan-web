import { useState } from "react";
import { TodoTask } from "@/lib/firebase/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Tag, Clock, AlertTriangle, User, Trash2, CheckSquare, Square } from "lucide-react";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskListViewProps {
  tasks: TodoTask[];
  onTaskClick: (task: TodoTask) => void;
  onStatusChange: (task: TodoTask) => Promise<TodoTask>;
  onDeleteMultiple?: (taskIds: string[]) => Promise<void>;
  isMobileView?: boolean;
}

export default function TaskListView({
  tasks,
  onTaskClick,
  onStatusChange,
  onDeleteMultiple,
  isMobileView = false
}: TaskListViewProps) {
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<string>>(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Hiển thị màu sắc tương ứng với priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Hiển thị màu sắc tương ứng với status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Chưa bắt đầu</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Đang thực hiện</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">Hoàn thành</Badge>;
      case 'skipped':
        return <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-200">Bỏ qua</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Xử lý khi thay đổi trạng thái hoàn thành của task
  const handleStatusChange = async (task: TodoTask) => {
    try {
      setLoadingTaskIds(prev => new Set(prev).add(task.id));
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await onStatusChange({
        ...task,
        status: newStatus
      });
    } finally {
      setLoadingTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    }
  };

  // Xử lý chọn/bỏ chọn một task
  const handleTaskSelection = (taskId: string, checked: boolean) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  // Xử lý chọn/bỏ chọn tất cả task
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(tasks.map(task => task.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  // Xử lý xóa nhiều task
  const handleDeleteSelected = async () => {
    if (!onDeleteMultiple || selectedTaskIds.size === 0) return;
    
    try {
      setIsDeleting(true);
      await onDeleteMultiple(Array.from(selectedTaskIds));
      setSelectedTaskIds(new Set());
    } catch (error) {
      console.error("Error deleting tasks:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = tasks.length > 0 && selectedTaskIds.size === tasks.length;
  const hasSelection = selectedTaskIds.size > 0;

  // Hiển thị giao diện mobile
  if (isMobileView) {
    return (
      <div className="space-y-3">
        {/* Selection Toolbar - Mobile */}
        {onDeleteMultiple && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSelectAll(!allSelected)}
                className="p-1 h-8 w-8"
              >
                {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </Button>
              <span className="text-sm font-medium">
                {hasSelection ? `Đã chọn ${selectedTaskIds.size}` : 'Chọn tất cả'}
              </span>
            </div>
            {hasSelection && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            )}
          </div>
        )}

          <div className="space-y-3 p-4">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className={`cursor-pointer transition-all duration-200 border ${
                  task.status === 'completed' 
                    ? 'bg-pink-50/50 border-pink-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-pink-300 hover:shadow-md'
                }`}
                onClick={() => onTaskClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    {onDeleteMultiple && (
                      <div className="pt-1 flex-shrink-0" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTaskIds.has(task.id)}
                          onCheckedChange={(checked) => handleTaskSelection(task.id, !!checked)}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      </div>
                    )}
                    
                    {/* Status checkbox */}
                    <div className="pt-1 flex-shrink-0" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <Checkbox
                        checked={task.status === 'completed'}
                        disabled={loadingTaskIds.has(task.id)}
                        onCheckedChange={() => handleStatusChange(task)}
                        className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                      />
                    </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-medium text-sm leading-5 ${
                      task.status === 'completed' 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-800'
                    }`}>
                      {task.title}
                    </h3>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-pink-500" />
                      <span>{format(task.dueDate.toDate(), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-3 h-3 mr-1 text-pink-500" />
                      <span className="capitalize truncate">
                        {task.category === 'venue' && 'Địa điểm'}
                        {task.category === 'attire' && 'Trang phục'}
                        {task.category === 'photography' && 'Nhiếp ảnh'}
                        {task.category === 'invitation' && 'Thiệp mời'}
                        {task.category === 'catering' && 'Ẩm thực'}
                        {task.category === 'decoration' && 'Trang trí'}
                        {task.category === 'music' && 'Âm nhạc'}
                        {task.category === 'transportation' && 'Di chuyển'}
                        {task.category === 'accommodation' && 'Chỗ ở'}
                        {task.category === 'beauty' && 'Làm đẹp'}
                        {task.category === 'gifts' && 'Quà tặng'}
                        {task.category === 'legal' && 'Thủ tục pháp lý'}
                        {task.category === 'other' && 'Khác'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-pink-500" />
                      <span className="truncate">{task.milestone}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1 text-pink-500" />
                      <span className="truncate">{task.assigneeName || 'Chưa phân công'}</span>
                    </div>
                  </div>
                  
                  {task.priority && (
                    <div className={`text-xs mt-2 flex items-center ${getPriorityColor(task.priority)}`}>
                      <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="capitalize">{
                        task.priority === 'high' ? 'Ưu tiên cao' :
                        task.priority === 'medium' ? 'Ưu tiên trung bình' :
                        'Ưu tiên thấp'
                      }</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  }

  // Hiển thị giao diện desktop
  return (
    <div className="space-y-4">
      {/* Selection Toolbar - Desktop */}
      {onDeleteMultiple && hasSelection && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
          <span className="text-sm font-medium">
            Đã chọn {selectedTaskIds.size} công việc
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Đang xóa...' : 'Xóa đã chọn'}
          </Button>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-pink-50/50">
              {onDeleteMultiple && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </TableHead>
              )}
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="font-medium text-gray-700">Công việc</TableHead>
              <TableHead className="font-medium text-gray-700">Mốc thời gian</TableHead>
              <TableHead className="font-medium text-gray-700">Ngày đến hạn</TableHead>
              <TableHead className="font-medium text-gray-700">Danh mục</TableHead>
              <TableHead className="font-medium text-gray-700">Trạng thái</TableHead>
              <TableHead className="font-medium text-gray-700">Người thực hiện</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id}
              className={`cursor-pointer transition-all duration-200 ${
                task.status === 'completed' 
                  ? 'bg-pink-50/30 hover:bg-pink-50/50' 
                  : 'hover:bg-pink-50/30'
              }`}
              onClick={() => onTaskClick(task)}
            >
              {onDeleteMultiple && (
                <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()} className="p-2">
                  <Checkbox
                    checked={selectedTaskIds.has(task.id)}
                    onCheckedChange={(checked) => handleTaskSelection(task.id, !!checked)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                </TableCell>
              )}
              <TableCell onClick={(e: React.MouseEvent) => e.stopPropagation()} className="p-2">
                <Checkbox
                  checked={task.status === 'completed'}
                  disabled={loadingTaskIds.has(task.id)}
                  onCheckedChange={() => handleStatusChange(task)}
                  className="data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                />
              </TableCell>
              <TableCell>
                <div className={`font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                  {task.title}
                </div>
                {task.priority && (
                  <div className={`text-xs mt-1 flex items-center ${getPriorityColor(task.priority)}`}>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span className="capitalize">{
                      task.priority === 'high' ? 'Ưu tiên cao' :
                      task.priority === 'medium' ? 'Ưu tiên trung bình' :
                      'Ưu tiên thấp'
                    }</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-gray-600">{task.milestone}</TableCell>
              <TableCell className="text-gray-600">
                {format(task.dueDate.toDate(), 'dd/MM/yyyy', { locale: vi })}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                  {task.category === 'venue' && 'Địa điểm'}
                  {task.category === 'attire' && 'Trang phục'}
                  {task.category === 'photography' && 'Nhiếp ảnh'}
                  {task.category === 'invitation' && 'Thiệp mời'}
                  {task.category === 'catering' && 'Ẩm thực'}
                  {task.category === 'decoration' && 'Trang trí'}
                  {task.category === 'music' && 'Âm nhạc'}
                  {task.category === 'transportation' && 'Di chuyển'}
                  {task.category === 'accommodation' && 'Chỗ ở'}
                  {task.category === 'beauty' && 'Làm đẹp'}
                  {task.category === 'gifts' && 'Quà tặng'}
                  {task.category === 'legal' && 'Thủ tục pháp lý'}
                  {task.category === 'other' && 'Khác'}
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(task.status)}
              </TableCell>
              <TableCell className="text-gray-600">
                {task.assigneeName || 'Chưa phân công'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
  );
} 