import { getFirestore, getStorage } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  getDocs,
  where,
  Timestamp,
  limit as firestoreLimit,
  serverTimestamp,
  updateDoc,
  deleteDoc
} from '@firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from '@firebase/storage';
import { WeddingData } from './models';
import { addWeddingToUser, removeWeddingFromUser } from './userService';

/**
 * Generate a wedding document ID from groom and bride names and date
 */
export const generateWeddingId = async (groomName: string, brideName: string, weddingDate?: Date): Promise<string> => {
  // Remove diacritical marks (Vietnamese accents)
  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[đĐ]/g, d => d === 'đ' ? 'd' : 'D');
  };

  // Join all parts of the name without spaces
  const groomFullName = groomName.trim().split(' ').join('');
  const brideFullName = brideName.trim().split(' ').join('');
  
  // Use current date if no date provided
  const date = weddingDate || new Date();
  
  // Format date as dd_mm_yy
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  const dateStr = `${day}_${month}_${year}`;
  
  // Format: fullname_fullname_dd_mm_yy (no spaces, accents removed)
  const baseId = `${removeAccents(groomFullName)}_${removeAccents(brideFullName)}_${dateStr}`.toLowerCase();
  
  // Remove any special characters, only keep alphanumeric and underscore
  const cleanId = baseId.replace(/[^a-z0-9_]/g, '');
  
  // Check if ID exists and add index if needed
  let weddingId = cleanId;
  let index = 1;
  
  while (await isWeddingIdTaken(weddingId)) {
    weddingId = `${index}${cleanId}`;
    index++;
  }
  
  return weddingId;
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
    const weddingId = await generateWeddingId(data.groomName, data.brideName, weddingDate);
    
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
export const uploadImage = async (weddingId: string, file: File, customPath?: string): Promise<string> => {
  try {
    const storage = await getStorage();
    
    // Use custom path if provided, otherwise generate default path
    const path = customPath || `weddings/${weddingId}/album/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
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
    
    // Filter out undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    console.log('Cleaned data for update:', cleanData);
    await setDoc(weddingRef, cleanData, { merge: true });
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
    
    // Query only public weddings
    const q = query(
      weddingsRef, 
      where('isPublic', '==', true),
      firestoreLimit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    const websites: WeddingData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as WeddingData;
      websites.push(data);
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
    const weddingId = await generateWeddingId(data.groomName, data.brideName, weddingDate);
    
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

// Add new interface for template sections
export interface TemplateSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  settings?: Record<string, any>;
  icon?: React.ComponentType<{ className?: string }>;
}

// Add new function to update template sections
export const updateTemplateSections = async (
  weddingId: string,
  sections: TemplateSection[]
): Promise<void> => {
  try {
    const db = await getFirestore();
    const weddingRef = doc(db, 'weddings', weddingId);
    
    // First, get the current document to ensure it exists
    const weddingDoc = await getDoc(weddingRef);
    if (!weddingDoc.exists()) {
      throw new Error('Wedding document not found');
    }
    
    // Update only the templateSections field and updatedAt timestamp
    await updateDoc(weddingRef, {
      templateSections: sections.map(section => ({
        id: section.id,
        name: section.name,
        enabled: section.enabled,
        order: section.order,
        settings: section.settings || {}
      })),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating template sections:', error);
    throw new Error('Failed to update template sections');
  }
};

// Add new function to get template sections
export const getTemplateSections = async (weddingId: string): Promise<TemplateSection[]> => {
  try {
    const db = await getFirestore();
    const weddingRef = doc(db, 'weddings', weddingId);
    const weddingDoc = await getDoc(weddingRef);
    
    if (weddingDoc.exists()) {
      const data = weddingDoc.data();
      return data.templateSections || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting template sections:', error);
    throw new Error('Failed to get template sections');
  }
};

// Add the deleteImage function to delete images from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the storage path from the URL
    const storage = await getStorage();
    const storageRef = ref(storage);
    
    // Create a reference from the full URL
    const imageRef = ref(storage, imageUrl);
    
    // Delete the file
    await deleteObject(imageRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Add this new function to get wedding images from storage
export const getWeddingImages = async (weddingId: string): Promise<string[]> => {
  try {
    const storage = await getStorage();
    const storageRef = ref(storage, `weddings/${weddingId}`);
    const result = await listAll(storageRef);
    
    // Get download URLs for all images
    const imageUrls = await Promise.all(
      result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        return url;
      })
    );
    
    return imageUrls;
  } catch (error) {
    console.error("Error getting wedding images:", error);
    throw error;
  }
};

/**
 * Delete a wedding website and all associated data
 */
export const deleteWeddingWebsite = async (weddingId: string): Promise<void> => {
  try {
    const db = await getFirestore();
    const storage = await getStorage();
    
    // First, get the wedding document to get the owner ID
    const weddingRef = doc(db, 'weddings', weddingId);
    const weddingDoc = await getDoc(weddingRef);
    
    if (!weddingDoc.exists()) {
      throw new Error('Wedding not found');
    }
    
    const weddingData = weddingDoc.data() as WeddingData;
    
    try {
      // Delete all files from storage
      const storageRef = ref(storage, `weddings/${weddingId}`);
      const result = await listAll(storageRef);
      
      // Delete all files in the wedding folder
      const deletePromises = result.items.map(async (item) => {
        try {
          await deleteObject(item);
        } catch (error) {
          console.warn(`Failed to delete file: ${item.fullPath}`, error);
        }
      });
      
      await Promise.all(deletePromises);
    } catch (storageError) {
      console.warn('Some storage files could not be deleted:', storageError);
    }
    
    // Delete all subcollections (wishes, etc.)
    try {
      const wishesRef = collection(db, 'weddings', weddingId, 'wishes');
      const wishesSnap = await getDocs(wishesRef);
      
      const deleteWishPromises = wishesSnap.docs.map(async (wishDoc) => {
        try {
          await deleteDoc(wishDoc.ref);
        } catch (error) {
          console.warn(`Failed to delete wish: ${wishDoc.id}`, error);
        }
      });
      
      await Promise.all(deleteWishPromises);
    } catch (subcollectionError) {
      console.warn('Some subcollections could not be deleted:', subcollectionError);
    }
    
    // Remove wedding from user's wedding list
    if (weddingData.ownerId) {
      try {
        await removeWeddingFromUser(weddingData.ownerId, weddingId);
      } catch (userError) {
        console.warn('Failed to remove wedding from user:', userError);
      }
    }
    
    // Finally, delete the main wedding document
    await deleteDoc(weddingRef);
    
  } catch (error) {
    console.error('Error deleting wedding website:', error);
    throw new Error('Không thể xoá website cưới. Vui lòng thử lại.');
  }
}; 