'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addMember, deleteMember, extendMembership, updateMember, getMembers } from './actions';
import { User, Users, Phone, MapPin, Tag, Edit, CalendarPlus, Trash2, Search } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function MembersClient({ initialMembers, initialTotalPages }: { initialMembers: any[], initialTotalPages: number }) {
  const [members, setMembers] = useState(initialMembers);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendData, setExtendData] = useState({ id: '', days: 30, amountPaid: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', email: '', contact: '', address: '', age: '', rfidTag: '', 
    birthday: '', emergencyContactName: '', emergencyContactNumber: '', emergencyContactRelation: '',
    durationDays: 30, amountPaid: '', status: 'ACTIVE' 
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const fetchMembers = async (p: number, search: string) => {
    setLoading(true);
    try {
      const res = await getMembers(p, 20, search);
      setMembers(res.members);
      setTotalPages(res.totalPages);
      setPage(p);
    } catch (err) {
      toast('error', 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const birthdayDate = formData.birthday ? new Date(formData.birthday) : undefined;

    try {
      if (isEditing && editingId) {
        await updateMember(editingId, {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          birthday: birthdayDate,
        });
        toast('success', `${formData.name} updated successfully`);
      } else {
        await addMember({ 
          ...formData, 
          age: formData.age ? parseInt(formData.age) : undefined,
          birthday: birthdayDate,
          durationDays: formData.durationDays,
          amountPaid: parseFloat(formData.amountPaid)
        });
        toast('success', `${formData.name} added to the system`);
      }
      
      setShowModal(false);
      resetForm();
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to save member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', email: '', contact: '', address: '', age: '', rfidTag: '', 
      birthday: '', emergencyContactName: '', emergencyContactNumber: '', emergencyContactRelation: '',
      durationDays: 30, amountPaid: '', status: 'ACTIVE' 
    });
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
      email: member.email || '',
      contact: member.contact || '',
      address: member.address || '',
      age: member.age ? member.age.toString() : '',
      birthday: member.birthday ? new Date(member.birthday).toISOString().split('T')[0] : '',
      emergencyContactName: member.emergencyContactName || '',
      emergencyContactNumber: member.emergencyContactNumber || '',
      emergencyContactRelation: member.emergencyContactRelation || '',
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
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      await deleteMember(confirmTarget);
      toast('success', 'Member deleted successfully');
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to delete member');
    } finally {
      setLoading(false);
    }
  };

  const openExtendModal = (member: any) => {
    setExtendData({ id: member.id, days: 30, amountPaid: '' });
    setShowExtendModal(true);
  };

  const submitExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await extendMembership(extendData.id, extendData.days, parseFloat(extendData.amountPaid));
      toast('success', `Membership extended by ${extendData.days} days`);
      setShowExtendModal(false);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to extend membership');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem' }}>Members DataBase</h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Manage and Track Gym Members</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search Name/RFID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchMembers(1, searchTerm)}
                style={{ paddingLeft: '40px', marginBottom: 0 }}
              />
            </div>
            <button onClick={() => fetchMembers(1, searchTerm)} className="brand-button-outline" disabled={loading} style={{ padding: '8px 16px' }}>Search</button>
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
            {members.map(member => {
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
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                          Age: {member.age || 'N/A'} {member.birthday && `| DOB: ${new Date(member.birthday).toLocaleDateString()}`}
                        </div>
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
                    {(member.emergencyContactName || member.emergencyContactNumber) && (
                      <div style={{ marginTop: '8px', padding: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', borderLeft: '2px solid var(--error)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 'bold', marginBottom: '2px' }}>Emergency Contact:</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{member.emergencyContactName} {member.emergencyContactRelation && `(${member.emergencyContactRelation})`}</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{member.emergencyContactNumber}</div>
                      </div>
                    )}
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
            {members.length === 0 && (
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <div style={{ color: '#888', fontSize: '0.9rem' }}>
          Page {page} of {totalPages || 1}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => fetchMembers(page - 1, searchTerm)} 
            disabled={page <= 1 || loading}
            className="brand-button-outline"
          >
            Previous
          </button>
          <button 
            onClick={() => fetchMembers(page + 1, searchTerm)} 
            disabled={page >= totalPages || loading}
            className="brand-button-outline"
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Member"
        message="Are you sure you want to delete this member? All their attendance records will be deleted too."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={loading}
      />

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
            <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>{isEditing ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Name</label>
                  <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Email Address</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Contact Number</label>
                  <input type="text" className="input-field" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div style={{ flex: 2 }}>
                  <label className="label">Address</label>
                  <input type="text" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">Age</label>
                  <input type="number" className="input-field" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} min="1" />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Birthday</label>
                  <input type="date" className="input-field" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '2px solid var(--error)' }}>
                <h3 style={{ color: 'var(--error)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: 0 }}>Emergency Contact</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Name</label>
                  <input type="text" className="input-field" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="label">Contact Number</label>
                    <input type="text" className="input-field" value={formData.emergencyContactNumber} onChange={e => setFormData({...formData, emergencyContactNumber: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="label">Relationship</label>
                    <input type="text" className="input-field" value={formData.emergencyContactRelation} onChange={e => setFormData({...formData, emergencyContactRelation: e.target.value})} placeholder="e.g. Spouse, Parent" />
                  </div>
                </div>
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
