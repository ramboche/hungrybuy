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
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApiAuthError } from "@/hooks/useApiAuthError";
import Section from "@/components/layout/Section";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { handleAuthError } = useApiAuthError();

  const [isViewAll, setIsViewAll] = useState(false);

  // --- NEW STATES FOR FETCHING ---
  const [isFullMenuLoaded, setIsFullMenuLoaded] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  const { cart, addToCart, updateQuantity } = useCart();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // --- REFACTORED FETCH MENU FUNCTION ---
  const fetchMenu = useCallback(async (fetchAll: boolean) => {
    try {
      if (fetchAll) {
        setIsFetchingMore(true);
      } else {
        setIsMenuLoading(true);
      }

      // 1. Pass a limit query parameter for the initial load
      const endpoint = fetchAll ? "/menu" : "/menu?limit=5";
      const res = await api.get(endpoint);
      const dbProducts = res.data.data.items;

      const readyProducts = dbProducts.map((p: Product) => ({
        ...p,
        image: "/images/burgers.jpeg",
        qty: 42, // Ensure this matches your actual schema needs
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

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (!user) return;

    const fetchCategoreies = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.data.categories);
      } catch (error) {
        handleAuthError(error, "Failed to load categories");
      }
    };

    fetchMenu(false); // Fetch only featured items first
    fetchCategoreies();
  }, [user, fetchMenu, handleAuthError]);

  // --- TRIGGER FULL LOAD WHEN 'SEE ALL' IS CLICKED ---
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

  // --- Filter Logic ---
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

      <div className={`flex-1 overflow-y-auto scrollbar-hide pb-24 h-full flex flex-col`}>
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
                // We slice it here as a safety net just in case the backend ignores the ?limit=5 parameter
                products={isViewAll ? filteredProducts : filteredProducts.slice(0, 5)}
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
    </main>
  );
}