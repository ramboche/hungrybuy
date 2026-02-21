import { Loader2 } from 'lucide-react';
import { BackendCartItem } from '@/lib/types';

interface CartFooterProps {
    totalAmount: number;
    isPlacing: boolean;
    cartItems: BackendCartItem[];
    handlePlaceOrderClick: () => void;
}

export default function CartFooter({ totalAmount, isPlacing, cartItems, handlePlaceOrderClick }: CartFooterProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent pt-20">
            <button
                onClick={handlePlaceOrderClick}
                disabled={isPlacing || cartItems.length === 0}
                className="w-full bg-brand-red text-white font-bold py-4 rounded-3xl shadow-lg shadow-red-200 active:scale-95 transition-transform flex justify-between items-center px-6 disabled:opacity-70 disabled:scale-100"
            >
                {isPlacing ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Placing Order...
                    </span>
                ) : (
                    <span>Place Order</span>
                )}

                <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">
                    $ {totalAmount}
                </span>
            </button>
        </div>
    );
}
