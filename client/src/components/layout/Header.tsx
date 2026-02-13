'use client';

import { useState } from 'react';
import QRScannerModal from '@/components/auth/QRScannerModal';
import { ShoppingBag, Search, QrCode } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({ cartCount = 0, onCartClick, searchQuery, onSearchChange }: HeaderProps) {

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { tableId, tableNo } = useCart();

  const handleScan = (scannedUrl: string) => {
    try {
      let scannedTableId = '';

      if (scannedUrl.startsWith('http')) {
        const urlObj = new URL(scannedUrl);
        scannedTableId = urlObj.searchParams.get('table') || '';
      } else {
        scannedTableId = scannedUrl;
      }

      if (scannedTableId) {
        setIsScannerOpen(false);
        window.location.href = `/?table=${scannedTableId}`;
      } else {
        alert("Invalid QR Code. Please scan a valid table code.");
      }
    } catch (e) {
      console.error("Invalid scan", e);
      setIsScannerOpen(false);
    }
  };

  return (
    <>
      <div className="py-5 flex flex-col gap-6">
        <div className="flex gap-3 items-center">

          {/* LEFT: Cart Button */}
          <button
            onClick={onCartClick}
            className="w-12 h-12 bg-brand-red rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 relative shrink-0 active:scale-90 transition-transform"
          >
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-brand-red text-xs font-bold flex items-center justify-center rounded-full border-2 border-brand-red">
                {cartCount}
              </span>
            )}
          </button>

          {/* CENTER: Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search food..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-12 bg-white rounded-full pl-6 pr-10 text-sm text-gray-600 outline-none border border-transparent focus:border-brand-red transition-all shadow-sm placeholder:text-gray-400"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* RIGHT: Table Indicator or QR Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border transition-all relative bg-white
              ${tableId ? 'border-green-200' : 'border-transparent active:scale-95 hover:bg-gray-50 cursor-pointer'}
            `}
          >
            {tableId ? (
              <div className="flex flex-col items-center leading-none">
                <span className="text-[7px] font-bold text-gray-400 uppercase tracking-wide">Table</span>
                <span className="text-base font-black text-brand-dark -mt-0.5">{tableNo}</span>
              </div>
            ) : (
              <QrCode size={20} className="text-brand-dark" />
            )}
          </button>

        </div>
      </div>

      {/* --- QR SCANNER MODAL --- */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}