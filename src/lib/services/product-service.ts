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
import type { Product } from '@/types/firebase';

export async function getCategoryProducts(username: string, categoryId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      where('username', '==', username),
      where('categoryId', '==', categoryId),
      orderBy('order', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new DatabaseError('Failed to fetch products');
  }
}

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  try {
    const now = new Date().toISOString();
    const productData = {
      ...product,
      createdAt: now,
      updatedAt: now
    };
    
    const docRef = await addDoc(collection(db, 'products'), productData);
    return {
      id: docRef.id,
      ...productData
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw new DatabaseError('Failed to create product');
  }
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw new DatabaseError('Failed to update product');
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new DatabaseError('Failed to delete product');
  }
}