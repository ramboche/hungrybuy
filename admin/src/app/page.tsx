'use client';

// --- 1. CONSOLIDATED IMPORTS ---
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { ShoppingBag, DollarSign, Users, Plus } from 'lucide-react';
import QrCodeModal from '@/components/admin/modals/QrCodeModal';

// Types & Data
import { Order, OrderStatus, Product, Table} from '@/lib/types';
import { ORDER_TABS } from '@/lib/data';

// Redux
import { RootState, AppDispatch } from '@/lib/store/store';
import { logout } from '@/lib/store/features/authSlice';
import { fetchTables, addTable, deleteTable } from '@/lib/store/features/tableSlice';
import { fetchCategories, addCategory, deleteCategory } from '@/lib/store/features/categorySlice';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '@/lib/store/features/menuSlice';
import { fetchOrders, updateOrderStatus } from '@/lib/store/features/orderSlice';

// Components
import AdminHeader from '@/components/admin/AdminHeader';
import StatsCard from '@/components/admin/StatsCard';
import OrderRow from '@/components/admin/OrderRow';
import AddTableModal from '@/components/admin/modals/AddTableModal';
import AdminBottomNav from '@/components/admin/AdminBottomNav';
import TablesGrid from '@/components/admin/TablesGrid';
import MenuRow from '@/components/admin/menu/MenuRow';
import CategoryPills from '@/components/admin/menu/CategoryPills';
import OrderDetailsView from '@/components/admin/orders/OrderDetailsView';

// Modals
import AddProductModal from '@/components/admin/modals/AddProductModal';
import ManageCategoriesModal from '@/components/admin/modals/ManageCategoriesModal';

