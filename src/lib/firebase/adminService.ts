import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { getFirestore } from './firebaseConfig';
import { 
  NotificationData, 
  TemplateConfigItem, 
  ColorConfig, 
  EffectConfig, 
  FlowerFrameConfig 
} from './models';

// Notification Management
export const createNotification = async (
  notificationData: Omit<NotificationData, 'id' | 'createdAt' | 'updatedAt'>,
  adminUserId: string
): Promise<string> => {
  const db = await getFirestore();
  const notificationsRef = collection(db, 'notifications');
  
  // Start with base required fields
  const cleanedData: any = {
    type: notificationData.type,
    notificationType: notificationData.notificationType,
    title: notificationData.title,
    message: notificationData.message,
    dismissible: notificationData.dismissible,
    priority: notificationData.priority,
    backgroundColor: notificationData.backgroundColor,
    textColor: notificationData.textColor,
    isActive: notificationData.isActive,
    visibility: notificationData.visibility,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: adminUserId
  };

  // Only add optional fields if they have actual values
  if (notificationData.ctaText && notificationData.ctaText.trim()) {
    cleanedData.ctaText = notificationData.ctaText.trim();
  }
  
  if (notificationData.ctaLink && notificationData.ctaLink.trim()) {
    cleanedData.ctaLink = notificationData.ctaLink.trim();
  }
  
  if (notificationData.expiresAt) {
    cleanedData.expiresAt = notificationData.expiresAt;
  }
  
  const docRef = await addDoc(notificationsRef, cleanedData);
  return docRef.id;
};

export const updateNotification = async (
  notificationId: string,
  updates: Partial<NotificationData>,
  adminUserId: string
): Promise<void> => {
  const db = await getFirestore();
  const notificationRef = doc(db, 'notifications', notificationId);
  
  // Clean up the updates object
  const cleanedUpdates: any = {
    updatedAt: Timestamp.now()
  };
  
  // Copy over defined values
  Object.keys(updates).forEach(key => {
    const value = (updates as any)[key];
    
    // Special handling for optional string fields - allow empty string to clear them
    if (key === 'ctaText' || key === 'ctaLink') {
      if (value !== undefined) {
        // Allow empty string to clear the field, or actual value
        cleanedUpdates[key] = typeof value === 'string' ? value.trim() : value;
      }
    } else if (key === 'expiresAt') {
      if (value !== undefined) {
        cleanedUpdates[key] = value;
      }
    } else if (value !== undefined) {
      cleanedUpdates[key] = value;
    }
  });
  
  await updateDoc(notificationRef, cleanedUpdates);
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  const db = await getFirestore();
  const notificationRef = doc(db, 'notifications', notificationId);
  await deleteDoc(notificationRef);
};

export const getAllNotifications = async (): Promise<NotificationData[]> => {
  const db = await getFirestore();
  const notificationsRef = collection(db, 'notifications');
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NotificationData[];
};

// Public function for guests to access guest-level notifications
export const getGuestNotifications = async (): Promise<NotificationData[]> => {
  try {
    const db = await getFirestore();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('isActive', '==', true),
      where('visibility', '==', 'guest'),
      where('notificationType', '==', 'header'), // Only header notifications for public display
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationData[];
    
    // Filter out expired notifications
    const now = new Date();
    return notifications.filter(notification => 
      !notification.expiresAt || notification.expiresAt.toDate() > now
    );
  } catch (error) {
    console.error('Error fetching guest notifications:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// Function for authenticated users to access user-level notifications
export const getUserNotifications = async (): Promise<NotificationData[]> => {
  try {
    const db = await getFirestore();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('isActive', '==', true),
      where('visibility', 'in', ['guest', 'user']), // Include both guest and user notifications
      where('notificationType', '==', 'header'),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NotificationData[];
    
    // Filter out expired notifications
    const now = new Date();
    return notifications.filter(notification => 
      !notification.expiresAt || notification.expiresAt.toDate() > now
    );
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return []; // Return empty array on error instead of throwing
  }
};

// Legacy function - now uses getUserNotifications
export const getPublicNotifications = async (): Promise<NotificationData[]> => {
  return await getGuestNotifications();
};

export const getActiveNotifications = async (): Promise<NotificationData[]> => {
  const db = await getFirestore();
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef, 
    where('isActive', '==', true),
    orderBy('priority', 'desc'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  const notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as NotificationData[];
  
  // Filter out expired notifications
  const now = new Date();
  return notifications.filter(notification => 
    !notification.expiresAt || notification.expiresAt.toDate() > now
  );
};

// Template Configuration Management
export const createTemplateConfig = async (
  configData: Omit<TemplateConfigItem, 'id' | 'createdAt' | 'updatedAt'>,
  adminUserId: string
): Promise<string> => {
  const db = await getFirestore();
  const configsRef = collection(db, 'templateConfigs');
  
  const newConfig = {
    ...configData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: adminUserId
  };
  
  const docRef = await addDoc(configsRef, newConfig);
  return docRef.id;
};

export const updateTemplateConfig = async (
  configId: string,
  updates: Partial<TemplateConfigItem>,
  adminUserId: string
): Promise<void> => {
  const db = await getFirestore();
  const configRef = doc(db, 'templateConfigs', configId);
  
  await updateDoc(configRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};

export const deleteTemplateConfig = async (configId: string): Promise<void> => {
  const db = await getFirestore();
  const configRef = doc(db, 'templateConfigs', configId);
  await deleteDoc(configRef);
};

export const getAllTemplateConfigs = async (): Promise<TemplateConfigItem[]> => {
  const db = await getFirestore();
  const configsRef = collection(db, 'templateConfigs');
  const q = query(configsRef, orderBy('type'), orderBy('order'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TemplateConfigItem[];
};

export const getTemplateConfigsByType = async (type: string): Promise<TemplateConfigItem[]> => {
  const db = await getFirestore();
  const configsRef = collection(db, 'templateConfigs');
  const q = query(
    configsRef, 
    where('type', '==', type),
    where('isActive', '==', true),
    orderBy('order')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TemplateConfigItem[];
};

export const getActiveTemplateConfigs = async (): Promise<TemplateConfigItem[]> => {
  const db = await getFirestore();
  const configsRef = collection(db, 'templateConfigs');
  const q = query(
    configsRef,
    where('isActive', '==', true),
    orderBy('type'),
    orderBy('order')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TemplateConfigItem[];
};

// Helper function to check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  // Check against the existing Super User system
  const { isSuperUser } = await import('./userService');
  return await isSuperUser(userId);
}; 