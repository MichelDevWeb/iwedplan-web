import { 
  User, 
  UserCredential, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail, 
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  updateProfile,
  signInWithCredential
} from 'firebase/auth';
import { getAuth } from './firebaseConfig';
import { createOrUpdateUser } from './userService';

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const auth = await getAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    
    // Also save user data to Firestore
    if (userCredential.user) {
      const userData: Record<string, any> = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
      };
      
      // Only add defined fields
      if (userCredential.user.displayName) {
        userData.displayName = userCredential.user.displayName;
      }
      
      if (userCredential.user.phoneNumber) {
        userData.phoneNumber = userCredential.user.phoneNumber;
      }
      
      if (userCredential.user.photoURL) {
        userData.photoURL = userCredential.user.photoURL;
      }
      
      await createOrUpdateUser(userData);
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const auth = await getAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Also save user data to Firestore
    if (userCredential.user) {
      const userData: Record<string, any> = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
      };
      
      // Only add defined fields
      if (userCredential.user.displayName) {
        userData.displayName = userCredential.user.displayName;
      }
      
      if (userCredential.user.phoneNumber) {
        userData.phoneNumber = userCredential.user.phoneNumber;
      }
      
      if (userCredential.user.photoURL) {
        userData.photoURL = userCredential.user.photoURL;
      }
      
      await createOrUpdateUser(userData);
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in with email/password:', error);
    throw error;
  }
};

/**
 * Create new user with email and password
 */
export const createUserWithEmail = async (email: string, password: string, displayName?: string): Promise<UserCredential> => {
  try {
    const auth = await getAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile if display name is provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Also save user data to Firestore
    if (userCredential.user) {
      const userData: Record<string, any> = {
        id: userCredential.user.uid,
        email: userCredential.user.email || '',
      };
      
      // Only add defined fields
      if (displayName || userCredential.user.displayName) {
        userData.displayName = displayName || userCredential.user.displayName;
      }
      
      if (userCredential.user.phoneNumber) {
        userData.phoneNumber = userCredential.user.phoneNumber;
      }
      
      if (userCredential.user.photoURL) {
        userData.photoURL = userCredential.user.photoURL;
      }
      
      await createOrUpdateUser(userData);
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error creating user with email/password:', error);
    throw error;
  }
};

/**
 * Initialize phone authentication with reCAPTCHA
 */
export const initPhoneAuth = async (containerID: string): Promise<RecaptchaVerifier> => {
  try {
    const auth = await getAuth();
    
    // Create RecaptchaVerifier
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerID, {
      size: 'normal',
      callback: () => {
        // reCAPTCHA solved, allow sign-in with phone
      }
    });
    
    // Render the reCAPTCHA widget
    await recaptchaVerifier.render();
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing phone auth:', error);
    throw error;
  }
};

/**
 * Send verification code to phone number
 */
export const sendVerificationCode = async (
  phoneNumber: string, 
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> => {
  try {
    const auth = await getAuth();
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    // Return verification ID to be used with the verification code
    return confirmationResult.verificationId;
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

/**
 * Verify phone number with code
 */
export const verifyPhoneWithCode = async (verificationId: string, verificationCode: string): Promise<UserCredential> => {
  try {
    const auth = await getAuth();
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    
    // Sign in with the credential
    return await signInWithCredential(auth, credential);
  } catch (error) {
    console.error('Error verifying phone number:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const auth = await getAuth();
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
  try {
    const auth = await getAuth();
    await signOut(auth);
    
    // Clear cached user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iwedplan_user');
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const auth = await getAuth();
    return auth.currentUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Listen for auth state changes
 */
export const onAuthChange = async (callback: (user: User | null) => void): Promise<(() => void)> => {
  const auth = await getAuth();
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback(user);
  });
  
  return unsubscribe;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
}; 