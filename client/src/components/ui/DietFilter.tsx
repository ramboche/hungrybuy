'use client';

type FilterType = 'all' | 'veg' | 'non-veg';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function DietFilter({ activeFilter, onFilterChange }: Props) {
  return (
    <div className="flex gap-3 mb-1">
      {/* All Button */}
      <button
        onClick={() => onFilterChange('all')}
        className={`px-6 py-2 rounded-full text-xs font-medium transition-all border shrink-0
          ${activeFilter === 'all' 
            ? 'bg-gray-900 text-white border-gray-900' 
            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
      >
        All
      </button>

      {/* Veg Button */}
      <button
        onClick={() => onFilterChange('veg')}
        className={`px-2 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-2 shrink-0
          ${activeFilter === 'veg' 
            ? 'bg-gray-900 text-white border-gray-900' 
            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
        Veg Only
      </button>

      {/* Non-Veg Button */}
      <button
        onClick={() => onFilterChange('non-veg')}
        className={`px-2 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-2 shrink-0
          ${activeFilter === 'non-veg' 
            ? 'bg-gray-900 text-white border-gray-900' 
            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
      >
         <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
        Non-Veg
      </button>
    </div>
  );
}