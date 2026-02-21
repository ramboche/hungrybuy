'use client';

import CartHeader from './CartHeader';
import TableStatusCard from './TableStatusCard';
import CartProductCard from './CartProductCard';
import CartFooter from './CartFooter';
import { useState } from 'react';
import { BackendCartItem } from '@/lib/types';


interface CartPageProps {
  cartItems: BackendCartItem[];
  totalAmount: number;
  onBack: () => void;
  onIncrease: (cartItemId: string) => void;
  onDecrease: (cartItemId: string) => void;
  onPlaceOrder: () => Promise<void>;
}

export default function CartPage({
  cartItems,
  totalAmount,
  onBack,
  onIncrease,
  onDecrease,
  onPlaceOrder
}: CartPageProps) {

  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrderClick = async () => {
    if (isPlacing || cartItems.length === 0) return;

    setIsPlacing(true);
    try {
      await onPlaceOrder();
    } catch {
      setIsPlacing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg relative">

      <CartHeader onBack={onBack} />

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-32 space-y-4">

        <TableStatusCard />

        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            return <CartProductCard
              key={item.id}
              item={item}
              onIncrease={onIncrease}
              onDecrease={onDecrease} />;
          })
        ) : (
          <div className="text-center py-20 opacity-50">
            <p className="text-gray-400">Your cart is empty</p>
          </div>
        )}

      </div>

      <CartFooter
        totalAmount={totalAmount}
        isPlacing={isPlacing}
        cartItems={cartItems}
        handlePlaceOrderClick={handlePlaceOrderClick}
      />

    </div>
  );
}