import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { getFirestore } from './firebaseConfig';
import { TodoTask, DefaultTaskTemplate, TaskAdvertisement, WeddingData } from './models';
import { getWeddingWebsite } from './weddingService';

// Các danh mục task mặc định
export const DEFAULT_TASK_CATEGORIES = [
  'venue', // Địa điểm
  'attire', // Trang phục
  'photography', // Nhiếp ảnh
  'invitation', // Thiệp mời
  'catering', // Ẩm thực
  'decoration', // Trang trí
  'music', // Âm nhạc
  'transportation', // Di chuyển
  'accommodation', // Chỗ ở
  'beauty', // Làm đẹp
  'gifts', // Quà tặng
  'legal', // Thủ tục pháp lý
  'other', // Khác
];

// Các task mặc định được tạo tự động
export const DEFAULT_TASKS: DefaultTaskTemplate[] = [
  {
    id: 'choose-venue',
    title: 'Chọn địa điểm tổ chức',
    description: 'Nghiên cứu và chọn địa điểm phù hợp cho đám cưới của bạn',
    category: 'venue',
    milestone: '12 tháng trước',
    daysBeforeWedding: 365,
    priority: 'high',
    suggestedAssignee: 'both',
    advertisementCategories: ['wedding-venue', 'reception-hall']
  },
  {
    id: 'create-guest-list',
    title: 'Lập danh sách khách mời',
    description: 'Tạo danh sách khách mời sơ bộ và phân loại theo quan hệ',
    category: 'other',
    milestone: '10 tháng trước',
    daysBeforeWedding: 300,
    priority: 'high',
    suggestedAssignee: 'both'
  },
  {
    id: 'book-photographer',
    title: 'Thuê nhiếp ảnh gia',
    description: 'Chọn nhiếp ảnh gia cho ngày cưới và buổi chụp ảnh cưới',
    category: 'photography',
    milestone: '9 tháng trước',
    daysBeforeWedding: 270,
    priority: 'medium',
    suggestedAssignee: 'both',
    advertisementCategories: ['wedding-photography', 'videography']
  },
  {
    id: 'select-wedding-attire',
    title: 'Chọn trang phục cưới',
    description: 'Chọn váy cưới, vest và phụ kiện đi kèm',
    category: 'attire',
    milestone: '8 tháng trước',
    daysBeforeWedding: 240,
    priority: 'high',
    suggestedAssignee: 'both',
    advertisementCategories: ['wedding-dress', 'groom-suit']
  },
  {
    id: 'pre-wedding-photoshoot',
    title: 'Chụp ảnh cưới',
    description: 'Thực hiện buổi chụp ảnh cưới',
    category: 'photography',
    milestone: '6 tháng trước',
    daysBeforeWedding: 180,
    priority: 'medium',
    suggestedAssignee: 'both',
    advertisementCategories: ['pre-wedding-photoshoot', 'photography-studio']
  },
  {
    id: 'select-catering',
    title: 'Chọn dịch vụ ẩm thực',
    description: 'Lựa chọn thực đơn và dịch vụ ẩm thực cho đám cưới',
    category: 'catering',
    milestone: '6 tháng trước',
    daysBeforeWedding: 180,
    priority: 'medium',
    suggestedAssignee: 'both',
    advertisementCategories: ['catering-service', 'wedding-cake']
  },
  {
    id: 'select-decoration',
    title: 'Chọn trang trí đám cưới',
    description: 'Quyết định phong cách trang trí và liên hệ với nhà cung cấp',
    category: 'decoration',
    milestone: '5 tháng trước',
    daysBeforeWedding: 150,
    priority: 'medium',
    suggestedAssignee: 'both',
    advertisementCategories: ['wedding-decoration', 'flowers']
  },
  {
    id: 'send-invitations',
    title: 'Gửi thiệp mời',
    description: 'Thiết kế, in và gửi thiệp mời đến khách mời',
    category: 'invitation',
    milestone: '3 tháng trước',
    daysBeforeWedding: 90,
    priority: 'high',
    suggestedAssignee: 'both',
    advertisementCategories: ['wedding-invitation', 'printing-service']
  },
  {
    id: 'final-venue-check',
    title: 'Kiểm tra lần cuối với địa điểm',
    description: 'Xác nhận lại mọi chi tiết với địa điểm tổ chức',
    category: 'venue',
    milestone: '1 tháng trước',
    daysBeforeWedding: 30,
    priority: 'high',
    suggestedAssignee: 'both'
  },
  {
    id: 'final-vendor-confirmation',
    title: 'Xác nhận lại với các nhà cung cấp',
    description: 'Liên hệ lại với tất cả nhà cung cấp dịch vụ để xác nhận chi tiết',
    category: 'other',
    milestone: '1 tuần trước',
    daysBeforeWedding: 7,
    priority: 'high',
    suggestedAssignee: 'both'
  },
];

/**
 * Lấy danh sách các task của một đám cưới
 */
export async function getWeddingTasks(weddingId: string): Promise<TodoTask[]> {
  try {
    const db = await getFirestore();
    const tasksRef = collection(db, 'weddings', weddingId, 'tasks');
    const tasksQuery = query(tasksRef, orderBy('dueDate', 'asc'));
    const snapshot = await getDocs(tasksQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
      } as TodoTask;
    });
  } catch (error) {
    console.error('Error fetching wedding tasks:', error);
    throw error;
  }
}

