import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { DatabaseError } from '../utils/errors';
import type { Category } from '@/types/firebase';

export async function getUserCategories(username: string): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(
      categoriesRef,
      where('username', '==', username),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new DatabaseError('Failed to fetch categories');
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  try {
    const now = new Date().toISOString();
    const categoryData = {
      ...category,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'categories'), categoryData);
    return {
      id: docRef.id,
      ...categoryData
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw new DatabaseError('Failed to create category');
  }
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  try {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw new DatabaseError('Failed to update category');
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new DatabaseError('Failed to delete category');
  }
}