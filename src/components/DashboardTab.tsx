import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell, Legend 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, TrendingUp, AlertTriangle, 
  Sparkles, Layers, ArrowRight, RefreshCw, Calendar 
} from 'lucide-react';
import { motion } from 'motion/react';

interface MetricData {
  todaySales: number;
  todayOrders: number;
  historicalSales: number;
  profit: number;
  expenses: number;
  activeTables: number;
  reservedTables: number;
  lowStockCount: number;
  expiringSoonCount: number;
}

interface AIInsight {
  title: string;
  recommendation: string;
  category: 'Stock' | 'Sales' | 'Menu' | 'Operation';
  impact: 'High' | 'Medium' | 'Low';
}

export default function DashboardTab() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [expiryList, setExpiryList] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      setMetrics(data.metrics);
      setChartData(data.historicalData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setLowStockList(data.lowStock);
      setExpiryList(data.expiringSoon);
    } catch (err) {
      console.error('Error fetching inventory alerts:', err);
    }
  };

  const generateAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/analytics/ai-insights', { method: 'POST' });
      const data = await res.json();
      setAiInsights(data);
    } catch (err) {
      console.error('Error generating AI Insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchInventoryAlerts();
    generateAIInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    await fetchInventoryAlerts();
    setRefreshing(false);
  };

  if (!metrics) {
    return (
      <div className="flex-1 bg-high-density-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="text-slate-400 font-medium text-sm">Synchronizing central telemetry data...</p>
        </div>
      </div>
    );
  }

  // Preprocess category distribution for simple category bar charts
  const categoryData = [
    { name: 'Veg', orders: 124 },
    { name: 'Non-Veg', orders: 156 },
    { name: 'Beverages', orders: 198 },
    { name: 'Desserts', orders: 92 },
    { name: 'Specials', orders: 48 }
  ];

  const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      {/* Top Banner / Breadcrumb */}
      <div className="flex items-center justify-between border-b border-high-density-border pb-5">
        <div>
          <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Operational Cockpit</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Analytics Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-2 bg-high-density-panel px-3 py-1.5 rounded-lg border border-high-density-border">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            Active Session: UTC 2026-06-29
          </span>
          <button 
            id="btn-dashboard-refresh"
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-high-density-panel hover:bg-[#1E293B] border border-high-density-border rounded-lg px-4 py-2 text-xs font-medium cursor-pointer transition-all hover:border-blue-500/30"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-500 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today Sales */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border hover:border-slate-700/80 transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">Today's Sales</p>
            <p className="text-2xl font-bold font-mono text-white">${metrics.todaySales.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded font-medium border border-emerald-500/10 inline-block">
              +14.2% vs yesterday
            </span>
          </div>
          <div className="p-3 rounded-xl bg-high-density-bg border border-high-density-border text-emerald-500 shadow-md">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Today Orders */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border hover:border-slate-700/80 transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">Today's Orders</p>
            <p className="text-2xl font-bold font-mono text-white">{metrics.todayOrders}</p>
            <span className="text-[10px] text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded font-medium border border-blue-500/10 inline-block">
              +8.5% peak volumes
            </span>
          </div>
          <div className="p-3 rounded-xl bg-high-density-bg border border-high-density-border text-blue-400 shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Monthly Net Profit */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border hover:border-slate-700/80 transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">Monthly Profit</p>
            <p className="text-2xl font-bold font-mono text-white">${metrics.profit.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded font-medium border border-emerald-500/10 inline-block">
              Avg Margin: 42.5%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-high-density-bg border border-high-density-border text-purple-400 shadow-md">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border hover:border-slate-700/80 transition-all flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider">Low Stock alerts</p>
            <p className="text-2xl font-bold font-mono text-rose-500">{metrics.lowStockCount}</p>
            <span className="text-[10px] text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded font-medium border border-rose-500/10 inline-block">
              Needs Immediate Order
            </span>
          </div>
          <div className="p-3 rounded-xl bg-high-density-bg border border-high-density-border text-rose-500 shadow-md">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Area Chart */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Revenue Trends</h3>
            <p className="text-xs text-slate-400">Daily sales performance & operational margins over past 30 days.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15181F', borderColor: '#1E293B', borderRadius: '12px' }} 
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#3b82f6', fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Gross Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dish Categories Bar Chart */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border space-y-4">
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Dish Category Shares</h3>
            <p className="text-xs text-slate-400">Total orders distributed by dining classification.</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#15181F', borderColor: '#1E293B', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Business Insights Panel */}
      <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
              RestaurantOS AI Gastronomical Intelligence
            </div>
            <h3 className="font-bold text-white text-lg tracking-tight">AI business insights</h3>
            <p className="text-xs text-slate-400">Real-time optimization models predicting sales surge, menu pairings, and supply chain adjustments.</p>
          </div>
          <button 
            id="btn-generate-ai-insights"
            onClick={generateAIInsights}
            disabled={loadingInsights}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 transition-all font-sans"
          >
            {loadingInsights ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Regenerate Insights
          </button>
        </div>

        {loadingInsights ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-400 font-mono tracking-widest animate-pulse">CONSULTING GEMINI ANALYTICAL ENGINE...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {aiInsights.map((insight, idx) => {
              const catColors: Record<string, string> = {
                'Stock': 'border-rose-500/20 bg-rose-500/5 text-rose-400',
                'Sales': 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
                'Menu': 'border-amber-500/20 bg-amber-500/5 text-amber-400',
                'Operation': 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'
              };
              return (
                <div key={idx} className="p-5 rounded-xl bg-high-density-bg border border-high-density-border space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${catColors[insight.category] || 'border-[#1E293B] text-slate-400'}`}>
                        {insight.category.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        insight.impact === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-high-density-highlight text-slate-400 border border-high-density-border'
                      }`}>
                        {insight.impact} Impact
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm tracking-tight">{insight.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.recommendation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Critical Stock & Expiry Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Watch */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Critical Stock Shortages
            </h4>
            <span className="text-xs text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-semibold">
              Action Required
            </span>
          </div>
          <div className="space-y-3">
            {lowStockList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">All raw inventory materials safely stocked.</p>
            ) : (
              lowStockList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-high-density-highlight border border-high-density-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Min Threshold: {item.minStock} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-rose-500 font-mono">{item.currentStock} {item.unit}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{item.supplierName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="p-6 rounded-2xl bg-high-density-panel border border-high-density-border space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Upcoming Material Expirations
            </h4>
            <span className="text-xs text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 font-semibold">
              Near Expiry (7d)
            </span>
          </div>
          <div className="space-y-3">
            {expiryList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No raw perishable ingredients nearing expiration.</p>
            ) : (
              expiryList.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-high-density-highlight border border-high-density-border flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-rose-400 mt-0.5 font-mono font-medium">Expires: {item.expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white font-mono">{item.currentStock} {item.unit}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{item.supplierName}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
