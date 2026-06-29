import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, AlertTriangle, ShoppingCart, Target, Sparkles, 
  Clock, Package, Star, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DemandPrediction {
  itemId: string;
  name: string;
  predictedQty: number;
  confidence: number;
}

interface WastePrediction {
  ingredientId: string;
  name: string;
  currentStock: number;
  unit: string;
  potentialWasteQty: number;
  daysToExpiry: number;
  wasteRiskPercent: number;
}

interface Segment {
  segment: string;
  count: number;
  avgCheck: number;
  description: string;
}

export default function AIPredictorTab() {
  const [activePredictor, setActivePredictor] = useState<'demand' | 'revenue' | 'waste' | 'segments' | 'purchase'>('demand');
  const [demandList, setDemandList] = useState<DemandPrediction[]>([]);
  const [forecastList, setForecastList] = useState<any[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [wasteList, setWasteList] = useState<WastePrediction[]>([]);
  const [segmentsList, setSegmentsList] = useState<Segment[]>([]);
  const [purchaseRecs, setPurchaseRecs] = useState<any[]>([]);
  const [rushHours, setRushHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIPredictorData = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        
        setDemandList(data.predictions.tomorrowDemand);
        setForecastList(data.predictions.weeklyForecast);
        setWeeklyTotal(data.predictions.weeklyForecastTotal);
        setWasteList(data.predictions.foodWaste);
        setSegmentsList(data.predictions.customerSegments);
        setRushHours(data.predictions.rushHour);

        // Fetch ingredients to calculate recommendations
        const ingRes = await fetch('/api/inventory');
        const ingData = await ingRes.json();
        const lowIngs = ingData.lowStock || [];
        
        // Auto purchase recommendations calculation
        const recs = ingData.ingredients.map((ing: any) => {
          const recQty = Math.ceil((ing.minStock * 2) - ing.currentStock);
          const urgency = ing.currentStock <= ing.minStock ? 'High' : 'Medium';
          return {
            id: ing.id,
            name: ing.name,
            currentStock: ing.currentStock,
            minStock: ing.minStock,
            unit: ing.unit,
            recommendedQty: Math.max(0, recQty),
            totalCost: Math.max(0, recQty) * ing.pricePerUnit,
            urgency,
            supplier: ing.supplierName
          };
        }).filter((r: any) => r.recommendedQty > 0);
        
        setPurchaseRecs(recs);
      } catch (err) {
        console.error('Error fetching AI predictor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIPredictorData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-high-density-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Brain className="h-10 w-10 text-blue-500 animate-pulse" />
          <p className="text-slate-400 font-medium text-sm">Processing machine learning projections...</p>
        </div>
      </div>
    );
  }

  // Association Rule recommendations mapping
  const menuAssociations = [
    { item: 'Truffle Mushroom Pizza', recommendations: ['Deconstructed Tiramisu ($9.99)', 'Cold-Pressed Cucumber Juice ($6.49)'], lift: '2.8x' },
    { item: 'Spicy Wagyu Smash Burger', recommendations: ['Classic Espresso Tonic ($5.99)', 'Molten Chocolate Lava ($10.49)'], lift: '3.1x' },
    { item: 'Signature Saffron Biryani', recommendations: ['Deconstructed Tiramisu ($9.99)', 'Cold-Pressed Cucumber Juice ($6.49)'], lift: '2.4x' }
  ];

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-high-density-border pb-5">
        <div>
          <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Gastronomical Intelligence Hub</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">AI Predictor Desk</h2>
        </div>
        <div className="flex items-center gap-2 bg-high-density-panel px-3.5 py-1.5 rounded-lg border border-high-density-border text-xs font-mono text-slate-400">
          <Sparkles className="h-4.5 w-4.5 text-blue-400" />
          Engine Status: ONLINE
        </div>
      </div>

      {/* Predictor Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left selector menu */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold px-3">Available ML Models</p>
          {[
            { id: 'demand', label: 'Dish Demand Predictor', icon: Target },
            { id: 'revenue', label: 'Revenue Forecasting', icon: TrendingUp },
            { id: 'waste', label: 'Food Waste Prediction', icon: AlertTriangle },
            { id: 'purchase', label: 'Auto Purchase Recommender', icon: ShoppingCart },
            { id: 'segments', label: 'Customer Segmentation', icon: Brain }
          ].map((item) => {
            const Icon = item.icon;
            const isSel = activePredictor === item.id;
            return (
              <button
                key={item.id}
                id={`btn-predictor-${item.id}`}
                onClick={() => setActivePredictor(item.id as any)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all border cursor-pointer ${
                  isSel 
                    ? 'bg-blue-600 text-white border-blue-500/30 font-semibold shadow-lg shadow-blue-500/5' 
                    : 'bg-high-density-panel hover:bg-[#1E293B] text-slate-400 border-high-density-border hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isSel ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Predictor Viewer Frame */}
        <div className="lg:col-span-3 bg-high-density-panel border border-high-density-border rounded-xl p-6 min-h-[420px] flex flex-col justify-between">
          
          {/* DEMAND PREDICTION VIEW */}
          {activePredictor === 'demand' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Tomorrow's Food Demand Prediction</h3>
                <p className="text-xs text-slate-400 mt-1">Uses historical sales velocity, weekend booking multipliers, and ingredient availability coefficients.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demandList.map((item, idx) => (
                  <div key={idx} className="p-4 bg-high-density-bg border border-high-density-border rounded-lg flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-white leading-tight">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-blue-400 font-semibold">Confidence</span>
                        <span className="text-[10px] font-mono text-slate-400">{item.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-blue-400">{item.predictedQty} units</p>
                      <p className="text-[9px] text-slate-500">Predicted tomorrow</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVENUE FORECASTING VIEW */}
          {activePredictor === 'revenue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">7-Day Revenue Forecasting</h3>
                  <p className="text-xs text-slate-400 mt-1">Linear regression fit calculated across historical daily margins projection.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-mono">Weekly Forecast Sum</p>
                  <p className="text-lg font-mono font-bold text-blue-400">${weeklyTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="h-60 w-full bg-high-density-bg p-3 rounded-lg border border-high-density-border">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastList} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F1117', borderColor: '#1E293B', borderRadius: '8px' }}
                      itemStyle={{ color: '#3B82F6', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Projected Revenue ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* FOOD WASTE RISK PREDICTION */}
          {activePredictor === 'waste' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Food Waste Risk Predictor</h3>
                <p className="text-xs text-slate-400 mt-1">Analyzes raw material stock thresholds, decay curves, and average daily consumption.</p>
              </div>
              <div className="space-y-3">
                {wasteList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">No raw perishables classified at imminent waste risk.</p>
                ) : (
                  wasteList.map((item, idx) => (
                    <div key={idx} className="p-4 bg-high-density-bg border border-high-density-border rounded-lg flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Current Stock: {item.currentStock} {item.unit} | Days to Expiry: <span className="font-bold text-rose-400">{item.daysToExpiry} days</span></p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-[10px] text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 font-bold">
                            {item.wasteRiskPercent}% Waste Risk
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Est. Excess Waste: {item.potentialWasteQty} {item.unit}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AUTO PURCHASE RECOMMENDER */}
          {activePredictor === 'purchase' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Auto Purchase Recommendation</h3>
                <p className="text-xs text-slate-400 mt-1">Formulates optimum order weights to restock materials reaching critical levels.</p>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {purchaseRecs.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Stock levels perfect. No purchase orders recommended.</p>
                ) : (
                  purchaseRecs.map((item, idx) => (
                    <div key={idx} className="p-4 bg-high-density-bg border border-high-density-border rounded-lg flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Supplier: <span className="font-semibold text-white">{item.supplier}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-blue-400">Order: +{item.recommendedQty} {item.unit}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Est. Cost: ${item.totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CUSTOMER SEGMENTATION VIEW */}
          {activePredictor === 'segments' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Customer Segmentation Model</h3>
                <p className="text-xs text-slate-400 mt-1">Categorizes loyal diners based on ticket size, frequency indices, and historical table reservation volumes.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {segmentsList.map((item, idx) => (
                  <div key={idx} className="p-4 bg-high-density-bg border border-high-density-border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400">{item.segment}</span>
                      <span className="text-[10px] text-slate-400 bg-high-density-panel px-2 py-0.5 rounded border border-high-density-border font-mono">
                        {item.count} customers
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{item.description}</p>
                    <div className="pt-1 border-t border-high-density-border/60 text-right">
                      <span className="text-[10px] text-slate-400 font-mono">Avg Check: ${item.avgCheck.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytical Footnote */}
          <div className="mt-6 pt-4 border-t border-high-density-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[10px] font-mono">
            <span>Model Version: RestaurantOS-ML-v2.1</span>
            <span>Last computed: UTC 2026-06-29</span>
          </div>
        </div>
      </div>

      {/* Rush Hour & Smart Pairings Bento Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rush Hours graph list */}
        <div className="p-6 rounded-xl bg-high-density-panel border border-high-density-border space-y-4">
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-blue-400" />
              Rush Hour load predictor
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Predicted hourly customer occupancy peaks based on weekly traffic records.</p>
          </div>
          <div className="space-y-2">
            {rushHours.slice(0, 7).map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300">{item.hour}</span>
                  <span className={`${item.loadPercent >= 80 ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>{item.loadPercent}% Load</span>
                </div>
                <div className="w-full bg-high-density-bg rounded-full h-1.5 overflow-hidden border border-high-density-border">
                  <div 
                    className={`h-full rounded-full ${item.loadPercent >= 80 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${item.loadPercent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Association Rules */}
        <div className="p-6 rounded-xl bg-high-density-panel border border-high-density-border space-y-4">
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-blue-400" />
              AI Dish Cross-Selling Recommendations
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Dishes frequently purchased together. Cross-selling these boosts check sizes by up to 24%.</p>
          </div>
          <div className="space-y-4">
            {menuAssociations.map((assoc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-high-density-highlight border border-high-density-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{assoc.item}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 font-mono font-bold">
                    Lift: {assoc.lift}
                  </span>
                </div>
                <div className="space-y-1 pl-3 border-l-2 border-blue-500/30">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-bold">Cross-sell Pairings</p>
                  {assoc.recommendations.map((rec, rIdx) => (
                    <div key={rIdx} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
