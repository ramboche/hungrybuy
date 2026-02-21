import { ChevronLeft } from 'lucide-react';

interface CartHeaderProps {
    onBack: () => void;
}

export default function CartHeader({ onBack }: CartHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-6 shrink-0">
            <button
                onClick={onBack}
                className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark active:scale-90 transition-transform"
            >
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-brand-dark">Your Order</h1>
            <div className="w-10"></div>
        </div>
    );
}