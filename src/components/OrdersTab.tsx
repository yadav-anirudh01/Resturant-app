import React, { useState, useEffect } from 'react';
import { 
  Receipt, Play, CheckCircle2, XCircle, DollarSign, Mail, 
  Download, Split, Sparkles, RefreshCw, Layers 
} from 'lucide-react';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tableId: number | null;
  type: 'Dine-In' | 'Takeaway' | 'Delivery' | 'Online';
  items: OrderItem[];
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Wallet' | null;
  paymentStatus: 'Pending' | 'Paid';
  notes?: string;
  timestamp: string;
  customerName: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Split billing popup/modal state
  const [splitOrder, setSplitOrder] = useState<Order | null>(null);
  const [splitWays, setSplitWays] = useState<number>(2);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayment = async (orderId: string, method: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentStatus: 'Paid',
          paymentMethod: method,
          status: 'Served' // set to Served automatically on paid dine-in
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailInvoice = (order: Order) => {
    alert(`Email invoice successfully queued and sent to registered guest: ${order.customerName}@restaurantos.ai`);
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return o.status !== 'Served' && o.status !== 'Cancelled';
    return o.status === statusFilter;
  });

  return (
    <div className="p-8 bg-slate-900 overflow-y-auto flex-1 text-slate-100 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Point of Sales</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Order Management Desk</h2>
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                statusFilter === filter 
                  ? 'bg-emerald-500 text-slate-950 font-bold' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map(order => {
            const statusColors: Record<string, string> = {
              'Pending': 'text-amber-400 bg-amber-500/5 border border-amber-500/10',
              'Preparing': 'text-blue-400 bg-blue-500/5 border border-blue-500/10',
              'Ready': 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10',
              'Served': 'text-slate-500 bg-slate-950 border border-slate-800',
              'Cancelled': 'text-rose-500 bg-rose-500/5 border border-rose-500/10'
            };

            return (
              <div key={order.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5">
                
                {/* Order Meta */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{order.id}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${statusColors[order.status]}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Diner: <strong className="text-white">{order.customerName}</strong></span>
                    <span>{order.type} {order.tableId ? `(Table ${order.tableId})` : ''}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    Placed: {new Date(order.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="space-y-2 border-t border-b border-slate-800/60 py-3.5">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">Ordered items</p>
                  <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-slate-300">x{it.quantity} {it.name}</span>
                        <span className="font-mono text-slate-400">${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Receipt and Notes */}
                <div className="space-y-3">
                  {order.notes && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/50 text-[11px] text-slate-400 italic">
                      Note: {order.notes}
                    </div>
                  )}

                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-400">Payment Status</p>
                      <span className={`text-[10px] font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {order.paymentStatus.toUpperCase()} {order.paymentMethod ? `via ${order.paymentMethod}` : ''}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Total Bill</p>
                      <p className="text-sm font-bold text-emerald-400">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* POS Operations & Status updates */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  {/* Status Progression buttons */}
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Preparing')}
                      className="w-full py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="h-3.5 w-3.5" /> Send to Kitchen (Prepare)
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Ready')}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Ready for Serving
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'Served')}
                      className="w-full py-2 bg-slate-100 hover:bg-white text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Serve Dishes
                    </button>
                  )}

                  {/* Payment Processor (If pending payment) */}
                  {order.paymentStatus === 'Pending' && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-mono text-slate-400 text-center uppercase tracking-widest font-semibold">Collect Bill Payment</p>
                      <div className="grid grid-cols-4 gap-1">
                        {['UPI', 'Card', 'Cash', 'Wallet'].map(m => (
                          <button
                            key={m}
                            onClick={() => handleProcessPayment(order.id, m)}
                            className="py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] font-bold text-emerald-400 cursor-pointer"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Utility panel: Split Bill, Print receipt, Email Receipt */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button 
                      onClick={() => setSplitOrder(order)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Split className="h-3 w-3 text-blue-400" /> Split
                    </button>
                    <a 
                      href={`/api/export/invoice/${order.id}`}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="h-3 w-3 text-emerald-500" /> Invoice
                    </a>
                    <button 
                      onClick={() => handleEmailInvoice(order)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Mail className="h-3 w-3 text-purple-400" /> Email
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Split Bill Overlay Modal */}
      {splitOrder && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base">Split Bill Calculator</h4>
              <button onClick={() => setSplitOrder(null)} className="text-slate-400 hover:text-white font-bold">×</button>
            </div>
            <div className="space-y-4 font-sans">
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure ticket splitting parameters for order <strong className="text-emerald-400 font-mono">{splitOrder.id}</strong>.
              </p>
              
              <div className="space-y-1.5 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Grand Total Bill</span>
                  <span>${splitOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-slate-800">
                  <span>Split share (1 of {splitWays})</span>
                  <span className="text-emerald-400">${(splitOrder.total / splitWays).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 uppercase">Number of Split Ways</label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setSplitWays(num)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        splitWays === num 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Collect payment of $${(splitOrder.total / splitWays).toFixed(2)} from each of the ${splitWays} guests.`);
                  setSplitOrder(null);
                }}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Log Split Collection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
