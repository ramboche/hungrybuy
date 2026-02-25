export default function TableStatusCard() {
    return (
        <div className="flex flex-col items-center justify-center mb-8 mt-2">
            <span className="bg-brand-orange-light text-brand-orange text-xs font-bold px-4 py-1.5 rounded-full mb-3">
                Dine In
            </span>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                Table #12
            </h2>
            
            <p className="text-sm text-gray-400 font-medium">
                Order ID: #HB-9283
            </p>
        </div>
    );
}