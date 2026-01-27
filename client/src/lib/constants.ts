import { Category, Product } from "./types";

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Burgers', image: '/images/burgers.jpeg' },
  { id: '2', name: 'Sushi', image: '/images/sushi.jpeg' },
  { id: '3', name: 'Shakes', image: '/images/shakes.jpeg' },
  { id: '4', name: 'Desserts', image: '/images/desserts.jpeg' },
];

// export const PRODUCTS: Product[] = [
//   {
//     id: '1',
//     name: 'Rolled Sushi',
//     description: 'Rolled sushi, or maki, is sushi where ingredients...',
//     price: 7.99,
//     rating: 4.8,name
//     image: '/images/sushi.jpeg',
//     qty: 1,
//     variants: [
//       // Added IDs here
//       { id: "1_6pcs", label: "6 pcs", price: 7.99 },
//       { id: "1_12pcs", label: "12 pcs", price: 14.99 }
//     ],
//     foodType: 'NON',
//     categoryId: '2'
//   },
//   {
//     id: '2',
//     name: 'Spicy Ramen',
//     description: 'Spicy ramen features a flavorful broth...',
//     price: 8.99,
//     rating: 4.9,
//     image: '/images/ramen.jpeg',
//     qty: 1,
//     variants: [
//       // Added IDs here
//       { id: "2_small", name: "Small", price: 8.99 },
//       { id: "2_medium", name: "Medium", price: 10.99 },
//       { id: "2_large", name: "Large", price: 12.99 }
//     ],
//     category: 'non-veg',
//     categoryId: '2'
//   },
//   {
//     id: '3',
//     name: 'Japanese Fried Chicken',
//     description: 'Popular dish featuring bite-sized pieces...',
//     price: 6.99,
//     rating: 4.8,
//     image: '/images/fried-chicken.jpeg',
//     qty: 1,
//     sizes: [
//       // Added IDs here
//       { id: "3_half", name: "Half", price: 6.99 },
//       { id: "3_full", name: "Full", price: 11.99 }
//     ],
//     category: 'non-veg',
//     categoryId: '2'
//   },
//   {
//     id: '4',
//     name: 'Veg Burger',
//     description: 'Popular dish featuring bite-sized pieces of paneer that are ..',
//     price: 6.99,
//     rating: 4.8,
//     image: '/images/burgers.jpeg',
//     qty: 3, // Note: This might represent a default qty or placeholder
//     category: 'veg',
//     categoryId: '1'
//     // No sizes array needed here if it has no variants
//   },
// ];