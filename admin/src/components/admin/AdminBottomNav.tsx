'use client';

import { ClipboardList, LayoutGrid, UtensilsCrossed } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 z-50 flex items-center justify-center gap-12 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">

      <NavBtn
        isActive={pathname === '/orders'}
        onClick={() => router.push('/orders')}
        icon={<ClipboardList size={24} />}
        label="Orders"
      />

      <NavBtn
        isActive={pathname === '/tables'}
        onClick={() => router.push('/tables')}
        icon={<LayoutGrid size={24} />}
        label="Tables"
      />

      <NavBtn
        isActive={pathname === '/menu'}
        onClick={() => router.push('/menu')}
        icon={<UtensilsCrossed size={24} />}
        label="Menu"
      />

    </div>
  );
}

interface NavBtnProps {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function NavBtn({ isActive, onClick, icon, label }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 min-w-16 transition-colors ${isActive ? 'text-brand-red' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <div className={isActive ? 'stroke-[2.5px]' : ''}>{icon}</div>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  )
}