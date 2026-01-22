export interface Category {
  id: string;
  name: string;
  image: string;
  color?: string; // For the circle bg
}

export interface ProductSize {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // This acts as the "Base Price" or default
  rating: number;
  image: string;
  qty: number;
  sizes?: ProductSize[]; // UPDATED: Now an array of objects
  category: 'veg' | 'non-veg',
  categoryId: string;
}