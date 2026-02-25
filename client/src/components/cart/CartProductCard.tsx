import Image from 'next/image';
import { BackendCartItem } from '@/lib/types';
import CartQuantityBtn from './CartQuantityBtn';

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
        <div className="bg-white rounded-2xl p-3 flex gap-4 mb-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50">
            <div className="relative w-20 h-20 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <Image
                    src={imageUrl || '/images/burgers.jpeg'}
                    alt={item.menuItem.name}
                    fill
                    className="object-cover"
                    unoptimized={true}
                />
            </div>

            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                    <h3 className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-1">
                        {item.menuItem.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">
                        {item.variant ? item.variant.label : ('Standard')}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="font-extrabold text-brand-orange text-base tracking-tight">
                        ${price}
                    </div>

                    <CartQuantityBtn
                        item={item}
                        onIncrease={() => onIncrease(item.id)}
                        onDecrease={() => onDecrease(item.id)}
                    />
                </div>
            </div>
        </div>
    );
}