import { Edit2, Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';

interface Props {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export default function MenuRow({ product, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-center shadow-sm group hover:shadow-md transition-all">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
           <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
           <span className="font-bold text-brand-red text-lg">${product.price ? (product.price / 100).toFixed(2) : '0.00'}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                product.isAvailable 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
                {product.isAvailable ? 'In Stock' : 'Sold Out'}
            </span>
            <span className="text-xs text-gray-400 truncate hidden sm:block">
                • {product.description}
            </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
         <button 
            onClick={onEdit}
            className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
         >
            <Edit2 size={14} />
            <span className="hidden sm:inline">Edit</span>
         </button>
         <button 
            onClick={onDelete}
            className="flex items-center gap-1 px-3 py-2 border border-red-100 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
         >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
         </button>
      </div>
    </div>
  );
}