'use client';

import Image from 'next/image';
import RatingBadge from '../ui/RatingBadge';
import { Product } from '@/lib/types';

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

  const isNonVeg = product.foodType === 'NON_VEG';

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col w-full group">

      {/* 🔴 Top Section: Large Image & Overlays */}
      <div className="relative w-full h-48 sm:h-56 bg-gray-100 overflow-hidden shrink-0">
        <Image
          src={imageUrl || '/images/burgers.jpeg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 400px"
          unoptimized={true}
        />

        {/* Veg/Non-Veg Tag (Top Left) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isNonVeg ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} />
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
            {isNonVeg ? 'Non-Veg' : 'Veg'}
          </span>
        </div>

        {/* Rating Badge (Bottom Right) */}
        <div className="absolute bottom-3 right-3 z-10 bg-white rounded-md shadow-sm">
          <RatingBadge rating={product.rating ?? 4.8} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">

        {/* Title & Description */}
        <div className="mb-4">
          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-snug">
            {product.description || "A delicious meal prepared with the finest ingredients."}
          </p>
        </div>

        {/* Price & Add Button Row */}
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-brand-orange">
            ${displayPrice}
          </span>

          {/* Action Button Area */}
          <div className="relative w-29 h-10 flex items-center justify-end">

            <div
              className={`absolute right-0 flex items-center gap-3 bg-brand-orange-light rounded-xl p-1 border border-brand-orange/10 transition-all duration-300 ease-out origin-right
                ${cartQty > 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 translate-x-4 pointer-events-none'}
              `}
            >
              <button
                onClick={handleCounterDecrease}
                className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-700 active:scale-90 transition-transform font-bold"
              >
                -
              </button>

              <span className="text-sm font-bold w-4 text-center text-brand-orange">
                {cartQty > 0 ? cartQty : 1}
              </span>

              <button
                onClick={handleCounterClick}
                className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-sm text-white active:scale-90 transition-transform font-bold"
              >
                +
              </button>
            </div>
            <div
              className={`absolute right-0 transition-all duration-300 ease-out origin-right
                ${cartQty > 0 ? 'opacity-0 scale-75 translate-x-4 pointer-events-none' : 'opacity-100 scale-100 translate-x-0'}
              `}
            >
              <button
                onClick={onAddClick}
                className="px-5 h-10 bg-brand-orange-light text-brand-orange rounded-xl font-bold text-sm flex items-center gap-1 hover:bg-[#faeae0] active:scale-95 transition-all"
              >
                Add <span className="text-lg leading-none font-medium">+</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}