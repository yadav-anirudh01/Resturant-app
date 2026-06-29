import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, LogIn, RefreshCw, ChefHat, User } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import AIPredictorTab from './components/AIPredictorTab';
import POSTab from './components/POSTab';
import OrdersTab from './components/OrdersTab';
import KitchenTab from './components/KitchenTab';
import TablesTab from './components/TablesTab';
import InventoryTab from './components/InventoryTab';
import MenuTab from './components/MenuTab';
import EmployeesTab from './components/EmployeesTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import { User as UserType } from './types';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Login form credentials
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginRole, setLoginRole] = useState<'Admin' | 'Manager' | 'Cashier' | 'Chef' | 'Waiter' | 'Customer'>('Admin');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // Automatically check for existing local session if any
    const savedUser = localStorage.getItem('restaurantos_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        // Default tab based on role permissions
        if (u.role === 'Chef') setCurrentTab('kitchen');
        else if (u.role === 'Customer') setCurrentTab('pos');
        else setCurrentTab('dashboard');
      } catch (e) {
        localStorage.removeItem('restaurantos_user');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');

    try {
      const res = await fetch("https://restaurant-app.onrender.com/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          role: loginRole
        })
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('restaurantos_user', JSON.stringify(data.user));
        
        // Route to logical default workspace based on role permissions
        if (data.user.role === 'Chef') {
          setCurrentTab('kitchen');
        } else if (data.user.role === 'Customer') {
          setCurrentTab('pos');
        } else {
          setCurrentTab('dashboard');
        }
      } else {
        setErrorMsg(data.message || 'Invalid credentials or matching roles.');
      }
    } catch (err) {
      setErrorMsg('Cannot establish connection to server. Please ensure standard ports are open.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('restaurantos_user');
  };

  // If not logged in, render the premium Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-high-density-bg flex items-center justify-center p-4 select-none font-sans relative overflow-hidden">
        
        {/* Decorative Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="w-full max-w-md bg-high-density-panel border border-high-density-border rounded-2xl p-8 relative z-10 space-y-8 shadow-2xl">
          
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-2xl mx-auto shadow-xl shadow-blue-500/20">
              R
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">RestaurantOS AI</h2>
              <p className="text-xs text-blue-500 font-semibold tracking-widest uppercase mt-1">AI Management 2.0</p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold text-center leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Select Access Node</label>
              <select
                value={loginRole}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setLoginRole(val);
                  // Autofill credentials helper for easy simulation
                  if (val === 'Admin' || val === 'Manager') {
                    setLoginUsername('admin');
                    setLoginPassword('admin123');
                  } else if (val === 'Chef') {
                    setLoginUsername('chef');
                    setLoginPassword('chef123');
                  } else if (val === 'Customer') {
                    setLoginUsername('guest');
                    setLoginPassword('guest123');
                  } else {
                    setLoginUsername('cashier');
                    setLoginPassword('cashier123');
                  }
                }}
                className="w-full bg-high-density-bg border border-high-density-border rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Admin">Administrator Desk (Full Access)</option>
                <option value="Manager">Restaurant Manager</option>
                <option value="Cashier">POS Cashier counter</option>
                <option value="Chef">Kitchen Executive Chef</option>
                <option value="Waiter">Floor Staff / Waiter</option>
                <option value="Customer">Self-Service Diner / Customer</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Username / Passcode</label>
              <input
                type="text"
                placeholder="Enter workspace credentials"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full bg-high-density-bg border border-high-density-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-high-density-bg border border-high-density-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-xl text-xs font-bold tracking-wider cursor-pointer shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Authenticating Session...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Initialize System Session
                </>
              )}
            </button>
          </form>

          {/* Quick login demo helper footnote */}
          <div className="bg-high-density-highlight p-4 rounded-xl border border-high-density-border/60 text-[10px] font-mono text-slate-500 leading-relaxed text-center space-y-1">
            <p className="text-blue-400 font-semibold uppercase tracking-wider">Simulation Helper</p>
            <p>Admin: admin / admin123 | Chef: chef / chef123</p>
            <p>Customer: guest / guest123</p>
          </div>

        </div>
      </div>
    );
  }

  // Active view routing map
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'ai':
        return <AIPredictorTab />;
      case 'pos':
        return <POSTab />;
      case 'orders':
        return <OrdersTab />;
      case 'kitchen':
        return <KitchenTab />;
      case 'tables':
        return <TablesTab />;
      case 'inventory':
        return <InventoryTab />;
      case 'menu':
        return <MenuTab />;
      case 'employees':
        return <EmployeesTab />;
      case 'reports':
        return <ReportsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen bg-high-density-bg text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar Navigation (Hidden for Customer segment to match immersive self-service styling) */}
      {user.role !== 'Customer' ? (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      ) : (
        // Custom header for Customer role since sidebar is omitted for self-service
        <aside className="w-64 bg-high-density-sidebar border-r border-high-density-border flex flex-col justify-between text-slate-200 h-screen select-none shrink-0">
          <div className="flex flex-col">
            <div className="p-6 border-b border-high-density-border flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">R</div>
                <div>
                  <h1 className="font-bold tracking-tight text-white text-base">RestaurantOS</h1>
                  <span className="text-[10px] font-mono text-blue-400 font-semibold tracking-widest">DINER SEAT</span>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              <button
                onClick={() => setCurrentTab('pos')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold ${
                  currentTab === 'pos' ? 'bg-blue-600/10 text-blue-400 rounded-md border-l-2 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-high-density-panel'
                }`}
              >
                Gourmet digital menu
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-high-density-border space-y-2">
            <div className="text-center font-mono text-[10px] text-slate-500">
              Seat ID: Table #4 | Diner: {user.name}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-1.5 bg-high-density-panel hover:bg-rose-950/20 hover:text-rose-400 text-[10px] font-bold text-slate-400 border border-high-density-border rounded-lg cursor-pointer transition-all"
            >
              Sign out session
            </button>
          </div>
        </aside>
      )}

      {/* Main active viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderActiveView()}
      </main>

    </div>
  );
}
