"use client";

import Header from "@/components/layout/Header";
import SectionTitle from "@/components/ui/SectionTitle";
import Categories from "@/components/sections/Categories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ProductDialog from "@/components/ui/ProductDialog";
import DietFilter from "@/components/ui/DietFilter";
import Loading from "@/components/other/Loading";
import { Product, Category } from "@/lib/types";
import { useState, useEffect, Suspense } from "react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import QRHandler from "@/components/auth/QRHandler";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApiAuthError } from "@/hooks/useApiAuthError";
import Section from "@/components/layout/Section";



export default function Home() {


  const router = useRouter();
  const { isLoading, user } = useAuth();
  const { handleAuthError } = useApiAuthError();

  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">(
    "all",
  );
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

  useEffect(() => {
    if (!user) return;

    const fetchMenu = async () => {
      try {
        const res = await api.get("/menu");
        const dbProducts = res.data.data.items;

        const readyProducts = dbProducts.map((p: Product) => ({
          ...p,
          image: "/images/burgers.jpeg",
          qty: 42,
        }));

        setProducts(readyProducts);
      } catch (error) {
        handleAuthError(error, "Failed to load menu");
      } finally {
        setIsMenuLoading(false);
      }
    };

    const fetchCategoreies = async () => {
      try {
        const res = await api.get("/categories");
        const dbCategories: Category[] = res.data.data.categories;
        setCategories(dbCategories);

      } catch (error) {
        handleAuthError(error, "Failed to load categories");
      }
    }

    fetchMenu();
    fetchCategoreies();

  }, [user, router, handleAuthError]);

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
        <div className="px-4 shrink-0">
          <Header
            cartCount={getTotalCartCount()}
            onCartClick={() => router.push("/cart")}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <div className="">
            <DietFilter
              activeFilter={dietFilter}
              onFilterChange={setDietFilter}
            />
          </div>
        </div>

        <div className="px-4 flex flex-col">
          <Section className="mb-2">
            <SectionTitle title="Categories" />
            <Categories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </Section>

          <Section>
            <SectionTitle title="Featured Product" />
            <FeaturedProducts
              products={filteredProducts}
              isLoading={isMenuLoading}
              getProductTotalQty={getProductTotalQty}
              onAddClick={handleCardAddClick}
              onIncrease={increaseSingleItem}
              onDecrease={decreaseSingleItem}
              onClearFilters={() => {
                setDietFilter("all");
                setSelectedCategory("all");
              }}
            />
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
