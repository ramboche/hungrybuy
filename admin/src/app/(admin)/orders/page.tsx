'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag, DollarSign, Users } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { ORDER_TABS } from '@/lib/data';
import { RootState, AppDispatch } from '@/lib/store/store';
import { updateOrderStatus } from '@/lib/store/features/orderSlice';

import StatsCard from '@/components/admin/StatsCard';
import OrderRow from '@/components/admin/OrderRow';
import OrderDetailsView from '@/components/orders/OrderDetailsView';

export default function OrdersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders } = useSelector((state: RootState) => state.orders);
    const { tables } = useSelector((state: RootState) => state.tables);

    const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const getTableNumber = (tableUuid: string) => {
        const found = tables.find(t => t.id === tableUuid);
        return found ? found.number : '??';
    };

    const cycleOrderStatus = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const statusFlow: Record<OrderStatus, OrderStatus> = {
            'PENDING': 'SERVED', 'SERVED': 'PAID', 'PAID': 'CANCELLED', 'CANCELLED': 'PENDING',
        };
        await dispatch(updateOrderStatus({ orderId, status: statusFlow[order.status] }));
    };

    const stats = {
        activeOrders: orders.filter(o => o.status !== 'PAID').length,
        revenue: orders.filter(o => o.status === 'PAID').reduce((totalAcc, order) => {
            return totalAcc + order.items.reduce((itemAcc, item) => itemAcc + (item.price * item.quantity), 0);
        }, 0) / 100,
        customers: orders.length
    };

    const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

    return (
        <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard title="Active Orders" value={stats.activeOrders.toString()} icon={<ShoppingBag size={24} />} badge="+3 new" badgeColor="bg-green-100 text-green-700" iconBg="bg-red-50 text-brand-red" />
                <StatsCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<DollarSign size={24} />} badge="+12%" badgeColor="bg-green-100 text-green-700" iconBg="bg-green-50 text-green-600" />
                <StatsCard title="Total Customers" value={stats.customers.toString()} icon={<Users size={24} />} badge="+8" badgeColor="bg-green-100 text-green-700" iconBg="bg-blue-50 text-blue-600" />
            </div>

            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden min-h-125">
                <div className="p-6 border-b border-gray-100 flex gap-4 overflow-x-auto">
                    {ORDER_TABS.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${activeTab === tab ? 'bg-brand-red text-white shadow-md shadow-red-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="divide-y divide-gray-50">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer block">
                                <OrderRow order={order} tableNumber={getTableNumber(order.tableId)} onStatusClick={() => cycleOrderStatus(order.id)} />
                            </div>
                        ))
                    ) : <div className="p-10 text-center text-gray-400">No active orders found.</div>}
                </div>
            </div>

            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailsView key="order-details" order={selectedOrder} tableNumber={getTableNumber(selectedOrder.tableId)} onBack={() => setSelectedOrder(null)} onComplete={() => {
                        dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'PAID' }));
                        setSelectedOrder(null);
                    }} />
                )}
            </AnimatePresence>
        </main>
    );
}