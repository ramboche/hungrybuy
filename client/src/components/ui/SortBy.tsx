import { ChevronDown } from "lucide-react";

interface Props {
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

export default function SortBy({ sortOrder, setSortOrder }: Props) {
    return (
        <div className="relative shrink-0">
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none bg-white border border-gray-100 text-gray-700 text-xs sm:text-sm font-semibold py-2 pl-4 pr-8 rounded-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange cursor-pointer transition-all"
            >
                <option value="popular">Sort by</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
                {/* <option value="rating">Top Rated</option> */}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} strokeWidth={2.5} />
        </div>
    );
}