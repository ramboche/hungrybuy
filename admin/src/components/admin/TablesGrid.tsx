import { Plus, Trash2, QrCode } from 'lucide-react';
import { Table, Order } from '@/lib/types'; // Import updated types

interface TablesGridProps {
  tables: Table[]; // Changed from string[] to Table[]
  activeOrders: Order[];
  onAddClick: () => void;
  onDeleteTable: (id: string) => void;
}

export default function TablesGrid({ tables, activeOrders, onAddClick, onDeleteTable }: TablesGridProps) {
  
  // Helper to format number (1 -> "01")
  const formatTableNum = (num: number) => num?.toString().padStart(2, '0');

  // Helper to check status (this logic might need adjusting depending on how you link orders to tables now)
  const getTableStatus = (tableNum: number) => {
    // Assuming Order has tableId as a string matching the number "01", "02" etc.
    // You might need to update this logic if Order.tableId becomes a UUID.
    const isActive = activeOrders.some(o => o.tableId === formatTableNum(tableNum) && o.status !== 'PAID');
    return isActive ? 'Occupied' : 'Available';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {/* Add Button */}
      <button 
        onClick={onAddClick}
        className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-red hover:text-brand-red hover:bg-red-50 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
           <Plus size={20} />
        </div>
        <span className="font-bold text-sm">Add Table</span>
      </button>

      {/* Table Cards */}
      {tables.map((table) => (
        <div key={table.id || table.number} className="aspect-square bg-white rounded-3xl p-4 shadow-sm border border-gray-100 relative group flex flex-col justify-between">
           
           <div className="flex justify-between items-start">
             <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
               getTableStatus(table.number) === 'Occupied' 
                 ? 'bg-red-100 text-red-600' 
                 : 'bg-green-100 text-green-600'
             }`}>
               {getTableStatus(table.number)}
             </span>
             
             <button 
               onClick={() => onDeleteTable(table.id)}
               className="text-gray-300 hover:text-red-500 transition-colors p-1"
             >
               <Trash2 size={16} />
             </button>
           </div>

           <div className="text-center">
             <h3 className="text-3xl font-bold text-gray-900">{formatTableNum(table.number)}</h3>
             <p className="text-xs text-gray-400 font-medium mt-1">Table</p>
           </div>

           <div className="flex justify-center">
             <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-brand-dark hover:text-white transition-colors">
               <QrCode size={18} />
             </button>
           </div>
        </div>
      ))}
    </div>
  );
}