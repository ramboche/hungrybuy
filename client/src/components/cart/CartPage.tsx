'use client';

import CartHeader from './CartHeader';
import TableStatusCard from './TableStatusCard';
import CartProductCard from './CartProductCard';
import CartFooter from './CartFooter';
import CartPageEmpty from './CartPageEmpty';
import { useState, useEffect, useRef } from 'react';
import { BackendCartItem } from '@/lib/types';
import { api } from '@/lib/api';
import OrderCard, { BackendOrder } from '@/components/orders/OrderCard';
import ToggleHeader from './ToggleHeader';
import { OrderCardSkeleton } from '../orders/OrderCardSkeleton';

interface CartPageProps {
  cartItems: BackendCartItem[];
  totalAmount: number;
  onBack: () => void;
  onIncrease: (cartItemId: string) => void;
  onDecrease: (cartItemId: string) => void;
  onPlaceOrder: () => Promise<void>;
}

export default function CartPage({
  cartItems,
  totalAmount,
  onBack,
  onIncrease,
  onDecrease,
  onPlaceOrder
}: CartPageProps) {

  const [isPlacing, setIsPlacing] = useState(false);
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasFetchedOrders = useRef(false);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!hasFetchedOrders.current) {
        setIsLoadingOrders(true);
      }

      try {
        const res = await api.get('/order/active');
        setOrders(res.data.data.orders);

        hasFetchedOrders.current = true;
      } catch (error) {
        console.error("Failed to fetch active orders", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    if (activeTab === 'orders') {
      fetchActiveOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const index = activeTab === 'cart' ? 0 : 1;
    const container = scrollContainerRef.current;
    const targetScrollLeft = index * container.clientWidth;

    if (Math.abs(container.scrollLeft - targetScrollLeft) > 5) {
      isProgrammaticScroll.current = true;

      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth',
      });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500);
    }
  }, [activeTab]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const width = container.clientWidth;

    if (width === 0) return;

    const progress = scrollPosition / width;
    setScrollProgress(progress);

    if (isProgrammaticScroll.current) return;

    const activeIndex = Math.round(progress);
    const newTab = activeIndex === 0 ? 'cart' : 'orders';

    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  const handlePlaceOrderClick = async () => {
    if (isPlacing || cartItems.length === 0) return;

    setIsPlacing(true);
    try {
      await onPlaceOrder();

    } catch {
      setIsPlacing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">

      <CartHeader onBack={onBack} />

      <ToggleHeader activeTab={activeTab} setActiveTab={setActiveTab} scrollProgress={scrollProgress} />

      <div className="flex-1 overflow-x-hidden overflow-y-auto bg-brand-bg scrollbar-hide pt-2 pb-40">

        <div className="px-4 sm:px-6">
          <TableStatusCard />
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >

          <div className="w-full shrink-0 snap-center px-4 sm:px-6">
            <div className="flex flex-col">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <CartProductCard
                    key={item.id}
                    item={item}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                  />
                ))
              ) : (
                <CartPageEmpty />
              )}
            </div>
          </div>

          <div className="w-full shrink-0 snap-center px-4 sm:px-6">
            <div className="flex flex-col pt-2">
              {isLoadingOrders ? (
                <>
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                  <OrderCardSkeleton />
                </>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <OrderCard key={order.id} order={order} onActiveTabChange={() => setActiveTab("cart")} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-100">
                  You have no active orders yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {activeTab === 'cart' && cartItems.length > 0 && (
        <CartFooter
          totalAmount={totalAmount}
          isPlacing={isPlacing}
          cartItems={cartItems}
          handlePlaceOrderClick={handlePlaceOrderClick}
        />
      )}

    </div>
  );
}