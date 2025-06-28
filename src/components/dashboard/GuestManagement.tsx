"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, CheckCircle, XCircle, Download, Phone, Mail, 
  Plus, Search, Filter, CalendarDays, UserPlus
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore } from '@/lib/firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from '@firebase/firestore';
import { Skeleton } from "@/components/ui/skeleton";
import LoadingOverlay from "@/components/ui/loading-overlay";
import { WeddingData } from "@/lib/firebase/models";

interface Attendance {
  id: string;
  name: string;
  attending: 'yes' | 'no';
  guests: number;
  notes?: string;
  timestamp: Timestamp;
  weddingId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  attendanceType: string;
  phone?: string;
  email?: string;
}

interface GuestManagementProps {
  selectedWedding: WeddingData | null;
}

export default function GuestManagement({ selectedWedding }: GuestManagementProps) {
  const { isAuthenticated, user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'attending' | 'notAttending'>('all');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load attendances when selectedWedding changes
  useEffect(() => {
    if (selectedWedding?.id && isAuthenticated) {
      loadAttendances();
    }
  }, [selectedWedding, isAuthenticated]);

  // Fetch attendances from Firestore
  const loadAttendances = async () => {
    if (!selectedWedding?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const db = await getFirestore();
      const attendancesRef = collection(db, "attendances");
      
      if (!user || !user.uid) {
        throw new Error("Bạn cần đăng nhập để xem danh sách tham dự");
      }
      
      const q = query(
        attendancesRef,
        where("weddingId", "==", selectedWedding.id),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      const attendanceData: Attendance[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Attendance, 'id'>
      }));
      
      setAttendances(attendanceData);
      
      if (attendanceData.length === 0) {
        setError("Chưa có xác nhận tham dự nào cho sự kiện này");
      }
    } catch (error) {
      console.error("Error loading attendances:", error);
      setError("Không thể tải danh sách tham dự. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter attendances based on current tab and search term
  const filteredAttendances = attendances.filter(attendance => {
    // Filter by search term
    const matchesSearch = attendance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendance.phone?.includes(searchTerm);
    
    if (!matchesSearch) return false;

    // Filter by tab
    switch (currentTab) {
      case 'attending':
        return attendance.attending === 'yes';
      case 'notAttending':
        return attendance.attending === 'no';
      default:
        return true;
    }
  });

  // Export to CSV
  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
      const headers = [
        'Tên', 
        'Trạng thái tham dự', 
        'Số khách', 
        'Ghi chú', 
        'Thời gian xác nhận', 
        'Điện thoại', 
        'Email'
      ];
      
      const csvRows = filteredAttendances.map(a => {
        const timestamp = a.timestamp?.toDate 
          ? a.timestamp.toDate().toLocaleString('vi-VN') 
          : '';
        
        return [
          a.name,
          a.attending === 'yes' ? 'Tham dự' : 'Không tham dự',
          a.guests.toString(),
          a.notes || '',
          timestamp,
          a.phone || '',
          a.email || ''
        ];
      });
      
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `danh-sach-khach-moi-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setExportLoading(false), 500);
    }
  };

  // Calculate summary statistics
  const totalAttending = attendances.filter(a => a.attending === 'yes').length;
  const totalNotAttending = attendances.filter(a => a.attending === 'no').length;
  const totalGuests = attendances
    .filter(a => a.attending === 'yes')
    .reduce((sum, a) => sum + (a.guests || 0), 0);

  // Format date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(timestamp.toDate());
  };

  // Render guest item
  const renderGuestItem = (attendance: Attendance) => (
    <Card key={attendance.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg">{attendance.name}</h3>
            <p className="text-sm text-gray-500">
              {formatDate(attendance.timestamp)}
            </p>
          </div>
          <Badge 
            variant={attendance.attending === 'yes' ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {attendance.attending === 'yes' ? (
              <>
                <CheckCircle className="h-3 w-3" />
                <span>Tham dự</span>
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                <span>Không tham dự</span>
              </>
            )}
          </Badge>
        </div>
        
        {attendance.attending === 'yes' && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Số khách:</span> {attendance.guests}
          </p>
        )}
        
        {attendance.notes && (
          <p className="mt-2 text-sm">
            <span className="font-medium">Ghi chú:</span> {attendance.notes}
          </p>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2">
          {attendance.phone && (
            <div className="text-xs flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <Phone className="h-3 w-3" />
              <span>{attendance.phone}</span>
            </div>
          )}
          
          {attendance.email && (
            <div className="text-xs flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <Mail className="h-3 w-3" />
              <span>{attendance.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (!selectedWedding) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vui lòng chọn một đám cưới để quản lý khách mời.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={isLoading} type="api" message="Đang tải danh sách khách mời..." />
      <LoadingOverlay isLoading={exportLoading} type="save" message="Đang xuất file CSV..." />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Quản lý khách mời
          </CardTitle>
          <CardDescription>
            Theo dõi danh sách khách mời và xác nhận tham dự cho đám cưới của {selectedWedding.brideName} & {selectedWedding.groomName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalAttending}</div>
                <div className="text-sm text-green-600">Tham dự</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{totalNotAttending}</div>
                <div className="text-sm text-red-600">Không tham dự</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalGuests}</div>
                <div className="text-sm text-blue-600">Tổng số khách</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Tìm kiếm khách mời..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={exportToCSV}
              disabled={attendances.length === 0 || !!error}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </div>

          {/* Display error if any */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Tabs for filtering */}
          <Tabs 
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'all' | 'attending' | 'notAttending')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tất cả ({attendances.length})</TabsTrigger>
              <TabsTrigger value="attending">Tham dự ({totalAttending})</TabsTrigger>
              <TabsTrigger value="notAttending">Không tham dự ({totalNotAttending})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/4 mb-1" />
                        <Skeleton className="h-4 w-full" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredAttendances.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Chưa có khách mời nào {searchTerm ? 'phù hợp với tìm kiếm' : ''}.</p>
                    {!searchTerm && (
                      <p className="text-sm mt-2">
                        Khách mời sẽ xuất hiện khi họ xác nhận tham dự qua website cưới của bạn.
                      </p>
                    )}
                  </div>
                ) : (
                  filteredAttendances.map(renderGuestItem)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="attending" className="mt-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {filteredAttendances.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Chưa có khách nào xác nhận tham dự.</p>
                  </div>
                ) : (
                  filteredAttendances.map(renderGuestItem)
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="notAttending" className="mt-6">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {filteredAttendances.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>Chưa có khách nào từ chối tham dự.</p>
                  </div>
                ) : (
                  filteredAttendances.map(renderGuestItem)
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
} 