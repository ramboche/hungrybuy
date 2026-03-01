export default function TableStatusCard() {
    return (
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 mb-6 mt-2">
            
            <div className="flex flex-col">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Table #12
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                    Order ID: #HB-9283
                </p>
            </div>
            
            <span className="bg-brand-orange-light text-brand-orange text-xs font-bold px-4 py-1.5 rounded-full shrink-0">
                Dine In
            </span>
            
        </div>
    );
}