/**
 * Lấy một task cụ thể
 */
export async function getTask(weddingId: string, taskId: string): Promise<TodoTask | null> {
  try {
    const db = await getFirestore();
    const taskRef = doc(db, 'weddings', weddingId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      return {
        ...taskDoc.data(),
        id: taskDoc.id,
      } as TodoTask;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
}

/**
 * Tạo một task mới
 */
export async function createTask(task: Omit<TodoTask, 'id'>): Promise<TodoTask> {
  try {
    const db = await getFirestore();
    const tasksRef = collection(db, 'weddings', task.weddingId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...task,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    
    return {
      ...task,
      id: docRef.id,
    } as TodoTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

/**
 * Cập nhật một task
 */
export async function updateTask(task: TodoTask): Promise<TodoTask> {
  try {
    const db = await getFirestore();
    const taskRef = doc(db, 'weddings', task.weddingId, 'tasks', task.id);
    
    // Cập nhật trường completedAt nếu đang chuyển sang trạng thái completed
    let updates: Partial<TodoTask> = {
      ...task,
      updatedAt: Timestamp.now(),
    };
    
    if (task.status === 'completed' && !task.completedAt) {
      updates.completedAt = Timestamp.now();
    }
    
    await updateDoc(taskRef, updates as any);
    
    return {
      ...task,
      ...updates,
    } as TodoTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

/**
 * Xóa một task
 */
export async function deleteTask(weddingId: string, taskId: string): Promise<void> {
  try {
    const db = await getFirestore();
    const taskRef = doc(db, 'weddings', weddingId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

/**
 * Tính ngày deadline dựa vào ngày cưới và số ngày trước đám cưới
 */
function calculateDueDate(weddingDate: Date, daysBeforeWedding: number): Date {
  const dueDate = new Date(weddingDate);
  dueDate.setDate(dueDate.getDate() - daysBeforeWedding);
  return dueDate;
}

/**
 * Tạo các task mặc định cho đám cưới dựa vào ngày cưới
 */
export async function generateDefaultTasks(weddingId: string): Promise<TodoTask[]> {
  try {
    // Lấy thông tin đám cưới để biết ngày cưới
    const weddingData = await getWeddingWebsite(weddingId) as WeddingData;
    
    if (!weddingData || !weddingData.eventDate) {
      throw new Error('Wedding date not found');
    }
    
    const weddingDate = weddingData.eventDate.toDate();
    const createdTasks: TodoTask[] = [];
    
    // Tạo các task mặc định
    for (const template of DEFAULT_TASKS) {
      const dueDate = calculateDueDate(weddingDate, template.daysBeforeWedding);
      
      const task: Omit<TodoTask, 'id'> = {
        weddingId: weddingId,
        title: template.title,
        description: template.description,
        category: template.category,
        milestone: template.milestone,
        dueDate: Timestamp.fromDate(dueDate),
        status: 'pending',
        isDefault: true,
        priority: template.priority,
        reminderSent: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Thêm task mới vào database
      const createdTask = await createTask(task);
      createdTasks.push(createdTask);
    }
    
    return createdTasks;
  } catch (error) {
    console.error('Error generating default tasks:', error);
    throw error;
  }
}

/**
 * Lấy danh sách quảng cáo liên quan đến task
 */
export async function getTaskAdvertisements(categories: string[]): Promise<TaskAdvertisement[]> {
  try {
    const db = await getFirestore();
    const now = Timestamp.now();
    const adsRef = collection(db, 'advertisements');
    const adsQuery = query(
      adsRef,
      where('isActive', '==', true),
      where('startDate', '<=', now),
      where('endDate', '>=', now),
      orderBy('startDate', 'desc'),
      orderBy('priority', 'desc')
    );
    
    const snapshot = await getDocs(adsQuery);
    const allAds = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as TaskAdvertisement[];
    
    // Lọc quảng cáo có category phù hợp
    return allAds.filter(ad => 
      ad.categories.some(category => categories.includes(category))
    );
  } catch (error) {
    console.error('Error fetching task advertisements:', error);
    throw error;
  }
}

/**
 * Cập nhật số lượt xem của quảng cáo
 */
export async function incrementAdViewCount(adId: string): Promise<void> {
  try {
    const db = await getFirestore();
    const adRef = doc(db, 'advertisements', adId);
    const adDoc = await getDoc(adRef);
    
    if (adDoc.exists()) {
      const currentCount = adDoc.data().viewCount || 0;
      await updateDoc(adRef, {
        viewCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error updating ad view count:', error);
    throw error;
  }
}

/**
 * Cập nhật số lượt click của quảng cáo
 */
export async function incrementAdClickCount(adId: string): Promise<void> {
  try {
    const db = await getFirestore();
    const adRef = doc(db, 'advertisements', adId);
    const adDoc = await getDoc(adRef);
    
    if (adDoc.exists()) {
      const currentCount = adDoc.data().clickCount || 0;
      await updateDoc(adRef, {
        clickCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error updating ad click count:', error);
    throw error;
  }
} 