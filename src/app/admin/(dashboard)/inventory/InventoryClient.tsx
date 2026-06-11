'use client';

import { useState } from 'react';
import { addInventoryItem, updateInventoryQuantity, deleteInventoryItem } from './actions';

export default function InventoryClient({ initialData }: { initialData: any[] }) {
  const [inventory, setInventory] = useState(initialData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', quantity: 0, price: 0 });
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addInventoryItem(formData);
    setLoading(false);
    setShowAddModal(false);
    setFormData({ name: '', quantity: 0, price: 0 });
    window.location.reload();
  };

  const handleUpdateStock = async (id: string, currentQty: number) => {
    const qtyStr = prompt(`Current stock is ${currentQty}. Enter new stock quantity:`, currentQty.toString());
    if (qtyStr !== null) {
      const qty = parseInt(qtyStr, 10);
      if (!isNaN(qty) && qty >= 0) {
        await updateInventoryQuantity(id, qty);
        window.location.reload();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteInventoryItem(id);
      window.location.reload();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#fff' }}>Inventory Management</h1>
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
                    <button onClick={() => handleUpdateStock(item.id, item.quantity)} className="brand-button-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Update Stock</button>
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
