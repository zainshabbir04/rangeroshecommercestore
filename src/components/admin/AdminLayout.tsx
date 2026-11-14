import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const AdminLayout: React.FC = () => {
  const { admin, loading, logout } = useAuth();
  const { settings } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-[#3A1042] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#3A1042]">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders & WhatsApp', icon: ShoppingBag, end: false },
    { to: '/admin/products', label: 'Products Management', icon: Package, end: false },
    { to: '/admin/inventory', label: 'Stock & Inventory', icon: Boxes, end: false },
    { to: '/admin/settings', label: 'Store Settings', icon: Settings, end: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex bg-[#FAF6F0] text-[#161F33]">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#161F33]/60 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-68 bg-[#161F33] text-[#FAF6F0] flex flex-col justify-between border-r border-[#B8862D]/40 transition-transform duration-300 no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-3">
              <img
                src={settings?.logo_url || '/uploads/1794056903993-429854-rang-e-rosh-logo.jpg'}
                alt={settings?.store_name || 'Rang e Rosh'}
                className="w-11 h-11 rounded-full object-contain bg-[#FAF6F0] p-0.5 border border-[#B8862D]"
              />
              <div>
                <span className="font-serif-editorial text-xl font-bold tracking-wider text-white block leading-none">
                  RANG <span className="italic font-normal text-[#D8B572] lowercase">e</span> ROSH
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#D8B572] font-semibold mt-1 block">
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xs text-xs font-semibold tracking-wider uppercase transition-all ${
                      isActive
                        ? 'bg-[#3A1042] text-white border-l-3 border-[#D8B572] shadow-sm'
                        : 'text-[#FAF6F0]/75 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-[#D8B572] shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xs bg-white/5 hover:bg-white/10 text-xs font-medium text-[#D8B572] flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="px-2 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-white font-semibold truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F73] shrink-0" />
              <span className="truncate">{admin.name}</span>
            </div>
            <p className="text-[11px] text-white/60 truncate">{admin.email}</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xs bg-[#8C2D56]/25 hover:bg-[#8C2D56] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E5D9C5] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 no-print">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#161F33] hover:bg-[#FAF6F0] rounded-xs cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif-editorial text-2xl font-bold text-[#161F33]">
              Store Administration
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#F3ECE0] text-[#3A1042] font-medium border border-[#E5D9C5]">
              WhatsApp Dispatch: <strong>{settings?.whatsapp_number || '+923 200 300 552'}</strong>
            </span>
            <Link
              to="/"
              className="px-3 py-1.5 bg-[#3A1042] text-white font-semibold uppercase tracking-wider rounded-xs hover:bg-[#8C2D56]"
            >
              Storefront
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
