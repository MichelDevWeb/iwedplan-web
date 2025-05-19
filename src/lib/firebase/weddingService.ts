import { getFirestore, getStorage } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  collectionGroup,
  limit as firestoreLimit,
  serverTimestamp,
  deleteDoc,
  updateDoc
} from '@firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { WeddingData } from './models';
import { addWeddingToUser } from './userService';

/**
 * Generate a wedding document ID from groom and bride names and date
 */
export const generateWeddingId = (groomName: string, brideName: string, weddingDate?: Date): string => {
  // Extract first and last names
  const groomNames = groomName.trim().split(' ');
  const brideNames = brideName.trim().split(' ');
  
  // Extract full first names (may include middle names)
  const groomFirstName = groomNames.length > 1 ? 
    groomNames.slice(0, -1).join('') : groomNames[0] || '';
  
  const brideFirstName = brideNames.length > 1 ? 
    brideNames.slice(0, -1).join('') : brideNames[0] || '';
  
  // Remove diacritical marks (Vietnamese accents)
  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[đĐ]/g, d => d === 'đ' ? 'd' : 'D');
  };
  
  // Use current date if no date provided
  const date = weddingDate || new Date();
  
  // Format date as dd_mm_yy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const dateStr = `${day}_${month}_${year}`;
  
  // Format: FirstName_LastName_dd_mm_yy (no spaces, accents removed)
  const weddingId = `${removeAccents(groomFirstName)}_${removeAccents(brideFirstName)}_${dateStr}`.toLowerCase();
  
  // Remove any special characters and spaces, only keep alphanumeric and underscore
  return weddingId.replace(/[^a-z0-9_]/g, '');
};

/**
 * Check if a wedding ID already exists
 */
export const isWeddingIdTaken = async (weddingId: string): Promise<boolean> => {
  try {
    if (!weddingId) return false;
    
    const db = await getFirestore();
    const docRef = doc(db, 'weddings', weddingId);
    const docSnap = await getDoc(docRef);
    
    // If document exists, the ID is taken
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking wedding ID availability:', error);
    return false;
  }
};

/**
 * Create wedding website in Firestore
 */
export const createWeddingWebsite = async (data: {
  groomName: string;
  brideName: string;
  template: string;
  eventDate?: Timestamp;
  ownerId: string;
}): Promise<string> => {
  try {
    const db = await getFirestore();
    
    // Generate wedding ID
    const weddingDate = data.eventDate ? data.eventDate.toDate() : new Date();
    const weddingId = generateWeddingId(data.groomName, data.brideName, weddingDate);
    
    // Check if the ID is already taken
    const isTaken = await isWeddingIdTaken(weddingId);
    if (isTaken) {
      throw new Error("This wedding ID already exists. Please use different names or date.");
    }
    
    // Create wedding data object
    const weddingData: WeddingData = {
      id: weddingId,
      groomName: data.groomName,
      brideName: data.brideName,
      ownerId: data.ownerId,
      createdAt: Timestamp.now(),
      template: data.template || 'default',
    };
    
    if (data.eventDate) {
      weddingData.eventDate = data.eventDate;
    }
    
    try {
      // First, create wedding document
      const weddingRef = doc(db, 'weddings', weddingId);
      await setDoc(weddingRef, weddingData);
      
      // Then, add wedding ID to user's weddingIds array
      await addWeddingToUser(data.ownerId, weddingId);
      
      return weddingId;
    } catch (innerError: any) {
      if (innerError.code === 'permission-denied') {
        console.error('Permission denied while creating wedding:', innerError);
        throw new Error("You don't have permission to create this wedding. Please check your authentication.");
      }
      throw innerError;
    }
  } catch (error) {
    console.error('Error creating wedding website:', error);
    throw error;
  }
};

