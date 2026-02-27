'use client';

type FilterType = 'all' | 'veg' | 'non-veg';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export default function DietFilter({ activeFilter, onFilterChange }: Props) {
  const isVegOnly = activeFilter === 'veg';

  const handleToggle = () => {
    onFilterChange(isVegOnly ? 'all' : 'veg');
    console.log(isVegOnly)
  };

  return (
    <div className="flex items-center mt-2 mb-2 px-1">
      <label className="flex items-center cursor-pointer group">

        {/* Label */}
        <span className="text-sm font-bold text-gray-800 select-none">
          Veg
        </span>

        {/* Custom Toggle Switch */}
        <div className="relative ml-2 flex items-center">
          <input
            type="checkbox"
            className="sr-only"
            checked={isVegOnly}
            onChange={handleToggle}
          />
          {/* Switch Background */}
          <div
            className={`block w-11 h-6 rounded-full transition-colors duration-300 ease-in-out shadow-inner
              ${isVegOnly ? 'bg-[#10B981]' : 'bg-gray-200'}
            `}
          ></div>
          {/* Switch Knob */}
          <div
            className={`absolute left-1 bg-brand-orange-light w-4 h-4 rounded-full transition-transform duration-300 ease-in-out shadow-sm
              ${isVegOnly ? 'translate-x-5' : 'translate-x-0'}
            `}
          ></div>
        </div>

      </label>
    </div>
  );
}