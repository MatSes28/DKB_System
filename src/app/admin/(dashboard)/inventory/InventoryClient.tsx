'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addInventoryItem, updateInventoryQuantity, deleteInventoryItem } from './actions';
import { Box, Package } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function InventoryClient({ initialData }: { initialData: any[] }) {
  const [inventory, setInventory] = useState(initialData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', quantity: 0, price: 0 });
  const [loading, setLoading] = useState(false);

  // Stock update modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockTarget, setStockTarget] = useState<{ id: string; name: string; currentQty: number } | null>(null);
  const [newStockQty, setNewStockQty] = useState('');

  // Delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addInventoryItem(formData);
      toast('success', `${formData.name} added to inventory`);
      setShowAddModal(false);
      setFormData({ name: '', quantity: 0, price: 0 });
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const openStockModal = (id: string, name: string, currentQty: number) => {
    setStockTarget({ id, name, currentQty });
    setNewStockQty(currentQty.toString());
    setShowStockModal(true);
  };

  const handleUpdateStock = async () => {
    if (!stockTarget) return;
    const qty = parseInt(newStockQty, 10);
    if (isNaN(qty) || qty < 0) {
      toast('error', 'Please enter a valid quantity');
      return;
    }
    setLoading(true);
    try {
      await updateInventoryQuantity(stockTarget.id, qty);
      toast('success', `${stockTarget.name} stock updated to ${qty}`);
      setShowStockModal(false);
      setStockTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      await deleteInventoryItem(confirmTarget);
      toast('success', 'Item removed from inventory');
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package color="var(--brand-color)" size={28} />
            Inventory Management
          </h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Track stock levels and product pricing</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="brand-button">+ Add Item</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity in Stock</th>
              <th>Price</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td style={{ color: '#fff', fontWeight: 'bold' }}>{item.name}</td>
                <td>
                  <span style={{ 
                    color: item.quantity > 5 ? 'var(--success)' : 'var(--error)',
                    fontWeight: 'bold'
                  }}>
                    {item.quantity}
                  </span>
                </td>
                <td>₱{item.price.toFixed(2)}</td>
                <td>{new Date(item.updatedAt).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openStockModal(item.id, item.name, item.quantity)} className="brand-button-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Update Stock</button>
                    <button onClick={() => handleDelete(item.id)} className="brand-button-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', borderColor: 'var(--error)', color: 'var(--error)' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No items in inventory.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this item from inventory?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={loading}
      />

      {/* Stock Update Modal (replaces prompt()) */}
      {showStockModal && stockTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '90%', maxWidth: '380px' }}>
            <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>Update Stock</h2>
            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Set new stock quantity for <strong style={{ color: 'var(--brand-color)' }}>{stockTarget.name}</strong>
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">New Quantity</label>
              <input
                type="number"
                className="input-field"
                value={newStockQty}
                onChange={e => setNewStockQty(e.target.value)}
                min="0"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleUpdateStock()}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowStockModal(false); setStockTarget(null); }} className="brand-button-outline">Cancel</button>
              <button type="button" onClick={handleUpdateStock} className="brand-button" disabled={loading}>{loading ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Add New Item</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Item Name</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Initial Quantity</label>
                <input type="number" className="input-field" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} min="0" required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Price (₱)</label>
                <input type="number" step="0.01" className="input-field" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} min="0" required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="brand-button-outline">Cancel</button>
                <button type="submit" className="brand-button" disabled={loading}>{loading ? 'Saving...' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
