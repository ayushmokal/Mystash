export interface User {
  id: string;
  email: string;
  username: string;
  profileUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  affiliateLink?: string;
  description?: string;
}