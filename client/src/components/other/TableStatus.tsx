'use client';
import { useCart } from "@/hooks/useCart";
import { QrCode } from 'lucide-react';

export default function TableStatus() {
  const { tableNo } = useCart();

  // If connected, show Table ID
  if (tableNo) {
    return (
      <div className="bg-green-100 border-b border-green-200 px-4 py-2 flex items-center justify-center gap-2 text-green-800 text-sm font-medium">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Connected to Table No : {tableNo}
      </div>
    );
  }

  // If NOT connected, show instruction
  return (
    <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-3 flex items-center justify-center gap-2 text-yellow-800 text-sm">
      <QrCode size={16} />
      <span>Please scan a QR code to start ordering</span>
    </div>
  );
}