'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Printer, CheckCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
  order: Order;
  tableNumber: string | number; // <--- NEW PROP (Pass this from parent)
  onBack: () => void;
  onComplete: () => void;
}

export default function OrderDetailsView({ order, tableNumber, onBack, onComplete }: Props) {

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  // --- Helpers ---
  const formatPrice = (cents: number) => (cents / 100).toFixed(2);

  const calculateTotal = () => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col shadow-2xl"
    >

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-gray-900">Order #{order.id.slice(0, 6)}</span>
        <div className="w-8" />
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-white pb-32">

        {/* Banner */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative z-10 flex justify-between items-start mb-8">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-200' : 'bg-green-500/20 text-green-200'
              }`}>
              <Clock size={12} /> {order.status}
            </span>
            <span className="text-xs font-medium text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()} • {formatTime(order.createdAt)}
            </span>
          </div>
          <div className="relative z-10">
            {/* Use prop instead of raw UUID */}
            <h1 className="text-3xl font-extrabold">Table {tableNumber}</h1>
            <p className="text-gray-400 text-sm mt-1">Dine-in • {order.items.length} Items</p>
          </div>
        </div>

        {/* Items */}
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Order Items</h3>
        <div className="space-y-4 mb-8">
          {/* Changed order.orders -> order.items */}
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={item.menuItem?.image || '/images/burger.jpg'}
                  alt={item.menuItem?.name || "Order Item"}
                  fill
                  className="object-cover"
                  sizes="64px"
                />

                {/* Badge needs z-10 to stay on top of the image */}
                <span className="absolute z-10 right-0 w-5 h-5 bg-brand-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.menuItem?.name}</h4>
                  {/* Calculate Price: (Item Price * Qty) / 100 */}
                  <span className="font-bold text-gray-900 text-sm">
                    ${formatPrice(item.price * item.quantity)}
                  </span>
                </div>
                {/* Variant Label */}
                <div className="flex flex-col gap-0.5 mt-1">
                  {item.variant && (
                    <p className="text-xs text-brand-red font-medium">
                      Size: {item.variant.label}
                    </p>
                  )}
                  {item.menuItem?.description && (
                    <p className="text-[10px] text-gray-400 line-clamp-1">
                      {item.menuItem.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>${formatPrice(calculateTotal())}</span>
          </div>

          <div className="h-px bg-gray-200 my-2" />

          <div className="flex justify-between text-lg font-extrabold text-brand-red">
            <span>Total</span>
            {/* Calculated Total */}
            <span>${formatPrice(calculateTotal())}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex gap-4 items-center">
        <button className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <Printer size={20} />
        </button>
        <button
          onClick={onComplete}
          className="flex-1 h-12 bg-brand-red text-white font-bold rounded-xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <CheckCircle size={18} />
          {order.status === 'PAID' ? 'Close Order' : 'Mark as Served'}
        </button>
      </div>

    </motion.div>
  );
}