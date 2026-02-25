'use client';

import CartHeader from './CartHeader';
import TableStatusCard from './TableStatusCard';
import CartProductCard from './CartProductCard';
import CartFooter from './CartFooter';
import { useState } from 'react';
import { BackendCartItem } from '@/lib/types';
import CartPageEmpty from './CartPageEmpty';


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
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">

      <CartHeader onBack={onBack} />

      <div className="flex-1 overflow-y-auto bg-brand-bg scrollbar-hide px-4 sm:px-6 pt-2 pb-40">

        <TableStatusCard />

        <div className="flex flex-col">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              return <CartProductCard
                key={item.id}
                item={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
              />;
            })
          ) : (
            <CartPageEmpty />
          )}
        </div>

      </div>

      {cartItems.length > 0 && (
        <CartFooter
          totalAmount={totalAmount}
          isPlacing={isPlacing}
          cartItems={cartItems}
          handlePlaceOrderClick={handlePlaceOrderClick}
        />
      )}

    </div>
  );
}