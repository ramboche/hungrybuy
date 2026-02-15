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

// Define Types

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
  variants?: Variant[];
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
  tableToken: string | null;
  tableNo: number;
  setTable: ({ token, no }: { token: string; no: number }) => void;
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
  const [tableToken, setTableTokenState] = useState<string | null>(null);
  const [tableNo, setTableNo] = useState<number>(0);

  const updateApiToken = (token: string | null) => {
    if (token) {
      api.defaults.headers.common["x-table-token"] = token;
    } else {
      delete api.defaults.headers.common["x-table-token"];
    }
  };

  // 1. Fetch Cart when tableToken changes
  useEffect(() => {
    const storedTable = localStorage.getItem("table");
    if (storedTable) {
      const { token, no } = JSON.parse(storedTable);

      setTableTokenState(token);
      setTableNo(no);

      updateApiToken(token);
      fetchCart();
    }
  }, []);


  const setTable = ({ token, no }: { token: string; no: number }) => {
    setTableTokenState(token);
    setTableNo(no);
    localStorage.setItem("table", JSON.stringify({ token, no }));
    fetchCart();
  };

  const resolveTableFromToken = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/table/qr/${token}`);

      const resolvedTable = res.data.data;

      const tableToken = resolvedTable.tableToken;
      const tableNo = resolvedTable.tableNumber;

      console.log(resolvedTable);

      if (tableToken && tableNo) {
        setTable({ token: tableToken, no: tableNo });
        toast.success("Connected to table!");
      }
    } catch (error) {
      console.error("QR Resolution Error:", error);
      toast.error("Invalid QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/cart`);
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
    if (!tableToken) {
      toast.error("No table selected!");
      return;
    }

    try {
      const existingItem = cart.find(
        (item) =>
          item.menuItem.id === menuItemId && item.variant?.id === variantId,
      );

      const finalQuantity = existingItem
        ? existingItem.quantity + quantity
        : quantity;

      const updatedCart = await api.post(`/cart/add`, {
        menuItemId,
        variantId,
        quantity: finalQuantity,
      });

      setCart(updatedCart.data.data.cart);
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
        await removeFromCart(cartItemId);
        return;
      }

      // Optimistic UI Update
      setCart((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      await api.patch(`/cart/${cartItemId}`, { quantity: newQuantity });
    } catch {
      toast.error("Failed to update cart");
      // Revert fetch on error
      if (tableToken) fetchCart();
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
      if (tableToken) fetchCart();
    }
  };

  const placeOrder = async () => {
    if (!tableToken) {
      toast.error("Table Token missing!");
      throw new Error("No Table Token");
    }

    try {
      await api.post(`/order/create`);
      // Success: Clear local cart immediately
      setCart([]);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Place Order Error:", error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to place order");
      throw error;
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
        tableToken,
        tableNo,
        setTable,
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
