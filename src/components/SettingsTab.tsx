import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldAlert, Database, RefreshCw, CheckCircle2, Sliders } from 'lucide-react';

interface SettingData {
  restaurantName: string;
  address: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  backupInterval: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<SettingData>({
    restaurantName: 'RestaurantOS AI',
    address: 'Suite 210, Gourmet Highs, CA',
    currency: '$',
    taxRate: 8.5,
    lowStockThreshold: 10,
    backupInterval: 'Daily'
  });
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [backupSuccess, setBackupSuccess] = useState('');

  const fetchSettingsAndBackups = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data.settings);
      setBackups(data.backups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndBackups();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess('Gourmet general preferences updated successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const res = await fetch('/api/settings/backup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBackupSuccess(`New database restore state successfully archived: ${data.backup.id}`);
        fetchSettingsAndBackups();
        setTimeout(() => setBackupSuccess(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreBackup = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/restore/${id}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`System successfully reverted back to Restore State: ${id}`);
        fetchSettingsAndBackups();
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
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Gourmet Core Controller</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">System Settings</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Main forms parameters */}
        <div className="xl:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4.5 w-4.5 text-emerald-400" />
            General Parameters
          </h3>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold text-center">
              {saveSuccess}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Establishment Name</label>
                  <input 
                    type="text" 
                    value={settings.restaurantName}
                    onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Operating Location Address</label>
                  <input 
                    type="text" 
                    value={settings.address}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">State Tax rate (GST %)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.taxRate}
                    onChange={e => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Low Stock Warning Limit</label>
                  <input 
                    type="number" 
                    value={settings.lowStockThreshold}
                    onChange={e => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </form>
          )}
        </div>

        {/* Database state backups panels */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Database className="h-4.5 w-4.5 text-emerald-400" />
              State Backup Engine
            </h3>
            {backupSuccess && (
              <div className="p-2.5 text-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold leading-tight">
                {backupSuccess}
              </div>
            )}

            <button
              onClick={handleCreateBackup}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Trigger Core Snapshot Archive
            </button>

            <div className="space-y-2 pt-3 border-t border-slate-800/60">
              <p className="text-[10px] font-mono text-slate-400 uppercase">Available Snapshots</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {backups.map(b => (
                  <div key={b.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center text-xs">
                    <div>
                      <p className="font-mono font-bold text-white leading-tight">{b.id}</p>
                      <span className="text-[9px] text-slate-500 block mt-0.5">{b.timestamp}</span>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(b.id)}
                      className="px-2 py-1 bg-emerald-500 text-slate-950 rounded text-[9px] font-bold cursor-pointer hover:bg-emerald-400"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
