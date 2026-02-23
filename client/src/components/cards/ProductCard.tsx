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
  const hasSizes = product.variants && product.variants.length > 0;

  const handleCounterClick = hasSizes ? onAddClick : onIncrease;
  const handleCounterDecrease = hasSizes ? onAddClick : onDecrease;

  const displayPrice = hasSizes
    ? (Math.min(...product.variants!.map(s => s.price)))
    : (product.price);

  const imageUrl = product.image
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
    : null;

  return (
    <div className="group bg-white rounded-3xl p-2 flex flex-col shadow-sm hover:shadow-md transition-all duration-300 w-full h-full">

      <div className="relative w-full aspect-4/3 shrink-0 rounded-[20px] overflow-hidden bg-gray-50">
        <Image
          src={imageUrl || '/images/burgers.jpeg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 150px, 200px"
          unoptimized={true}
        />

        <div className="absolute top-2 right-2 z-10">
          <RatingBadge rating={product.rating ?? 4.8} />
        </div>
      </div>

      <div className="flex flex-row flex-1 px-1 pb-1 pt-2 gap-2 h-full">
        {/* Left Side: Name and Price */}
        <div className="flex flex-col flex-1 justify-between min-w-0">
          <h3 className="font-bold text-[12px] text-brand-dark leading-snug">
            {product.name}
          </h3>
          <div className="mt-auto">
            <span className="text-brand-red font-bold text-[15px]">${displayPrice}</span>
          </div>
        </div>

        {/* Right Side: The New Vertical Button */}
        <div className="shrink-0 flex flex-col justify-end relative w-8">
          <div className={`transition-all duration-100 ease-out ${cartQty > 0 ? 'h-22' : 'h-7'}`} />
          <div
            className={`absolute bottom-0 left-0 w-full transition-all duration-100 ease-out origin-bottom
              ${cartQty > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
            `}
          >
            <QuantityBtn
              count={cartQty > 0 ? cartQty : 1}
              onIncrease={handleCounterClick}
              onDecrease={handleCounterDecrease}
            />
          </div>

          <div
            className={`absolute bottom-0 left-0 w-full transition-all duration-100 ease-out origin-bottom
              ${cartQty > 0 ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'}
            `}
          >
            <button
              onClick={onAddClick}
              className="w-8 h-7 bg-brand-red rounded-lg flex items-center justify-center shadow-md text-white active:scale-90 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}