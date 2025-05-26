"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore } from '@/lib/firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from '@firebase/firestore';
import { CheckCircle, XCircle, Download, Phone, Mail } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

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

interface AttendanceListModalProps {
  trigger: React.ReactNode;
  weddingId?: string;
}

export default function AttendanceListModal({ trigger, weddingId }: AttendanceListModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'attending' | 'notAttending'>('all');
  const [error, setError] = useState<string | null>(null);

  // Only authenticated users can access this modal
  if (!isAuthenticated) {
    return null;
  }

  // Load attendances when modal opens
  useEffect(() => {
    if (isOpen && weddingId) {
      loadAttendances();
    }
  }, [isOpen, weddingId]);

  // Fetch attendances from Firestore
  const loadAttendances = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const db = await getFirestore();
      const attendancesRef = collection(db, "attendances");
      
      // Make sure user is authenticated before querying
      if (!user || !user.uid) {
        throw new Error("Bạn cần đăng nhập để xem danh sách tham dự");
      }
      
      // Based on the Firestore rules, attendances are linked to weddings
      // We don't see an explicit permission in the rules, but we can query for entries with the wedding ID
      // This means we need proper rules or the document structure must match what's allowed
      const q = query(
        attendancesRef,
        where("weddingId", "==", weddingId),
        // For now, we'll remove the createdBy constraint since it might not be in the document structure
        // The access will be controlled by Firestore rules
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      
      // Convert data to our Attendance type
      const attendanceData: Attendance[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<Attendance, 'id'>
      }));
      
      setAttendances(attendanceData);
      
      // If no attendances and we successfully queried, it's just empty
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

  // Filter attendances based on current tab
  const filteredAttendances = React.useMemo(() => {
    switch (currentTab) {
      case 'attending':
        return attendances.filter(a => a.attending === 'yes');
      case 'notAttending':
        return attendances.filter(a => a.attending === 'no');
      default:
        return attendances;
    }
  }, [attendances, currentTab]);

  // Export to CSV
  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      'Tên', 
      'Trạng thái tham dự', 
      'Số khách', 
      'Ghi chú', 
      'Thời gian xác nhận', 
      'Điện thoại', 
      'Email'
    ];
    
    // Prepare CSV rows
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
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh-sach-tham-du-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Danh sách tham dự</DialogTitle>
          <DialogDescription>
            Danh sách khách mời đã xác nhận tham dự đám cưới của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Summary statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{totalAttending}</div>
              <div className="text-sm text-green-600">Tham dự</div>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{totalNotAttending}</div>
              <div className="text-sm text-red-600">Không tham dự</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalGuests}</div>
              <div className="text-sm text-blue-600">Tổng số khách</div>
            </div>
          </div>
          
          {/* Display error if any */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {/* Tabs for filtering */}
          <Tabs 
            defaultValue="all" 
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'all' | 'attending' | 'notAttending')}
            className="w-full"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="all">Tất cả ({attendances.length})</TabsTrigger>
                <TabsTrigger value="attending">Tham dự ({totalAttending})</TabsTrigger>
                <TabsTrigger value="notAttending">Không tham dự ({totalNotAttending})</TabsTrigger>
              </TabsList>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={exportToCSV}
                disabled={attendances.length === 0 || !!error}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Xuất CSV</span>
              </Button>
            </div>
            
            <TabsContent value="all" className="mt-4 overflow-y-auto max-h-[50vh]">
              {renderAttendanceList(filteredAttendances, isLoading)}
            </TabsContent>
            <TabsContent value="attending" className="mt-4 overflow-y-auto max-h-[50vh]">
              {renderAttendanceList(filteredAttendances, isLoading)}
            </TabsContent>
            <TabsContent value="notAttending" className="mt-4 overflow-y-auto max-h-[50vh]">
              {renderAttendanceList(filteredAttendances, isLoading)}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Helper function to render attendance list
  function renderAttendanceList(items: Attendance[], loading: boolean) {
    if (loading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 mb-3">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-1" />
          <Skeleton className="h-4 w-full" />
        </div>
      ));
    }
    
    if (items.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>Chưa có xác nhận tham dự nào.</p>
        </div>
      );
    }
    
    return items.map(attendance => (
      <div key={attendance.id} className="border rounded-lg p-4 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{attendance.name}</h3>
            <p className="text-sm text-gray-500">
              {formatDate(attendance.timestamp)}
            </p>
          </div>
          <Badge 
            variant={attendance.attending === 'yes' ? 'success' : 'destructive'}
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
          <p className="mt-1 text-sm">
            <span className="font-medium">Số khách:</span> {attendance.guests}
          </p>
        )}
        
        {attendance.notes && (
          <p className="mt-1 text-sm">
            <span className="font-medium">Ghi chú:</span> {attendance.notes}
          </p>
        )}
        
        <div className="mt-2 flex flex-wrap gap-2">
          {attendance.phone && (
            <div className="text-xs flex items-center gap-1 text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{attendance.phone}</span>
            </div>
          )}
          
          {attendance.email && (
            <div className="text-xs flex items-center gap-1 text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{attendance.email}</span>
            </div>
          )}
        </div>
      </div>
    ));
  }
} 