'use client';

import { ChevronLeft, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import { PRODUCTS } from '@/lib/constants'; // Need this to lookup product details

interface CartPageProps {
  cartDetails: Record<string, Record<string, number>>;
  onBack: () => void;
  onClear: () => void;
  onIncrease: (productId: string, size: string) => void;
  onDecrease: (productId: string, size: string) => void;
}

export default function CartPage({ cartDetails, onBack, onClear, onIncrease, onDecrease }: CartPageProps) {
  
  // 1. Flatten the cart data into a list we can render
  const cartItems: Array<{
    productId: string;
    product: typeof PRODUCTS[0];
    size: string;
    qty: number;
    price: number;
  }> = [];

  let subtotal = 0;

  Object.entries(cartDetails).forEach(([productId, sizes]) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    Object.entries(sizes).forEach(([size, qty]) => {
      // Find price for this specific size
      let price = product.price;
      if (product.sizes) {
        const sizeObj = product.sizes.find(s => s.name === size);
        if (sizeObj) price = sizeObj.price;
      }

      subtotal += price * qty;

      cartItems.push({
        productId,
        product,
        size,
        qty,
        price
      });
    });
  });

  return (
    <div className="flex flex-col h-full bg-brand-bg relative">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between px-6 py-6 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark active:scale-90 transition-transform">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-brand-dark">Your Order</h1>
        <button onClick={onClear} className="text-brand-red text-sm font-bold active:opacity-70">
          Clear
        </button>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-32 space-y-4">
        
        {/* Table Info Card */}
        <div className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm mb-6">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-brand-red">
               {/* Fork/Knife Icon SVG */}
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
             </div>
             <div>
               <h3 className="font-bold text-brand-dark text-sm">Table 05</h3>
               <p className="text-xs text-gray-400">Dine-in Service</p>
             </div>
          </div>
          <span className="bg-red-50 text-brand-red text-[10px] font-bold px-3 py-1 rounded-full border border-red-100">
            CONFIRMED
          </span>
        </div>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          cartItems.map((item, idx) => (
            <div key={`${item.productId}-${item.size}`} className="bg-white rounded-3xl p-3 flex gap-4 shadow-sm">
              {/* Image */}
              <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-brand-dark text-sm line-clamp-1">{item.product.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.size !== 'default' ? item.size : 'Standard'} • No onions
                  </p>
                  <div className="mt-1 font-bold text-brand-red">
                    $ {item.price.toFixed(2)}
                  </div>
                </div>

                {/* Counter */}
                <div className="flex justify-end">
                   <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                      <button 
                        onClick={() => onDecrease(item.productId, item.size)}
                        className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-dark active:scale-90 transition-transform"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => onIncrease(item.productId, item.size)}
                        className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center shadow-sm text-white active:scale-90 transition-transform"
                      >
                        <Plus size={14} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 opacity-50">
             <p className="text-gray-400">Your cart is empty</p>
          </div>
        )}

      </div>

      {/* --- BOTTOM ACTION BAR --- */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent pt-20">
        <button className="w-full bg-brand-red text-white font-bold py-4 rounded-3xl shadow-lg shadow-red-200 active:scale-95 transition-transform flex justify-between items-center px-6">
          <span>Place Order</span>
          <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
            $ {subtotal.toFixed(2)}
          </span>
        </button>
      </div>

    </div>
  );
}