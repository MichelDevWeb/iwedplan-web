'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff, Calendar, Bell, Gift, Star, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createNotification, 
  updateNotification, 
  deleteNotification, 
  getAllNotifications 
} from '@/lib/firebase/adminService';
import { NotificationData } from '@/lib/firebase/models';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import LoadingOverlay from '@/components/ui/loading-overlay';

interface NotificationFormData {
  type: 'sale' | 'voucher' | 'system' | 'info' | 'warning';
  notificationType: 'header' | 'floating'; // New field
  title: string;
  message: string;
  ctaText: string;
  ctaLink: string;
  dismissible: boolean;
  expiresAt: string; // Date string
  priority: 'low' | 'medium' | 'high';
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  visibility: 'guest' | 'user' | 'admin'; // Updated field
}

const notificationTypes = [
  { value: 'sale', label: 'Sale', icon: Star, color: 'bg-red-100 text-red-800' },
  { value: 'voucher', label: 'Voucher', icon: Gift, color: 'bg-purple-100 text-purple-800' },
  { value: 'system', label: 'Hệ thống', icon: Bell, color: 'bg-blue-100 text-blue-800' },
  { value: 'info', label: 'Thông tin', icon: Info, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'warning', label: 'Cảnh báo', icon: AlertTriangle, color: 'bg-orange-100 text-orange-800' }
];

const notificationDisplayTypes = [
  { value: 'header', label: 'Header Bar', color: 'bg-blue-100 text-blue-800' },
  { value: 'floating', label: 'Floating', color: 'bg-purple-100 text-purple-800' }
];

const priorityOptions = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Trung bình', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Cao', color: 'bg-red-100 text-red-800' }
];

const visibilityOptions = [
  { value: 'guest', label: 'Guest (Chưa đăng nhập)', color: 'bg-gray-100 text-gray-800' },
  { value: 'user', label: 'User (Đã đăng nhập)', color: 'bg-green-100 text-green-800' },
  { value: 'admin', label: 'Admin Only', color: 'bg-red-100 text-red-800' }
];

const defaultBackgrounds = [
  'bg-gradient-to-r from-red-600 to-pink-600',
  'bg-gradient-to-r from-purple-600 to-pink-600',
  'bg-gradient-to-r from-blue-600 to-cyan-600',
  'bg-gradient-to-r from-indigo-600 to-purple-600',
  'bg-gradient-to-r from-emerald-600 to-teal-600'
];

// Simple Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-gray-200 ${className}`} />
);

