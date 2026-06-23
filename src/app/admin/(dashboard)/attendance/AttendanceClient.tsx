'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAttendance } from './actions';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, CheckCircle2, UserCheck, Trash2, Calendar, Activity } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function AttendanceClient({ initialData }: { initialData: any[] }) {
  const [attendances, setAttendances] = useState(initialData);
  const [mounted, setMounted] = useState(false);
  
  // Format today's date as YYYY-MM-DD in Philippine Time
  const defaultDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const [dateFilter, setDateFilter] = useState<string>(defaultDate);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = (id: string) => {
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    setLoading(true);
    try {
      await deleteAttendance(confirmTarget);
      toast('success', 'Attendance record deleted');
      setConfirmOpen(false);
      setConfirmTarget(null);
      router.refresh();
    } catch (err) {
      toast('error', 'Failed to delete attendance record');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendances = attendances.filter(record => {
    if (!dateFilter) return true;
    const recordDate = new Date(record.timestamp).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    return recordDate === dateFilter;
  });

  // Generate real chart data based on filtered attendances by hour
  const hourBuckets: Record<string, number> = {};
  const keyHours = [6, 9, 12, 15, 18, 21];
  keyHours.forEach(h => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h;
    hourBuckets[`${displayHour}${ampm}`] = 0;
  });
  
  filteredAttendances.forEach(a => {
    const hour = new Date(a.timestamp).getHours();
    // Find closest key hour
    let closest = keyHours[0];
    for (const kh of keyHours) {
      if (Math.abs(hour - kh) < Math.abs(hour - closest)) closest = kh;
    }
    const ampm = closest >= 12 ? 'PM' : 'AM';
    const displayHour = closest > 12 ? closest - 12 : closest;
    const key = `${displayHour}${ampm}`;
    if (hourBuckets[key] !== undefined) hourBuckets[key]++;
  });

  const chartData = Object.entries(hourBuckets).map(([time, count]) => ({ time, count }));

  if (!mounted) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="var(--brand-color)" size={28} />
            Live Traffic Feed
          </h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Monitor gym entry and exit logs in real-time</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="var(--brand-color)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="date" 
              className="input-field" 
              style={{ width: 'auto', marginBottom: 0, paddingLeft: '36px' }}
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
            />
          </div>
          {dateFilter && (
            <button className="brand-button-outline" onClick={() => setDateFilter('')}>
              Show All Time
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        {/* Live Feed List */}
        <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>Entry Logs</h3>
            <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
              SYNCING
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAttendances.map(record => {
              const tapInTime = new Date(record.timestamp).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' });
              const tapOutTime = record.tapOut ? new Date(record.tapOut).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }) : null;
              
              return (
                <div key={record.id} style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '12px',
                  borderLeft: record.tapOut ? '3px solid #3b82f6' : '3px solid var(--success)',
                  transition: 'transform 0.2s ease', cursor: 'default'
                }} className="feed-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}>
                      {record.tapOut ? <CheckCircle2 size={20} color="#3b82f6" /> : <UserCheck size={20} color="var(--success)" />}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px' }}>{record.member.name}</div>
                      <div style={{ color: '#888', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '2px' }}>RFID: {record.member.rfidTag}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--brand-color)', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Clock size={12} /> IN: {tapInTime}
                      </div>
                      <div style={{ color: record.tapOut ? '#3b82f6' : '#666', fontSize: '0.8rem', marginTop: '2px' }}>
                        {record.tapOut ? `OUT: ${tapOutTime}` : 'ACTIVE SESSION'}
                      </div>
                    </div>
                    
                    <button onClick={() => handleDelete(record.id)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--error)'} onMouseOut={e => e.currentTarget.style.color = '#555'} title="Delete Log">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredAttendances.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                <Clock size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                <p>No activity recorded for this timeframe.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.5rem' }}>Traffic Volume</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--brand-color)', lineHeight: '1', marginBottom: '1rem' }}>
              {filteredAttendances.length}
            </div>
            
            <div style={{ width: '100%', height: '100px' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-color)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--brand-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: '#121212', border: 'none', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="count" stroke="var(--brand-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1rem' }}>Active Sessions</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '50%', border: '4px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', border: '4px solid var(--success)', borderRadius: '50%', borderTopColor: 'transparent', transform: 'rotate(45deg)' }}></div>
                <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {filteredAttendances.filter(a => !a.tapOut).length}
                </span>
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>Members currently on the gym floor.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance log entry?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        loading={loading}
      />
    </div>
  );
}
