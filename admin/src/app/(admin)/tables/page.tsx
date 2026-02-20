'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { addTable, deleteTable } from '@/lib/store/features/tableSlice';
import { Table } from '@/lib/types';

import TablesGrid from '@/components/admin/TablesGrid';
import AddTableModal from '@/components/modals/AddTableModal';
import QrCodeModal from '@/components/modals/QrCodeModal';

export default function TablesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { tables } = useSelector((state: RootState) => state.tables);
  const { orders } = useSelector((state: RootState) => state.orders);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [selectedQrTable, setSelectedQrTable] = useState<Table | null>(null);

  const handleAddTable = async (newTableInput: string) => {
    const number = parseInt(newTableInput);
    if (isNaN(number)) return alert("Please enter a valid table number");

    const result = await dispatch(addTable(number));
    if (addTable.fulfilled.match(result)) setIsTableModalOpen(false);
    else alert(result.payload || "Failed to add table");
  };

  const handleDeleteTable = async (id: string) => {
    if (confirm("Are you sure you want to delete this table?")) {
      await dispatch(deleteTable(id));
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Restaurant Tables</h3>
          <span className="text-sm text-gray-400 font-medium">{tables.length} Tables Total</span>
        </div>
        <TablesGrid
          tables={tables}
          activeOrders={orders}
          onAddClick={() => setIsTableModalOpen(true)}
          onDeleteTable={handleDeleteTable}
          onQrClick={(table) => setSelectedQrTable(table)}
        />
      </div>

      <AddTableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onAdd={handleAddTable} currentTables={tables} />
      <QrCodeModal isOpen={!!selectedQrTable} onClose={() => setSelectedQrTable(null)} table={selectedQrTable} />
    </main>
  );
}