'use client';

import { useCart } from '@/hooks/useCart';
import { Variant } from '@/lib/types';
import { MenuItem } from '@/lib/types';
import { useState } from 'react';

export interface BackendOrder {
    id: string;
    status: string;
    totalAmount: number;
    createdAt: Date;
    items: {
        id: string;
        quantity: number;
        price: number;
        menuItem: MenuItem;
        variant: Variant | null;
    }[];
}

export default function OrderCard({ order, onActiveTabChange }: { order: BackendOrder, onActiveTabChange: () => void }) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleOrderAgain = async () => {
        setIsAdding(true);
        try {
            console.log(order)
            for (const item of order.items) {
                console.log(item)
                await addToCart(item.menuItem, item.quantity, item.variant || undefined);
            }
        } finally {
            setIsAdding(false);
            onActiveTabChange();
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800 text-sm">Order #{order.id.slice(-4).toUpperCase()}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium uppercase tracking-wider">
                    {order.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                        <span>
                            {item.quantity}x {item.menuItem.name}
                            {item.variant && <span className="text-xs text-gray-400 ml-1">({item.variant.label})</span>}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                <span className="font-bold text-gray-900">Total: ₹{order.totalAmount}</span>
                <button
                    onClick={handleOrderAgain}
                    disabled={isAdding}
                    className="px-4 py-2 bg-brand-orange/10 text-brand-orange text-sm font-bold rounded-lg hover:bg-brand-orange/20 transition-colors disabled:opacity-50"
                >
                    {isAdding ? 'Adding...' : 'Order Again'}
                </button>
            </div>
        </div>
    );
}