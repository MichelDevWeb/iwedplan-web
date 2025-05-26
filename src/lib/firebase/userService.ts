import { getFirestore } from './firebaseConfig';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp, 
  Timestamp,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { UserData } from './models';

/**
 * Get a user document by ID
 */
export const getUserById = async (userId: string): Promise<UserData | null> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Create or update a user document
 */
export const createOrUpdateUser = async (userData: Partial<UserData>): Promise<string> => {
  try {
    if (!userData.id) {
      throw new Error('User ID is required');
    }
    
    const db = await getFirestore();
    const userRef = doc(db, 'users', userData.id);
    const userSnap = await getDoc(userRef);
    
    // Filter out undefined values to prevent Firebase errors
    const filteredUserData: Record<string, any> = {};
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUserData[key] = value;
      }
    });
    
    if (userSnap.exists()) {
      // Update existing user
      const updateData: Record<string, any> = {
        ...filteredUserData,
        lastLogin: serverTimestamp(),
      };
      delete updateData.id; // Remove id from update data
      await updateDoc(userRef, updateData);
    } else {
      // Create new user
      await setDoc(userRef, {
        ...filteredUserData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionTier: 'free', // Default tier
      });
    }
    
    return userData.id;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

/**
 * Add a wedding ID to a user's weddings array
 */
export const addWeddingToUser = async (userId: string, weddingId: string): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create the user document if it doesn't exist
      await setDoc(userRef, {
        id: userId,
        weddingIds: [weddingId],
        createdAt: serverTimestamp(),
        subscriptionTier: 'free', // Default tier
      });
    } else {
      // Update existing user
      await updateDoc(userRef, {
        weddingIds: arrayUnion(weddingId)
      });
    }
  } catch (error) {
    console.error('Error adding wedding to user:', error);
    throw error;
  }
};

/**
 * Remove a wedding ID from a user's weddings array
 */
export const removeWeddingFromUser = async (userId: string, weddingId: string): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      weddingIds: arrayRemove(weddingId)
    });
  } catch (error) {
    console.error('Error removing wedding from user:', error);
    throw error;
  }
};

/**
 * Update a user's subscription
 */
export const updateUserSubscription = async (
  userId: string, 
  tier: 'free' | 'premium' | 'professional',
  durationMonths: number
): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    
    // Calculate subscription end date
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(now.getMonth() + durationMonths);
    
    await updateDoc(userRef, {
      subscriptionTier: tier,
      subscriptionStart: Timestamp.fromDate(now),
      subscriptionEnd: Timestamp.fromDate(endDate),
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

/**
 * Add a payment record to a user's payment history
 */
export const addPaymentRecord = async (
  userId: string, 
  payment: {
    amount: number;
    currency: string;
    type: 'subscription' | 'one-time';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    details?: any;
  }
): Promise<string> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    
    // Generate a unique payment ID
    const paymentId = `payment_${Date.now()}`;
    
    const paymentRecord = {
      id: paymentId,
      ...payment,
      date: serverTimestamp(),
    };
    
    await updateDoc(userRef, {
      [`paymentHistory.${paymentId}`]: paymentRecord
    });
    
    return paymentId;
  } catch (error) {
    console.error('Error adding payment record:', error);
    throw error;
  }
};

/**
 * Get all weddings created by a user
 */
export const getUserWeddings = async (userId: string): Promise<{id: string, groomName: string, brideName: string}[]> => {
  try {
    const db = await getFirestore();
    
    // First get user document to check if they have weddings
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn('User not found:', userId);
      return [];
    }
    
    const userData = userDoc.data();
    const weddingIds = userData.weddingIds || [];
    
    if (weddingIds.length === 0) {
      return [];
    }
    
    // Query weddings where ownerId equals userId
    const weddingsQuery = query(
      collection(db, 'weddings'),
      where('ownerId', '==', userId)
    );
    
    const weddingsSnap = await getDocs(weddingsQuery);
    
    if (weddingsSnap.empty) {
      return [];
    }
    
    // Map the results to the expected format
    const weddings = weddingsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        groomName: data.groomName || '',
        brideName: data.brideName || ''
      };
    });
    
    return weddings;
  } catch (error) {
    console.error('Error fetching user weddings:', error);
    return [];
  }
}; 