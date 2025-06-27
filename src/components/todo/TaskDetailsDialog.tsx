import { useState } from "react";
import { TodoTask } from "@/lib/firebase/models";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Tag, Clock, User, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DEFAULT_TASK_CATEGORIES } from "@/lib/firebase/todoService";
import TaskAdvertisementSection from "@/components/todo/TaskAdvertisementSection";

interface TaskDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: TodoTask;
  onUpdate: (task: TodoTask) => Promise<TodoTask>;
  onDelete: () => Promise<void>;
}

export default function TaskDetailsDialog({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
}: TaskDetailsDialogProps) {
  const [editedTask, setEditedTask] = useState<TodoTask>(task);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cập nhật state khi task thay đổi từ bên ngoài
  if (task.id !== editedTask.id) {
    setEditedTask(task);
  }

  // Xử lý chuyển đổi sang chế độ chỉnh sửa
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  // Xử lý lưu thay đổi
  const handleSaveClick = async () => {
    try {
      setIsLoading(true);
      await onUpdate(editedTask);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý xóa task
  const handleDeleteClick = async () => {
    try {
      setIsLoading(true);
      await onDelete();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (status: string) => {
    setEditedTask({
      ...editedTask,
      status: status as 'pending' | 'in-progress' | 'completed' | 'skipped',
    });
  };

  // Xử lý thay đổi người được giao
  const handleAssigneeChange = (assignee: string) => {
    let assigneeName = '';
    
    switch (assignee) {
      case 'bride':
        assigneeName = 'Cô dâu';
        break;
      case 'groom':
        assigneeName = 'Chú rể';
        break;
      case 'planner':
        assigneeName = 'Wedding Planner';
        break;
      default:
        assigneeName = '';
    }
    
    setEditedTask({
      ...editedTask,
      assignedTo: assignee,
      assigneeName: assigneeName,
    });
  };

  // Xử lý thay đổi mức độ ưu tiên
  const handlePriorityChange = (priority: string) => {
    setEditedTask({
      ...editedTask,
      priority: priority as 'low' | 'medium' | 'high',
    });
  };

  // Hiển thị thông tin trạng thái dưới dạng văn bản
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chưa bắt đầu';
      case 'in-progress':
        return 'Đang thực hiện';
      case 'completed':
        return 'Hoàn thành';
      case 'skipped':
        return 'Đã bỏ qua';
      default:
        return status;
    }
  };

  // Hiển thị thông tin danh mục dưới dạng văn bản
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'venue':
        return 'Địa điểm';
      case 'attire':
        return 'Trang phục';
      case 'photography':
        return 'Nhiếp ảnh';
      case 'invitation':
        return 'Thiệp mời';
      case 'catering':
        return 'Ẩm thực';
      case 'decoration':
        return 'Trang trí';
      case 'music':
        return 'Âm nhạc';
      case 'transportation':
        return 'Di chuyển';
      case 'accommodation':
        return 'Chỗ ở';
      case 'beauty':
        return 'Làm đẹp';
      case 'gifts':
        return 'Quà tặng';
      case 'legal':
        return 'Thủ tục pháp lý';
      case 'other':
        return 'Khác';
      default:
        return category;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa công việc' : 'Chi tiết công việc'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin của công việc này'
              : 'Xem chi tiết và quản lý công việc'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tiêu đề công việc */}
          {isEditing ? (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                placeholder="Nhập tiêu đề công việc"
              />
            </div>
          ) : (
            <h2 className="text-xl font-semibold">{task.title}</h2>
          )}

          {/* Mô tả công việc */}
          {isEditing ? (
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={editedTask.description || ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Mô tả chi tiết về công việc này"
                className="min-h-[100px]"
              />
            </div>
          ) : (
            task.description && <p className="text-gray-700">{task.description}</p>
          )}

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trạng thái */}
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              {isEditing ? (
                <Select
                  value={editedTask.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                      <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="skipped">Bỏ qua</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-blue-500' :
                    task.status === 'skipped' ? 'bg-gray-400' : 'bg-gray-500'
                  }`}></div>
                  <span>{getStatusText(task.status)}</span>
                </div>
              )}
            </div>

            {/* Mức độ ưu tiên */}
            <div className="space-y-2">
              <Label>Mức độ ưu tiên</Label>
              {isEditing ? (
                <Select
                  value={editedTask.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mức độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="high">Ưu tiên cao</SelectItem>
                      <SelectItem value="medium">Ưu tiên trung bình</SelectItem>
                      <SelectItem value="low">Ưu tiên thấp</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center">
                  <AlertTriangle className={`w-4 h-4 mr-2 ${
                    task.priority === 'high' ? 'text-red-500' :
                    task.priority === 'medium' ? 'text-orange-500' : 'text-green-500'
                  }`} />
                  <span>
                    {task.priority === 'high' ? 'Ưu tiên cao' :
                     task.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                  </span>
                </div>
              )}
            </div>

            {/* Mốc thời gian */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-500" />
                Mốc thời gian
              </Label>
              {isEditing ? (
                <Input
                  value={editedTask.milestone}
                  onChange={(e) => setEditedTask({ ...editedTask, milestone: e.target.value })}
                  placeholder="Ví dụ: 6 tháng trước"
                />
              ) : (
                <div>{task.milestone}</div>
              )}
            </div>

            {/* Ngày đến hạn */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                Ngày đến hạn
              </Label>
              <div>
                {format(task.dueDate.toDate(), 'dd/MM/yyyy', { locale: vi })}
              </div>
            </div>

            {/* Danh mục */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Tag className="w-4 h-4 mr-1 text-gray-500" />
                Danh mục
              </Label>
              {isEditing ? (
                <Select
                  value={editedTask.category}
                  onValueChange={(value) => setEditedTask({ ...editedTask, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {DEFAULT_TASK_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryText(category)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div>{getCategoryText(task.category)}</div>
              )}
            </div>

            {/* Người được giao */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <User className="w-4 h-4 mr-1 text-gray-500" />
                Người thực hiện
              </Label>
              {isEditing ? (
                <Select
                  value={editedTask.assignedTo || ''}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người thực hiện" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">Chưa phân công</SelectItem>
                      <SelectItem value="bride">Cô dâu</SelectItem>
                      <SelectItem value="groom">Chú rể</SelectItem>
                      <SelectItem value="planner">Wedding Planner</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <div>{task.assigneeName || 'Chưa phân công'}</div>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          {isEditing ? (
            <div className="grid w-full gap-1.5 mt-4">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={editedTask.notes || ''}
                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                placeholder="Ghi chú thêm về công việc này"
              />
            </div>
          ) : (
            task.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-1">Ghi chú:</h3>
                <p className="text-gray-700 text-sm">{task.notes}</p>
              </div>
            )
          )}

          {/* Phần quảng cáo liên quan */}
          {!isEditing && (
            <TaskAdvertisementSection 
              category={task.category} 
              advertisementIds={task.advertisementIds || []}
            />
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          {isEditing ? (
            <>
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={handleDeleteClick}
              >
                Xóa
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSaveClick}
                  disabled={isLoading}
                >
                  Lưu thay đổi
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isLoading}
              >
                Xóa
              </Button>
              <Button
                onClick={handleEditClick}
                disabled={isLoading}
              >
                Chỉnh sửa
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 