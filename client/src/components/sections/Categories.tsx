import CategoryItem from "@/components/cards/CategoryItem";
import { Category } from "@/lib/types";
import DietFilter from "../ui/DietFilter";

type FilterType = 'all' | 'veg' | 'non-veg';

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  activeDietFilter: FilterType
  onFilterChange: (filter: FilterType) => void;
}

export default function Categories({
  categories,
  selectedCategory,
  onSelectCategory,
  activeDietFilter,
  onFilterChange
}: CategoriesProps) {
  return (
    <div className="flex flex-col w-full">

      {/* Header Row */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h2 className="text-lg font-bold text-gray-900">Categories</h2>
        <DietFilter activeFilter={activeDietFilter} onFilterChange={onFilterChange} />
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