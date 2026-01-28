import { X } from 'lucide-react';
import { useState } from 'react';
import { Table } from '@/lib/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tableNum: string) => void;
  currentTables: Table[];
}

export default function AddTableModal({ isOpen, onClose, onAdd, currentTables }: Props) {
  const [newTableNumber, setNewTableNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newTableNumber);
    setNewTableNumber('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Table</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
         </div>
         
         <form onSubmit={handleSubmit}>
           <div className="mb-6">
             <label className="block text-sm font-semibold text-gray-700 mb-2">Table Number</label>
             <input 
               type="text" 
               placeholder="e.g. 15"
               className="w-full h-12 rounded-xl border border-gray-200 px-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
               value={newTableNumber}
               onChange={(e) => setNewTableNumber(e.target.value)}
               autoFocus
             />
             <p className="text-xs text-gray-400 mt-2">Current tables: {currentTables.join(', ')}</p>
           </div>
           
           <button 
            type="submit"
            className="w-full h-12 bg-brand-red text-white font-bold rounded-xl shadow-lg shadow-red-200 active:scale-95 transition-transform"
           >
             Confirm Add Table
           </button>
         </form>
      </div>
    </div>
  );
}