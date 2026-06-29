import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Clock, AlertCircle, CheckCircle2, Play, Volume2, RefreshCw } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  tableId: number | null;
  type: string;
  items: OrderItem[];
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  timestamp: string;
  customerName: string;
  chefId?: string;
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
}

export default function KitchenTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [chefs, setChefs] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const previousOrderCountRef = useRef<number>(0);

  // HTML5 Web Audio API synthesizer for clean sound alerts
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5 node
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5 node

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5 node

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.5);
    } catch (e) {
      console.warn('AudioContext failed to load or trigger:', e);
    }
  };

  const fetchKitchenState = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      // Filter out completed and cancelled orders
      const kitchenOrders = data.filter((o: Order) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
      
      // Check if a new order has arrived to trigger sound notification
      if (previousOrderCountRef.current > 0 && kitchenOrders.length > previousOrderCountRef.current) {
        playChime();
      }
      previousOrderCountRef.current = kitchenOrders.length;
      
      setOrders(kitchenOrders);

      // Fetch employees to load assigned Chefs list
      const empRes = await fetch('/api/employees');
      const empData = await empRes.json();
      setChefs(empData.filter((e: Employee) => e.role === 'Chef'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenState();
    const interval = setInterval(fetchKitchenState, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchKitchenState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignChef = async (orderId: string, chefId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chefId, status: 'Preparing' }) // Auto start cooking upon Chef assignment
      });
      const data = await res.json();
      if (data.success) {
        fetchKitchenState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to calculate cooking/wait duration dynamically
  const getWaitMinutes = (isoString: string) => {
    const placed = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - placed.getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-high-density-border pb-5">
        <div>
          <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Kitchen Display System (KDS)</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Live Chef's Order Queue</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={playChime}
            className="flex items-center gap-2 bg-high-density-panel hover:bg-[#1E293B] border border-high-density-border px-4.5 py-2 rounded-lg text-xs font-semibold cursor-pointer text-blue-400"
          >
            <Volume2 className="h-4 w-4 text-blue-400" /> Sound Check
          </button>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg font-semibold">
            Active Chef Queue: {orders.length} orders
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-xl bg-high-density-panel border border-high-density-border text-center space-y-3">
          <ChefHat className="h-12 w-12 text-slate-600 mx-auto" />
          <h4 className="font-bold text-white text-base">Kitchen Queue is Clear</h4>
          <p className="text-xs text-slate-500">Wait for customer orders to populate the active display rails.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map(order => {
            const minutesWait = getWaitMinutes(order.timestamp);
            const isLate = minutesWait >= 15;
            const assignedChef = chefs.find(c => c.id === order.chefId);

            return (
              <div 
                key={order.id} 
                className={`p-6 rounded-xl bg-high-density-panel border transition-all flex flex-col justify-between space-y-5 ${
                  order.status === 'Pending' ? 'border-amber-500/30' :
                  order.status === 'Ready' ? 'border-emerald-500/30 opacity-70' : 'border-high-density-border'
                }`}
              >
                {/* Meta details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-white">{order.id}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.type} {order.tableId ? `| Table ${order.tableId}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        order.status === 'Pending' ? 'text-amber-400 bg-amber-500/5' :
                        order.status === 'Preparing' ? 'text-blue-400 bg-blue-500/5' : 'text-emerald-400 bg-emerald-500/5'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock className={`h-3.5 w-3.5 ${isLate ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                    <span className={isLate ? 'text-rose-500 font-semibold' : 'text-slate-400'}>
                      Elapsed: <strong className="font-mono">{minutesWait} mins</strong>
                    </span>
                    {isLate && (
                      <span className="text-[9px] font-bold text-rose-500 bg-rose-500/5 border border-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Priority
                      </span>
                    )}
                  </div>
                </div>

                {/* Items and quantities */}
                <div className="space-y-2 border-t border-b border-high-density-border py-4">
                  <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500">Dish Preparation</p>
                  <div className="space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-high-density-highlight p-2 rounded-lg">
                        <span className="text-sm font-bold text-white">x{it.quantity} {it.name}</span>
                        <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase bg-blue-500/5 px-2 py-0.5 rounded">VEG</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chef Assignment & Instructions */}
                <div className="space-y-3">
                  {order.notes && (
                    <div className="p-2.5 rounded-lg bg-high-density-bg border border-high-density-border/40 text-[11px] text-amber-400 italic">
                      Instructions: {order.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono">Assigned Chef</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{assignedChef ? assignedChef.name : 'Unassigned'}</p>
                    </div>
                    {/* Quick Assign Dropdown */}
                    {!order.chefId && (
                      <select
                        onChange={(e) => handleAssignChef(order.id, e.target.value)}
                        className="bg-high-density-bg border border-high-density-border text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500/50 text-slate-300"
                      >
                        <option value="">Assign Chef...</option>
                        {chefs.map(chef => (
                          <option key={chef.id} value={chef.id}>{chef.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Action steps */}
                <div className="pt-2 border-t border-high-density-border flex gap-2">
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Cooking
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Ready')}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete Prep (Ready)
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <div className="text-center w-full text-xs text-slate-500 font-medium py-1.5 bg-high-density-bg rounded-lg border border-high-density-border">
                      Dishes Prepared & Servable
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
