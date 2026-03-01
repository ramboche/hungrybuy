import { ArrowLeft } from 'lucide-react';

interface CartHeaderProps {
    onBack: () => void;
}

export default function CartHeader({ onBack }: CartHeaderProps) {
    return (
        <div className="flex items-center justify-between px-6 py-3 shrink-0 relative">

            <button
                onClick={onBack}
                className="p-1 -ml-1 text-gray-900 active:scale-90 transition-transform rounded-full hover:bg-gray-100 z-10"
            >
                <ArrowLeft size={24} strokeWidth={2.5} />
            </button>

            <h1 className="text-lg font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                Your Order
            </h1>

            <div className="w-8"></div>
        </div>
    );
}