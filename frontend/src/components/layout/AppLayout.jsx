import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trophy, LayoutDashboard, Users, Swords, BarChart2, User, LogOut, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/boloes', icon: Trophy, label: 'Bolões' },
];

export default function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-10 h-10 copa-gradient rounded-xl flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display text-xl tracking-wider text-white">BOLÃO</p>
            <p className="text-xs text-slate-400 -mt-1">Copa 2026</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-800 pt-4">
          <NavLink to="/perfil" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-sm font-medium mb-1">
            <User size={18} />
            {user?.user_metadata?.nome || 'Perfil'}
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 copa-gradient rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-white" />
          </div>
          <span className="font-display text-lg tracking-wider">BOLÃO COPA 2026</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-sm pt-16">
          <nav className="bg-slate-900 p-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all',
                  isActive ? 'bg-primary-500/20 text-primary-400' : 'text-slate-300'
                )}
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 font-medium"
            >
              <LogOut size={20} />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        <div className="md:p-8 p-4 pt-20 md:pt-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
