export function OrderCardSkeleton() {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 animate-pulse">

            <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded-md w-20"></div>
            </div>

            <div className="space-y-3 mb-5">
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-9 bg-gray-200 rounded-lg w-28"></div>
            </div>
        </div>
    );
}