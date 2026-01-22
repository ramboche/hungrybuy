'use client';

type FilterType = 'all' | 'veg' | 'non-veg';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function DietFilter({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex gap-3 mb-6">
      {/* All Button */}
      <button
        onClick={() => onFilterChange('all')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border
          ${activeFilter === 'all' 
            ? 'bg-brand-dark text-white border-brand-dark' 
            : 'bg-white text-gray-500 border-gray-200'}`}
      >
        All
      </button>

      {/* Veg Button */}
      <button
        onClick={() => onFilterChange('veg')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-2
          ${activeFilter === 'veg' 
            ? 'bg-green-600 text-white border-green-600' 
            : 'bg-white text-gray-500 border-gray-200'}`}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 ring-2 ring-green-200" />
        Veg
      </button>

      {/* Non-Veg Button */}
      <button
        onClick={() => onFilterChange('non-veg')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-2
          ${activeFilter === 'non-veg' 
            ? 'bg-red-600 text-white border-red-600' 
            : 'bg-white text-gray-500 border-gray-200'}`}
      >
         <span className="w-2 h-2 rounded-full bg-red-400 ring-2 ring-red-200" />
        Non-Veg
      </button>
    </div>
  );
}