'use client';

import { MenuItem } from '@/lib/types';

interface Props {
    product: MenuItem;
    onClick: (categoryId: string, productId: string) => void;
}

export default function SearchResultCard({ product, onClick }: Props) {
    const isVeg = product.foodType === 'VEG';
    const hasSizes = product.variants && product.variants.length > 0;
    const displayPrice = hasSizes
        ? (Math.min(...product.variants!.map(s => s.price)))
        : (product.price);

    return (
        <div
            onClick={() => onClick(product.categoryId, product.id)}
            className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-start gap-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all cursor-pointer mb-3"
        >
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 border ${isVeg ? 'border-[#10B981]' : 'border-[#EF4444]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`}></div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                        {product.name}
                    </h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 pr-2">
                    {product.description}
                </p>
            </div>

            <div className="shrink-0">
                <span className="font-extrabold text-brand-orange text-base">
                    ${displayPrice}
                </span>
            </div>
        </div>
    );
}