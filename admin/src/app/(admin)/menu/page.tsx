'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';
import { RootState, AppDispatch } from '@/lib/store/store';
import { addCategory, deleteCategory } from '@/lib/store/features/categorySlice';
import { addProduct, updateProduct, deleteProduct } from '@/lib/store/features/menuSlice';
import { Product } from '@/lib/types';

import MenuRow from '@/components/menu/MenuRow';
import CategoryPills from '@/components/menu/CategoryPills';
import AddProductModal from '@/components/modals/AddProductModal';
import ManageCategoriesModal from '@/components/modals/ManageCategoriesModal';

export default function MenuPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.categories);
  const { products } = useSelector((state: RootState) => state.menu);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSaveProduct = async (itemData: FormData, variants: { id?: string; label: string; price: number }[]) => {
    let result;
    if (editingProduct) {
      result = await dispatch(updateProduct({ id: editingProduct.id, itemData, variants }));
    } else {
      result = await dispatch(addProduct({ itemData, variants }));
    }

    if (addProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } else {
      alert(result.payload || "Failed to save product");
    }
  };

  const filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.categoryId === activeCategory);

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Menu Management</h2>
        </div>
        <CategoryPills categories={categories} activeCategory={activeCategory} onCategoryClick={setActiveCategory} onAddCategory={() => setIsCategoryModalOpen(true)} />
        <div className="flex flex-col gap-3 mt-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <MenuRow key={product.id} product={product} onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }} onDelete={() => { if (confirm("Delete product?")) dispatch(deleteProduct(product.id)); }} />
            ))
          ) : <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed">No items in this category yet.</div>}
        </div>
      </div>

      <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="fixed bottom-24 right-6 w-14 h-14 bg-brand-red text-white rounded-full shadow-xl shadow-red-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>

      <AddProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} categories={categories} initialData={editingProduct} />
      <ManageCategoriesModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={async (name) => { const r = await dispatch(addCategory(name)); if (addCategory.fulfilled.match(r)) setIsCategoryModalOpen(false); }} onDelete={(id) => { if (confirm("Delete category?")) dispatch(deleteCategory(id)); }} />
    </main>
  );
}