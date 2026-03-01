'use client';

import { ArrowLeft, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Props {
    query: string;
    setQuery: (val: string) => void;
}

export default function SearchHeader({ query, setQuery }: Props) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const animationTimer = setTimeout(() => {
            setIsAnimating(false);
        }, 10);

        const focusTimer = setTimeout(() => {
            inputRef.current?.focus();
        }, 100);

        return () => {
            clearTimeout(animationTimer);
            clearTimeout(focusTimer);
        };
    }, []);

    return (
        <div className="bg-white sticky top-0 z-20 border-b border-gray-50">
            <div
                className={`flex items-center gap-3 py-4 px-4 transition-all duration-50 ease-out transform
                    ${isAnimating ? ' opacity-0' : 'opacity-100'}
                `}
            >
                <button
                    onClick={() => router.back()}
                    className={`p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-opacity duration-300 delay-50 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="relative flex-1 shadow-sm rounded-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for dishes, drinks..."
                        className="w-full h-10 bg-gray-50 rounded-xl pl-10 pr-10 text-base font-medium text-gray-600 outline-none focus:ring-1 focus:ring-brand-orange/20 transition-all shadow-inner"
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
        </div>
    );
}