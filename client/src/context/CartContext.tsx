"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { AxiosError } from 'axios';

// --- Types (Matching your Prisma Schema) ---
type Variant = {
  id: string;
  label: string;
  price: number;
};

type MenuItem = {
  id: string;
  name: string;
  price: number | null;
  isAvailable: boolean;
  categoryId: string;
  variants?: Variant[]; // Optional, in case you include them
};

type CartItem = {
  id: string;
  quantity: number;
  menuItem: MenuItem;
  variant?: Variant | null;
};

type CartContextType = {
  cart: CartItem[];
  isLoading: boolean;
  totalAmount: number;
  tableId: string | null;
  tableNo: number;
  setTableId: (id: string) => void;
  resolveTableFromToken: (token: string) => Promise<void>;
  addToCart: (
    menuItemId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  placeOrder: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tableId, setTableIdState] = useState<string | null>(null);
  const [tableNo, setTableNo] = useState<number>(0);

  // 1. Fetch Cart when tableId changes
  useEffect(() => {
    const storedTableId = localStorage.getItem("table_id");
    if (storedTableId) {
      setTableIdState(storedTableId);
      fetchCart(storedTableId);
    }
  }, []);

  const setTableId = (id: string) => {
    setTableIdState(id);
    localStorage.setItem("table_id", id);
    fetchCart(id);
  };

  const resolveTableFromToken = async (token: string) => {
    setIsLoading(true);
    try {
      // Matches Backend: router.get("/qr/:qrToken", resolveQr);
      const res = await api.get(`/table/qr/${token}`);

      const resolvedTable = res.data.data.table;

      const tableId = resolvedTable.id;
      const tableNo = resolvedTable.number;

      if (tableId) {
        setTableId(tableId);
        setTableNo(tableNo);
        toast.success("Connected to table!");
      }
    } catch (error) {
      console.error("QR Resolution Error:", error);
      toast.error("Invalid QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCart = async (tid: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/cart/${tid}`);
      setCart(res.data.data.cart);
    } catch (error) {
      console.error("Fetch Cart Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Add to Cart
  const addToCart = async (
    menuItemId: string,
    quantity: number,
    variantId?: string,
  ) => {
    if (!tableId) {
      toast.error("No table selected!");
      return;
    }

    try {
      // Frontend Logic: Check if item already exists to increment quantity
      // (Because backend replaces quantity instead of adding)
      const existingItem = cart.find(
        (item) =>
          item.menuItem.id === menuItemId && item.variant?.id === variantId,
      );

      const finalQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

      await api.post(`/cart/add-to-cart/${tableId}`, {
        menuItemId,
        variantId,
        quantity: finalQuantity,
      });

      // Optimistic Update or Refetch
      // For simplicity, let's refetch to ensure data consistency
      await fetchCart(tableId);
      toast.success("Added to cart!");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to add item");
    }
  };

  // 3. Update Quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        // If 0, delete it
        await removeFromCart(cartItemId);
        return;
      }

      // Optimistic UI Update (Make it feel fast)
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      await api.patch(`/cart/${cartItemId}`, { quantity: newQuantity });
    } catch {
      toast.error("Failed to update cart");
      // Revert fetch on error
      if (tableId) fetchCart(tableId);
    }
  };

  // 4. Remove Item
  const removeFromCart = async (cartItemId: string) => {
    try {
      // Optimistic UI Update
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));

      await api.delete(`/cart/${cartItemId}`);
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
      if (tableId) fetchCart(tableId);
    }
  };

  const placeOrder = async () => {
    if (!tableId) {
      toast.error("Table ID missing!");
      throw new Error("No Table ID");
    }

    try {
      // Calls the order routes: router.post("/create/:tableId", createOrder);
      await api.post(`/order/create/${tableId}`);

      // Success: Clear local cart immediately
      setCart([]);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Place Order Error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to place order");
      throw error; // Re-throw to let UI handle loading states
    }
  };

  // 5. Calculate Total
  const totalAmount = cart.reduce((total, item) => {
    const price = item.variant ? item.variant.price : item.menuItem.price || 0;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalAmount,
        tableId,
        tableNo,
        setTableId,
        resolveTableFromToken,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
