import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthError, DatabaseError } from '../utils/errors';
import type { User } from 'firebase/auth';
import type { UserProfile } from '@/types/firebase';

export async function createUserProfile(user: User, username: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    const profile: UserProfile = {
      username,
      email: user.email!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, profile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new DatabaseError('Failed to create user profile');
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new AuthError('User profile not found');
    }

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new DatabaseError('Failed to fetch user profile');
  }
}

export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new AuthError('User not found');
    }

    return snapshot.docs[0].data() as UserProfile;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Error fetching user by username:', error);
    throw new DatabaseError('Failed to fetch user by username');
  }
}