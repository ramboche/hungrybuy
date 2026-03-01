'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { logout } from '@/lib/store/features/authSlice';
import { fetchTables } from '@/lib/store/features/tableSlice';
import { fetchCategories } from '@/lib/store/features/categorySlice';
import { fetchProducts } from '@/lib/store/features/menuSlice';
import { fetchOrders } from '@/lib/store/features/orderSlice';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminBottomNav from '@/components/admin/AdminBottomNav';
import Loading from '@/components/other/Loading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTables());
      dispatch(fetchCategories());
      dispatch(fetchProducts({ categoryId: "all" }));
      dispatch(fetchOrders());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isMounted || !isAuthenticated) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-24">
      <AdminHeader onLogout={handleLogout} />
      {children} 
      <AdminBottomNav />
    </div>
  );
}