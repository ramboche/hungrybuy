import { ArrowRight, Loader2 } from 'lucide-react';
import { BackendCartItem } from '@/lib/types';

interface CartFooterProps {
    totalAmount: number;
    isPlacing: boolean;
    cartItems: BackendCartItem[];
    handlePlaceOrderClick: () => void;
}

export default function CartFooter({ totalAmount, isPlacing, cartItems, handlePlaceOrderClick }: CartFooterProps) {
    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white rounded-t-4xl shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.05)] z-20">

            <div className="flex justify-between items-end mb-6 px-1">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-gray-900">
                    ${totalAmount.toFixed(2)}
                </span>
            </div>

            <button
                onClick={handlePlaceOrderClick}
                disabled={isPlacing || cartItems.length === 0}
                className="w-full bg-brand-orange text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform flex justify-center items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
                {isPlacing ? (
                    <>
                        <Loader2 className="animate-spin" size={22} />
                        <span>Placing Order...</span>
                    </>
                ) : (
                    <>
                        <span>Place Order</span>
                        <ArrowRight size={20} strokeWidth={2.5} />
                    </>
                )}
            </button>
        </div>
    );
}