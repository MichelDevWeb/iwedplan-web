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
 * Create or update user data in Firestore
 */
export const createUserProfile = async (userData: Partial<UserData>): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userData.id!);
    
    // Check if user already exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user with default role
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        subscriptionTier: 'free',
        role: 'user', // Default role
      });
    } else {
      // Update existing user
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user data by ID
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Check if user is Super User
 */
export const isSuperUser = async (userId: string): Promise<boolean> => {
  try {
    const userData = await getUserData(userId);
    return userData?.role === 'super_user';
  } catch (error) {
    console.error('Error checking super user status:', error);
    return false;
  }
};

/**
 * Update user role (only for development/admin purposes)
 */
export const updateUserRole = async (userId: string, role: 'user' | 'super_user'): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      role: role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Set Super User role for testing (development only)
 */
export const setSuperUserRole = async (userEmail: string): Promise<void> => {
  try {
    const db = await getFirestore();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }
    
    const userDoc = querySnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      role: 'super_user'
    });
    
    console.log(`User ${userEmail} has been granted Super User role`);
  } catch (error) {
    console.error('Error setting super user role:', error);
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
        role: 'user', // Default role
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
 * Update user subscription
 */
export const updateUserSubscription = async (
  userId: string, 
  tier: 'free' | 'premium' | 'professional',
  subscriptionEnd?: Timestamp
): Promise<void> => {
  try {
    const db = await getFirestore();
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      subscriptionTier: tier,
      subscriptionStart: serverTimestamp(),
      subscriptionEnd: subscriptionEnd
    });
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
};

/**
 * Get all users (Super User only)
 */
export const getAllUsers = async (requestingUserId: string): Promise<UserData[]> => {
  try {
    // Check if requesting user is super user
    if (!(await isSuperUser(requestingUserId))) {
      throw new Error('Unauthorized: Only super users can access all users');
    }
    
    const db = await getFirestore();
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const users: UserData[] = [];
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserData);
    });
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Get all weddings created by a user
 */
export const getUserWeddings = async (userId: string): Promise<{id: string, groomName: string, brideName: string}[]> => {
  try {
    const db = await getFirestore();
    
    // Check if user is super user
    const isSuper = await isSuperUser(userId);
    
    let weddingsQuery;
    if (isSuper) {
      // Super user can see all weddings
      weddingsQuery = collection(db, 'weddings');
    } else {
      // Regular user can only see their own weddings
      weddingsQuery = query(
        collection(db, 'weddings'),
        where('ownerId', '==', userId)
      );
    }
    
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
        brideName: data.brideName || '',
        ownerId: data.ownerId || '',
        createdAt: data.createdAt
      };
    });
    
    // Sort by creation date (newest first)
    return weddings.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return 0;
    });
  } catch (error) {
    console.error('Error fetching user weddings:', error);
    return [];
  }
};

/**
 * Get all weddings in the system (Super User only)
 */
export const getAllWeddings = async (requestingUserId: string): Promise<{id: string, groomName: string, brideName: string, ownerId: string, createdAt?: any}[]> => {
  try {
    // Check if requesting user is super user
    if (!(await isSuperUser(requestingUserId))) {
      throw new Error('Unauthorized: Only super users can access all weddings');
    }
    
    const db = await getFirestore();
    const weddingsRef = collection(db, 'weddings');
    const querySnapshot = await getDocs(weddingsRef);
    
    const weddings: {id: string, groomName: string, brideName: string, ownerId: string, createdAt?: any}[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      weddings.push({
        id: doc.id,
        groomName: data.groomName || '',
        brideName: data.brideName || '',
        ownerId: data.ownerId || '',
        createdAt: data.createdAt
      });
    });
    
    // Sort by creation date (newest first)
    return weddings.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return 0;
    });
  } catch (error) {
    console.error('Error getting all weddings:', error);
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