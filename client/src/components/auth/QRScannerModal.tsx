'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { X } from 'lucide-react';
import { useState } from 'react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (url: string) => void;
}

export default function QRScannerModal({ isOpen, onClose, onScan }: QRScannerModalProps) {
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/90 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full backdrop-blur-sm z-10"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-sm relative aspect-square rounded-3xl overflow-hidden border-2 border-brand-red/50 shadow-2xl">
        <Scanner
          onScan={(result) => {
            if (result && result.length > 0) {
              onScan(result[0].rawValue);
            }
          }}
          onError={(err) => {
            console.error(err);
            setError("Camera permission denied or not available.");
          }}
          scanDelay={500}
          allowMultiple={false}
          sound={false}
          // FIX: 'audio' is removed. Use top-level 'sound={false}' if explicitly needed (default is false).
          components={{
            onOff: false,  // This shows the camera toggle button
            torch: true,
            zoom: false,
            finder: false,
          }}
          constraints={{
            facingMode: 'environment' // Forces back camera
          }}
          styles={{
            container: { width: '100%', height: '100%' }
          }}
        />
      </div>

      <p className="text-white mt-6 text-center font-medium opacity-80">
        Point camera at a Table QR Code
      </p>

      {error && (
        <p className="text-red-400 mt-2 text-sm text-center">{error}</p>
      )}
    </div>
  );
}