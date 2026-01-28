'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types';
import { motion } from 'framer-motion'; // <--- Import Framer Motion

interface Props {
  order: Order;
  onBack: () => void;
  onComplete: () => void;
}

export default function OrderDetailsView({ order, onBack, onComplete }: Props) {
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  return (
    // <--- Changed to motion.div
    <motion.div 
      initial={{ x: '100%' }}      // Start off-screen (right)
      animate={{ x: 0 }}           // Slide to center
      exit={{ x: '100%' }}         // Slide back out when closed
      transition={{ type: 'spring', damping: 25, stiffness: 200 }} // Smooth "spring" physics
      className="fixed inset-0 z-100 bg-white flex flex-col shadow-2xl"
    >
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-gray-900">Order Details {order.id}</span>
        <div className="w-8" /> 
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-white pb-32">
        
        {/* Banner */}
        <div className="bg-gray-900 rounded-3xl p-6 text-white mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="relative z-10 flex justify-between items-start mb-8">
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
               <Clock size={12} /> {order.status}
             </span>
             <span className="text-xs font-medium text-gray-400">{order.createdAt}</span>
          </div>
          <div className="relative z-10">
             <h1 className="text-3xl font-extrabold">Table #{order.tableId}</h1>
             <p className="text-gray-400 text-sm mt-1">Dine-in • {order.orders.length} Items</p>
          </div>
        </div>

        {/* Items */}
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Order Items</h3>
        <div className="space-y-4 mb-8">
          {order.orders.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
               <div className="relative w-16 h-16 shrink-0">
                  <img src={item.menuItem?.image} alt={item.menuItem?.name} className="w-full h-full object-cover rounded-xl bg-gray-100" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-red text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {item.quantity}
                  </span>
               </div>
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.menuItem?.name}</h4>
                     <span className="font-bold text-gray-900 text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.menuItem?.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.menuItem?.description}</p>}
               </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        {order.customerNote && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2 text-sm">Special Instructions</h3>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-700">
               <AlertCircle size={20} className="shrink-0" />
               <p className="text-xs font-medium leading-relaxed">{order.customerNote}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
           {/* <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>${order.totalAmount.toFixed(2)}</span>
           </div> */}
           {/* <div className="flex justify-between text-sm text-gray-500">
              <span>Tax (10%)</span><span>${order.tax.toFixed(2)}</span>
           </div> */}
           <div className="h-px bg-gray-200 my-2" />
           <div className="flex justify-between text-lg font-extrabold text-brand-red">
              <span>Total</span><span>${order.totalAmount.toFixed(2)}</span>
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
            Mark as Completed
         </button>
      </div>

    </motion.div>
  );
}