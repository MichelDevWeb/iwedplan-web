"use client";

import { useState } from 'react';
import { 
  DropdownMenu, DropdownMenuContent, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  Gift, Save, Eye, RefreshCw, Plus, 
  Building2, Trash2, QrCode 
} from 'lucide-react';
import { toast } from "sonner";
import { updateWeddingWebsite, uploadImage } from "@/lib/firebase/weddingService";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCode?: string;
}

interface GiftCustomizerProps {
  weddingId: string;
  initialData: {
    giftTitle?: string;
    giftDescription?: string;
    bankAccounts?: BankAccount[];
  };
  onUpdate: (data: Record<string, unknown>) => void;
  onPreview: (data: Record<string, unknown>) => void;
  buttonClassName?: string;
}

export default function GiftCustomizer({
  weddingId,
  initialData,
  onUpdate,
  onPreview,
  buttonClassName
}: GiftCustomizerProps) {
  // Gift info state
  const [giftTitle, setGiftTitle] = useState(initialData.giftTitle || "Mừng Cưới");
  const [giftDescription, setGiftDescription] = useState(
    initialData.giftDescription || 
    "Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi."
  );
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialData.bankAccounts || []);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentAccountIndex, setCurrentAccountIndex] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();

  // Add new bank account with default values
  const addBankAccount = () => {
    const newAccount: BankAccount = {
      id: uuidv4(),
      bankName: "Ngân hàng",
      accountNumber: "0000000000",
      accountName: "Tên chủ tài khoản",
      qrCode: ""
    };
    setBankAccounts([...bankAccounts, newAccount]);
    toast.success("Đã thêm tài khoản mới");
    
    // Set index to edit the new account
    setCurrentAccountIndex(bankAccounts.length);
  };

  // Remove bank account by index
  const removeBankAccount = (index: number) => {
    const newAccounts = [...bankAccounts];
    newAccounts.splice(index, 1);
    setBankAccounts(newAccounts);
    
    // Reset current index if needed
    if (currentAccountIndex === index || index >= newAccounts.length) {
      setCurrentAccountIndex(null);
    } else if (currentAccountIndex && currentAccountIndex > index) {
      setCurrentAccountIndex(currentAccountIndex - 1);
    }
    
    toast.success("Đã xóa tài khoản");
  };

  // Update specific account field
  const updateAccountField = (index: number, field: keyof BankAccount, value: string) => {
    const newAccounts = [...bankAccounts];
    newAccounts[index] = {
      ...newAccounts[index],
      [field]: value
    };
    setBankAccounts(newAccounts);
  };

  // Handle QR code upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (!e.target.files || !e.target.files[0] || !weddingId) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.includes('image/')) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn (tối đa 5MB)");
      return;
    }
    
    try {
      // Upload to Firebase Storage
      const path = `weddings/${weddingId}/qr-${Date.now()}.${file.name.split('.').pop()}`;
      const imageUrl = await uploadImage(weddingId, file, path);
      
      if (imageUrl) {
        updateAccountField(index, 'qrCode', imageUrl);
        toast.success("Đã tải mã QR lên");
      }
    } catch (error) {
      console.error("Error uploading QR code:", error);
      toast.error("Không thể tải lên mã QR. Vui lòng thử lại.");
    } finally {
      // Clear the file input
      if (e.target) e.target.value = '';
    }
  };

  // Preview gift settings (without saving to database)
  const handlePreview = () => {
    const previewData = {
      giftTitle: giftTitle,
      giftDescription: giftDescription,
      bankAccounts: bankAccounts
    };
    
    onPreview(previewData);
    toast.success("Xem trước thay đổi");
  };
  
  // Reset to initial values
  const handleReset = () => {
    // Update local state
    setGiftTitle(initialData.giftTitle || "Mừng Cưới");
    setGiftDescription(initialData.giftDescription || "Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi.");
    setBankAccounts(initialData.bankAccounts || []);
    
    // Send the reset data to parent component
    const resetData = {
      giftTitle: initialData.giftTitle || "Mừng Cưới",
      giftDescription: initialData.giftDescription || "Sự hiện diện của bạn là món quà quý giá nhất đối với chúng tôi.",
      bankAccounts: initialData.bankAccounts || []
    };
    
    onPreview(resetData);
    toast.success("Đã đặt lại tất cả cài đặt");
  };

  // Save gift settings to the database
  const saveGiftSettings = async () => {
    if (!isAuthenticated || !weddingId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Create data object
      const updateData: Record<string, unknown> = {};
      
      // Only add fields that have valid values
      if (giftTitle && giftTitle.trim() !== '') {
        updateData.giftTitle = giftTitle.trim();
      }
      
      if (giftDescription && giftDescription.trim() !== '') {
        updateData.giftDescription = giftDescription.trim();
      }
      
      // Include bank accounts if they exist
      if (bankAccounts && bankAccounts.length > 0) {
        updateData.bankAccounts = bankAccounts;
      }
      
      // Make sure we have something to update
      if (Object.keys(updateData).length === 0) {
        toast.error("Không có thay đổi để lưu");
        return;
      }
      
      // Update database
      await updateWeddingWebsite(weddingId, updateData);
      
      // Notify parent component
      onUpdate(updateData);
      
      toast.success("Đã lưu cài đặt mừng cưới");
    } catch (error) {
      console.error("Error saving gift settings:", error);
      setSaveError("Không thể lưu cài đặt. Vui lòng thử lại.");
      toast.error("Không thể lưu cài đặt. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "backdrop-blur-sm hover:bg-white/30 transition-all duration-300", 
              buttonClassName || "bg-white/20 hover:bg-white/30 border-white/50 text-rose-800"
            )}
          >
            <Gift className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[280px] sm:w-[350px] md:w-[400px] bg-white/90 backdrop-blur-md border border-pink-100 shadow-lg dropdown-content"
        >
          <Tabs defaultValue="info" className="w-full flex flex-col h-auto">
            <TabsList className="grid grid-cols-2 w-full mb-2 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
              <TabsTrigger value="info" className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                <span>Thông tin</span>
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>Tài khoản</span>
                {bankAccounts.length > 0 && (
                  <span className="ml-1 text-xs bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded-full">
                    {bankAccounts.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            {/* Info Tab */}
            <TabsContent value="info" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Thông tin mừng cưới</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="giftTitle">Tiêu đề</Label>
                  <Input
                    id="giftTitle"
                    placeholder="Tiêu đề mừng cưới"
                    value={giftTitle}
                    onChange={(e) => setGiftTitle(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="giftDescription">Mô tả</Label>
                  <Textarea
                    id="giftDescription"
                    placeholder="Mô tả mừng cưới"
                    value={giftDescription}
                    onChange={(e) => setGiftDescription(e.target.value)}
                    className="text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Accounts Tab */}
            <TabsContent value="accounts" className="space-y-2 flex-1 overflow-y-auto">
              <DropdownMenuLabel className="font-script text-pink-600 text-center text-lg sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">Quản lý tài khoản</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-pink-200/50" />
              
              <div className="px-3 py-2 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Danh sách tài khoản</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 text-rose-600 border-pink-200"
                      onClick={addBankAccount}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Thêm mới</span>
                    </Button>
                  </div>
                  
                  {/* List of bank accounts */}
                  {bankAccounts.length === 0 ? (
                    <div className="text-center p-4 text-sm text-gray-500">
                      Chưa có tài khoản nào. Bấm &quot;Thêm mới&quot; để bắt đầu.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {bankAccounts.map((account, index) => (
                        <div 
                          key={account.id}
                          className={cn(
                            "p-2 border border-gray-200 rounded-md bg-white flex flex-col gap-2 relative group",
                            currentAccountIndex === index && "border-pink-300 bg-pink-50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{account.bankName}</h4>
                              <p className="text-xs text-gray-500 truncate">
                                {account.accountNumber} - {account.accountName}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => currentAccountIndex === index ? setCurrentAccountIndex(null) : setCurrentAccountIndex(index)}
                              >
                                {currentAccountIndex === index ? (
                                  <span className="text-xs">Đóng</span>
                                ) : (
                                  <span className="text-xs">Sửa</span>
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeBankAccount(index)}
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded edit form */}
                          {currentAccountIndex === index && (
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <div className="space-y-1">
                                <Label htmlFor={`bank-name-${index}`} className="text-xs">Tên ngân hàng</Label>
                                <Input
                                  id={`bank-name-${index}`}
                                  value={account.bankName}
                                  onChange={(e) => updateAccountField(index, 'bankName', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Tên ngân hàng"
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor={`account-number-${index}`} className="text-xs">Số tài khoản</Label>
                                <Input
                                  id={`account-number-${index}`}
                                  value={account.accountNumber}
                                  onChange={(e) => updateAccountField(index, 'accountNumber', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Số tài khoản"
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor={`account-name-${index}`} className="text-xs">Tên chủ tài khoản</Label>
                                <Input
                                  id={`account-name-${index}`}
                                  value={account.accountName}
                                  onChange={(e) => updateAccountField(index, 'accountName', e.target.value)}
                                  className="h-7 text-xs"
                                  placeholder="Tên chủ tài khoản"
                                />
                              </div>
                              
                              <div className="space-y-1">
                                <Label htmlFor={`qr-code-${index}`} className="text-xs flex justify-between">
                                  <span>Mã QR</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 text-xs px-1 text-blue-500"
                                    onClick={() => document.getElementById(`qr-upload-${index}`)?.click()}
                                  >
                                    <QrCode className="h-3 w-3 mr-1" />
                                    Tải lên
                                  </Button>
                                  <input
                                    id={`qr-upload-${index}`}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleQrUpload(e, index)}
                                  />
                                </Label>
                                
                                {account.qrCode ? (
                                  <div className="relative w-full h-24 border border-gray-200 rounded-md">
                                    <Image 
                                      src={account.qrCode} 
                                      alt="QR Code" 
                                      fill 
                                      className="object-contain p-1"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-1 right-1 h-5 w-5 rounded-full"
                                      onClick={() => updateAccountField(index, 'qrCode', '')}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-full h-24 border border-dashed border-gray-200 rounded-md">
                                    <span className="text-xs text-gray-400">Chưa có mã QR</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Footer with Save, Preview and Reset Buttons */}
            <div className="px-3 py-2 border-t border-pink-100 mt-2 sticky bottom-0 bg-white/90 backdrop-blur-sm z-10">
              {saveError && (
                <p className="text-xs text-red-500 mb-2">{saveError}</p>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                  onClick={handlePreview}
                >
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Xem trước
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-200 transition-all duration-200 hover:scale-105"
                  onClick={saveGiftSettings}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1">
                      <span className="animate-spin">◌</span> 
                      Đang lưu...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Lưu thay đổi
                    </span>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200 transition-all duration-200 hover:scale-105"
                  onClick={handleReset}
                >
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Đặt lại
                  </span>
                </Button>
              </div>
            </div>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 