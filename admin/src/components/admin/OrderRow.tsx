import { UtensilsCrossed, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';

interface OrderRowProps {
  order: Order;
  tableNumber: string | number;
  onStatusClick: () => void;
}

export default function OrderRow({ order, tableNumber, onStatusClick }: OrderRowProps) {

  const totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SERVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} />;
      case 'SERVED': return <UtensilsCrossed size={14} />;
      case 'PAID': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return null;
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors group cursor-pointer border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-lg border-2 border-white shadow-sm shrink-0">
          {tableNumber}
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-base">Table {tableNumber}</h4>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <span>#{order.id.slice(0, 6)}</span>
            <span>•</span>
            <span>{order.items.length} Items</span>
            <span>•</span>
            <span className="text-brand-red font-bold">${(totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
        <span className="text-sm font-bold text-gray-500">
          {formatTime(order.createdAt)}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onStatusClick(); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all hover:brightness-95 active:scale-95 ${getStatusStyle(order.status)}`}
        >
          {getStatusIcon(order.status)}
          {order.status}
        </button>
      </div>
    </div>
  );
}