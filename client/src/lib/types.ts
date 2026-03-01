export interface Category {
  id: string;
  name: string;
  image: string;
  color?: string;
}

export interface Variant {
  id: string;
  label: string;
  price: number;
}

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  foodType: 'VEG' | 'NON_VEG';
  categoryId: string;
  variants: Variant[];
  image?: string | null;
  rating?: number;
  qty?: number;
};

export interface BackendCartItem {
  id: string;
  quantity: number;
  menuItem: {
    id: string;
    name: string;
    price: number | null;
    description: string | null;
    image?: string | null;
  };
  variant?: {
    id: string;
    label: string;
    price: number;
  } | null;
}

export interface Table {
  id: string;
  number: number;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
}