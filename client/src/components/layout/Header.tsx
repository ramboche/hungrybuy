'use client';

import { ShoppingBag, Search } from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartCount = 0, onCartClick }: HeaderProps) {
  return (
    <div className="py-5 flex flex-col gap-6">
      <div className="flex gap-4 items-center">
        
        {/* LEFT: Cart Button (Replaced Menu) */}
        <button 
          onClick={onCartClick}
          className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 relative shrink-0 active:scale-90 transition-transform"
        >
          <ShoppingBag size={24} />
          
          {/* Optional: Cart Count Badge */}
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-brand-red text-xs font-bold flex items-center justify-center rounded-full border-2 border-brand-red">
              {cartCount}
            </span>
          )}
        </button>
        
        {/* RIGHT: Search Bar (Kept exactly as yours) */}
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search your favorite food...." 
            className="w-full h-12 bg-white rounded-full pl-6 pr-12 text-sm text-gray-600 outline-none border border-transparent focus:border-brand-red transition-all shadow-sm"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-black" size={20} />
        </div>

      </div>
    </div>
  );
}