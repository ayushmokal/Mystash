export interface UserProfile {
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  userId: string;
  username: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  userId: string;
  username: string;
  categoryId: string;
  name: string;
  brand: string;
  imageUrl: string;
  affiliateLink?: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}