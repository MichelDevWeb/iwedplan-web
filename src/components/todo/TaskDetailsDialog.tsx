import { useState, useEffect } from "react";
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

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader className="pb-4 sm:pb-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {isEditing ? 'Chỉnh sửa công việc' : 'Chi tiết công việc'}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-600 hidden sm:block">
            {isEditing
              ? 'Cập nhật thông tin công việc để theo dõi tiến độ tốt hơn'
              : 'Xem chi tiết đầy đủ và quản lý công việc này'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
          {isEditing ? (
            // Form chỉnh sửa
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          className="text-base sm:text-lg font-medium border-2 border-gray-200 focus:border-pink-400"
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
                          className="min-h-[80px] sm:min-h-[120px] border-2 border-gray-200 focus:border-pink-400 text-sm sm:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Trạng thái */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Trạng thái</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                            <SelectTrigger className="h-10">
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

                  {/* Mốc thời gian */}
                  <FormField
                    control={form.control}
                    name="milestone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <Clock className="w-3 h-3 mr-1 text-gray-500" />
                          Mốc thời gian
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: 6 tháng trước" className="h-10" {...field} />
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
                          <Tag className="w-3 h-3 mr-1 text-gray-500" />
                          Danh mục
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
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
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                          <User className="w-3 h-3 mr-1 text-gray-500" />
                          Người thực hiện
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
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

                {/* Ghi chú */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Ghi chú thêm</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Thêm ghi chú, lưu ý quan trọng về công việc này"
                          className="min-h-[100px] border-2 border-gray-200 focus:border-pink-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            // Chế độ xem chi tiết
            <>
              {/* Tiêu đề công việc */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-pink-100">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">{task.title}</h2>
              </div>

              {/* Mô tả công việc */}
              {task.description && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{task.description}</p>
                </div>
              )}

              {/* Thông tin cơ bản */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <div className="w-2 h-5 sm:h-6 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full mr-2 sm:mr-3"></div>
                  Thông tin chi tiết
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Trạng thái */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Trạng thái</div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        task.status === 'skipped' ? 'bg-gray-400' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm">{getStatusText(task.status)}</span>
                    </div>
                  </div>

                  {/* Mức độ ưu tiên */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Mức độ ưu tiên</div>
                    <div className="flex items-center">
                      <AlertTriangle className={`w-3 h-3 mr-2 ${
                        task.priority === 'high' ? 'text-red-500' :
                        task.priority === 'medium' ? 'text-orange-500' : 'text-green-500'
                      }`} />
                      <span className="text-sm">
                        {task.priority === 'high' ? 'Ưu tiên cao' :
                         task.priority === 'medium' ? 'Ưu tiên trung bình' : 'Ưu tiên thấp'}
                      </span>
                    </div>
                  </div>

                  {/* Mốc thời gian */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Clock className="w-3 h-3 mr-1 text-gray-500" />
                      Mốc thời gian
                    </div>
                    <div className="text-sm text-gray-600">{task.milestone}</div>
                  </div>

                  {/* Ngày đến hạn */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                      Ngày đến hạn
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(task.dueDate.toDate(), 'dd/MM/yyyy', { locale: vi })}
                    </div>
                  </div>

                  {/* Danh mục */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Tag className="w-3 h-3 mr-1 text-gray-500" />
                      Danh mục
                    </div>
                    <div className="text-sm text-gray-600">{getCategoryText(task.category)}</div>
                  </div>

                  {/* Người được giao */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <User className="w-3 h-3 mr-1 text-gray-500" />
                      Người thực hiện
                    </div>
                    <div className="text-sm text-gray-600">{task.assigneeName || 'Chưa phân công'}</div>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {task.notes && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Ghi chú
                  </h3>
                  <p className="text-blue-700 text-sm leading-relaxed">{task.notes}</p>
                </div>
              )}

              {/* Phần quảng cáo liên quan */}
              <TaskAdvertisementSection 
                category={task.category} 
                advertisementIds={task.advertisementIds || []}
              />
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 sm:pt-6 border-t border-gray-100 bg-gray-50/50 gap-3 sm:gap-0 sticky bottom-0">
          {isEditing ? (
            <>
              <Button
                variant="destructive"
                disabled={isLoading}
                onClick={handleDeleteClick}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 order-2 sm:order-1"
                size="sm"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </Button>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none border-2 border-gray-300 hover:bg-gray-100 font-semibold"
                  size="sm"
                >
                  Hủy
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                  size="sm"
                >
                  {isLoading ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isLoading}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 order-2 sm:order-1"
                size="sm"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </Button>
              <Button
                onClick={handleEditClick}
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 order-1 sm:order-2"
                size="sm"
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