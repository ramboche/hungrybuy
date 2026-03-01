import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { MenuItem, Category } from "@/lib/types";

const globalCache = {
    categories: null as Category[] | null,
    menu: {} as Record<string, { items: MenuItem[]; nextCursor: string | null; hasNextPage: boolean }>,
};

const generateCacheKey = (category: string, diet: string, search: string, sort: string) => {
    return `${category}-${diet}-${search}-${sort}`;
};

// --- HOOK 1: CATEGORIES ---
export const useCategories = (user: any, handleAuthError: any) => {
    const [categories, setCategories] = useState<Category[]>(globalCache.categories || []);

    useEffect(() => {
        if (!user) return;

        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                const dbCategories: Category[] = res.data.data.categories;

                globalCache.categories = dbCategories;
                setCategories(dbCategories);
            } catch (error) {
                handleAuthError(error, "Failed to load categories");
            }
        };

        if (!globalCache.categories) {
            fetchCategories();
        } 
    }, [user, handleAuthError]);

    return categories;
};

export const useMenu = (
    user: any,
    selectedCategory: string,
    dietFilter: string,
    debouncedSearchQuery: string,
    sortOrder: string,
    handleAuthError: any
) => {
    const cacheKey = generateCacheKey(selectedCategory, dietFilter, debouncedSearchQuery, sortOrder);

    const cachedData = globalCache.menu[cacheKey];

    const [products, setProducts] = useState<MenuItem[]>(cachedData?.items || []);
    const [nextCursor, setNextCursor] = useState<string | null>(cachedData?.nextCursor || null);
    const [hasNextPage, setHasNextPage] = useState<boolean>(cachedData?.hasNextPage || false);

    const [isMenuLoading, setIsMenuLoading] = useState(!cachedData);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchMenu = useCallback(
        async (isLoadMore: boolean = false, cursorToUse: string | null = null) => {
            if (!user) return;

            try {
                if (isLoadMore) setIsFetchingMore(true);
                else if (!globalCache.menu[cacheKey]) setIsMenuLoading(true);

                const params = new URLSearchParams({ limit: "20" });

                if (isLoadMore && cursorToUse) params.append("cursor", cursorToUse);
                if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
                if (dietFilter !== "all") params.append("foodType", dietFilter === "veg" ? "VEG" : "NON_VEG");
                if (debouncedSearchQuery.trim().length >= 2) params.append("search", debouncedSearchQuery.trim());
                if (sortOrder !== "popular") {
                    params.append("sortBy", "price");
                    params.append("sortOrder", sortOrder);
                }

                const endpoint = `/menu?${params.toString()}`;
                const res = await api.get(endpoint);
                const data = res.data.data;

                const readyProducts = data.items.map((p: MenuItem) => ({
                    ...p,
                    qty: 42,
                }));

                setProducts((prev) => {
                    const newProducts = isLoadMore ? [...prev, ...readyProducts] : readyProducts;

                    globalCache.menu[cacheKey] = {
                        items: newProducts,
                        nextCursor: data.pagination.nextCursor,
                        hasNextPage: data.pagination.hasNextPage,
                    };

                    return newProducts;
                });

                setNextCursor(data.pagination.nextCursor);
                setHasNextPage(data.pagination.hasNextPage);
            } catch (error) {
                handleAuthError(error, "Failed to load menu");
            } finally {
                setIsMenuLoading(false);
                setIsFetchingMore(false);
            }
        },
        [user, cacheKey, selectedCategory, dietFilter, debouncedSearchQuery, sortOrder, handleAuthError]
    );

    useEffect(() => {
        const currentCache = globalCache.menu[cacheKey];
        setProducts(currentCache?.items || []);
        setNextCursor(currentCache?.nextCursor || null);
        setHasNextPage(currentCache?.hasNextPage || false);
        setIsMenuLoading(!currentCache);

        fetchMenu(false, null);
    }, [cacheKey, fetchMenu]);

    return {
        products,
        nextCursor,
        hasNextPage,
        isMenuLoading,
        isFetchingMore,
        fetchMenu,
    };
};