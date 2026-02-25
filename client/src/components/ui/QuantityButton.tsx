
interface Props {
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onAddClick: () => void;
}

export default function QuantityBtn({ count, onIncrease, onDecrease, onAddClick }: Props) {
  return (
    <div className="relative w-29 h-10 flex items-center justify-end">

      <div
        className={`absolute right-0 flex items-center gap-3 bg-brand-orange-light rounded-xl p-1 border border-brand-orange/10 transition-all duration-100 ease-out origin-right
                ${count > 0 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-75 translate-x-4 pointer-events-none'}
              `}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDecrease();
          }}
          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-gray-700 active:scale-90 transition-transform font-bold"
        >
          -
        </button>

        <span className="text-sm font-bold w-4 text-center text-brand-orange">
          {count > 0 ? count : 1}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onIncrease();
          }}
          className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-sm text-white active:scale-90 transition-transform font-bold"
        >
          +
        </button>
      </div>
      <div
        className={`absolute right-0 transition-all duration-100 ease-out origin-right
                ${count > 0 ? 'opacity-0 scale-75 translate-x-4 pointer-events-none' : 'opacity-100 scale-100 translate-x-0'}
              `}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddClick();
          }}
          className="px-5 h-10 bg-brand-orange-light text-brand-orange rounded-xl font-bold text-sm flex items-center gap-1 hover:bg-[#faeae0] active:scale-95 transition-all"
        >
          Add <span className="text-lg leading-none font-medium">+</span>
        </button>
      </div>

    </div>
  );
}