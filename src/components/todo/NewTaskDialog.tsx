import { useState } from "react";
import { Timestamp } from "firebase/firestore";
import { TodoTask } from "@/lib/firebase/models";
import { DEFAULT_TASK_CATEGORIES } from "@/lib/firebase/todoService";
import { addDays, format } from "date-fns";
import { vi } from "date-fns/locale";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface NewTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<TodoTask, 'id'>) => Promise<TodoTask>;
  weddingId: string;
  weddingDate: Date | null;
}

// Định nghĩa schema validation
const newTaskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  milestone: z.string().min(1, "Vui lòng nhập mốc thời gian"),
  dueDate: z.date(),
  priority: z.enum(["low", "medium", "high"]),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type NewTaskFormValues = z.infer<typeof newTaskSchema>;

export default function NewTaskDialog({
  isOpen,
  onClose,
  onCreateTask,
  weddingId,
  weddingDate,
}: NewTaskDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo form với react-hook-form
  const form = useForm<NewTaskFormValues>({
    resolver: zodResolver(newTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      milestone: "",
      dueDate: weddingDate ? addDays(weddingDate, -30) : new Date(),
      priority: "medium",
      assignedTo: "",
      notes: "",
    },
  });

  // Reset form khi dialog đóng
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Đợi animation đóng dialog kết thúc rồi mới reset form
      setTimeout(() => form.reset(), 300);
    }
  };

  // Xử lý submit form
  const onSubmit = async (values: NewTaskFormValues) => {
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

      // Chuẩn bị dữ liệu task mới
      const newTask: Omit<TodoTask, 'id'> = {
        weddingId,
        title: values.title,
        description: values.description || '',
        category: values.category,
        milestone: values.milestone,
        dueDate: Timestamp.fromDate(values.dueDate),
        status: 'pending',
        assignedTo: values.assignedTo === 'unassigned' ? '' : values.assignedTo || '',
        assigneeName,
        notes: values.notes || '',
        isDefault: false,
        priority: values.priority,
        reminderSent: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Gọi hàm tạo task
      await onCreateTask(newTask);
      
      // Đóng dialog
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị tên danh mục
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm công việc mới</DialogTitle>
          <DialogDescription>
            Tạo một công việc mới cho kế hoạch đám cưới của bạn
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tiêu đề */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tiêu đề công việc..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về công việc này..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Danh mục */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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

              {/* Mức độ ưu tiên */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức độ ưu tiên</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mức độ ưu tiên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">Ưu tiên cao</SelectItem>
                        <SelectItem value="medium">Ưu tiên trung bình</SelectItem>
                        <SelectItem value="low">Ưu tiên thấp</SelectItem>
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
                    <FormLabel>Mốc thời gian</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: 6 tháng trước ngày cưới"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ngày đến hạn */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày đến hạn</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            weddingDate
                              ? date > weddingDate
                              : false
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Người thực hiện */}
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người thực hiện</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người thực hiện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Chưa phân công</SelectItem>
                        <SelectItem value="bride">Cô dâu</SelectItem>
                        <SelectItem value="groom">Chú rể</SelectItem>
                        <SelectItem value="planner">Wedding Planner</SelectItem>
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
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm về công việc này..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                Thêm công việc
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 