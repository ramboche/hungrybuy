// --- ENUMS (Matched to Prisma) ---
export type Role = 'USER' | 'SHOP' | 'ADMIN';

export type FoodType = 'VEG' | 'NON_VEG';

export type OrderStatus = 'PENDING' | 'CANCELLED' | 'SERVED' | 'PAID';

// --- DATA MODELS ---

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface MenuVariant {
  id: string;
  label: string;
  price: number; // Stored in cents in DB
}

// "Product" in Frontend = "MenuItem" in Backend
export interface Product {
  id: string;
  name: string;
  description: string | null;
  foodType: FoodType; 
  price: number | null; // Can be null if it relies solely on variants
  isAvailable: boolean;
  categoryId: string;
  variants?: MenuVariant[]; 
  
  // UI-Specific Fields (Not in DB, handled by frontend fallbacks)
  image?: string; 
  rating?: number;
}

// Represents the relation in Prisma: Order -> OrderItem
export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number; // Snapshot price at time of order
  
  // Relations (often included in API responses)
  menuItem?: Product;
  variant?: MenuVariant | null;
}

export interface Order {
  id: string;
  tableId: string;
  status: OrderStatus;
  createdAt: string; // ISO Date String coming from JSON
  
  // Prisma relation is named 'orders', but UI often uses 'items'
  // We align with Prisma here:
  orders: OrderItem[]; 

  // UI Computed Helpers (Calculated on frontend or sent as extras)
  totalAmount: number; 
  customerNote?: string;
}

// --- AUTH STATE ---
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// src/lib/types.ts (Add/Update this)
export interface Table {
  id: string;
  number: number;
  qrToken: string;
}