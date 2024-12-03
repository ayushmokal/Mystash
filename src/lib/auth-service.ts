import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

interface LoginData {
  email: string;
  password: string;
}

async function checkUsernameAvailability(username: string): Promise<boolean> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
}

export async function registerUser({ email, password, username }: RegisterData) {
  try {
    // Check if username is available
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      throw new AuthError('Username is already taken');
    }

    // Create the user account
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with username
    await updateProfile(user, { displayName: username });
    
    // Create user document
    await setDoc(doc(db, 'users', user.uid), {
      username,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { user };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error instanceof AuthError) {
      throw error;
    }

    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/email-already-in-use':
        throw new AuthError('This email is already registered');
      case 'auth/invalid-email':
        throw new AuthError('Invalid email address');
      case 'auth/operation-not-allowed':
        throw new AuthError('Email/password accounts are not enabled. Please contact support.');
      case 'auth/weak-password':
        throw new AuthError('Password is too weak');
      default:
        throw new AuthError('Failed to create account. Please try again.');
    }
  }
}

export async function loginUser({ email, password }: LoginData) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific Firebase errors
    switch (error.code) {
      case 'auth/invalid-email':
        throw new AuthError('Invalid email address');
      case 'auth/user-disabled':
        throw new AuthError('This account has been disabled');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new AuthError('Invalid email or password');
      default:
        throw new AuthError('Failed to sign in. Please try again.');
    }
  }
}

async function createOrUpdateUserDoc(user: User) {
  if (!user.displayName) {
    throw new AuthError('Username is required');
  }

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    // Create new user document
    await setDoc(userRef, {
      username: user.displayName,
      email: user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    // Update existing user document
    await setDoc(userRef, {
      username: user.displayName,
      email: user.email,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

export async function signInWithGoogle() {
  try {
    // First, try popup sign-in
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await createOrUpdateUserDoc(user);
      return { user };
    } catch (popupError: any) {
      // If popup is blocked or fails, fall back to redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return { user: null }; // Redirect will happen, no user yet
      }
      
      // Handle other specific errors
      switch (popupError.code) {
        case 'auth/operation-not-allowed':
          throw new AuthError('Google sign-in is not enabled. Please contact support.');
        case 'auth/cancelled-popup-request':
          throw new AuthError('Sign-in cancelled. Please try again.');
        default:
          throw popupError;
      }
    }
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError('Failed to sign in with Google. Please try again.');
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createOrUpdateUserDoc(result.user);
      return { user: result.user };
    }
    return { user: null };
  } catch (error: any) {
    console.error('Redirect result error:', error);
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new AuthError('Google sign-in is not enabled. Please contact support.');
    }
    
    throw new AuthError('Failed to complete Google sign-in.');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw new AuthError('Failed to sign out.');
  }
}