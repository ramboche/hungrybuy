import ProductCard from "@/components/cards/ProductCard";
import { Product } from "@/lib/types";

interface FeaturedProductsProps {
  products: Product[];
  isLoading: boolean;
  getProductTotalQty: (id: string) => number;
  onAddClick: (product: Product) => void;
  onIncrease: (product: Product) => void;
  onDecrease: (productId: string) => void;
  onClearFilters: () => void;
}

export default function Featured({
  products,
  isLoading,
  getProductTotalQty,
  onAddClick,
  onIncrease,
  onDecrease,
  onClearFilters,
}: FeaturedProductsProps) {
  return (
    <div className="w-full mt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-safe px-1">

        {isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
            <p className="text-sm font-medium text-gray-500">Loading menu...</p>
          </div>
        )}

        {!isLoading && products.length > 0 && products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            cartQty={getProductTotalQty(product.id)}
            onAddClick={() => onAddClick(product)}
            onIncrease={() => onIncrease(product)}
            onDecrease={() => onDecrease(product.id)}
          />
        ))}

        {!isLoading && products.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center">
            <p className="text-gray-500 font-medium mb-3">No items found</p>
            <button
              onClick={onClearFilters}
              className="px-5 py-2 bg-gray-100 rounded-full text-brand-orange text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}