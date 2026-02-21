import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { BackendCartItem } from '@/lib/types';

interface CartProductCardProps {
    item: BackendCartItem;
    onIncrease: (cartItemId: string) => void;
    onDecrease: (cartItemId: string) => void;
}

export default function CartProductCard({ item, onIncrease, onDecrease }: CartProductCardProps) {
    const price: number = item.variant ? item.variant.price : item.menuItem.price!;

    const imageUrl = item.menuItem.image
        ? `${process.env.NEXT_PUBLIC_API_URL}${item.menuItem.image}`
        : null;

    return (
        <div key={item.id} className="bg-white rounded-3xl p-3 flex gap-4 shadow-sm">
            {/* Image (Local Lookup) */}
            <div className="relative w-24 h-24 shrink-0 bg-gray-100 rounded-2xl overflow-hidden">
                <Image
                    src={imageUrl || '/images/burgers.jpeg'}
                    alt={item.menuItem.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                />
            </div>

            {/* Info (Backend Data) */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-brand-dark text-sm line-clamp-1">
                        {item.menuItem.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.variant ? item.variant.label : 'Standard'}
                    </p>
                    <div className="mt-1 font-bold text-brand-red">
                        $ {price}
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
}