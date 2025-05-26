import { getFirestore } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  addDoc
} from '@firebase/firestore';
import { WeddingWish } from './models';

/**
 * Add a new wish to a wedding's wishbook
 */
export const addWeddingWish = async (
  weddingId: string, 
  wishData: { 
    name: string; 
    message: string; 
    relationship?: string 
  }
): Promise<string> => {
  try {
    const db = await getFirestore();
    
    // Reference to the wishes sub-collection of the wedding
    const wishesCollectionRef = collection(db, 'weddings', weddingId, 'wishes');
    
    // Create wish data with timestamps
    const newWish: Omit<WeddingWish, 'id'> = {
      name: wishData.name,
      message: wishData.message,
      createdAt: Timestamp.now(),
      approved: false, // Wishes need to be approved by the wedding owners
      relationship: wishData.relationship
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(wishesCollectionRef, newWish);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding wedding wish:', error);
    throw new Error('Failed to add wish. Please try again later.');
  }
};

/**
 * Get wishes for a wedding
 */
export const getWeddingWishes = async (
  weddingId: string, 
  options?: { 
    limit?: number; 
    approvedOnly?: boolean 
  }
): Promise<WeddingWish[]> => {
  try {
    const db = await getFirestore();
    const wishesCollectionRef = collection(db, 'weddings', weddingId, 'wishes');
    
    // Build query with conditions
    let q = query(wishesCollectionRef, orderBy('createdAt', 'desc'));
    
    // Add approved filter if needed
    if (options?.approvedOnly) {
      q = query(q, where('approved', '==', true));
    }
    
    // Add limit if provided
    if (options?.limit) {
      q = query(q, firestoreLimit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    // Map documents to WeddingWish objects
    const wishes: WeddingWish[] = [];
    querySnapshot.forEach((doc) => {
      wishes.push({
        id: doc.id,
        ...doc.data()
      } as WeddingWish);
    });
    
    return wishes;
  } catch (error) {
    console.error('Error getting wedding wishes:', error);
    return [];
  }
};

/**
 * Approve or reject a wish
 */
export const updateWishStatus = async (
  weddingId: string, 
  wishId: string, 
  approved: boolean
): Promise<boolean> => {
  try {
    const db = await getFirestore();
    const wishRef = doc(db, 'weddings', weddingId, 'wishes', wishId);
    
    await updateDoc(wishRef, {
      approved,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating wish status:', error);
    return false;
  }
};

/**
 * Delete a wish
 */
export const deleteWish = async (weddingId: string, wishId: string): Promise<boolean> => {
  try {
    const db = await getFirestore();
    const wishRef = doc(db, 'weddings', weddingId, 'wishes', wishId);
    
    await deleteDoc(wishRef);
    return true;
  } catch (error) {
    console.error('Error deleting wish:', error);
    return false;
  }
}; 