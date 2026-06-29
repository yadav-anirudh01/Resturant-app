import React, { useState, useEffect } from 'react';
import { Table2, GitMerge, RefreshCw, Layers, Calendar, UserPlus } from 'lucide-react';

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: 'Available' | 'Reserved' | 'Occupied';
  mergedWith: number | null;
  currentCustomerName?: string;
}

export default function TablesTab() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  
  // Merger
  const [mergeT1, setMergeT1] = useState<string>('');
  const [mergeT2, setMergeT2] = useState<string>('');
  const [mergeMsg, setMergeMsg] = useState('');

  // Shifting
  const [shiftSourceId, setShiftSourceId] = useState<string>('');
  const [shiftTargetId, setShiftTargetId] = useState<string>('');
  const [shiftMsg, setShiftMsg] = useState('');

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/tables');
      const data = await res.json();
      setTables(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (tableId: number, status: string, name?: string) => {
    try {
      const payload: any = { status };
      if (name) payload.currentCustomerName = name;
      else if (status === 'Available') payload.currentCustomerName = '';

      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        fetchTables();
        setSelectedTable(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMergeTables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeT1 || !mergeT2) return;

    try {
      const res = await fetch('/api/tables/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId1: parseInt(mergeT1),
          tableId2: parseInt(mergeT2)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMergeMsg(`Successfully merged tables ${mergeT1} and ${mergeT2}.`);
        setMergeT1('');
        setMergeT2('');
        fetchTables();
        setTimeout(() => setMergeMsg(''), 4000);
      } else {
        alert(data.message || 'Error merging tables');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShiftCustomers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftSourceId || !shiftTargetId) return;

    const sourceTable = tables.find(t => t.id === parseInt(shiftSourceId));
    const targetTable = tables.find(t => t.id === parseInt(shiftTargetId));

    if (!sourceTable || !targetTable) return;
    if (sourceTable.status !== 'Occupied' || targetTable.status !== 'Available') {
      alert('Source table must be Occupied and target table must be Available.');
      return;
    }

    try {
      // 1. Move customer name & Occupied status to target
      await fetch(`/api/tables/${targetTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Occupied',
          currentCustomerName: sourceTable.currentCustomerName
        })
      });

      // 2. Free up source table
      await fetch(`/api/tables/${sourceTable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Available',
          currentCustomerName: ''
        })
      });

      setShiftMsg(`Successfully shifted customer to Table ${shiftTargetId}.`);
      setShiftSourceId('');
      setShiftTargetId('');
      fetchTables();
      setTimeout(() => setShiftMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-high-density-bg overflow-y-auto flex-1 text-slate-200 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-high-density-border pb-5">
        <div>
          <span className="text-xs font-mono text-blue-500 uppercase tracking-widest font-semibold">Dining Floor Matrix</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Live Table Planner</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Available</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reserved</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Floor Visualizer Grid */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {tables.map(table => {
                const isOcc = table.status === 'Occupied';
                const isRes = table.status === 'Reserved';
                const isAvail = table.status === 'Available';

                const cardColors = isOcc 
                  ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50' 
                  : isRes 
                  ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50' 
                  : 'border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40';

                const statusBadge = isOcc ? 'text-rose-400 bg-rose-500/10' : isRes ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10';

                return (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-6 rounded-xl border text-left flex flex-col justify-between h-44 transition-all cursor-pointer select-none relative overflow-hidden ${cardColors}`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-500">CAP: {table.capacity}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${statusBadge}`}>
                          {table.status}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white tracking-tight">{table.name}</h4>
                      {table.mergedWith && (
                        <p className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
                          <GitMerge className="h-3 w-3" /> Merged with Table {table.mergedWith}
                        </p>
                      )}
                    </div>

                    <div className="border-t border-high-density-border/60 pt-3 flex flex-col gap-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">Diner Context</span>
                      <span className="text-xs font-semibold text-slate-100 truncate">
                        {table.currentCustomerName || 'Walk-in / Open'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action controllers (Merge, shift, table management popup) */}
        <div className="space-y-6">
          
          {/* Table click detailed controls */}
          {selectedTable && (
            <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-high-density-border pb-3">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">{selectedTable.name} Panel</h4>
                <button onClick={() => setSelectedTable(null)} className="text-slate-400 hover:text-white font-bold cursor-pointer">×</button>
              </div>
              
              <div className="space-y-1 bg-high-density-bg p-3.5 rounded-lg border border-high-density-border text-xs">
                <p className="text-slate-400">Current Status: <strong className="text-white">{selectedTable.status}</strong></p>
                <p className="text-slate-400">Customer: <strong className="text-white">{selectedTable.currentCustomerName || 'None'}</strong></p>
                <p className="text-slate-400">Capacity: <strong className="text-white">{selectedTable.capacity} guests</strong></p>
              </div>

              <div className="space-y-2">
                {selectedTable.status === 'Available' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTable.id, 'Reserved', 'Walk-in Booker')}
                    className="w-full py-2 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Reserve Table
                  </button>
                )}
                {selectedTable.status === 'Reserved' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTable.id, 'Occupied', selectedTable.currentCustomerName || 'Walk-in Guest')}
                    className="w-full py-2 bg-blue-600 text-white hover:bg-blue-500 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Seat Customers (Occupied)
                  </button>
                )}
                {(selectedTable.status === 'Occupied' || selectedTable.status === 'Reserved') && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedTable.id, 'Available')}
                    className="w-full py-2 bg-high-density-bg hover:bg-high-density-highlight text-slate-300 border border-high-density-border rounded-lg text-xs font-bold cursor-pointer transition-all"
                  >
                    Free Up / Clear Table
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Merge table controller */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <GitMerge className="h-4.5 w-4.5 text-blue-400" />
              Merge Tables
            </h3>
            {mergeMsg && (
              <div className="p-2 text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                {mergeMsg}
              </div>
            )}
            <form onSubmit={handleMergeTables} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  required
                  value={mergeT1}
                  onChange={e => setMergeT1(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">Table A</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select
                  required
                  value={mergeT2}
                  onChange={e => setMergeT2(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">Table B</option>
                  {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-high-density-bg hover:bg-high-density-highlight text-slate-300 border border-high-density-border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Perform Tables Merger
              </button>
            </form>
          </div>

          {/* Shift customer tables controller */}
          <div className="bg-high-density-panel border border-high-density-border rounded-xl p-6 space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-blue-400" />
              Shift Diners table
            </h3>
            {shiftMsg && (
              <div className="p-2 text-center bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                {shiftMsg}
              </div>
            )}
            <form onSubmit={handleShiftCustomers} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <select
                  required
                  value={shiftSourceId}
                  onChange={e => setShiftSourceId(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">From</option>
                  {tables.filter(t => t.status === 'Occupied').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select
                  required
                  value={shiftTargetId}
                  onChange={e => setShiftTargetId(e.target.value)}
                  className="w-full bg-high-density-bg border border-high-density-border rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="">To</option>
                  {tables.filter(t => t.status === 'Available').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-high-density-bg hover:bg-high-density-highlight text-slate-300 border border-high-density-border rounded-lg text-xs font-semibold cursor-pointer"
              >
                Re-allocate Customer Table
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