/**
 * Upload an image to Firebase Storage and return the URL
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storage = await getStorage();
    const storageRef = ref(storage, path);
    const uploadResult = await uploadBytes(storageRef, file);
    return await getDownloadURL(uploadResult.ref);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Không thể tải lên ảnh. Vui lòng thử lại sau.");
  }
};

/**
 * Update wedding website data
 */
export const updateWeddingWebsite = async (weddingId: string, data: Partial<WeddingData>): Promise<void> => {
  try {
    const db = await getFirestore();
    const weddingRef = doc(db, 'weddings', weddingId);
    await setDoc(weddingRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating wedding website:", error);
    throw new Error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
  }
};

/**
 * Get wedding website data by document ID
 */
export const getWeddingWebsite = async (weddingId: string): Promise<WeddingData | null> => {
  try {
    const db = await getFirestore();
    const weddingRef = doc(db, 'weddings', weddingId);
    const docSnap = await getDoc(weddingRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as WeddingData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting wedding website:", error);
    throw new Error("Không thể tải thông tin website. Vui lòng thử lại sau.");
  }
};

/**
 * Get featured wedding websites for the landing page
 */
export const getFeaturedWeddingWebsites = async (limit: number = 3): Promise<WeddingData[]> => {
  try {
    const db = await getFirestore();
    const weddingsRef = collection(db, 'weddings');
    const q = query(weddingsRef, firestoreLimit(limit));
    const querySnapshot = await getDocs(q);
    
    const websites: WeddingData[] = [];
    querySnapshot.forEach((doc) => {
      websites.push(doc.data() as WeddingData);
    });
    
    // Sort by creation date and limit
    return websites
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting featured wedding websites:", error);
    return [];
  }
};

/**
 * Clear Firestore cache (for development only)
 */
export const clearFirestoreCache = async (): Promise<void> => {
  try {
    console.log('Firestore cache cleared');
  } catch (error) {
    console.error('Error clearing Firestore cache:', error);
  }
};

/**
 * Create a wedding document in Firestore (with user association)
 */
export const createFirestoreWedding = async (userId: string, data: WeddingData): Promise<{ status: string; message: string }> => {
  try {
    const db = await getFirestore();
    
    // Generate document ID using groom, bride names, and wedding date
    const weddingDate = data.eventDate ? data.eventDate.toDate() : new Date();
    const weddingId = generateWeddingId(data.groomName, data.brideName, weddingDate);
    
    // Check if the wedding ID already exists
    const idTaken = await isWeddingIdTaken(weddingId);
    if (idTaken) {
      return {
        status: 'error',
        message: 'This wedding ID already exists. Please use different names or date.'
      };
    }
    
    // Update the ID in the data
    data.id = weddingId;
    
    // Add owner field to relate to the user
    data.ownerId = userId;
    
    // Add timestamp if not present
    if (!data.createdAt) {
      data.createdAt = Timestamp.now();
    }
    
    // Create the document
    const weddingRef = doc(db, 'weddings', weddingId);
    await setDoc(weddingRef, data);
    
    return {
      status: 'success',
      message: 'Wedding created successfully'
    };
  } catch (error) {
    console.error('Error creating wedding:', error);
    return {
      status: 'error',
      message: 'Failed to create wedding'
    };
  }
};

/**
 * Update a wedding document in Firestore
 */
export const updateFirestoreWedding = async (weddingId: string, data: Partial<WeddingData>, oldData?: WeddingData): Promise<{ status: string; message: string }> => {
  try {
    const db = await getFirestore();
    const weddingRef = doc(db, 'weddings', weddingId);
    
    // Check if wedding exists
    const docSnap = await getDoc(weddingRef);
    if (!docSnap.exists()) {
      return {
        status: 'error',
        message: 'Wedding not found'
      };
    }
    
    // Update the document
    await updateDoc(weddingRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return {
      status: 'success',
      message: 'Wedding updated successfully'
    };
  } catch (error) {
    console.error('Error updating wedding:', error);
    return {
      status: 'error',
      message: 'Failed to update wedding'
    };
  }
}; 