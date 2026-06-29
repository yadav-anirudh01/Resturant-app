import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, ShoppingCart, Heart, Search, Filter, 
  Calendar, Star, Send, Clock, MapPin, CheckCircle2, Ticket 
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Veg' | 'Non-Veg' | 'Beverages' | 'Desserts' | 'Special';
  image: string;
  available: boolean;
  isFavorite?: boolean;
}

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'Available' | 'Reserved' | 'Occupied';
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export default function POSTab() {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [tablesList, setTablesList] = useState<Table[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<'Dine-In' | 'Takeaway' | 'Delivery' | 'Online'>('Dine-In');
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Wallet'>('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState('');

  // Live Order Tracking
  const [myOrders, setMyOrders] = useState<any[]>([]);

  // Reservation Form State
  const [reserveName, setReserveName] = useState('');
  const [reserveTableId, setReserveTableId] = useState<number | null>(null);
  const [reserveStatus, setReserveStatus] = useState('');

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const fetchMenuAndTables = async () => {
    try {
      const menuRes = await fetch('/api/menu');
      const menuData = await menuRes.json();
      setMenuList(menuData);

      const tableRes = await fetch('/api/tables');
      const tableData = await tableRes.json();
      setTablesList(tableData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setMyOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMenuAndTables();
    fetchMyOrders();
    // poll orders for live tracking updates
    const interval = setInterval(fetchMyOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    const existing = cart.find(c => c.menuItem.id === item.id);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.menuItem.id !== item.id));
    }
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'PROMO10') {
      setAppliedDiscount(10.00);
    } else if (couponCode.toUpperCase() === 'WELCOME5') {
      setAppliedDiscount(5.00);
    } else {
      setAppliedDiscount(0);
      alert('Invalid Promo Code. Try: PROMO10 ($10 off) or WELCOME5 ($5 off)');
    }
  };

  // Cart Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.085; // settings.taxRate
  const total = Math.max(0, subtotal + tax - appliedDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert('Please specify a Customer Name for the order context.');
      return;
    }
    if (cart.length === 0) {
      alert('Your digital cart is empty!');
      return;
    }

    const orderPayload = {
      tableId: orderType === 'Dine-In' ? selectedTableId : null,
      type: orderType,
      items: cart.map(c => ({
        menuItemId: c.menuItem.id,
        name: c.menuItem.name,
        price: c.menuItem.price,
        quantity: c.quantity
      })),
      subtotal,
      tax,
      discount: appliedDiscount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash' ? 'Pending' : 'Paid',
      notes,
      customerName
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        setOrderSuccessMessage(`Order placed successfully! Reference: ${data.order.id}`);
        setCart([]);
        setNotes('');
        setCustomerName('');
        setAppliedDiscount(0);
        setCouponCode('');
        fetchMenuAndTables(); // Refresh available tables
        fetchMyOrders();
        setTimeout(() => setOrderSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReserveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveName || !reserveTableId) {
      alert('Fill all reservation details.');
      return;
    }

    try {
      const res = await fetch(`/api/tables/${reserveTableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Reserved',
          currentCustomerName: reserveName
        })
      });
      const data = await res.json();
      if (data.success) {
        setReserveStatus(`Table Reserved successfully for ${reserveName}.`);
        setReserveName('');
        setReserveTableId(null);
        fetchMenuAndTables();
        setTimeout(() => setReserveStatus(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName || !feedbackComment) {
      alert('Please fill in both name and comment.');
      return;
    }

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: feedbackName,
          rating: feedbackRating,
          comment: feedbackComment
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackStatus(`Thank you! Loyalty reward of ${data.review.loyaltyPoints} points awarded!`);
        setFeedbackName('');
        setFeedbackComment('');
        setFeedbackRating(5);
        setTimeout(() => setFeedbackStatus(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Menu filters
  const filteredMenu = menuList.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      
      {/* Header */}
      <div className="border-b border-high-density-border pb-5">
        <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Self-Service Terminal</span>
        <h2 className="text-2xl font-bold text-white tracking-tight mt-1">POS & Digital Menu</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left column: Food Catalog */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-high-density-panel p-4 rounded-xl border border-high-density-border">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Veg', 'Non-Veg', 'Beverages', 'Desserts', 'Special'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-high-density-bg text-slate-400 hover:text-white hover:bg-[#1E293B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-high-density-bg border border-high-density-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Menu Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMenu.map(dish => (
              <div key={dish.id} className="rounded-xl overflow-hidden bg-high-density-panel border border-high-density-border flex flex-col justify-between">
                <div>
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={dish.image} 
                      alt={dish.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow ${
                        dish.category === 'Veg' ? 'bg-emerald-500/90 text-slate-950' : 'bg-rose-500/90 text-white'
                      }`}>
                        {dish.category}
                      </span>
                      {dish.isFavorite && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-slate-950" /> Bestseller
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-sm tracking-tight">{dish.name}</h4>
                      <span className="font-mono font-bold text-blue-400 text-sm">${dish.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{dish.description}</p>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleAddToCart(dish)}
                    disabled={!dish.available}
                    className="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-high-density-bg hover:bg-blue-600 hover:text-white text-slate-300 font-semibold text-xs border border-high-density-border hover:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {dish.available ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Cart Checkout & Trackers */}
        <div className="space-y-6">
          
          {/* Cart & Checkout */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-high-density-border pb-4">
              <ShoppingCart className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white text-base tracking-tight">Active Dining Cart</h3>
            </div>

            {orderSuccessMessage && (
              <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-medium text-center">
                {orderSuccessMessage}
              </div>
            )}

            {cart.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">Select dishes on the left to populate active ticket.</p>
            ) : (
              <div className="space-y-4">
                {/* Cart list */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1 border-b border-high-density-border pb-4">
                  {cart.map(item => (
                    <div key={item.menuItem.id} className="flex justify-between items-center bg-high-density-highlight p-2.5 rounded-lg border border-high-density-border/50">
                      <div>
                        <p className="text-xs font-semibold text-white">{item.menuItem.name}</p>
                        <p className="text-[10px] text-blue-400 font-mono mt-0.5">${item.menuItem.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2 bg-high-density-bg border border-high-density-border rounded-lg p-1">
                        <button onClick={() => handleRemoveFromCart(item.menuItem)} className="p-1 hover:text-white text-slate-400"><Minus className="h-3 w-3" /></button>
                        <span className="text-xs font-mono font-bold w-4 text-center text-white">{item.quantity}</span>
                        <button onClick={() => handleAddToCart(item.menuItem)} className="p-1 hover:text-white text-slate-400"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout form context */}
                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Customer Context</label>
                      <input 
                        type="text" 
                        placeholder="e.g. John Doe"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Service Method</label>
                      <select 
                        value={orderType}
                        onChange={e => setOrderType(e.target.value as any)}
                        className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="Dine-In">Dine-In</option>
                        <option value="Takeaway">Takeaway</option>
                        <option value="Delivery">Delivery</option>
                        <option value="Online">Online</option>
                      </select>
                    </div>
                  </div>

                  {orderType === 'Dine-In' && (
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Select Active Table</label>
                      <select 
                        value={selectedTableId || ''} 
                        onChange={e => setSelectedTableId(parseInt(e.target.value) || null)}
                        className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Choose available table --</option>
                        {tablesList.filter(t => t.status === 'Available').map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Coupon Codes */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1 flex items-center gap-1">
                        <Ticket className="h-3 w-3 text-blue-400" /> Coupon code
                      </label>
                      <input 
                        type="text" 
                        placeholder="PROMO10 / WELCOME5"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-high-density-bg border border-high-density-border hover:bg-[#1E293B] px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer text-white"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Payment Gateway */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Payment Method</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['UPI', 'Card', 'Wallet', 'Cash'].map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method as any)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            paymentMethod === method 
                              ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                              : 'bg-high-density-bg border border-high-density-border text-slate-400 hover:text-white'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Order notes */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Preparation Note</label>
                    <textarea
                      placeholder="Special instructions (e.g., allergies, spicy levels)"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full h-12 bg-high-density-bg border border-high-density-border rounded-lg p-2 text-xs text-white focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Receipts sums */}
                  <div className="bg-high-density-highlight p-4 rounded-xl border border-high-density-border font-mono space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>GST & Tax (8.5%)</span>
                      <span>+${tax.toFixed(2)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-rose-400">
                        <span>Discount Applied</span>
                        <span>-${appliedDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-high-density-border flex justify-between font-bold text-white text-sm">
                      <span>Total Invoice</span>
                      <span className="text-blue-400">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold tracking-wider cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    Confirm & Place Dining Order
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Table Reservation Mock */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-blue-400" /> Book / Reserve Table
            </h3>
            {reserveStatus && (
              <div className="p-2 text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                {reserveStatus}
              </div>
            )}
            <form onSubmit={handleReserveTable} className="space-y-3">
              <input 
                type="text" 
                placeholder="Guest Name"
                required
                value={reserveName}
                onChange={e => setReserveName(e.target.value)}
                className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
              />
              <select
                required
                value={reserveTableId || ''}
                onChange={e => setReserveTableId(parseInt(e.target.value) || null)}
                className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- Choose Table --</option>
                {tablesList.filter(t => t.status === 'Available').map(t => (
                  <option key={t.id} value={t.id}>{t.name} (Cap: {t.capacity})</option>
                ))}
              </select>
              <button 
                type="submit"
                className="w-full py-2 bg-high-density-bg hover:bg-high-density-highlight text-slate-300 border border-high-density-border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reserve Selected Table
              </button>
            </form>
          </div>

          {/* Live Order Tracker */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-blue-400 animate-spin" style={{ animationDuration: '60s' }} /> Live Order Status Tracking
            </h3>
            <div className="space-y-3">
              {myOrders.slice(-2).map(order => {
                const statusColors: Record<string, string> = {
                  'Pending': 'text-amber-400 bg-amber-500/5 border border-amber-500/10',
                  'Preparing': 'text-blue-400 bg-blue-500/5 border border-blue-500/10',
                  'Ready': 'text-emerald-400 bg-emerald-500/5 border border-emerald-500/10',
                  'Served': 'text-slate-400 bg-slate-800 border border-slate-700'
                };
                return (
                  <div key={order.id} className="p-3.5 rounded-xl bg-high-density-bg border border-high-density-border space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-white">{order.id}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${statusColors[order.status] || ''}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Diner: {order.customerName}</span>
                      <span>Total: ${order.total.toFixed(2)}</span>
                    </div>
                    {/* Cooking / Delivery progress bar */}
                    <div className="w-full bg-high-density-highlight h-1 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${
                        order.status === 'Pending' ? 'w-1/4 bg-amber-500' :
                        order.status === 'Preparing' ? 'w-2/3 bg-blue-500 animate-pulse' :
                        'w-full bg-blue-500'
                      }`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews Feedback */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Star className="h-4.5 w-4.5 text-blue-400" /> Share Diners Review
            </h3>
            {feedbackStatus && (
              <div className="p-2 text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                {feedbackStatus}
              </div>
            )}
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Your Name"
                  required
                  value={feedbackName}
                  onChange={e => setFeedbackName(e.target.value)}
                  className="flex-1 bg-high-density-bg border border-high-density-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
                <select
                  value={feedbackRating}
                  onChange={e => setFeedbackRating(parseInt(e.target.value))}
                  className="bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-amber-400 font-bold focus:outline-none"
                >
                  <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                  <option value="4">⭐⭐⭐⭐ 4/5</option>
                  <option value="3">⭐⭐⭐ 3/5</option>
                  <option value="2">⭐⭐ 2/5</option>
                  <option value="1">⭐ 1/5</option>
                </select>
              </div>
              <textarea
                placeholder="Write your culinary feedback... get instant loyalty points!"
                required
                value={feedbackComment}
                onChange={e => setFeedbackComment(e.target.value)}
                className="w-full h-16 bg-high-density-bg border border-high-density-border rounded-lg p-2.5 text-xs text-white focus:outline-none resize-none"
              ></textarea>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Send className="h-3.5 w-3.5" /> Submit Culinary Review
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
