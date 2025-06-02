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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Star, Crown, Palette, 
  Wand2, Image, DollarSign, ArrowUpDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  createTemplateConfig, 
  updateTemplateConfig, 
  deleteTemplateConfig, 
  getAllTemplateConfigs 
} from '@/lib/firebase/adminService';
import { TemplateConfigItem } from '@/lib/firebase/models';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import LoadingOverlay from '@/components/ui/loading-overlay';

interface TemplateConfigFormData {
  type: 'template' | 'flowerFrame' | 'color' | 'effect';
  name: string;
  displayName: string;
  description: string;
  imageUrl: string;
  previewUrl: string;
  isVip: boolean;
  price: number;
  isActive: boolean;
  order: number;
  // Type-specific fields
  colorCode?: string;
  gradientColors?: string[];
  effectType?: 'particles' | 'animation' | 'background';
  cssClass?: string;
  frameImageUrl?: string;
  frameStyle?: Record<string, any>;
}

const configTypes = [
  { value: 'template', label: 'Template', icon: Image, color: 'bg-blue-100 text-blue-800' },
  { value: 'flowerFrame', label: 'Khung hoa', icon: Star, color: 'bg-pink-100 text-pink-800' },
  { value: 'color', label: 'Màu sắc', icon: Palette, color: 'bg-purple-100 text-purple-800' },
  { value: 'effect', label: 'Hiệu ứng', icon: Wand2, color: 'bg-cyan-100 text-cyan-800' }
];

const effectTypes = [
  { value: 'particles', label: 'Particles' },
  { value: 'animation', label: 'Animation' },
  { value: 'background', label: 'Background' }
];

// Simple Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <div className={`border-t border-gray-200 ${className}`} />
);

