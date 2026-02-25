'use client';

import { useState } from 'react';
import QRScannerModal from '@/components/auth/QRScannerModal';
import { Search, QrCode, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface HeaderProps {
  cartCount?: number;
  onCartClick?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchFocus?: () => void;
}

export default function Header({ cartCount = 0, onCartClick, searchQuery, onSearchChange, onSearchFocus }: HeaderProps) {

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { tableToken, tableNo, resolveTableFromToken } = useCart();

  const handleScan = async (scannedUrl: string) => {
    try {
      let qrToken = '';

      if (scannedUrl.startsWith('http')) {
        const urlObj = new URL(scannedUrl);
        qrToken = urlObj.searchParams.get('table') || '';
      } else {
        qrToken = scannedUrl;
      }

      console.log(qrToken);

      if (qrToken) {
        setIsScannerOpen(false);

        await resolveTableFromToken(qrToken);

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
      <div className="py-4 flex flex-col gap-5">

        {/* TOP ROW: Logo and Actions */}
        <div className="flex justify-between items-center">

          {/* Brand Logo & Subtitle */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">
              HungryBuy<span className="text-brand-orange">.</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Delicious food at your table</p>
          </div>

          {/* Right Actions: Table Info & Cart */}
          <div className="flex items-center gap-4">

            {/* Table Indicator / QR Scanner */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${tableToken
                  ? 'bg-[#f16716] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                }`}
            >
              {tableToken ? (
                <span className="text-sm font-bold">{tableNo}</span>
              ) : (
                <QrCode size={18} />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-1 shrink-0 active:scale-95 transition-transform"
            >
              <ShoppingCart size={26} className="text-gray-800" strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for dishes, drinks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={onSearchFocus}
            className="w-full h-12 bg-[#F6F6F6] rounded-xl pl-11 pr-4 text-base text-gray-700 outline-none border border-transparent focus:border-brand-orange transition-all placeholder:text-gray-400 font-medium"
          />
        </div>

      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}