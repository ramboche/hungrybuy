import { Bell, Menu, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onLogout: () => void;
}

export default function AdminHeader({ onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-full lg:hidden">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-extrabold text-brand-dark">Dashboard</h1>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={22} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-brand-red font-bold border-2 border-white shadow-sm">
          M
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-xs font-bold text-brand-red bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </header>
  );
}