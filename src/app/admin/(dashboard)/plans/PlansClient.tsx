'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, CreditCard, Clock, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { createPlan, deletePlan } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function PlansClient({ initialPlans }: { initialPlans: any[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({ name: '', price: '', durationDays: '' });

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const price = parseFloat(formData.price);
    const durationDays = parseInt(formData.durationDays, 10);
    
    if (isNaN(price) || isNaN(durationDays)) {
      toast('error', 'Please enter valid numbers for price and duration.');
      setLoading(false);
      return;
    }

    const res = await createPlan({ name: formData.name, price, durationDays });
    
    if (res.error) {
      toast('error', res.error);
    } else {
      toast('success', 'Plan created successfully');
      setShowModal(false);
      setFormData({ name: '', price: '', durationDays: '' });
      // In a real app we'd refresh the server state here, but for now we rely on revalidatePath
      window.location.reload(); 
    }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    
    const res = await deletePlan(deleteId);
    if (res.error) {
      toast('error', res.error);
    } else {
      toast('success', 'Plan deleted successfully');
      setPlans(plans.filter(p => p.id !== deleteId));
    }
    setDeleteId(null);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>Configure tiered pricing and package durations.</p>
        </div>
        <button className="brand-button" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Plan
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {plans.map((plan) => (
          <div key={plan.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{plan.name}</h3>
              <button onClick={() => setDeleteId(plan.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}>
                <Trash2 size={18} />
              </button>
            </div>
            
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--brand-color)', marginBottom: '1.5rem' }}>
              ₱{plan.price.toFixed(2)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                <Clock size={16} /> Duration: {plan.durationDays} days
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '0.9rem' }}>
                <Users size={16} /> Enrolled: <strong style={{ color: '#fff' }}>{plan._count.members}</strong> members
              </div>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <CreditCard size={48} color="#555" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Plans Configured</h3>
            <p style={{ color: '#888' }}>Create your first membership tier to start enrolling members.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#fff' }}>Create New Plan</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label className="label">Plan Name</label>
                <input required type="text" className="input-field" placeholder="e.g., 1 Month VIP" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Price (₱)</label>
                <input required type="number" step="0.01" className="input-field" placeholder="e.g., 1000" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="label">Duration (Days)</label>
                <input required type="number" className="input-field" placeholder="e.g., 30" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: e.target.value})} />
                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>How many days this package lasts before expiring.</div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="brand-button-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={loading} className="brand-button" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <ConfirmModal 
          open={true}
          title="Delete Plan"
          message="Are you sure you want to delete this membership plan? New members will no longer be able to select it."
          onConfirm={executeDelete}
          onCancel={() => setDeleteId(null)}
          confirmLabel="Delete Plan"
        />
      )}
    </div>
  );
}
