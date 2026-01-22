'use client';

import Image from 'next/image';
import RatingBadge from '../ui/RatingBadge';
import QuantityBtn from '../ui/QuantityButton'; 
import { Product } from '@/lib/types';
import { Plus } from 'lucide-react';

interface Props {
  product: Product;
  cartQty: number;
  onAddClick: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function ProductCard({ product, cartQty, onAddClick, onIncrease, onDecrease }: Props) {
  const hasSizes = product.sizes && product.sizes.length > 0;

  const handleCounterClick = hasSizes ? onAddClick : onIncrease;
  const handleCounterDecrease = hasSizes ? onAddClick : onDecrease;

  const displayPrice = hasSizes 
    ? Math.min(...product.sizes!.map(s => s.price)) 
    : product.price;

  return (
    // Added 'min-h-[140px]' to ensure consistent height across different contents
    <div className="group bg-white rounded-3xl p-3 flex gap-3 sm:gap-4 shadow-sm hover:shadow-lg transition-all duration-300 w-full min-h-35">
      
      {/* Image: Slightly smaller on tiny screens (w-28) -> Standard (w-32) */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 self-center"> 
        <div className="w-full h-full rounded-2xl overflow-hidden relative bg-gray-100">
             <RatingBadge rating={product.rating} />
             {/* Sizes prop helps browser load right image size */}
             <Image 
               src={product.image} 
               alt={product.name} 
               fill 
               className="object-cover transition-transform duration-500 group-hover:scale-110"
               sizes="(max-width: 640px) 112px, 128px"
             />
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between min-h-28"> 
        <div>
          {/* Title scales down slightly on mobile to prevent wrapping issues */}
          <h3 className="font-bold text-base sm:text-lg text-brand-dark leading-tight line-clamp-2 sm:line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-[10px] text-gray-400 font-medium block mb-0.5">
              {hasSizes ? 'Starts from' : 'Price'}
            </span>
            <span className="text-brand-red font-bold text-lg">
              $ {displayPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="shrink-0 mb-0.5">
            {cartQty > 0 ? (
               // Scale down counter slightly on very small screens
               <div className="scale-90 origin-right sm:scale-100">
                  <QuantityBtn 
                    count={cartQty}
                    onIncrease={handleCounterClick}
                    onDecrease={handleCounterDecrease}
                  />
               </div>
            ) : (
              <button 
                onClick={onAddClick} 
                // Increased touch target size slightly
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-full text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform bg-brand-red"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}