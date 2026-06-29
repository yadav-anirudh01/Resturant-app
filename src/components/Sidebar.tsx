import React from 'react';
import { 
  LayoutDashboard, Brain, Utensils, Receipt, ChefHat, 
  Table2, Warehouse, Users, Menu, FileText, Settings, Search, LogOut 
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onLogout,
  searchQuery,
  setSearchQuery
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Analytics Cockpit', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Cashier'] },
    { id: 'ai', label: 'AI Predictor Hub', icon: Brain, roles: ['Admin', 'Manager'] },
    { id: 'pos', label: 'POS & Digital Menu', icon: Utensils, roles: ['Admin', 'Manager', 'Cashier', 'Waiter'] },
    { id: 'orders', label: 'Order Desk', icon: Receipt, roles: ['Admin', 'Manager', 'Cashier'] },
    { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat, roles: ['Admin', 'Chef'] },
    { id: 'tables', label: 'Table Planner', icon: Table2, roles: ['Admin', 'Manager', 'Waiter'] },
    { id: 'inventory', label: 'Inventory Hub', icon: Warehouse, roles: ['Admin', 'Manager'] },
    { id: 'menu', label: 'Menu Editor', icon: Menu, roles: ['Admin', 'Manager'] },
    { id: 'employees', label: 'Employee Hub', icon: Users, roles: ['Admin', 'Manager'] },
    { id: 'reports', label: 'Reports Desk', icon: FileText, roles: ['Admin', 'Manager'] },
    { id: 'settings', label: 'System Settings', icon: Settings, roles: ['Admin', 'Manager'] }
  ];

  const allowedItems = menuItems.filter(item => {
    if (!user) return false;
    return item.roles.includes(user.role);
  });

  return (
    <aside id="app-sidebar" className="w-64 bg-high-density-sidebar border-r border-high-density-border flex flex-col justify-between text-slate-200 h-screen select-none shrink-0">
      <div className="flex flex-col overflow-y-auto">
        {/* Brand Header */}
        <div className="p-6 border-b border-high-density-border flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              R
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white text-lg leading-none">RestaurantOS</h1>
              <p className="text-[10px] text-blue-500 font-semibold tracking-widest uppercase mt-1">AI Management 2.0</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-high-density-bg border border-high-density-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600/10 text-blue-400 rounded-md border-l-2 border-blue-500 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-[#1E293B]'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      {user && (
        <div className="p-4 border-t border-high-density-border bg-high-density-highlight flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border-2 border-high-density-border flex items-center justify-center font-bold text-white uppercase shadow-sm">
              {user.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
          </div>
          <button
            id="btn-sidebar-logout"
            onClick={onLogout}
            className="w-full py-2 flex items-center justify-center gap-2 rounded-lg bg-high-density-bg hover:bg-rose-950/30 hover:text-rose-400 text-xs font-medium text-slate-400 border border-high-density-border hover:border-rose-900/30 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout System
          </button>
        </div>
      )}
    </aside>
  );
}