export default function NotificationManagement() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<NotificationFormData>({
    type: 'info',
    notificationType: 'header',
    title: '',
    message: '',
    ctaText: '',
    ctaLink: '',
    dismissible: true,
    expiresAt: '',
    priority: 'medium',
    backgroundColor: defaultBackgrounds[0],
    textColor: 'text-white',
    isActive: true,
    visibility: 'guest'
  });

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const allNotifications = await getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'info',
      notificationType: 'header',
      title: '',
      message: '',
      ctaText: '',
      ctaLink: '',
      dismissible: true,
      expiresAt: '',
      priority: 'medium',
      backgroundColor: defaultBackgrounds[0],
      textColor: 'text-white',
      isActive: true,
      visibility: 'guest'
    });
    setEditing(null);
  };

  const handleEdit = (notification: NotificationData) => {
    setFormData({
      type: notification.type,
      notificationType: notification.notificationType || 'header',
      title: notification.title,
      message: notification.message,
      ctaText: notification.ctaText || '',
      ctaLink: notification.ctaLink || '',
      dismissible: notification.dismissible,
      expiresAt: notification.expiresAt ? 
        notification.expiresAt.toDate().toISOString().slice(0, 16) : '',
      priority: notification.priority,
      backgroundColor: notification.backgroundColor || defaultBackgrounds[0],
      textColor: notification.textColor || 'text-white',
      isActive: notification.isActive,
      visibility: notification.visibility || 'guest'
    });
    setEditing(notification.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setSaving(true);

      // Build notification data with only defined values
      const notificationData: any = {
        type: formData.type,
        notificationType: formData.notificationType,
        title: formData.title,
        message: formData.message,
        dismissible: formData.dismissible,
        priority: formData.priority,
        backgroundColor: formData.backgroundColor,
        textColor: formData.textColor,
        isActive: formData.isActive,
        visibility: formData.visibility,
        createdBy: user.uid
      };

      // Handle optional fields differently for create vs update
      if (editing) {
        // For updates, include empty strings to allow clearing fields
        notificationData.ctaText = formData.ctaText;
        notificationData.ctaLink = formData.ctaLink;
        if (formData.expiresAt) {
          notificationData.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        } else {
          notificationData.expiresAt = null; // Clear the expiration date
        }
      } else {
        // For creation, only add fields with actual values
        if (formData.ctaText && formData.ctaText.trim()) {
          notificationData.ctaText = formData.ctaText.trim();
        }
        
        if (formData.ctaLink && formData.ctaLink.trim()) {
          notificationData.ctaLink = formData.ctaLink.trim();
        }
        
        if (formData.expiresAt) {
          notificationData.expiresAt = Timestamp.fromDate(new Date(formData.expiresAt));
        }
      }

      if (editing) {
        await updateNotification(editing, notificationData, user.uid);
        toast.success('Đã cập nhật thông báo');
      } else {
        await createNotification(notificationData, user.uid);
        toast.success('Đã tạo thông báo mới');
      }

      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('Không thể lưu thông báo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;

    try {
      setDeleting(showDeleteModal);
      await deleteNotification(showDeleteModal);
      toast.success('Đã xoá thông báo');
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Không thể xoá thông báo');
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const toggleActive = async (notification: NotificationData) => {
    if (!user?.uid) return;

    try {
      await updateNotification(
        notification.id, 
        { isActive: !notification.isActive }, 
        user.uid
      );
      toast.success(notification.isActive ? 'Đã ẩn thông báo' : 'Đã hiển thị thông báo');
      loadNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast.error('Không thể thay đổi trạng thái thông báo');
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString('vi-VN');
  };

  const getTypeInfo = (type: string) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[0];
  };

  const getVisibilityInfo = (visibility: string) => {
    return visibilityOptions.find(v => v.value === visibility) || visibilityOptions[0];
  };

  const getNotificationTypeInfo = (notificationType: string) => {
    return notificationDisplayTypes.find(t => t.value === notificationType) || notificationDisplayTypes[0];
  };

  return (
    <>
      <LoadingOverlay 
        isLoading={saving}
        type="save"
        message={editing ? "Đang cập nhật thông báo..." : "Đang tạo thông báo..."}
      />
      
      <LoadingOverlay 
        isLoading={deleting !== null}
        type="delete"
        message="Đang xoá thông báo..."
      />

      <div className="space-y-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}</CardTitle>
            <CardDescription>
              {editing ? 'Cập nhật thông tin thông báo' : 'Thêm thông báo mới hiển thị trên header'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại thông báo</Label>
                  <Select value={formData.type} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notificationType">Loại hiển thị</Label>
                  <Select value={formData.notificationType} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, notificationType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationDisplayTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${type.color}`}></div>
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Ưu tiên</Label>
                  <Select value={formData.priority} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Tiêu đề thông báo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Nội dung thông báo"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Text nút bấm (tùy chọn)</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="Ví dụ: Mua ngay"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">Link nút bấm (tùy chọn)</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                    placeholder="Ví dụ: /create/template hoặc #pricing"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Ngày hết hạn (tùy chọn)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Màu nền</Label>
                  <Select value={formData.backgroundColor} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, backgroundColor: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultBackgrounds.map((bg, index) => (
                        <SelectItem key={bg} value={bg}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${bg}`}></div>
                            Gradient {index + 1}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-4 mt-8">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dismissible"
                      checked={formData.dismissible}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, dismissible: checked }))
                      }
                    />
                    <Label htmlFor="dismissible">Có thể đóng</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="isActive">Hiển thị</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Hiển thị</Label>
                  <Select value={formData.visibility} onValueChange={(value: 'guest' | 'user' | 'admin') => 
                    setFormData(prev => ({ ...prev, visibility: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((visibility) => (
                        <SelectItem key={visibility.value} value={visibility.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${visibility.color}`}></div>
                            {visibility.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thông báo ({notifications.length})</CardTitle>
            <CardDescription>
              Quản lý tất cả thông báo trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const typeInfo = getTypeInfo(notification.type);
                  const priorityInfo = getPriorityInfo(notification.priority);
                  const visibilityInfo = getVisibilityInfo(notification.visibility || 'guest');
                  const notificationTypeInfo = getNotificationTypeInfo(notification.notificationType || 'header');
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <div
                      key={notification.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className="w-4 h-4" />
                            <h3 className="font-medium">{notification.title}</h3>
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            <Badge className={notificationTypeInfo.color}>
                              {notificationTypeInfo.label}
                            </Badge>
                            <Badge className={priorityInfo.color}>
                              {priorityInfo.label}
                            </Badge>
                            <Badge className={visibilityInfo.color}>
                              {visibilityInfo.label}
                            </Badge>
                            {notification.isActive ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Eye className="w-3 h-3 mr-1" />
                                Hiển thị
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Ẩn
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Tạo: {formatDate(notification.createdAt)}</p>
                            {notification.expiresAt && (
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Hết hạn: {formatDate(notification.expiresAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(notification)}
                            className="h-8 w-8 p-0"
                          >
                            {notification.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(notification)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteModal(notification.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDelete}
        title="Xác nhận xoá"
        message="Bạn có chắc chắn muốn xoá thông báo này không? Hành động này không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        isLoading={!!deleting}
        loadingText="Đang xoá..."
      />
    </>
  );
} 