export default function TemplateConfigManagement() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<TemplateConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const [formData, setFormData] = useState<TemplateConfigFormData>({
    type: 'template',
    name: '',
    displayName: '',
    description: '',
    imageUrl: '',
    previewUrl: '',
    isVip: false,
    price: 0,
    isActive: true,
    order: 0,
    colorCode: '#ffffff',
    gradientColors: [],
    effectType: 'particles',
    cssClass: '',
    frameImageUrl: '',
    frameStyle: {}
  });

  // Load configs
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const allConfigs = await getAllTemplateConfigs();
      setConfigs(allConfigs);
    } catch (error) {
      console.error('Error loading configs:', error);
      toast.error('Không thể tải danh sách cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'template',
      name: '',
      displayName: '',
      description: '',
      imageUrl: '',
      previewUrl: '',
      isVip: false,
      price: 0,
      isActive: true,
      order: 0,
      colorCode: '#ffffff',
      gradientColors: [],
      effectType: 'particles',
      cssClass: '',
      frameImageUrl: '',
      frameStyle: {}
    });
    setEditing(null);
  };

  const handleEdit = (config: TemplateConfigItem) => {
    setFormData({
      type: config.type,
      name: config.name,
      displayName: config.displayName,
      description: config.description || '',
      imageUrl: config.imageUrl || '',
      previewUrl: config.previewUrl || '',
      isVip: config.isVip,
      price: config.price,
      isActive: config.isActive,
      order: config.order,
      // Type-specific fields
      colorCode: (config as any).colorCode || '#ffffff',
      gradientColors: (config as any).gradientColors || [],
      effectType: (config as any).effectType || 'particles',
      cssClass: (config as any).cssClass || '',
      frameImageUrl: (config as any).frameImageUrl || '',
      frameStyle: (config as any).frameStyle || {}
    });
    setEditing(config.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      setSaving(true);

      // Base configuration data
      let configData: any = {
        type: formData.type,
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        imageUrl: formData.imageUrl,
        previewUrl: formData.previewUrl,
        isVip: formData.isVip,
        price: formData.price,
        isActive: formData.isActive,
        order: formData.order,
        config: {},
        createdBy: user.uid
      };

      // Add type-specific fields
      switch (formData.type) {
        case 'color':
          configData.colorCode = formData.colorCode;
          if (formData.gradientColors && formData.gradientColors.length > 0) {
            configData.gradientColors = formData.gradientColors;
          }
          break;
        case 'effect':
          configData.effectType = formData.effectType;
          configData.cssClass = formData.cssClass;
          break;
        case 'flowerFrame':
          configData.frameImageUrl = formData.frameImageUrl;
          configData.frameStyle = formData.frameStyle;
          break;
      }

      if (editing) {
        await updateTemplateConfig(editing, configData, user.uid);
        toast.success('Đã cập nhật cấu hình');
      } else {
        await createTemplateConfig(configData, user.uid);
        toast.success('Đã tạo cấu hình mới');
      }

      resetForm();
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;

    try {
      setDeleting(showDeleteModal);
      await deleteTemplateConfig(showDeleteModal);
      toast.success('Đã xoá cấu hình');
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Không thể xoá cấu hình');
    } finally {
      setDeleting(null);
      setShowDeleteModal(null);
    }
  };

  const toggleActive = async (config: TemplateConfigItem) => {
    if (!user?.uid) return;

    try {
      await updateTemplateConfig(
        config.id, 
        { isActive: !config.isActive }, 
        user.uid
      );
      toast.success(config.isActive ? 'Đã ẩn cấu hình' : 'Đã hiển thị cấu hình');
      loadConfigs();
    } catch (error) {
      console.error('Error toggling config:', error);
      toast.error('Không thể thay đổi trạng thái cấu hình');
    }
  };

  const getTypeInfo = (type: string) => {
    return configTypes.find(t => t.value === type) || configTypes[0];
  };

  // Filter configs by type
  const filteredConfigs = activeTab === 'all' 
    ? configs 
    : configs.filter(config => config.type === activeTab);

  const configsByType = {
    template: configs.filter(c => c.type === 'template'),
    flowerFrame: configs.filter(c => c.type === 'flowerFrame'),
    color: configs.filter(c => c.type === 'color'),
    effect: configs.filter(c => c.type === 'effect')
  };

  return (
    <>
      <LoadingOverlay 
        isLoading={saving}
        type="save"
        message={editing ? "Đang cập nhật cấu hình..." : "Đang tạo cấu hình..."}
      />
      
      <LoadingOverlay 
        isLoading={deleting !== null}
        type="delete"
        message="Đang xoá cấu hình..."
      />

      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {configTypes.map(type => {
            const count = configsByType[type.value as keyof typeof configsByType]?.length || 0;
            const vipCount = configsByType[type.value as keyof typeof configsByType]?.filter(c => c.isVip).length || 0;
            const TypeIcon = type.icon;
            
            return (
              <Card key={type.value}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{type.label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-gray-500">
                        {vipCount} VIP
                      </p>
                    </div>
                    <TypeIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Chỉnh sửa cấu hình' : 'Tạo cấu hình mới'}</CardTitle>
            <CardDescription>
              {editing ? 'Cập nhật thông tin cấu hình template' : 'Thêm cấu hình mới cho templates'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loại cấu hình</Label>
                  <Select value={formData.type} onValueChange={(value: any) => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {configTypes.map(type => (
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
                  <Label htmlFor="name">Tên ID</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ví dụ: romantic, elegant"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Tên hiển thị</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Tên hiển thị cho người dùng"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="order">Thứ tự hiển thị</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả chi tiết về cấu hình"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL hình ảnh</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="previewUrl">URL preview</Label>
                  <Input
                    id="previewUrl"
                    value={formData.previewUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, previewUrl: e.target.value }))}
                    placeholder="https://example.com/preview.jpg"
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {formData.type === 'color' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="colorCode">Mã màu</Label>
                    <Input
                      id="colorCode"
                      type="color"
                      value={formData.colorCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorCode: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {formData.type === 'effect' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="effectType">Loại hiệu ứng</Label>
                    <Select value={formData.effectType} onValueChange={(value: any) => 
                      setFormData(prev => ({ ...prev, effectType: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {effectTypes.map(effect => (
                          <SelectItem key={effect.value} value={effect.value}>
                            {effect.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cssClass">CSS Class</Label>
                    <Input
                      id="cssClass"
                      value={formData.cssClass}
                      onChange={(e) => setFormData(prev => ({ ...prev, cssClass: e.target.value }))}
                      placeholder="CSS class name"
                    />
                  </div>
                </div>
              )}

              {formData.type === 'flowerFrame' && (
                <div className="space-y-2">
                  <Label htmlFor="frameImageUrl">URL hình khung</Label>
                  <Input
                    id="frameImageUrl"
                    value={formData.frameImageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, frameImageUrl: e.target.value }))}
                    placeholder="https://example.com/frame.png"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVip"
                    checked={formData.isVip}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isVip: checked }))
                    }
                  />
                  <Label htmlFor="isVip" className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    VIP
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Giá VIP (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    disabled={!formData.isVip}
                  />
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
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

        {/* Configs List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách cấu hình ({filteredConfigs.length})</CardTitle>
            <CardDescription>
              Quản lý tất cả cấu hình template trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs for filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                {configTypes.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredConfigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có cấu hình nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConfigs.map((config) => {
                  const typeInfo = getTypeInfo(config.type);
                  const TypeIcon = typeInfo.icon;
                  
                  return (
                    <div
                      key={config.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <TypeIcon className="w-4 h-4" />
                            <h3 className="font-medium">{config.displayName}</h3>
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            {config.isVip && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Crown className="w-3 h-3 mr-1" />
                                VIP
                              </Badge>
                            )}
                            {config.isActive ? (
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
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">ID:</span> {config.name}</p>
                            {config.description && (
                              <p><span className="font-medium">Mô tả:</span> {config.description}</p>
                            )}
                            {config.isVip && (
                              <p className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium">Giá:</span> {config.price.toLocaleString()} VNĐ
                              </p>
                            )}
                            <p className="flex items-center gap-1">
                              <ArrowUpDown className="w-3 h-3" />
                              <span className="font-medium">Thứ tự:</span> {config.order}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleActive(config)}
                            className="h-8 w-8 p-0"
                          >
                            {config.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(config)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteModal(config.id)}
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
        message="Bạn có chắc chắn muốn xoá cấu hình này không? Hành động này không thể hoàn tác."
        confirmText="Xoá"
        cancelText="Hủy"
        variant="destructive"
        isLoading={!!deleting}
        loadingText="Đang xoá..."
      />
    </>
  );
} 