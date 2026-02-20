import { Plus } from 'lucide-react';
import { Category } from '@/lib/types';

interface Props {
  categories: Category[];
  activeCategory: string;
  onCategoryClick: (id: string) => void;
  onAddCategory: () => void;
}

export default function CategoryPills({ categories, activeCategory, onCategoryClick, onAddCategory }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      
      {/* 1. Add New Button */}
      <button 
        onClick={onAddCategory}
        className="flex items-center gap-1 px-4 py-2 rounded-full border border-dashed border-brand-red text-brand-red bg-red-50/50 text-xs font-bold whitespace-nowrap active:scale-95 transition-transform"
      >
        <Plus size={14} />
        Category
      </button>

      {/* 2. NEW: "All" Button */}
      <button
        onClick={() => onCategoryClick('all')}
        className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
          activeCategory === 'all'
            ? 'bg-brand-red text-white shadow-red-200'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        All Items
      </button>

      {/* 3. Existing Category List */}
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoryClick(cat.id)}
          className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
            activeCategory === cat.id
             ? 'bg-brand-red text-white shadow-red-200'
             : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}