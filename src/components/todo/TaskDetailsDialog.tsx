import { useState, useEffect } from "react";
import { TodoTask } from "@/lib/firebase/models";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Tag, Clock, User, AlertTriangle, CheckCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_TASK_CATEGORIES } from "@/lib/firebase/todoService";
import TaskAdvertisementSection from "@/components/todo/TaskAdvertisementSection";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema validation cho task editing
const editTaskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  milestone: z.string().min(1, "Vui lòng nhập mốc thời gian"),
  priority: z.enum(["low", "medium", "high"]),
  assignedTo: z.string(),
  notes: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed", "skipped"]),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

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
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form setup với validation
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      category: task.category,
      milestone: task.milestone,
      priority: task.priority,
      assignedTo: task.assignedTo || "unassigned",
      notes: task.notes || "",
      status: task.status,
    },
  });

  // Cập nhật form khi task thay đổi từ bên ngoài
  useEffect(() => {
    form.reset({
      title: task.title,
      description: task.description || "",
      category: task.category,
      milestone: task.milestone,
      priority: task.priority,
      assignedTo: task.assignedTo || "unassigned",
      notes: task.notes || "",
      status: task.status,
    });
  }, [task, form]);

  // Reset form khi dialog đóng
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
      setIsEditing(false);
      setTimeout(() => form.reset(), 300);
    }
  };

  // Xử lý chuyển đổi sang chế độ chỉnh sửa
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    form.reset();
    setIsEditing(false);
  };

  // Xử lý submit form
  const onSubmit = async (values: EditTaskFormValues) => {
    try {
      setIsLoading(true);

      // Xác định tên người được giao nhiệm vụ
      let assigneeName = '';
      if (values.assignedTo && values.assignedTo !== 'unassigned') {
        switch (values.assignedTo) {
          case 'bride':
            assigneeName = 'Cô dâu';
            break;
          case 'groom':
            assigneeName = 'Chú rể';
            break;
          case 'planner':
            assigneeName = 'Wedding Planner';
            break;
        }
      }

      // Cập nhật task với dữ liệu mới
      const updatedTask: TodoTask = {
        ...task,
        title: values.title,
        description: values.description || "",
        category: values.category,
        milestone: values.milestone,
        priority: values.priority,
        assignedTo: values.assignedTo === 'unassigned' ? '' : values.assignedTo,
        assigneeName,
        notes: values.notes || "",
        status: values.status,
        updatedAt: new Date() as any, // Will be converted to Timestamp in service
      };

      await onUpdate(updatedTask);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'skipped':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              task.status === 'completed' ? 'bg-green-100' :
              task.priority === 'high' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {task.status === 'completed' ? (
                <CheckCircle className={`w-5 h-5 ${
                  task.status === 'completed' ? 'text-green-600' :
                  task.priority === 'high' ? 'text-red-600' : 'text-blue-600'
                }`} />
              ) : (
                <AlertTriangle className={`w-5 h-5 ${
                  task.priority === 'high' ? 'text-red-600' : 
                  task.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isEditing ? 'Chỉnh sửa công việc' : 'Chi tiết công việc'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {isEditing
                  ? 'Cập nhật thông tin công việc để theo dõi tiến độ tốt hơn'
                  : 'Xem chi tiết đầy đủ và quản lý công việc này'}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEditing ? (
            // Form chỉnh sửa
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h3>
                    
                    {/* Tiêu đề công việc */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Tiêu đề công việc</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tiêu đề công việc"
                              className="text-base font-medium"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mô tả công việc */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Mô tả chi tiết</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mô tả chi tiết về công việc này"
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Status & Priority Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Trạng thái & Ưu tiên</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trạng thái */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Trạng thái</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="pending">Chưa bắt đầu</SelectItem>
                                  <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                                  <SelectItem value="completed">Hoàn thành</SelectItem>
                                  <SelectItem value="skipped">Bỏ qua</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Mức độ ưu tiên */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Mức độ ưu tiên</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="high">Ưu tiên cao</SelectItem>
                                  <SelectItem value="medium">Ưu tiên trung bình</SelectItem>
                                  <SelectItem value="low">Ưu tiên thấp</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Chi tiết</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mốc thời gian */}
                      <FormField
                        control={form.control}
                        name="milestone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                              <Clock className="w-4 h-4 mr-2 text-gray-500" />
                              Mốc thời gian
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Ví dụ: 6 tháng trước" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Danh mục */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                              <Tag className="w-4 h-4 mr-2 text-gray-500" />
                              Danh mục
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Người được giao */}
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              Người thực hiện
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn người thực hiện" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="unassigned">Chưa phân công</SelectItem>
                                  <SelectItem value="bride">Cô dâu</SelectItem>
                                  <SelectItem value="groom">Chú rể</SelectItem>
                                  <SelectItem value="planner">Wedding Planner</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Notes Card */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Ghi chú</h3>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700">Ghi chú thêm</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Thêm ghi chú, lưu ý quan trọng về công việc này"
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          ) : (
            // Chế độ xem chi tiết
            <div className="space-y-6">
              {/* Task Title Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-pink-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                          {task.priority === 'high' ? 'Ưu tiên cao' : 
                           task.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryText(task.category)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description Card */}
              {task.description && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Mô tả</h3>
                    <p className="text-gray-700 leading-relaxed">{task.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time & Schedule Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thời gian</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Mốc thời gian</p>
                          <p className="text-gray-600">{task.milestone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Ngày đến hạn</p>
                          <p className="text-gray-600">
                            {format(task.dueDate.toDate(), 'dd/MM/yyyy', { locale: vi })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignment Card */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Phân công</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Người thực hiện</p>
                          <p className="text-gray-600">{task.assigneeName || 'Chưa phân công'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Tag className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Danh mục</p>
                          <p className="text-gray-600">{getCategoryText(task.category)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Card */}
              {task.notes && (
                <Card className="border-l-4 border-l-blue-400">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      📝 Ghi chú
                    </h3>
                    <p className="text-blue-700 leading-relaxed">{task.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Advertisement Section */}
              <TaskAdvertisementSection 
                category={task.category} 
                advertisementIds={task.advertisementIds || []}
              />
            </div>
          )}
        </div>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between items-center rounded-b-xl">
          {isEditing ? (
            <>
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button
                onClick={handleEditClick}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Chỉnh sửa
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 