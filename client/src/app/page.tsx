"use client";

import Header from "@/components/layout/Header";
import SectionTitle from "@/components/ui/SectionTitle";
import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ProductDialog from "@/components/ui/ProductDialog";
import DietFilter from "@/components/ui/DietFilter";
import Loading from "@/components/other/Loading";
import { Product, Category } from "@/lib/types";
import { useState, useEffect, Suspense, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import QRHandler from "@/components/auth/QRHandler";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApiAuthError } from "@/hooks/useApiAuthError";
import Section from "@/components/layout/Section";
import { ArrowLeft } from "lucide-react";

export default function Home() {

  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { handleAuthError } = useApiAuthError();

  const [isViewAll, setIsViewAll] = useState(false);
  const [isFullMenuLoaded, setIsFullMenuLoaded] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">(
    "all",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  const { cart, addToCart, updateQuantity, resolveTableFromToken } = useCart();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const fetchMenu = useCallback(async (fetchAll: boolean) => {
    try {
      if (fetchAll) {
        setIsFetchingMore(true);
      } else {
        setIsMenuLoading(true);
      }

      const endpoint = fetchAll ? "/menu" : "/menu?limit=20";
      const res = await api.get(endpoint);
      const dbProducts = res.data.data.items;

      const readyProducts = dbProducts.map((p: Product) => ({
        ...p,
        qty: 42,
      }));

      setProducts(readyProducts);

      if (fetchAll) {
        setIsFullMenuLoaded(true);
      }
    } catch (error) {
      handleAuthError(error, "Failed to load menu");
    } finally {
      setIsMenuLoading(false);
      setIsFetchingMore(false);
    }
  }, [handleAuthError]);

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
    }

    fetchMenu(false);
    fetchCategoreies();

  }, [user, fetchMenu, handleAuthError]);

  useEffect(() => {
    if (isViewAll && !isFullMenuLoaded && user) {
      fetchMenu(true);
    }
  }, [isViewAll, isFullMenuLoaded, user, fetchMenu]);

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
  const increaseSingleItem = async (product: Product) => {
    await addToCart(product.id, 1);
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
        await addToCart(selectedProduct.id, newQty, variantId);
      }
    }
  };

  const handleCardAddClick = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setIsDialogOpen(true);
    } else {
      increaseSingleItem(product);
    }
  };


  // --- 2. Updated Filter Logic ---
  const filteredProducts = products.filter((product) => {
    const targetFoodType = dietFilter === "veg" ? "VEG" : "NON_VEG";

    const matchesDiet =
      dietFilter === "all" || product.foodType === targetFoodType;

    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDiet && matchesCategory && matchesSearch;
  });

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
      <Suspense fallback={null}>
        <QRHandler />
      </Suspense>

      <div
        className={`flex-1 overflow-y-auto scrollbar-hide pb-24 h-full flex flex-col`}
      >
        <div className="px-4 shrink-0 sticky top-0 z-20 bg-brand-bg">
          <Header
            cartCount={getTotalCartCount()}
            onCartClick={() => router.push("/cart")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={() => setIsViewAll(true)}
          />

        </div>
        <div className="px-4 shrink-0">
          {!isViewAll && (
            <div>
              <DietFilter activeFilter={dietFilter} onFilterChange={setDietFilter} />
            </div>
          )}


          {isViewAll && (
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsViewAll(false)}
                className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-red"
              >
                <ArrowLeft size={16} /> Back to Home
              </button>
            </div>
          )}
        </div>

        <div className="px-4 flex flex-col">
          {!isViewAll && (
            <Section className="mb-2">
              <SectionTitle title="Categories" />
              <Categories
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </Section>
          )}

          <Section>
            <SectionTitle
              title={isViewAll ? "All Products" : "Featured Product"}
              actionText={isViewAll ? "" : "See all"}
              onActionClick={isViewAll ? undefined : () => setIsViewAll(true)}
            />
            <div className={isViewAll ? "pb-safe min-h-screen" : ""}>
              <FeaturedProducts
                products={filteredProducts}
                isLoading={isMenuLoading || isFetchingMore}
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
          </Section>
        </div>
      </div>

      <ProductDialog
        key={selectedProduct?.id ? `${selectedProduct.id}-${isDialogOpen}` : 'dialog-reset'}
        isOpen={isDialogOpen}
        product={selectedProduct}
        initialData={
          selectedProduct
            ? cart
              .filter((i) => i.menuItem.id === selectedProduct.id)
              .reduce(
                (acc, item) => {
                  if (item.variant)
                    acc[item.variant.label] = item.quantity;
                  return acc;
                },
                {} as Record<string, number>,
              )
            : {}
        }
        onClose={() => setIsDialogOpen(false)}
        onSave={handleDialogSave}
      />
    </main>
  );
}
