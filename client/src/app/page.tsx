"use client";

import Header from "@/components/layout/Header";
import SectionTitle from "@/components/ui/SectionTitle";
import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ProductDialog from "@/components/ui/ProductDialog";
import Loading from "@/components/other/Loading";
import { MenuItem } from "@/lib/types";
import { useState, useEffect, Suspense, useMemo } from "react";
import { useCart } from "@/hooks/useCart";
import QRHandler from "@/components/auth/QRHandler";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useApiAuthError } from "@/hooks/useApiAuthError";
import { Loader2 } from "lucide-react";
import SortBy from "@/components/ui/SortBy";
import HomeSearchHandler from "@/components/search/HomeSearchHandler";
import SearchOverlay from "@/components/search/SearchOverlay";
import { api } from "@/lib/api";

import { useCategories } from "@/hooks/useMenuCache";

export default function Home() {
  const [tableParam, setTableParam] = useState<string | null>(null);
  const [categoryIdFromUrl, setCategoryIdFromUrl] = useState<string | null>(null);
  const [highlightIdFromUrl, setHighlightIdFromUrl] = useState<string | null>(null);

  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { handleAuthError } = useApiAuthError();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("popular");

  const { cart, addToCart, updateQuantity, resolveTableFromToken } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  const [allProducts, setAllProducts] = useState<MenuItem[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);


  const categories = useCategories(user, handleAuthError);

  useEffect(() => {
    if (!user) return;

    const fetchFullMenu = async () => {
      try {
        setIsMenuLoading(true);
        const res = await api.get("/menu");

        const dbProducts = res.data.data.items.map((p: MenuItem) => ({
          ...p,
          qty: 42,
        }));

        setAllProducts(dbProducts);
      } catch (error) {
        handleAuthError(error, "Failed to load full menu");
      } finally {
        setIsMenuLoading(false);
      }
    };

    fetchFullMenu();
  }, [user, handleAuthError]);

  const displayedProducts = useMemo(() => {
    let filtered = [...allProducts];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    if (dietFilter !== "all") {
      const dietValue = dietFilter === "veg" ? "VEG" : "NON_VEG";
      filtered = filtered.filter((p) => p.foodType === dietValue);
    }

    if (debouncedSearchQuery.trim().length >= 2) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (sortOrder !== "popular") {
      filtered.sort((a, b) => {
        if (sortOrder === "asc") return a.price! - b.price!;
        if (sortOrder === "desc") return b.price! - a.price!;
        return 0;
      });
    }

    return filtered;
  }, [allProducts, selectedCategory, dietFilter, debouncedSearchQuery, sortOrder]);

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

  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl);
    }

    if (highlightIdFromUrl) {
      const checkExist = setInterval(() => {
        const element = document.getElementById(`product-${highlightIdFromUrl}`);

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

  if (isLoading) return <Loading />;
  if (!user) return null;

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
      const variantObj = selectedProduct.variants?.find((v) => v.label === variantLabel);
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

      {/* 1. Header Section */}
      <div className="w-full px-4 sm:px-6 shrink-0 z-20 bg-white pt-2">
        <Header
          cartCount={getTotalCartCount()}
          onCartClick={() => router.push("/cart")}
          onSearchOpen={() => setIsSearchOpen(true)}
        />
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide w-full flex flex-col relative">
        {/* 2. Categories */}
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
          <div className="mt-1">
            <SortBy sortOrder={sortOrder} setSortOrder={setSortOrder} />
          </div>
        </div>

        {/* 5. Products List */}
        <div className="px-4 sm:px-6 pb-28">
          <FeaturedProducts
            products={displayedProducts}
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
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDialog
        key={selectedProduct?.id ? `${selectedProduct.id}-${isDialogOpen}` : "dialog-reset"}
        isOpen={isDialogOpen}
        product={selectedProduct}
        initialData={
          selectedProduct
            ? cart
              .filter((i) => i.menuItem.id === selectedProduct.id)
              .reduce((acc, item) => {
                if (item.variant) acc[item.variant.label] = item.quantity;
                return acc;
              }, {} as Record<string, number>)
            : {}
        }
        onClose={() => setIsDialogOpen(false)}
        onSave={handleDialogSave}
      />

      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}