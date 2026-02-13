'use client';

import { X, Download, Printer, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Table } from '@/lib/types';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
}

export default function QrCodeModal({ isOpen, onClose, table }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchQrCode = async () => {
      if (!table) return;

      setIsLoading(true);
      try {
        const response = await api.get(`/table/${table.id}/qr`, {
          responseType: 'blob',
        });

        // Create URL and update state
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch QR code", error);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. Logic Flow
    if (isOpen && table) {
      fetchQrCode();
    }

    // 3. CLEANUP FUNCTION (Runs on unmount OR before re-running)
    return () => {
      setImageUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };
  }, [isOpen, table]);


  const handleDownload = () => {
    if (imageUrl && table) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `Table-${table.number}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (imageUrl) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <body style="display:flex; justify-content:center; align-items:center; height:100vh;">
              <img src="${imageUrl}" style="max-width:100%;" onload="window.print();window.close()" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">Table {table.number} QR</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center justify-center bg-white min-h-75">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xs font-medium">Generating QR...</span>
            </div>
          ) : imageUrl ? (
            <div className="relative group">
              <Image
                src={imageUrl}
                alt="Table QR"
                width={192}
                height={192}
                className="object-contain rounded-lg border border-gray-100 shadow-sm"
                unoptimized = {true} 
              />
            </div>
          ) : (
            <p className="text-red-500 text-sm">Failed to load QR Code</p>
          )}

          <p className="mt-4 text-sm text-gray-500 font-medium">
            Scan to order from Table {table.number}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 h-10 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="flex items-center justify-center gap-2 h-10 bg-brand-red text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 active:scale-95 transition-transform disabled:opacity-50"
          >
            <Download size={16} /> Download
          </button>
        </div>

      </div>
    </div>
  );
}