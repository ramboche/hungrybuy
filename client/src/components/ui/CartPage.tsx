'use client';

import { ChevronLeft, Minus, Plus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { BackendCartItem } from '@/lib/types';


interface CartPageProps {
  cartItems: BackendCartItem[];
  totalAmount: number; // Expecting Integers (cents) from parent calculation
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
      // On success, parent (Home) usually switches view, so we don't need to unset loading
    } catch {
      setIsPlacing(false); // Reset on error so they can try again
    }
  };

  // Helper: Lookup image from constants because DB doesn't have images yet
  const getProductImage = () => {
    // const found = PRODUCTS.find(p => p.name.toLowerCase() === name.toLowerCase());
    return '/images/burgers.jpeg';
  };

  // Helper: Format Cents to Dollars (799 -> 7.99)
  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg relative">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-6 py-6 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark">Your Order</h1>
        <div className="w-10"></div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-32 space-y-4">

        {/* Table Status Card */}
        <div className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-brand-red">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-brand-dark text-sm">Table Service</h3>
              <p className="text-xs text-gray-400">Dine-in</p>
            </div>
          </div>
          <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full border border-green-100">
            ACTIVE
          </span>
        </div>

        {/* Cart Items List */}
        {cartItems.length > 0 ? (
          cartItems.map((item) => {
            // Priority: Variant Price > Base Menu Price
            const rawPrice: number = item.variant ? item.variant.price : item.menuItem.price!;

            return (
              <div key={item.id} className="bg-white rounded-3xl p-3 flex gap-4 shadow-sm">
                {/* Image (Local Lookup) */}
                <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                  <Image
                    src={getProductImage()}
                    alt={item.menuItem.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info (Backend Data) */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-bold text-brand-dark text-sm line-clamp-1">
                      {item.menuItem.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {/* Backend uses 'label' for variants */}
                      {item.variant ? item.variant.label : 'Standard'}
                    </p>
                    <div className="mt-1 font-bold text-brand-red">
                      $ {formatPrice(rawPrice)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex justify-end">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                      <button
                        onClick={() => onDecrease(item.id)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-dark active:scale-90 transition-transform"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => onIncrease(item.id)}
                        className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center shadow-sm text-white active:scale-90 transition-transform"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 opacity-50">
            <p className="text-gray-400">Your cart is empty</p>
          </div>
        )}

      </div>

      {/* --- FOOTER / TOTAL --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent pt-20">
        <button
          onClick={handlePlaceOrderClick}
          disabled={isPlacing || cartItems.length === 0}
          className="w-full bg-brand-red text-white font-bold py-4 rounded-3xl shadow-lg shadow-red-200 active:scale-95 transition-transform flex justify-between items-center px-6 disabled:opacity-70 disabled:scale-100"
        >
          {isPlacing ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} /> Placing Order...
            </span>
          ) : (
            <span>Place Order</span>
          )}

          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
            $ {formatPrice(totalAmount)}
          </span>
        </button>
      </div>

    </div>
  );
}