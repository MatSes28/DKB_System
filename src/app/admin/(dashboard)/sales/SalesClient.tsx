'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addSale, deleteSale, getSales } from './actions';
import { ShoppingCart, Box, Plus, Minus, Trash2, Printer, CheckCircle2, UserCheck, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function SalesClient({ initialSales, initialTotalPages, inventory = [], members = [] }: { initialSales: any[], initialTotalPages: number, inventory?: any[], members?: any[] }) {
  const [sales, setSales] = useState(initialSales);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'POS' | 'HISTORY'>('POS');
  const [historySubTab, setHistorySubTab] = useState<'CUSTOMERS' | 'PRODUCTS'>('CUSTOMERS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [pendingMembershipItem, setPendingMembershipItem] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Custom amount modal state
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // Confirm delete
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  // Checkout confirm
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [lastCheckoutCart, setLastCheckoutCart] = useState<any[]>([]);
  const [lastCheckoutTotal, setLastCheckoutTotal] = useState(0);

  const router = useRouter();
  const { toast } = useToast();
  
  // Custom quick items for the POS that aren't necessarily in inventory
  const quickItems = [
    { id: 'walkin', name: 'Walk-in', price: 60, type: 'CUSTOMERS', color: 'var(--brand-color)' },
    { id: 'member-1w', name: 'Weekly', price: 250, type: 'CUSTOMERS', color: 'var(--brand-color)' },
    { id: 'member-1m', name: 'Monthly', price: 800, type: 'CUSTOMERS', color: 'var(--brand-color)' },
    { id: 'custom', name: 'Custom Amount', price: 0, type: 'CUSTOMERS', color: '#666' }
  ];

  const addToCart = (item: any, isInventory = false) => {
    if (item.id === 'custom') {
      setShowCustomAmountModal(true);
      setCustomAmount('');
      return;
    }

    if (item.name.includes('Weekly') || item.name.includes('Monthly') || item.name.includes('Membership')) {
      setPendingMembershipItem(item);
      setShowMemberModal(true);
      return;
    }
    
    finalizeAddToCart(item, isInventory);
  };

  const handleCustomAmountConfirm = () => {
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt <= 0) {
      toast('error', 'Please enter a valid amount');
      return;
    }
    const item = { id: 'custom', name: 'Custom Amount', price: amt, type: 'CUSTOMERS', color: '#666' };
    finalizeAddToCart(item, false);
    setShowCustomAmountModal(false);
    setCustomAmount('');
  };

  const finalizeAddToCart = (item: any, isInventory = false, memberId?: string, memberName?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.memberId === memberId);
      if (existing) {
        return prev.map(i => i.id === item.id && i.memberId === memberId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1, isInventory, memberId, memberName }];
    });
  };

  const confirmMembershipAdd = () => {
    if (!selectedMemberId) return;
    const member = members.find(m => m.id === selectedMemberId);
    if (member) {
      finalizeAddToCart(pendingMembershipItem, false, member.id, member.name);
    }
    setShowMemberModal(false);
    setPendingMembershipItem(null);
    setSelectedMemberId('');
  };

  const updateQty = (id: string, memberId: string | undefined, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.memberId === memberId) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : i;
      }
      return i;
    }));
  };

  const removeFromCart = (id: string, memberId: string | undefined) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.memberId === memberId)));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    
    try {
      // Process each item in the cart
      for (const item of cart) {
        for (let i = 0; i < item.qty; i++) {
          await addSale({ 
            itemName: item.name, 
            amount: item.price, 
            type: item.isInventory ? 'PRODUCTS' : 'CUSTOMERS',
            inventoryId: item.isInventory ? item.id : undefined,
            memberId: item.memberId
          });
        }
      }

      // Save for receipt printing
      setLastCheckoutCart([...cart]);
      setLastCheckoutTotal(cartTotal);
      setShowCheckoutSuccess(true);
      
      toast('success', `Checkout successful! Total: ₱${cartTotal.toFixed(2)}`);
      setCart([]);
      router.refresh();
    } catch (err) {
      toast('error', 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (items: any[], total: number) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;
    
    const date = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' });
    const itemsHtml = items.map(i => {
      const target = i.memberName ? ` <span style="font-size:0.8rem;color:#666;">(${i.memberName})</span>` : '';
      return `<p>${i.qty}x ${i.name}${target} <span style="float:right">₱${(i.price * i.qty).toFixed(2)}</span></p>`
    }).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - DKB Fitness Gym</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; text-align: center; }
            h1 { margin-bottom: 5px; font-size: 1.5rem; }
            .divider { border-bottom: 1px dashed #000; margin: 15px 0; }
            .details { text-align: left; margin-bottom: 15px; }
            .details p { margin: 5px 0; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h1>DKB FITNESS GYM</h1>
          <p style="margin:0;font-size:0.9rem;">Official Receipt</p>
          <div class="divider"></div>
          <div class="details">
            <p><strong>Date:</strong> ${date}</p>
          </div>
          <div class="divider"></div>
          <div class="details">
            ${itemsHtml}
          </div>
          <div class="divider"></div>
          <div class="total">
            <p>TOTAL: ₱${total.toFixed(2)}</p>
          </div>
          <div class="divider"></div>
          <p>Thank you for your business!</p>
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDelete = async (id: string) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const confirmDeleteSale = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      await deleteSale(confirmTarget);
      toast('success', 'Sale record deleted');
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to delete sale');
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async (p: number, t: string) => {
    setIsFiltering(true);
    try {
      const start = startDate ? new Date(startDate) : undefined;
      let end = endDate ? new Date(endDate) : undefined;
      if (end) end.setHours(23, 59, 59, 999);
      
      const res = await getSales(start, end, p, 20, t);
      setSales(res.sales);
      setTotalPages(res.totalPages);
      setPage(p);
    } catch (error) {
      toast('error', 'Failed to fetch sales');
    } finally {
      setIsFiltering(false);
    }
  };

  const handleFilter = () => fetchSales(1, historySubTab);



  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart color="var(--brand-color)" size={28} />
            Point of Sale
          </h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Fast Checkout System</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setActiveTab('POS')} className={activeTab === 'POS' ? 'brand-button' : 'brand-button-outline'}>
            Terminal
          </button>
          <button onClick={() => setActiveTab('HISTORY')} className={activeTab === 'HISTORY' ? 'brand-button' : 'brand-button-outline'}>
            Sales History
          </button>
        </div>
      </div>

      {activeTab === 'POS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 200px)' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', overflowY: 'auto' }}>
            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Gym Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {quickItems.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => addToCart(item, false)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: `1px solid ${item.color}`, 
                    borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ color: item.color, fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.name}</div>
                  {item.price > 0 && <div style={{ color: '#fff' }}>₱{item.price.toFixed(2)}</div>}
                </div>
              ))}
            </div>

            <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box size={20} color="var(--success)" /> Inventory Products
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {inventory.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => item.quantity > 0 && addToCart(item, true)}
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', 
                    borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', cursor: item.quantity > 0 ? 'pointer' : 'not-allowed',
                    opacity: item.quantity > 0 ? 1 : 0.5, transition: 'all 0.2s'
                  }}
                  onMouseOver={e => item.quantity > 0 && (e.currentTarget.style.borderColor = 'var(--success)')}
                  onMouseOut={e => item.quantity > 0 && (e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)')}
                >
                  <div style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.name}</div>
                  <div style={{ color: '#fff' }}>₱{item.price.toFixed(2)}</div>
                  <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' }}>Stock: {item.quantity}</div>
                </div>
              ))}
              {inventory.length === 0 && <div style={{ color: '#888' }}>No inventory items available.</div>}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                Current Order <span>{cart.length} items</span>
              </h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{item.name}</div>
                        {item.memberName && <div style={{ color: 'var(--brand-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>For: {item.memberName}</div>}
                        <div style={{ color: '#888', fontSize: '0.9rem' }}>₱{item.price.toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => updateQty(item.id, item.memberId, -1)} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ color: '#fff', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.memberId, 1)} style={{ background: 'transparent', border: '1px solid #444', color: '#fff', borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
                        <button onClick={() => removeFromCart(item.id, item.memberId)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', marginLeft: '10px', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.5)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span style={{ color: '#fff' }}>TOTAL</span>
                <span style={{ color: 'var(--brand-color)' }}>₱{cartTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0 || loading}
                style={{ 
                  width: '100%', padding: '1rem', background: cart.length > 0 ? 'var(--success)' : '#333', 
                  color: cart.length > 0 ? '#000' : '#888', border: 'none', borderRadius: '8px', 
                  fontSize: '1.1rem', fontWeight: 'bold', cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'PROCESSING...' : <><CheckCircle2 size={20} /> CHECKOUT</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Amount Modal */}
      {showCustomAmountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '350px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Custom Amount</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Enter Amount (₱)</label>
              <input
                type="number"
                step="0.01"
                className="input-field"
                value={customAmount}
                onChange={e => setCustomAmount(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleCustomAmountConfirm()}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCustomAmountModal(false)} className="brand-button-outline">Cancel</button>
              <button type="button" onClick={handleCustomAmountConfirm} className="brand-button">Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Success Modal (Print Receipt) */}
      {showCheckoutSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
            <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Checkout Complete!</h2>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Total: ₱{lastCheckoutTotal.toFixed(2)}</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowCheckoutSuccess(false)} className="brand-button-outline" style={{ flex: 1 }}>Close</button>
              <button onClick={() => { printReceipt(lastCheckoutCart, lastCheckoutTotal); setShowCheckoutSuccess(false); }} className="brand-button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Printer size={18} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserCheck color="var(--brand-color)" /> Select Member
            </h2>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Linking this {pendingMembershipItem?.name} purchase will automatically extend their membership expiration date.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Target Member</label>
              <select className="input-field" value={selectedMemberId} onChange={e => setSelectedMemberId(e.target.value)} required>
                <option value="">-- Search Member --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (Exp: {new Date(m.membershipEnd).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowMemberModal(false); setPendingMembershipItem(null); setSelectedMemberId(''); }} className="brand-button-outline">Cancel</button>
              <button type="button" onClick={confirmMembershipAdd} className="brand-button" disabled={!selectedMemberId}>Link & Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Sale"
        message="Are you sure you want to delete this sale record? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteSale}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={loading}
      />

      {activeTab === 'HISTORY' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ color: '#fff', margin: 0 }}>Recent Transactions</h2>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
              <Calendar size={18} color="#888" />
              <input 
                type="date" 
                className="input-field" 
                style={{ padding: '6px 10px', minWidth: '130px' }}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <span style={{ color: '#888' }}>to</span>
              <input 
                type="date" 
                className="input-field" 
                style={{ padding: '6px 10px', minWidth: '130px' }}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
              <button 
                onClick={handleFilter}
                disabled={isFiltering}
                className="brand-button" 
                style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Filter size={16} /> {isFiltering ? 'Filtering...' : 'Filter'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={() => { setHistorySubTab('CUSTOMERS'); fetchSales(1, 'CUSTOMERS'); }} 
              className={historySubTab === 'CUSTOMERS' ? 'brand-button' : 'brand-button-outline'}
              style={{ flex: 1 }}
            >
              Customer Sales
            </button>
            <button 
              onClick={() => { setHistorySubTab('PRODUCTS'); fetchSales(1, 'PRODUCTS'); }} 
              className={historySubTab === 'PRODUCTS' ? 'brand-button' : 'brand-button-outline'}
              style={{ flex: 1 }}
            >
              Product Sales
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.date).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td style={{ color: '#fff', fontWeight: 'bold' }}>{sale.itemName}</td>
                    <td>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: sale.type === 'CUSTOMERS' ? 'rgba(245, 166, 35, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: sale.type === 'CUSTOMERS' ? 'var(--brand-color)' : 'var(--success)' }}>
                        {sale.type}
                      </span>
                    </td>
                    <td style={{ color: '#fff', fontWeight: 'bold' }}>₱{sale.amount.toFixed(2)}</td>
                    <td>
                      <button onClick={() => handleDelete(sale.id)} className="brand-button-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--error)', color: 'var(--error)' }}>Delete</button>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No sales history available for this category.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.9rem' }}>
              Page {page} of {totalPages || 1}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => fetchSales(page - 1, historySubTab)} 
                disabled={page <= 1 || isFiltering}
                className="brand-button-outline"
              >
                Previous
              </button>
              <button 
                onClick={() => fetchSales(page + 1, historySubTab)} 
                disabled={page >= totalPages || isFiltering}
                className="brand-button-outline"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
