import { Plus, Minus } from 'lucide-react';

interface Props {
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantityBtn({ count, onIncrease, onDecrease }: Props) {
  return (
    <div className="flex items-center gap-2 bg-brand-red text-white px-2 py-1 rounded-full h-8 w-24 justify-between shadow-md">
      {/* Minus Button */}
      <button 
        onClick={onDecrease}
        className="bg-white rounded-full p-0.5 hover:bg-gray-100 transition-colors active:scale-90"
        type="button"
      >
        <Minus size={12} className="text-brand-red" />
      </button>

      {/* Number Display */}
      <span className="font-bold text-sm text-center w-full select-none">
        {count.toString().padStart(1, '0')}
      </span>

      {/* Plus Button */}
      <button 
        onClick={onIncrease}
        className="bg-white rounded-full p-0.5 hover:bg-gray-100 transition-colors active:scale-90"
        type="button"
      >
        <Plus size={12} className="text-brand-red" />
      </button>
    </div>
  );
}