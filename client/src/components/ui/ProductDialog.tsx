'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/lib/types';
import QuantityBtn from './QuantityButton';
import { useState, useEffect } from 'react';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  // NEW: Receive existing data and return full object
  initialData: Record<string, number>; 
  onSave: (quantities: Record<string, number>) => void;
}

export default function ProductDialog({ product, isOpen, onClose, initialData, onSave }: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      // FIX: Load the existing data instead of resetting to empty
      setQuantities(initialData || {});
      console.log("Dialog Open. Loaded:", initialData);
    }
  }, [isOpen, product, initialData]);

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
    // Send the WHOLE object back to page.tsx, not just the total
    onSave(quantities); 
    onClose();
  };

  const sizeList = product.sizes || [];

  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-40 transition-opacity backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl shadow-2xl animate-slide-up max-w-md mx-auto max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
               <div className="w-16 h-16 relative rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                 {product.image && product.image.trim() !== "" ? (
                   <Image src={product.image} alt={product.name} fill className="object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gray-200" />
                 )}
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
            <div key={size.name} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div>
                <span className="font-semibold text-sm sm:text-base text-brand-dark block">{size.name}</span>
                <span className="text-brand-red font-bold text-sm sm:text-base">$ {size.price.toFixed(2)}</span>
              </div>
              <QuantityBtn 
                count={quantities[size.name] || 0}
                onIncrease={() => handleIncrease(size.name)}
                onDecrease={() => handleDecrease(size.name)}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 bg-white shrink-0 pb-8 sm:pb-6">
          <button 
            onClick={handleSaveBtn}
            className="w-full bg-brand-red text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition-transform"
          >
            Update Cart
          </button>
        </div>
      </div>
    </>
  );
}