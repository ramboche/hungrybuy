export default function CartPageEmpty() {
    return (
        <div className="text-center py-24 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                <span className="text-2xl opacity-50">🛒</span>
            </div>
            <p className="text-gray-900 font-bold text-lg">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-1">Add some delicious items to your order!</p>
        </div>
    );
}