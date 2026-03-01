'use client';

import Image from 'next/image';
import RatingBadge from '../ui/RatingBadge';
import { MenuItem } from '@/lib/types';
import QuantityBtn from '../ui/QuantityButton';

interface Props {
  product: MenuItem;
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
    <div id={`product-${product.id}`} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 flex flex-col w-full group">

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
          <QuantityBtn
            count={cartQty}
            onIncrease={handleCounterClick}
            onDecrease={handleCounterDecrease}
            onAddClick={onAddClick}
          />
        </div>

      </div>
    </div>
  );
}