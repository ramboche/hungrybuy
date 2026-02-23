import { Plus, Minus } from 'lucide-react';

interface Props {
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantityBtn({ count, onIncrease, onDecrease }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-1 h-22 shadow-inner border border-gray-100">

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDecrease();
        }}
        className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-brand-dark active:scale-90 transition-transform border border-gray-100"
        type="button"
      >
        <Minus size={14} />
      </button>

      <span className="text-xs font-bold h-2 flex items-center justify-center text-brand-dark select-none">
        {count}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onIncrease();
        }}
        className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center shadow-sm text-white active:scale-90 transition-transform"
        type="button"
      >
        <Plus size={14} />
      </button>



    </div>
  );
}