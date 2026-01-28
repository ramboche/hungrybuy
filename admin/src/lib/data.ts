import { Order, Product, Category, OrderStatus } from './types';

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

// --- MOCK TABLES ---
// Kept as strings for now to match your current Dashboard UI state
export const INITIAL_TABLES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

// --- MOCK ORDERS (Matches Prisma Order & OrderItem) ---
export const INITIAL_ORDERS: Order[] = [
  { 
    id: '#204', 
    tableId: '05', 
    status: 'PENDING', // Matches backend enum
    createdAt: new Date().toISOString(), // Matches 'createdAt' in types
    customerNote: "Customer has a peanut allergy. Please check sauces.",
    totalAmount: 4070, // $40.70 -> 4070 cents
    
    // RENAMED from 'items' to 'orders' to match Prisma Schema/Types
    orders: [
      { 
        id: 'item-1',
        menuItemId: 'p2',
        quantity: 2,
        price: 1200, // Price per unit snapshot
        menuItem: { name: 'Spicy Chicken Burger', image: '/images/burger.jpg' } as Product,
        variant: { id: 'v_spicy', label: 'Extra Spicy', price: 1200 }
      },
      { 
        id: 'item-2',
        menuItemId: 'fries', // Assuming ID exists or just mock
        quantity: 1,
        price: 500,
        menuItem: { name: 'French Fries', image: '/images/burger.jpg' } as Product,
        variant: { id: 'v_lrg', label: 'Large', price: 500 }
      },
      { 
        id: 'item-3',
        menuItemId: 'p5',
        quantity: 2,
        price: 400,
        menuItem: { name: 'Cola Zero', image: '/images/burger.jpg' } as Product,
        variant: null
      }
    ]
  },
  { 
    id: '#203', 
    tableId: '12', 
    status: 'SERVED', 
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    totalAmount: 1980, // $19.80 -> 1980 cents
    orders: [
      { 
        id: 'item-4',
        menuItemId: 'p3',
        quantity: 2,
        price: 900,
        menuItem: { name: 'Veggie Delight', image: '/images/burger.jpg' } as Product,
        variant: null
      }
    ]
  }
];

// Updated Tabs to match your Backend Enums
export const ORDER_TABS = ['All', 'PENDING', 'SERVED', 'PAID', 'CANCELLED'] as const;