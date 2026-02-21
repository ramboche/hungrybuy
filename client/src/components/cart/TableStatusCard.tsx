export default function TableStatusCard() {
    return (
        <div className="bg-white rounded-3xl p-4 flex items-center justify-between shadow-sm mb-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-brand-red">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                    </svg>
                </div>
                <div>
                    <h3 className="font-bold text-brand-dark text-sm">Table Service</h3>
                    <p className="text-xs text-gray-400">Dine-in</p>
                </div>
            </div>
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full border border-green-100">
                ACTIVE
            </span>
        </div>
    );
}