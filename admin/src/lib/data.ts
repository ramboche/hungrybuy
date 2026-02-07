import { Product, Category} from './types';

// --- MOCK CATEGORIES ---
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'pizzas', name: 'Pizzas' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'desserts', name: 'Desserts' },
];

// --- MOCK PRODUCTS (Matches Prisma MenuItem) ---
// Prices are in CENTS (e.g., 899 = $8.99)
export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    name: 'Classic Cheeseburger', 
    price: 899, 
    categoryId: 'burgers', 
    image: '/images/burger.jpg', 
    isAvailable: true, 
    description: '350g • Juicy beef patty',
    foodType: 'NON_VEG',
    variants: [
      { id: 'v1', label: 'Single', price: 899 },
      { id: 'v2', label: 'Double', price: 1199 },
    ]
  },
  { 
    id: 'p2', 
    name: 'Spicy Chicken Burger', 
    price: 1050, 
    categoryId: 'burgers', 
    image: '/images/burger.jpg', 
    isAvailable: true, 
    description: 'Spicy sauce • Crispy chicken',
    foodType: 'NON_VEG',
    variants: []
  },
  { 
    id: 'p3', 
    name: 'Veggie Delight', 
    price: 900, 
    categoryId: 'burgers', 
    image: '/images/burger.jpg', 
    isAvailable: false, 
    description: 'Vegan patty • Fresh veggies',
    foodType: 'VEG',
    variants: []
  },
  { 
    id: 'p4', 
    name: 'Double Bacon Stack', 
    price: 1250, 
    categoryId: 'burgers', 
    image: '/images/burger.jpg', 
    isAvailable: true, 
    description: 'Double beef • Crispy bacon',
    foodType: 'NON_VEG',
    variants: []
  },
  {
    id: 'p5',
    name: 'Cola Zero',
    price: 400,
    categoryId: 'drinks',
    image: '/images/burger.jpg',
    isAvailable: true,
    description: 'No sugar, ice cold',
    foodType: 'VEG',
    variants: [
      { id: 'v_reg', label: 'Regular', price: 400 },
      { id: 'v_lrg', label: 'Large', price: 550 },
    ]
  }
];

// Updated Tabs to match your Backend Enums
export const ORDER_TABS = ['All', 'PENDING', 'SERVED', 'PAID', 'CANCELLED'] as const;