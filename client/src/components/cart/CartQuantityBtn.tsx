import { Minus, Plus } from "lucide-react";

export default function CartQuantityBtn({ item, onIncrease, onDecrease }: {
    item: {
        id: string;
        quantity: number;
    };
    onIncrease: (id: string) => void;
    onDecrease: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
            <button
                onClick={() => onDecrease(item.id)}
                className="text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
            >
                <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center select-none">
                {item.quantity}
            </span>
            <button
                onClick={() => onIncrease(item.id)}
                className="text-gray-400 hover:text-gray-600 active:scale-90 transition-transform"
            >
                <Plus size={14} strokeWidth={2.5} />
            </button>
        </div>
    )
}