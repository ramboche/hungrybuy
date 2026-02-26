'use client';

import { ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface Props {
    query: string;
    setQuery: (val: string) => void;
}

export default function SearchHeader({ query, setQuery }: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="flex items-center gap-3 py-4 px-4 bg-white sticky top-0 z-10 border-b border-gray-50">
            <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={24} />
            </button>

            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange" size={18} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full h-11 bg-gray-50 rounded-xl pl-10 pr-10 text-base font-medium text-gray-900 outline-none focus:ring-1 focus:ring-brand-orange/20 transition-all"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}