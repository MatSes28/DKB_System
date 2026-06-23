'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Download, DollarSign, TrendingDown, TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useToast } from '@/components/admin/Toast';
import { addExpense, deleteExpense } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

const EXPENSE_CATEGORIES = ['RENT', 'UTILITIES', 'SALARY', 'MAINTENANCE', 'EQUIPMENT', 'MARKETING', 'OTHER'];

export default function ReportsClient({ initialSales, initialExpenses }: { initialSales: any[], initialExpenses: any[] }) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [sales] = useState(initialSales);
  
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ category: 'UTILITIES', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Month filtering
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Calculate Financials based on selected month
  const financials = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthSales = sales.filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    });

    const grossRevenue = monthSales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossRevenue - totalExpenses;

    return { monthSales, monthExpenses, grossRevenue, totalExpenses, netProfit };
  }, [sales, expenses, selectedMonth]);

  // Chart Data for the last 6 months P&L
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      const rev = sales.filter(s => {
        const d = new Date(s.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      }).reduce((sum, s) => sum + s.amount, 0);

      const exp = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      }).reduce((sum, e) => sum + e.amount, 0);

      data.push({
        name: monthNames[targetMonth],
        Revenue: rev,
        Expenses: exp,
        Profit: rev - exp
      });
    }
    return data;
  }, [sales, expenses]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      toast('error', 'Please enter a valid amount.');
      setLoading(false); return;
    }

    const res = await addExpense({ 
      category: formData.category, 
      amount, 
      description: formData.description, 
      date: new Date(formData.date) 
    });
    
    if (res.error) {
      toast('error', res.error);
    } else {
      toast('success', 'Expense recorded');
      setShowModal(false);
      setFormData({ category: 'UTILITIES', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      window.location.reload();
    }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    const res = await deleteExpense(deleteId);
    if (res.error) {
      toast('error', res.error);
    } else {
      toast('success', 'Expense deleted');
      setExpenses(expenses.filter(e => e.id !== deleteId));
    }
    setDeleteId(null);
  };

  // CSV Export
  const handleExport = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount (PHP)'].join(','),
      ...financials.monthSales.map(s => `"${new Date(s.date).toLocaleDateString()}","INCOME","${s.type}","${s.itemName}",${s.amount}`),
      ...financials.monthExpenses.map(e => `"${new Date(e.date).toLocaleDateString()}","EXPENSE","${e.category}","${e.description || ''}",${e.amount}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DKB_PL_Report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Financial Reports (P&L)</h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Track gross revenue, expenses, and net profit margins.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="month" 
            className="input-field" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
            style={{ width: 'auto', padding: '10px 16px' }}
          />
          <button className="brand-button-outline" onClick={handleExport}>
            <Download size={20} /> Export CSV
          </button>
          <button className="brand-button" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Record Expense
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: '#888', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Gross Revenue</h3>
            <DollarSign size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
            ₱{financials.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: '#888', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Expenses</h3>
            <TrendingDown size={20} color="var(--error)" />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--error)' }}>
            ₱{financials.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', border: financials.netProfit >= 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ color: '#888', margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>Net Profit</h3>
            <BarChart3 size={20} color={financials.netProfit >= 0 ? "var(--success)" : "var(--error)"} />
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: financials.netProfit >= 0 ? '#fff' : 'var(--error)' }}>
            ₱{financials.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ color: financials.netProfit >= 0 ? 'var(--success)' : 'var(--error)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            {financials.grossRevenue > 0 ? ((financials.netProfit / financials.grossRevenue) * 100).toFixed(1) : 0}% Profit Margin
          </div>
        </div>
      </div>

      {/* Main 6 Month Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>6-Month Profit & Loss Trend</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="Revenue" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="var(--error)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Ledger */}
      <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>Expense Ledger ({selectedMonth})</h3>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {financials.monthExpenses.length > 0 ? financials.monthExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString('en-PH')}</td>
                <td>
                  <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {expense.category}
                  </span>
                </td>
                <td style={{ color: '#aaa' }}>{expense.description || '-'}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--error)' }}>
                  ₱{expense.amount.toFixed(2)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button onClick={() => setDeleteId(expense.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>No expenses recorded for this month.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Record Expense</h2>
            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="label">Date</label>
                <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Amount (₱)</label>
                <input required type="number" step="0.01" className="input-field" placeholder="e.g., 5000" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <input type="text" className="input-field" placeholder="e.g., May Electricity Bill" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="brand-button-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={loading} className="brand-button" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal 
          open={true}
          title="Delete Expense"
          message="Are you sure you want to delete this expense record? This will alter your Profit & Loss calculations for this month."
          onConfirm={executeDelete}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete Expense"
        />
      )}
    </div>
  );
}
