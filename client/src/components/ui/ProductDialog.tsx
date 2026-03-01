'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { MenuItem } from '@/lib/types';
import QuantityBtn from './QuantityButton';
import { useState } from 'react';

interface Props {
  product: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  initialData: Record<string, number>;
  onSave: (quantities: Record<string, number>) => void;
}

export default function ProductDialog({ product, isOpen, onClose, initialData, onSave }: Props) {

  const [quantities, setQuantities] = useState<Record<string, number>>(initialData || {});

  if (!isOpen || !product) return null;

  const handleIncrease = (sizeName: string) => {
    setQuantities(prev => ({ ...prev, [sizeName]: (prev[sizeName] || 0) + 1 }));
  };

  const handleDecrease = (sizeName: string) => {
    setQuantities(prev => {
      const current = prev[sizeName] || 0;
      if (current <= 0) return prev;
      return { ...prev, [sizeName]: current - 1 };
    });
  };

  const handleSaveBtn = () => {
    onSave(quantities);
    onClose();
  };

  const imageUrl = product.image
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
    : null;

  const sizeList = product.variants || [];

  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-[2px]" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl shadow-2xl animate-slide-up max-w-md mx-auto max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                <Image src={imageUrl || '/images/burgers.jpeg'} alt={product.name} fill className="object-cover" unoptimized={true} />
              </div>
              <div>
                <h3 className="font-bold text-lg sm:text-xl text-brand-dark leading-tight pr-4">{product.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 shrink-0">
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto px-6 py-2 space-y-4 scrollbar-hide min-h-25">
          {sizeList.map((size) => (
            <div key={size.label} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div>
                <span className="font-semibold text-sm sm:text-base text-brand-dark block">{size.label}</span>
                <span className="text-brand-orange/85 font-bold text-sm sm:text-base">$ {(size.price)}</span>
              </div>
              <QuantityBtn
                count={quantities[size.label] || 0}
                onIncrease={() => handleIncrease(size.label)}
                onDecrease={() => handleDecrease(size.label)}
                onAddClick={() => handleIncrease(size.label)}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 bg-white shrink-0 pb-8 sm:pb-6">
          <button
            onClick={handleSaveBtn}
            className="w-full bg-brand-orange text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-100 active:scale-95 transition-transform"
          >
            Update Cart
          </button>
        </div>
      </div>
    </>
  );
}