export default function AdminDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  // 2. Use Typed Dispatch
  const dispatch = useDispatch<AppDispatch>();

  // 3. Get Auth & Tables State from Redux
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { tables } = useSelector((state: RootState) => state.tables); // <--- Tables from Redux
  const { categories } = useSelector((state: RootState) => state.categories);
  const { products } = useSelector((state: RootState) => state.menu);
  const { orders } = useSelector((state: RootState) => state.orders);

  // --- Hydration Fix ---
  useEffect(() => {
    // FIX: Wrap in setTimeout to avoid the "synchronous setState" error.
    // This pushes the update to the next tick, satisfying the linter.
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // --- Route Protection ---
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isMounted, isAuthenticated, router]);

  // --- 4. Fetch Tables from Backend on Load ---
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTables());
      dispatch(fetchCategories());
      dispatch(fetchProducts());
      dispatch(fetchOrders());
    }
  }, [isAuthenticated, dispatch]);

  // --- Logout Handler ---
  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  // --- VIEW STATE ---
  const [currentView, setCurrentView] = useState<'ORDERS' | 'TABLES' | 'MENU'>('ORDERS');

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

  // --- MODAL STATES ---
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);


  // --- HANDLERS --
  // 
  const getTableNumber = (tableUuid: string) => {
    const found = tables.find(t => t.id === tableUuid);
    return found ? found.number : '??';
  };

  // 5. Updated Add Table Handler (API)
  const handleAddTable = async (newTableInput: string) => {
    const number = parseInt(newTableInput);

    if (isNaN(number)) {
      alert("Please enter a valid table number");
      return;
    }

    // Dispatch API Action
    const result = await dispatch(addTable(number));
    console.log(result)

    if (addTable.fulfilled.match(result)) {
      setIsTableModalOpen(false);
    } else {
      alert(result.payload || "Failed to add table");
    }
  };

  // 6. Updated Delete Table Handler (API)
  const handleDeleteTable = async (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      await dispatch(deleteTable(id));
    }
  };

  // ... (Other handlers remain the same) ...
  const cycleOrderStatus = async (orderId: string) => {
    // Find current status
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statusFlow: Record<OrderStatus, OrderStatus> = {
      'PENDING': 'SERVED',
      'SERVED': 'PAID',
      'PAID': 'CANCELLED',
      'CANCELLED': 'PENDING',
    };

    const nextStatus = statusFlow[order.status];
    await dispatch(updateOrderStatus({ orderId, status: nextStatus }));
  };

  const openAddProduct = () => { setEditingProduct(null); setIsProductModalOpen(true); };
  const openEditProduct = (product: Product) => { setEditingProduct(product); setIsProductModalOpen(true); };
  const handleOrderClick = (order: Order) => { setSelectedOrder(order); };

  const handleMarkCompleted = () => {
    if (selectedOrder) {
      dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: 'PAID' }));
      setSelectedOrder(null);
    }
  };

  const handleSaveProduct = async (
    itemData: FormData,
    variants: { id?: string; label: string; price: number }[]
  ) => {
    let result;

    if (editingProduct) {
      // Update Mode
      result = await dispatch(updateProduct({
        id: editingProduct.id,
        itemData,
        variants,
      }));
    } else {
      // Add Mode
      result = await dispatch(addProduct({
        itemData,
        variants,
      }));
    }

    // Check success
    if (addProduct.fulfilled.match(result) || updateProduct.fulfilled.match(result)) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } else {
      const errorMsg = result.payload as string || "Failed to save product";
      alert(errorMsg);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete product?")) await dispatch(deleteProduct(id));
  };

  const handleAddCategory = async (name: string) => {
    const result = await dispatch(addCategory(name));
    if (addCategory.fulfilled.match(result)) {
      setIsCategoryModalOpen(false);
    } else {
      alert(result.payload || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete category?")) await dispatch(deleteCategory(id));
  };

  // --- STATS ---
  const stats = {
    activeOrders: orders.filter(o => o.status !== 'PAID').length,
    revenue: orders
      .filter(o => o.status === 'PAID')
      .reduce((totalAcc, order) => {
        const orderTotal = order.items.reduce((itemAcc, item) => {
          return itemAcc + (item.price * item.quantity);
        }, 0);
        return totalAcc + orderTotal;
      }, 0) / 100,

    customers: orders.length
  };

  const filteredProducts = activeCategory === 'all' ? products : products.filter(p => p.categoryId === activeCategory);
  const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

  // 7. Early Return (MUST be after all hooks)
  if (!isMounted || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-24">

      {/* <div className="max-w-7xl mx-auto pt-4 ￼
px-4 md:px-8 flex justify-between items-center">
        <p className="text-sm text-gray-500">Welcome back, <span className="font-bold text-gray-900">{user?.name}</span></p>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-brand-red bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div> */}

      <AdminHeader onLogout={handleLogout} />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

        {currentView === 'ORDERS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Active Orders" value={stats.activeOrders.toString()} icon={<ShoppingBag size={24} />} badge="+3 new" badgeColor="bg-green-100 text-green-700" iconBg="bg-red-50 text-brand-red" />
            <StatsCard title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={<DollarSign size={24} />} badge="+12%" badgeColor="bg-green-100 text-green-700" iconBg="bg-green-50 text-green-600" />
            <StatsCard title="Total Customers" value={stats.customers.toString()} icon={<Users size={24} />} badge="+8" badgeColor="bg-green-100 text-green-700" iconBg="bg-blue-50 text-blue-600" />
          </div>
        )}

        {/* VIEW: ORDERS */}
        {currentView === 'ORDERS' && (
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
                  <div key={order.id} onClick={() => handleOrderClick(order)} className="cursor-pointer block">
                    <OrderRow
                      order={order}
                      tableNumber={getTableNumber(order.tableId)}
                      onStatusClick={() => cycleOrderStatus(order.id)}
                    />
                  </div>
                ))
              ) : <div className="p-10 text-center text-gray-400">No active orders found.</div>}
            </div>
          </div>
        )}

        {/* VIEW: TABLES */}
        {currentView === 'TABLES' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Restaurant Tables</h3>
              <span className="text-sm text-gray-400 font-medium">{tables.length} Tables Total</span>
            </div>
            <TablesGrid
              tables={tables} // Passing Redux Data
              activeOrders={orders}
              onAddClick={() => setIsTableModalOpen(true)}
              onDeleteTable={handleDeleteTable}
              onQrClick={(table) => setSelectedQrTable(table)}
            />
          </div>
        )}

        {/* VIEW: MENU */}
        {currentView === 'MENU' && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-900">Menu Management</h2></div>
            <CategoryPills categories={categories} activeCategory={activeCategory} onCategoryClick={setActiveCategory} onAddCategory={() => setIsCategoryModalOpen(true)} />
            <div className="flex flex-col gap-3 mt-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <MenuRow key={product.id} product={product} onEdit={() => openEditProduct(product)} onDelete={() => handleDeleteProduct(product.id)} />
                ))
              ) : <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed">No items in this category yet.</div>}
            </div>
          </div>
        )}
      </main>

      {currentView === 'MENU' && (
        <button onClick={openAddProduct} className="fixed bottom-24 right-6 w-14 h-14 bg-brand-red text-white rounded-full shadow-xl shadow-red-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
          <Plus size={28} />
        </button>
      )}

      <AdminBottomNav activeTab={currentView} onTabChange={setCurrentView} />

      <AnimatePresence>
        {selectedOrder && <OrderDetailsView key="order-details" order={selectedOrder} tableNumber={getTableNumber(selectedOrder.tableId)} onBack={() => setSelectedOrder(null)} onComplete={handleMarkCompleted} />}
      </AnimatePresence>

      <AddTableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onAdd={handleAddTable}
        currentTables={tables}
      />
      <AddProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} categories={categories} initialData={editingProduct} />
      <ManageCategoriesModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} onAdd={handleAddCategory} onDelete={handleDeleteCategory} />

      <QrCodeModal
        isOpen={!!selectedQrTable}
        onClose={() => setSelectedQrTable(null)}
        table={selectedQrTable}
      />
    </div>
  );
}