'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addEquipment, updateEquipmentStatus, deleteEquipment } from './actions';
import { Wrench, Trash2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function EquipmentClient({ initialData }: { initialData: any[] }) {
  const [equipment, setEquipment] = useState(initialData);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addEquipment({ name: formData.name, notes: formData.notes });
      toast('success', `${formData.name} registered successfully`);
      setShowAddModal(false);
      setFormData({ name: '', notes: '' });
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateEquipmentStatus(id, newStatus);
      toast('success', `Equipment status updated to ${newStatus}`);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to update status');
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
      await deleteEquipment(confirmTarget);
      toast('success', 'Equipment removed from database');
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to delete equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench color="var(--brand-color)" size={28} />
            Equipment Monitoring
          </h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Track machine health and maintenance</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="brand-button">+ Add Equipment</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {equipment.map(item => (
          <div key={item.id} className="glass-panel" style={{ 
            padding: '1.5rem', 
            borderTop: item.status === 'OPTIMAL' ? '4px solid var(--success)' : 
                       item.status === 'MAINTENANCE' ? '4px solid var(--brand-color)' : 
                       '4px solid var(--error)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{item.name}</h2>
              <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <select 
                className="input-field" 
                value={item.status} 
                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                style={{ 
                  color: item.status === 'OPTIMAL' ? 'var(--success)' : 
                         item.status === 'MAINTENANCE' ? 'var(--brand-color)' : 'var(--error)',
                  fontWeight: 'bold'
                }}
              >
                <option value="OPTIMAL">🟢 OPTIMAL</option>
                <option value="MAINTENANCE">🟠 NEEDS MAINTENANCE</option>
                <option value="OUT_OF_ORDER">🔴 OUT OF ORDER</option>
              </select>
            </div>

            <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              Last Serviced: <span style={{ color: '#ccc' }}>{new Date(item.lastMaintained).toLocaleDateString()}</span>
            </div>
            {item.notes && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', color: '#aaa', fontStyle: 'italic' }}>
                "{item.notes}"
              </div>
            )}
          </div>
        ))}
        
        {equipment.length === 0 && (
          <div style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            No equipment registered in the database yet.
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Remove Equipment"
        message="Are you sure you want to remove this equipment from the database?"
        confirmLabel="Remove"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={loading}
      />

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Register Equipment</h2>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Equipment Name (e.g., Treadmill #1)</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required autoFocus />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Notes (Optional)</label>
                <input type="text" className="input-field" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="brand-button-outline">Cancel</button>
                <button type="submit" className="brand-button" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
