'use client';

import { useState } from 'react';
import { addMember, deleteMember, extendMembership } from './actions';
import { User, Phone, MapPin, Tag, Edit, CalendarPlus, Trash2, Search } from 'lucide-react';

export default function MembersClient({ initialMembers }: { initialMembers: any[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendData, setExtendData] = useState({ id: '', days: 30, amountPaid: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', contact: '', address: '', age: '', rfidTag: '', durationDays: 30, amountPaid: '', status: 'ACTIVE' });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isEditing && editingId) {
      await updateMember(editingId, {
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
      });
    } else {
      await addMember({ 
        ...formData, 
        age: formData.age ? parseInt(formData.age) : undefined,
        durationDays: formData.durationDays,
        amountPaid: parseFloat(formData.amountPaid)
      });
    }
    
    setLoading(false);
    setShowModal(false);
    resetForm();
    window.location.reload();
  };

  const resetForm = () => {
    setFormData({ name: '', contact: '', address: '', age: '', rfidTag: '', durationDays: 30, amountPaid: '', status: 'ACTIVE' });
    setIsEditing(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (member: any) => {
    setFormData({
      name: member.name,
      contact: member.contact || '',
      address: member.address || '',
      age: member.age ? member.age.toString() : '',
      rfidTag: member.rfidTag,
      durationDays: 30,
      amountPaid: '',
      status: member.status || 'ACTIVE'
    });
    setEditingId(member.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this member? All their attendance records will be deleted too.')) {
      await deleteMember(id);
      window.location.reload();
    }
  };

  const openExtendModal = (member: any) => {
    setExtendData({ id: member.id, days: 30, amountPaid: '' });
    setShowExtendModal(true);
  };

  const submitExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await extendMembership(extendData.id, extendData.days, parseFloat(extendData.amountPaid));
    window.location.reload();
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.rfidTag && m.rfidTag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Members DataBase</h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Manage and Track Gym Members</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by Name or RFID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', marginBottom: 0 }}
            />
          </div>
          <button onClick={openAddModal} className="brand-button">+ Add Member</button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Contact Info</th>
              <th>RFID Tag</th>
              <th>Status</th>
              <th>Valid Until</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map(member => {
              const isValid = new Date(member.membershipEnd) >= new Date();
              const initials = member.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.2), rgba(245, 166, 35, 0.05))',
                        border: '1px solid var(--brand-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--brand-color)', fontWeight: 'bold', fontSize: '0.9rem',
                        boxShadow: '0 0 10px rgba(245, 166, 35, 0.2)'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>Age: {member.age || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Phone size={14} color="#888" />
                      <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{member.contact || 'No Contact'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#888" />
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{member.address || 'No Address'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px', width: 'fit-content' }}>
                      <Tag size={14} color="var(--brand-color)" />
                      <span style={{ fontFamily: 'monospace', color: '#fff', letterSpacing: '1px' }}>{member.rfidTag}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      color: isValid ? 'var(--success)' : 'var(--error)',
                      padding: '6px 12px',
                      background: isValid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${isValid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '1px',
                      boxShadow: isValid ? '0 0 10px rgba(16,185,129,0.2)' : '0 0 10px rgba(239,68,68,0.2)'
                    }}>
                      {isValid ? 'ACTIVE' : 'EXPIRED'}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontWeight: '500' }}>
                      {new Date(member.membershipEnd).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openExtendModal(member)} className="brand-button-outline" style={{ padding: '8px', border: 'none', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }} title="Extend">
                        <CalendarPlus size={16} />
                      </button>
                      <button onClick={() => openEditModal(member)} className="brand-button-outline" style={{ padding: '8px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff' }} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="brand-button-outline" style={{ padding: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
                  <Users size={48} color="#333" style={{ margin: '0 auto 1rem auto' }} />
                  <p>No members found in database.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>{isEditing ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Name</label>
                <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Contact Number</label>
                <input type="text" className="input-field" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Address</label>
                <input type="text" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Age</label>
                <input type="number" className="input-field" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} min="1" />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">RFID Tag ID</label>
                <input type="text" className="input-field" value={formData.rfidTag} onChange={e => setFormData({...formData, rfidTag: e.target.value})} required placeholder="Tap card or type manually" />
              </div>
              
              {isEditing ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Status</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="label">Membership Duration (Days)</label>
                    <input type="number" className="input-field" value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: parseInt(e.target.value)})} min="1" required />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Amount Paid (₱)</label>
                    <input type="number" step="0.01" className="input-field" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} required />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="brand-button-outline">Cancel</button>
                <button type="submit" className="brand-button" disabled={loading}>{loading ? 'Saving...' : 'Save Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExtendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Extend Membership</h2>
            <form onSubmit={submitExtend}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Days to Add</label>
                <input type="number" className="input-field" value={extendData.days} onChange={e => setExtendData({...extendData, days: parseInt(e.target.value)})} min="1" required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Amount Paid (₱)</label>
                <input type="number" step="0.01" className="input-field" value={extendData.amountPaid} onChange={e => setExtendData({...extendData, amountPaid: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowExtendModal(false)} className="brand-button-outline">Cancel</button>
                <button type="submit" className="brand-button" disabled={loading}>{loading ? 'Saving...' : 'Extend & Record Sale'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
