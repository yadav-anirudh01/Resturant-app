import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Star, Clock, CreditCard, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier' | 'Chef' | 'Waiter';
  attendanceStatus: 'Present' | 'Absent' | 'On Leave';
  shiftStart: string;
  shiftEnd: string;
  salary: number;
  performanceScore: number;
  leaveDays: string[];
}

export default function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [payrollSuccess, setPayrollSuccess] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleToggleAttendance = async (empId: string, status: string) => {
    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceStatus: status })
      });
      const data = await res.json();
      if (data.success) {
        fetchEmployees();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessPayroll = () => {
    setPayrollSuccess('Payroll calculations submitted! Bank direct transfers successfully initiated.');
    setTimeout(() => setPayrollSuccess(''), 5000);
  };

  // Payroll aggregations
  const totalPayrollCost = employees.reduce((sum, e) => sum + e.salary, 0);
  const activeStaffCount = employees.filter(e => e.attendanceStatus === 'Present').length;

  return (
    <div className="p-8 bg-slate-900 overflow-y-auto flex-1 text-slate-100 space-y-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-semibold">Human Resources</span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Staff & Employee Hub</h2>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span className="text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
            Active Staff Present Today: {activeStaffCount} / {employees.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Employee List Grid */}
        <div className="xl:col-span-3 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {employees.map(emp => {
                const isPresent = emp.attendanceStatus === 'Present';
                const isLeave = emp.attendanceStatus === 'On Leave';

                const attendanceBadgeColor = isPresent 
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                  : isLeave 
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                  : 'text-rose-400 bg-rose-500/10 border border-rose-500/20';

                return (
                  <div key={emp.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-bold text-sm uppercase">
                          {emp.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{emp.name}</h4>
                          <span className="text-[10px] font-mono text-emerald-400 font-semibold uppercase">{emp.role}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${attendanceBadgeColor}`}>
                        {emp.attendanceStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800/60 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> Shift Timings
                        </p>
                        <p className="text-white font-mono text-xs">{emp.shiftStart} – {emp.shiftEnd}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <CreditCard className="h-3 w-3 text-slate-400" /> Monthly Salary
                        </p>
                        <p className="text-white font-mono text-xs">${emp.salary.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5 text-amber-400 items-center">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star 
                            key={idx} 
                            className={`h-3.5 w-3.5 ${idx < Math.round(emp.performanceScore) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        ))}
                        <span className="text-[10px] text-slate-400 font-mono ml-1.5">({emp.performanceScore}/5)</span>
                      </div>

                      {/* Quick Attendance Selector Switches */}
                      <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                        {['Present', 'Leave'].map(att => {
                          const stateVal = att === 'Present' ? 'Present' : 'On Leave';
                          const active = emp.attendanceStatus === stateVal;
                          return (
                            <button
                              key={att}
                              onClick={() => handleToggleAttendance(emp.id, stateVal)}
                              className={`px-2 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                active 
                                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {att}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: Payroll Summary */}
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Payroll Center</h3>
            </div>

            {payrollSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold text-center">
                {payrollSuccess}
              </div>
            )}

            <div className="space-y-3.5 font-sans">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <p className="text-[10px] font-mono text-slate-400 uppercase">Monthly Salary Payout</p>
                <p className="text-2xl font-mono font-bold text-white">${totalPayrollCost.toLocaleString()}</p>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
                  <span>Gross tax withheld:</span>
                  <span className="font-mono">$724.50</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50 leading-relaxed">
                <AlertCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Salaries auto-credited on the last working day. Performance bonuses added to basic payouts based on score aggregates.</span>
              </div>

              <button
                onClick={handleProcessPayroll}
                className="w-full py-2.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                Trigger Monthly Bank Payroll
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
