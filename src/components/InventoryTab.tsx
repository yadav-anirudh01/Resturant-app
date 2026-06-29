import React, { useState, useEffect } from 'react';
import { Warehouse, AlertTriangle, ShoppingCart, Users, Calendar, Plus, RefreshCw, CheckCircle } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  supplierName: string;
  pricePerUnit: number;
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  ingredientsProvided: string[];
}

export default function InventoryTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [lowStock, setLowStock] = useState<Ingredient[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Form restock states
  const [purchaseIngId, setPurchaseIngId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState('');
  const [purchaseMsg, setPurchaseMsg] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setIngredients(data.ingredients);
      setSuppliers(data.suppliers);
      setLowStock(data.lowStock);
      setExpiringSoon(data.expiringSoon);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseIngId || !purchaseQty) return;

    try {
      const res = await fetch('/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientId: purchaseIngId,
          quantity: parseFloat(purchaseQty)
        })
      });
      const data = await res.json();
      if (data.success) {
        setPurchaseMsg(`Restocked successfully! Updated material quantity.`);
        setPurchaseIngId('');
        setPurchaseQty('');
        fetchInventory();
        setTimeout(() => setPurchaseMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-high-density-border pb-5">
        <div>
          <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Storehouse Management</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Inventory Control Hub</h2>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-rose-400 bg-rose-500/5 px-3 py-1.5 rounded-lg border border-rose-500/10">
            Low Stock: {lowStock.length} materials
          </span>
          <span className="text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-lg border border-amber-500/10">
            Expiring (7d): {expiringSoon.length} materials
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Ingredients spreadsheet table */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-high-density-panel border border-high-density-border rounded-xl overflow-hidden">
            <div className="p-5 border-b border-high-density-border flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Warehouse className="h-4.5 w-4.5 text-blue-400" />
                Raw Materials Inventory
              </h3>
              <button 
                onClick={fetchInventory}
                className="p-1.5 hover:bg-[#1E293B] rounded-lg text-slate-400 hover:text-white border border-high-density-border"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-high-density-sidebar text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-high-density-border">
                    <tr>
                      <th className="px-6 py-4">Ingredient Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Expiry Date</th>
                      <th className="px-6 py-4">Supplier</th>
                      <th className="px-6 py-4 text-right">Cost/Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-high-density-border/40">
                    {ingredients.map((ing) => {
                      const isLow = ing.currentStock <= ing.minStock;
                      const expDate = new Date(ing.expiryDate);
                      const today = new Date('2026-06-29');
                      const daysToExp = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isExpiring = daysToExp <= 7 && daysToExp >= 0;

                      return (
                        <tr key={ing.id} className="hover:bg-high-density-highlight transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{ing.name}</td>
                          <td className="px-6 py-4">
                            {isLow ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">Low Stock</span>
                            ) : isExpiring ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">Expiry Alert</span>
                            ) : (
                              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase">Normal</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-white">
                            {ing.currentStock} {ing.unit}
                            <span className="text-[10px] text-slate-500 font-normal block">Min: {ing.minStock} {ing.unit}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-300">
                            {ing.expiryDate}
                            {isExpiring && <span className="text-[9px] text-rose-400 block font-semibold mt-0.5">{daysToExp} days left</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{ing.supplierName}</td>
                          <td className="px-6 py-4 text-right font-mono text-blue-400 font-bold">${ing.pricePerUnit.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Supplier Details & PO Creator */}
        <div className="space-y-6">
          
          {/* Purchase Order Restock Form */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="h-4.5 w-4.5 text-blue-400" />
              Create Purchase Order
            </h3>
            {purchaseMsg && (
              <div className="p-2 text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                {purchaseMsg}
              </div>
            )}
            <form onSubmit={handlePurchaseSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Select Ingredient</label>
                <select
                  required
                  value={purchaseIngId}
                  onChange={e => setPurchaseIngId(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">-- Select Material --</option>
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Order Quantity</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 10"
                  required
                  value={purchaseQty}
                  onChange={e => setPurchaseQty(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/10"
              >
                Log Restock Delivery
              </button>
            </form>
          </div>

          {/* Suppliers list */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-400" />
              Supplier Directories
            </h3>
            <div className="space-y-3.5">
              {suppliers.map(sup => (
                <div key={sup.id} className="p-3.5 rounded-xl bg-high-density-bg border border-high-density-border space-y-2">
                  <div className="flex justify-between items-center border-b border-high-density-border pb-1.5">
                    <p className="text-xs font-bold text-white">{sup.name}</p>
                    <span className="text-[9px] font-mono text-slate-500">SUPP</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Contact: <strong className="text-white font-mono">{sup.contact}</strong></p>
                  <p className="text-[10px] text-slate-400">Email: <strong className="text-white">{sup.email}</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sup.ingredientsProvided.map((ing, idx) => (
                      <span key={idx} className="text-[9px] font-mono text-blue-400 bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
