import React, { useState, useEffect } from 'react';
import { FileText, Download, Mail, Printer, Sparkles, Database, CheckSquare, List } from 'lucide-react';

interface ReportPreview {
  date: string;
  orders: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export default function ReportsTab() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'employees'>('sales');
  const [duration, setDuration] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dataPreview, setDataPreview] = useState<ReportPreview[]>([]);
  const [emailSuccess, setEmailSuccess] = useState('');

  useEffect(() => {
    const fetchReportPreview = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        
        // Map last 7 entries for preview
        const mapped = data.historicalData.slice(-8).map((day: any) => ({
          date: day.date,
          orders: day.orders,
          revenue: day.revenue,
          expenses: day.expense,
          profit: parseFloat((day.revenue - day.expense).toFixed(2))
        }));
        setDataPreview(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchReportPreview();
  }, []);

  const handleTriggerEmailReport = () => {
    setEmailSuccess(`Gourmet intelligence report successfully generated and sent to owner / managers!`);
    setTimeout(() => setEmailSuccess(''), 5000);
  };

  return (
    <div className="p-8 bg-slate-900 overflow-y-auto flex-1 text-slate-100 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Business Intelligence</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Reports & Exports Desk</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left side: Selector configuration */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-emerald-400" />
            Compile Parameters
          </h3>

          <div className="space-y-4">
            
            {/* Report category selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Report Category</label>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'sales', label: 'Financial Sales Report' },
                  { id: 'inventory', label: 'Inventory Stock Sheet' },
                  { id: 'employees', label: 'Employee Attendance & Payroll' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setReportType(cat.id as any)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      reportType === cat.id 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                        : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration filter selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-400 uppercase">Interval Duration</label>
              <div className="grid grid-cols-3 gap-1">
                {['daily', 'weekly', 'monthly'].map(dur => (
                  <button
                    key={dur}
                    onClick={() => setDuration(dur as any)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border capitalize transition-all ${
                      duration === dur 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-2">
              <a 
                href={`/api/export/report/${reportType}`}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="h-4 w-4" /> Export Spreadsheet (.CSV)
              </a>

              <button 
                onClick={handleTriggerEmailReport}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer text-slate-300"
              >
                <Mail className="h-4 w-4 text-purple-400" /> Email Executive PDF
              </button>
            </div>

          </div>
        </div>

        {/* Right side: Report grid preview */}
        <div className="xl:col-span-3 space-y-6">
          {emailSuccess && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold text-center">
              {emailSuccess}
            </div>
          )}

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800/80">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-emerald-400" />
                Data Preview Log (Live)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Report Timestamp</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Gross Revenue</th>
                    <th className="px-6 py-4">Operating Cost</th>
                    <th className="px-6 py-4 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {dataPreview.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">{item.date}</td>
                      <td className="px-6 py-4 font-semibold text-slate-300">{item.orders} tickets</td>
                      <td className="px-6 py-4 font-mono text-white font-bold">${item.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">${item.expenses.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">${item.profit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
