'use client';

import Header from '@/components/layout/Header';
import SectionTitle from '@/components/ui/SectionTitle';
import CategoryItem from '@/components/cards/CategoryItem';
import ProductCard from '@/components/cards/ProductCard';
import ProductDialog from '@/components/ui/ProductDialog';
import DietFilter from '@/components/ui/DietFilter';
import CartPage from '@/components/ui/CartPage'; // <--- Import New Component
import { CATEGORIES, PRODUCTS } from '@/lib/constants';
import { Product } from '@/lib/types';
import { useState } from 'react';

export default function Home() {
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartDetails, setCartDetails] = useState<Record<string, Record<string, number>>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- NEW: View State ---
  const [currentView, setCurrentView] = useState<'HOME' | 'CART'>('HOME');

  // --- Helper: Get Total Count for Badge ---
  const getTotalCartCount = () => {
    let count = 0;
    Object.values(cartDetails).forEach(sizes => {
      Object.values(sizes).forEach(qty => count += qty);
    });
    return count;
  };

  const getProductTotalQty = (productId: string) => {
    const details = cartDetails[productId];
    if (!details) return 0;
    return Object.values(details).reduce((sum, qty) => sum + qty, 0);
  };

  const increaseSingleItem = (id: string) => {
    setCartDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], "default": (prev[id]?.["default"] || 0) + 1 }
    }));
  };

  const decreaseSingleItem = (id: string) => {
    setCartDetails(prev => {
      const currentQty = prev[id]?.["default"] || 0;
      if (currentQty <= 1) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...prev[id], "default": currentQty - 1 } };
    });
  };

  // --- NEW: Handle Size Increase/Decrease from Cart ---
  const handleCartIncrease = (id: string, size: string) => {
    setCartDetails(prev => ({
      ...prev,
      [id]: { ...prev[id], [size]: (prev[id]?.[size] || 0) + 1 }
    }));
  };

  const handleCartDecrease = (id: string, size: string) => {
    setCartDetails(prev => {
      const currentQty = prev[id]?.[size] || 0;
      if (currentQty <= 1) {
         // Remove this size
         const newSizes = { ...prev[id] };
         delete newSizes[size];
         
         // If product has no sizes left, remove product
         if (Object.keys(newSizes).length === 0) {
             const newCart = { ...prev };
             delete newCart[id];
             return newCart;
         }
         return { ...prev, [id]: newSizes };
      }
      return { ...prev, [id]: { ...prev[id], [size]: currentQty - 1 } };
    });
  };

  const handleCardAddClick = (product: Product) => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedProduct(product);
      setIsDialogOpen(true);
    } else {
      increaseSingleItem(product.id);
    }
  };

  const handleDialogSave = (quantities: Record<string, number>) => {
    if (!selectedProduct) return;
    const cleanQuantities: Record<string, number> = {};
    let total = 0;
    Object.entries(quantities).forEach(([size, qty]) => {
      if (qty > 0) {
        cleanQuantities[size] = qty;
        total += qty;
      }
    });

    setCartDetails(prev => {
      if (total === 0) {
        const copy = { ...prev };
        delete copy[selectedProduct.id];
        return copy;
      }
      return { ...prev, [selectedProduct.id]: cleanQuantities };
    });
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesDiet = dietFilter === 'all' || product.category === dietFilter;
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    return matchesDiet && matchesCategory;
  });

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
      
      {/* --- CONDITIONAL RENDERING --- */}
      {currentView === 'CART' ? (
        <CartPage 
          cartDetails={cartDetails}
          onBack={() => setCurrentView('HOME')}
          onClear={() => setCartDetails({})}
          onIncrease={handleCartIncrease}
          onDecrease={handleCartDecrease}
        />
      ) : (
        /* --- HOME PAGE VIEW --- */
        <>
          <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 h-full flex flex-col">
            
            <div className="px-4 shrink-0">
                {/* Updated Header with Cart Click Handler */}
                <Header 
                  cartCount={getTotalCartCount()} 
                  onCartClick={() => setCurrentView('CART')}
                />
                <div className="">
                  <DietFilter activeFilter={dietFilter} onFilterChange={setDietFilter} />
                </div>
            </div>

            <div className="px-4 flex flex-col">
                <section className="mb-2">
                <SectionTitle title="Categories" />
                <div className="flex justify-start overflow-x-auto pb-4 scrollbar-hide gap-4">
                    <CategoryItem id="all" name="All" image="" isActive={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
                    {CATEGORIES.map(cat => (
                    <CategoryItem key={cat.id} {...cat} isActive={selectedCategory === cat.id} onClick={() => setSelectedCategory(cat.id)} />
                    ))}
                </div>
                </section>

                <section>
                <SectionTitle title="Featured Product" />
                <div className='flex flex-col gap-3 pb-safe'>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product}
                                cartQty={getProductTotalQty(product.id)}
                                onAddClick={() => handleCardAddClick(product)}
                                onIncrease={() => increaseSingleItem(product.id)}
                                onDecrease={() => decreaseSingleItem(product.id)}
                            />
                        ))
                    ) : (
                        <div className="py-10 text-center opacity-50">
                            <p className="text-gray-500 font-medium">No items found</p>
                            <button onClick={() => {setDietFilter('all'); setSelectedCategory('all')}} className="mt-2 text-brand-red text-xs underline">
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
                </section>
            </div>
          </div>

          <ProductDialog 
            isOpen={isDialogOpen} 
            product={selectedProduct} 
            initialData={selectedProduct ? (cartDetails[selectedProduct.id] || {}) : {}}
            onClose={() => setIsDialogOpen(false)}
            onSave={handleDialogSave}
          />
        </>
      )}
    </main>
  );
}