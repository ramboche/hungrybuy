"use client";

import Header from "@/components/layout/Header";
import SectionTitle from "@/components/ui/SectionTitle";
import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ProductDialog from "@/components/ui/ProductDialog";
import Loading from "@/components/other/Loading";
import { MenuItem, Category } from "@/lib/types";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { api } from "@/lib/api";
import QRHandler from "@/components/auth/QRHandler";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useApiAuthError } from "@/hooks/useApiAuthError";
import { Loader2 } from "lucide-react";
import SortBy from "@/components/ui/SortBy";
import HomeSearchHandler from "@/components/search/HomeSearchHandler";
import SearchOverlay from "@/components/search/SearchOverlay";

export default function Home() {
  const [tableParam, setTableParam] = useState<string | null>(null);
  const [categoryIdFromUrl, setCategoryIdFromUrl] = useState<string | null>(
    null,
  );
  const [highlightIdFromUrl, setHighlightIdFromUrl] = useState<string | null>(
    null,
  );

  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { handleAuthError } = useApiAuthError();

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">(
    "all",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [sortOrder, setSortOrder] = useState<string>("popular");

  const [products, setProducts] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  const { cart, addToCart, updateQuantity, resolveTableFromToken } = useCart();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      if (tableParam) {
        localStorage.setItem("pending_table_scan", tableParam);
      }
      router.push("/login");
    }
  }, [isLoading, user, router, tableParam]);

  useEffect(() => {
    if (user) {
      const pendingTable = localStorage.getItem("pending_table_scan");

      if (pendingTable) {
        resolveTableFromToken(pendingTable);
        localStorage.removeItem("pending_table_scan");
        router.replace("/");
      }
    }
  }, [user, resolveTableFromToken, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMenu = useCallback(
    async (isLoadMore: boolean = false, cursorToUse: string | null = null) => {
      try {
        if (isLoadMore) {
          setIsFetchingMore(true);
        } else {
          setIsMenuLoading(true);
        }

        const params = new URLSearchParams({ limit: "20" });

        if (isLoadMore && cursorToUse) {
          params.append("cursor", cursorToUse);
        }

        if (selectedCategory !== "all") {
          params.append("categoryId", selectedCategory);
        }

        if (dietFilter !== "all") {
          params.append("foodType", dietFilter === "veg" ? "VEG" : "NON_VEG");
        }

        if (debouncedSearchQuery.trim().length >= 2) {
          params.append("search", debouncedSearchQuery.trim());
        }

        if (sortOrder !== "popular") {
          params.append("sortBy", "price");
          params.append("sortOrder", sortOrder);
        }

        const endpoint = `/menu?${params.toString()}`;
        const res = await api.get(endpoint);
        const data = res.data.data;
        const dbProducts = data.items;

      const readyProducts = dbProducts.map((p: MenuItem) => ({
        ...p,
        qty: 42,
      }));

        if (isLoadMore) {
          setProducts((prev) => [...prev, ...readyProducts]);
        } else {
          setProducts(readyProducts);
        }

        setNextCursor(data.pagination.nextCursor);
        setHasNextPage(data.pagination.hasNextPage);
      } catch (error) {
        handleAuthError(error, "Failed to load menu");
      } finally {
        setIsMenuLoading(false);
        setIsFetchingMore(false);
      }
    },
    [
      handleAuthError,
      selectedCategory,
      dietFilter,
      debouncedSearchQuery,
      sortOrder,
    ],
  );

  useEffect(() => {
    if (!user) return;

    setNextCursor(null);
    setHasNextPage(false);

    fetchMenu(false, null);
  }, [fetchMenu, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingMore) {
          fetchMenu(true, nextCursor);
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingMore, fetchMenu, nextCursor]);

  useEffect(() => {
    if (!user) return;

    const fetchCategoreies = async () => {
      try {
        const res = await api.get("/categories");
        const dbCategories: Category[] = res.data.data.categories;
        setCategories(dbCategories);
      } catch (error) {
        handleAuthError(error, "Failed to load categories");
      }
    };

    fetchCategoreies();
  }, [user, handleAuthError]);

  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
    }

    if (highlightIdFromUrl) {
      const checkExist = setInterval(() => {
        const element = document.getElementById(
          `product-${highlightIdFromUrl}`,
        );

        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });

          clearInterval(checkExist);
          const url = new URL(window.location.href);
          url.searchParams.delete('highlight');
          url.searchParams.delete('categoryId');
          window.history.replaceState({}, '', url.toString());
        }
      }, 500);
      setTimeout(() => clearInterval(checkExist), 2000);

      return () => clearInterval(checkExist);
    }
  }, [categoryIdFromUrl, highlightIdFromUrl]);

  if (isLoading) {
    return <Loading />;
  }

  if (!user) return null;

  // --- Helpers ---
  const getTotalCartCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getProductTotalQty = (productId: string) => {
    return cart
      .filter((item) => item.menuItem.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const findCartItem = (productId: string, variantId?: string) => {
    return cart.find(
      (item) =>
        item.menuItem.id === productId &&
        (variantId ? item.variant?.id === variantId : !item.variant),
    );
  };

  // --- Event Handlers ---
  const increaseSingleItem = async (product: MenuItem) => {
    const existingItem = findCartItem(product.id);

    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      await addToCart(product, 1);
    }
  };

  const decreaseSingleItem = async (productId: string) => {
    const existingItem = findCartItem(productId);
    if (existingItem) {
      await updateQuantity(existingItem.id, existingItem.quantity - 1);
    }
  };

  const handleDialogSave = async (quantities: Record<string, number>) => {
    if (!selectedProduct) return;

    for (const [variantLabel, newQty] of Object.entries(quantities)) {
      const variantObj = selectedProduct.variants?.find(
        (v) => v.label === variantLabel,
      );
      const variantId = variantObj?.id;

      if (!variantId) continue;

      const existingItem = findCartItem(selectedProduct.id, variantId);

      if (existingItem) {
        await updateQuantity(existingItem.id, newQty);
      } else if (newQty > 0) {
        await addToCart(selectedProduct, newQty, variantObj);
      }
    }
  };

  const handleCardAddClick = async (product: MenuItem) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setIsDialogOpen(true);
    } else {
      await addToCart(product, 1);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === selectedCategory) {
      setSelectedCategory("all");
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const currentCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => c.id === selectedCategory)?.name || "Products";

  return (
    <main className="h-dvh w-full bg-white relative flex flex-col overflow-hidden">
      <Suspense fallback={null}>
        <QRHandler />
      </Suspense>

      <Suspense fallback={null}>
        <HomeSearchHandler
          onTableParam={setTableParam}
          onCategoryParam={setCategoryIdFromUrl}
          onHighlightParam={setHighlightIdFromUrl}
        />
      </Suspense>

      {/* 1. Header Section (Sticky at the top) */}
      <div className="w-full px-4 sm:px-6 shrink-0 z-20 bg-white pt-2">
        <Header
          cartCount={getTotalCartCount()}
          onCartClick={() => router.push("/cart")}
          onSearchOpen={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide w-full flex flex-col relative">
        {/* 2. Categories (Now Horizontal) */}
        <div className="px-4 sm:px-6">
          <Categories
            categories={categories}
            selectedCategory={selectedCategory}
            onClickCategory={handleCategoryClick}
            activeDietFilter={dietFilter}
            onFilterChange={setDietFilter}
          />
        </div>

        {/* 4. Section Title & Sort By */}
        <div className="px-4 sm:px-6 mt-4 flex items-start justify-between">
          <SectionTitle
            categoryName={currentCategoryName}
            categorydescription={
              selectedCategory === "all"
                ? "Explore our delicious menu"
                : "Freshly made with premium ingredients"
            }
          />
          {/* Pushed slightly down to align with the title text nicely */}
          <div className="mt-1">
            <SortBy sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>
        </div>

        {/* 5. Products List */}
        <div className="px-4 sm:px-6 pb-28">
          <FeaturedProducts
            products={products}
            isLoading={isMenuLoading}
            getProductTotalQty={getProductTotalQty}
            onAddClick={handleCardAddClick}
            onIncrease={increaseSingleItem}
            onDecrease={decreaseSingleItem}
            onClearFilters={() => {
              setDietFilter("all");
              setSelectedCategory("all");
              setSearchQuery("");
            }}
          />

          {/* Infinite Scroll Loader */}
          <div
            ref={observerTarget}
            className="w-full h-10 mt-6 flex justify-center items-center"
          >
            {isFetchingMore && (
              <Loader2 className="animate-spin text-brand-orange" size={24} />
            )}
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDialog
        key={
          selectedProduct?.id
            ? `${selectedProduct.id}-${isDialogOpen}`
            : "dialog-reset"
        }
        isOpen={isDialogOpen}
        product={selectedProduct}
        initialData={
          selectedProduct
            ? cart
                .filter((i) => i.menuItem.id === selectedProduct.id)
                .reduce(
                  (acc, item) => {
                    if (item.variant) acc[item.variant.label] = item.quantity;
                    return acc;
                  },
                  {} as Record<string, number>,
                )
            : {}
        }
        onClose={() => setIsDialogOpen(false)}
        onSave={handleDialogSave}
      />

      {isSearchOpen && (
        <SearchOverlay onClose={() => setIsSearchOpen(false)} />
      )}
    </main>
  );
}
