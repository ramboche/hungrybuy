'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchHeader from '@/components/search/SearchHeader';
import SearchResultCard from '@/components/search/SearchResultCard';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [pageLoaded, setPageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setPageLoaded(true), 150);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = await api.get('/menu', {
                    params: {
                        search: query.trim(),
                        limit: 20,
                    }
                });

                setResults(res.data.data.items || []);
            } catch (error) {
                console.error("Search failed", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchResults, 400);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleResultClick = (categoryId: string, productId: string) => {
        router.push(`/?categoryId=${categoryId}&highlight=${productId}`);
    };

    return (
        <div className="min-h-dvh bg-gray-50 flex flex-col">
            <SearchHeader query={query} setQuery={setQuery} />

            <div className={`flex-1 overflow-y-auto px-4 pt-4 pb-20 transition-opacity duration-500 ease-in-out
          ${pageLoaded ? 'opacity-100' : 'opacity-0'}
        `}>
                {query.trim().length >= 2 && (
                    <p className="text-sm text-gray-500 mb-4 font-medium px-1">
                        {isLoading ? 'Searching...' : `Found ${results.length} results`}
                    </p>
                )}

                {query.trim().length === 1 && (
                    <p className="text-sm text-gray-500 text-center mt-10">
                        Type at least 2 characters to search...
                    </p>
                )}

                <div className="flex flex-col">
                    {results.map((product) => (
                        <SearchResultCard
                            key={product.id}
                            product={product}
                            onClick={handleResultClick}
                        />
                    ))}
                </div>

                {!isLoading && results.length > 0 && (
                    <p className="text-center text-xs text-gray-400 mt-6 pb-6">End of results</p>
                )}
            </div>
        </div>
    );
}