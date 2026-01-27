export interface Category {
  id: string;
  name: string;
  image: string;
  color?: string; // For the circle bg
}

export interface Variant {
  id: string;
  label: string; // Matches DB
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;       // Now this expects Integers (cents) from DB
  foodType: 'VEG' | 'NON_VEG'; // Matches DB Enum
  categoryId: string;
  variants: Variant[]; // Matches DB relation name
  
  // These fields are NOT in DB yet, so we make them optional or handle them
  image?: string; 
  rating?: number;
  qty?: number;
}

export interface BackendCartItem {
  id: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number | null; // Expecting Integers (e.g., 799 for $7.99)
  };
  variant?: {
    id: string;
    label: string;
    price: number; // Expecting Integers
  } | null;
}