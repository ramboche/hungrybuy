'use client';

import Header from '@/components/layout/Header';
import SectionTitle from '@/components/ui/SectionTitle';
import CategoryItem from '@/components/cards/CategoryItem';
import ProductCard from '@/components/cards/ProductCard';
import ProductDialog from '@/components/ui/ProductDialog';
import DietFilter from '@/components/ui/DietFilter';
import CartPage from '@/components/ui/CartPage'; 
import TestTableSetter from '@/components/other/TestTableSetter'; 
import { CATEGORIES } from '@/lib/constants'; 
import { Product } from '@/lib/types';
import { useState, useEffect } from 'react'; 
import { useCart } from '@/context/CartContext'; 
import { api } from '@/lib/api'; 

export default function Home() {
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  // Global Cart State
  const { cart, addToCart, updateQuantity, tableId } = useCart();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<'HOME' | 'CART'>('HOME');

  // --- 1. Simplified Fetch (Matches Backend Directly) ---
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        console.log(res)
        const dbProducts = res.data.data.items;
        
        // Just add the fields missing from DB (image, qty)
        const readyProducts = dbProducts.map((p: any) => ({
            ...p,
            image: '/images/burgers.jpeg', // Default image until DB has them
            qty: 42,                   // Default qty for demo
        }));

        setProducts(readyProducts);
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setIsMenuLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // --- Helpers ---
  const getTotalCartCount = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getProductTotalQty = (productId: string) => {
    return cart
      .filter(item => item.menuItem.id === productId)
      .reduce((acc, item) => acc + item.quantity, 0);
  };

  const findCartItem = (productId: string, variantId?: string) => {
    return cart.find(item => 
      item.menuItem.id === productId && 
      (variantId ? item.variant?.id === variantId : !item.variant)
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

  // Updated to use 'variants' and 'label' (Backend Terms)
  const handleDialogSave = async (quantities: Record<string, number>) => {
    if (!selectedProduct) return;

    for (const [variantLabel, newQty] of Object.entries(quantities)) {
        // CHANGE: Use 'variants' and 'label'
        const variantObj = selectedProduct.variants?.find(v => v.label === variantLabel);
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

  const handleCartIncrease = async (cartItemId: string) => {
      const item = cart.find(i => i.id === cartItemId);
      if(item) await updateQuantity(cartItemId, item.quantity + 1);
  };

  const handleCartDecrease = async (cartItemId: string) => {
      const item = cart.find(i => i.id === cartItemId);
      if(item) await updateQuantity(cartItemId, item.quantity - 1);
  };

  const handleCardAddClick = (product: Product) => {
    // CHANGE: Check 'variants' instead of 'sizes'
    if (product.variants && product.variants.length > 0) {
      setSelectedProduct(product);
      setIsDialogOpen(true);
    } else {
      increaseSingleItem(product);
    }
  };

  // --- 2. Updated Filter Logic ---
  const filteredProducts = products.filter((product) => {
    // Translate UI ('veg') to Backend Enum ('VEG')
    const targetFoodType = dietFilter === 'veg' ? 'VEG' : 'NON_VEG';
    
    // CHANGE: Check 'foodType' instead of 'category'
    const matchesDiet = dietFilter === 'all' || product.foodType === targetFoodType;
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    
    return matchesDiet && matchesCategory;
  });

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
      
      {!tableId && (
         <div className="absolute top-0 left-0 right-0 z-50">
           <TestTableSetter />
         </div>
      )}

      {currentView === 'CART' ? (
        <CartPage 
          cartItems={cart} 
          onBack={() => setCurrentView('HOME')}
          onIncrease={handleCartIncrease}
          onDecrease={handleCartDecrease}
          totalAmount={cart.reduce((sum, item) => {
              const price = item.variant ? item.variant.price : (item.menuItem.price || 0);
              // Handle Cents if needed (divide by 100)
              // const realPrice = price / 100; 
              return sum + (price * item.quantity);
          }, 0)}
        />
      ) : (
        <>
          <div className={`flex-1 overflow-y-auto scrollbar-hide pb-24 h-full flex flex-col ${!tableId ? 'pt-12' : ''}`}> 
            
            <div className="px-4 shrink-0">
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
                    {isMenuLoading && <p className="text-center text-sm text-gray-500 py-10">Loading menu...</p>}
                    
                    {!isMenuLoading && filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product}
                                cartQty={getProductTotalQty(product.id)}
                                onAddClick={() => handleCardAddClick(product)}
                                onIncrease={() => increaseSingleItem(product)}
                                onDecrease={() => decreaseSingleItem(product.id)}
                            />
                        ))
                    ) : !isMenuLoading && (
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
            initialData={
                selectedProduct 
                ? cart.filter(i => i.menuItem.id === selectedProduct.id).reduce((acc, item) => {
                    // CHANGE: Use 'label' because Backend/Types now use 'label'
                    if(item.variant) acc[item.variant.label] = item.quantity;
                    return acc;
                  }, {} as Record<string, number>)
                : {}
            }
            onClose={() => setIsDialogOpen(false)}
            onSave={handleDialogSave}
          />
        </>
      )}
    </main>
  );
}