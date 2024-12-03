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
import { auth, googleProvider } from '../firebase';
import { createUserProfile, getUserByUsername } from './user-service';
import { AuthError, handleFirebaseError } from '../utils/errors';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';

async function generateUniqueUsername(baseUsername: string): Promise<string> {
  let username = baseUsername.toLowerCase().replace(/\s+/g, '');
  let counter = 0;
  let isUnique = false;
  let finalUsername = username;

  while (!isUnique) {
    try {
      const existingUser = await getUserByUsername(finalUsername);
      if (!existingUser) {
        isUnique = true;
      } else {
        counter++;
        finalUsername = `${username}${counter}`;
      }
    } catch (error) {
      if (error instanceof AuthError && error.message === 'User not found') {
        isUnique = true;
      } else {
        throw error;
      }
    }
  }

  return finalUsername;
}

export async function registerUser({ email, password, username }: RegisterCredentials): Promise<{ user: User }> {
  try {
    // Check username availability
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      throw new AuthError('Username is already taken');
    }

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: username });
    await createUserProfile(user, username);
    return { user };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function loginUser({ email, password }: LoginCredentials): Promise<{ user: User }> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return { user };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function signInWithGoogle(): Promise<{ user: User | null }> {
  try {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // Generate username from display name or email
      const baseUsername = user.displayName || user.email?.split('@')[0] || '';
      if (!baseUsername) {
        throw new AuthError('Could not generate username from Google account');
      }

      // Check if user profile already exists
      try {
        await getUserByUsername(baseUsername);
      } catch (error) {
        if (error instanceof AuthError && error.message === 'User not found') {
          // Create new profile with unique username
          const username = await generateUniqueUsername(baseUsername);
          await createUserProfile(user, username);
          await updateProfile(user, { displayName: username });
        }
      }

      return { user };
    } catch (error: any) {
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, googleProvider);
        return { user: null };
      }
      throw error;
    }
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function handleRedirectResult(): Promise<{ user: User | null }> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      const baseUsername = result.user.displayName || result.user.email?.split('@')[0] || '';
      if (!baseUsername) {
        throw new AuthError('Could not generate username from Google account');
      }

      // Check if user profile already exists
      try {
        await getUserByUsername(baseUsername);
      } catch (error) {
        if (error instanceof AuthError && error.message === 'User not found') {
          // Create new profile with unique username
          const username = await generateUniqueUsername(baseUsername);
          await createUserProfile(result.user, username);
          await updateProfile(result.user, { displayName: username });
        }
      }

      return { user: result.user };
    }
    return { user: null };
  } catch (error) {
    throw handleFirebaseError(error);
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw new AuthError('Failed to sign out');
  }
}