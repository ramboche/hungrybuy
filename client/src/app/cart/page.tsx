"use client";

import CartPage from "@/components/cart/CartPage";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import Loading from "@/components/other/Loading";

export default function CartPageRoute() {
  const router = useRouter();
  const { cart, updateQuantity, placeOrder } = useCart();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) return <Loading />;

  const handleCartIncrease = async (cartItemId: string) => {
    const item = cart.find((i) => i.id === cartItemId);
    if (item) await updateQuantity(cartItemId, item.quantity + 1);
  };

  const handleCartDecrease = async (cartItemId: string) => {
    const item = cart.find((i) => i.id === cartItemId);
    if (item) await updateQuantity(cartItemId, item.quantity - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrder();
      router.push("/"); 
    } catch (error) {
      console.error("Order failed", error);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.variant
        ? item.variant.price
        : item.menuItem.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg shadow-xl overflow-hidden">
        <CartPage
          cartItems={cart}
          onBack={() => router.back()} 
          onIncrease={handleCartIncrease}
          onDecrease={handleCartDecrease}
          onPlaceOrder={handlePlaceOrder}
          totalAmount={calculateTotal()}
        />
    </main>
  );
}