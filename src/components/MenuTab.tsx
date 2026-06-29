import React, { useState, useEffect } from 'react';
import { Menu, Plus, Trash2, Edit3, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

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

export default function MenuTab() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New item form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'Veg' | 'Non-Veg' | 'Beverages' | 'Desserts' | 'Special'>('Veg');
  const [image, setImage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
    const payload = {
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || fallbackImage,
      available: true,
      isFavorite
    };

    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Dish created successfully and added to active POS menu catalog!');
        setName('');
        setDescription('');
        setPrice('');
        setCategory('Veg');
        setImage('');
        setIsFavorite(false);
        fetchMenu();
        setTimeout(() => setFormSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !item.available })
      });
      const data = await res.json();
      if (data.success) {
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this dish from the menu?')) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-slate-900 overflow-y-auto flex-1 text-slate-100 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Store Catalog Editor</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Menu Management</h2>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
          Dishes Listed: {menu.length} entries
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Active Dishes Grid with edit triggers */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map(item => (
                <div key={item.id} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold shadow ${
                        item.category === 'Veg' ? 'bg-emerald-500/95 text-slate-950' : 'bg-rose-500/95 text-white'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                      <span className="font-mono text-emerald-400 font-bold">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                      <span>Status: <strong className={item.available ? 'text-emerald-400' : 'text-rose-500'}>
                        {item.available ? 'AVAILABLE' : 'SOLD OUT'}
                      </strong></span>
                      {item.isFavorite && <span className="text-amber-400 font-bold">BESTSELLER</span>}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                        item.available 
                          ? 'bg-rose-500/5 text-rose-400 border-rose-500/20 hover:bg-rose-500/10' 
                          : 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold'
                      }`}
                    >
                      {item.available ? 'Set Sold Out' : 'Set Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="py-2 text-[11px] font-bold rounded-xl bg-slate-900 text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Create New Menu Dish */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-emerald-400" />
              Add Food Dish
            </h3>

            {formSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold text-center">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateMenuItem} className="space-y-4 font-sans">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Dish Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Saffron Kheer"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Category Classification</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Desserts">Desserts / Sweets</option>
                  <option value="Special">OS Specialty Selection</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Selling Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 12.99"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Image URL</label>
                <input 
                  type="url" 
                  placeholder="Paste Unsplash URL (optional)"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  placeholder="Briefly describe dish ingredients and gourmet presentation..."
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="chk-bestseller"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="chk-bestseller" className="text-xs text-slate-300">Promote as Menu Bestseller</label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md"
              >
                Publish New Dish
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
