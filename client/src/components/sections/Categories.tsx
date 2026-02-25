import CategoryItem from "@/components/cards/CategoryItem"; 
import { Category } from "@/lib/types";

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function Categories({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoriesProps) {
  return (
    <div className="flex flex-col w-full mb-2">
      
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-900">Categories</h2>
        <button className="text-sm font-semibold text-brand-orange hover:opacity-80 transition-opacity">
          See All
        </button>
      </div>

      {/* Horizontal Scrollable Categories List */}
      <div className="flex overflow-x-auto gap-5 pb-2 px-1 mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categories.map((cat) => (
          <div key={cat.id} className="shrink-0">
            <CategoryItem
              id={cat.id}
              name={cat.name}
              image={cat.image} 
              isActive={selectedCategory === cat.id}
              onClick={() => onSelectCategory(cat.id)}
            />
          </div>
        ))}
      </div>
      
    </div>
  );
}