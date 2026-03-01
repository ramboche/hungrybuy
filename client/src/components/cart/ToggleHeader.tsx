interface ToggleHeaderProps {
    activeTab: 'cart' | 'orders';
    setActiveTab: (tab: 'cart' | 'orders') => void;
    scrollProgress: number;
}

export default function ToggleHeader({
    activeTab,
    setActiveTab,
    scrollProgress
}: ToggleHeaderProps) {
    return (
        <div className="relative flex bg-white border-b border-gray-200 shrink-0">
            <button
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-3 text-sm font-bold transition-colors duration-200 ${activeTab === 'cart' ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                Cart
            </button>
            <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-sm font-bold transition-colors duration-200 ${activeTab === 'orders' ? 'text-brand-orange' : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                Orders
            </button>

            <div
                className="absolute bottom-0 left-0 h-0.75 w-1/2 bg-brand-orange rounded-t-md"
                style={{
                    transform: `translateX(${scrollProgress * 100}%)`,
                }}
            />
        </div>
    );
}