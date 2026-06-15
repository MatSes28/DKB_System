'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, TrendingUp, Zap, AlertTriangle, Activity } from 'lucide-react';
import styles from './page.module.css';

// Live Data injected from server

export default function DashboardClient({ 
  membersCount, activeMembersCount, todaysAttendance, salesTotal, expiringMembers, equipment,
  monthlyGrowth, revenueData, peakHours
}: any) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={styles.container}>Loading Cyber-Fitness Core...</div>;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className={styles.pageTitle} style={{ marginBottom: '0.5rem' }}>Command Center</h1>
          <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
            System Online • All Tracking Nominal
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--success)', textTransform: 'uppercase' }}>Live Sync</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className={styles.statLabel}>Total Members</h3>
              <div className={styles.statValue}>{membersCount}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(245, 166, 35, 0.1)', borderRadius: '12px' }}>
              <Users size={24} color="var(--brand-color)" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +12% this month
          </div>
        </div>
        
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className={styles.statLabel}>Active Members</h3>
              <div className={styles.statValue}>{activeMembersCount}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <Activity size={24} color="var(--success)" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: '#888', fontSize: '0.85rem' }}>
            {((activeMembersCount / (membersCount || 1)) * 100).toFixed(1)}% retention rate
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className={styles.statLabel}>Today's Traffic</h3>
              <div className={styles.statValue}>{todaysAttendance}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(245, 166, 35, 0.1)', borderRadius: '12px' }}>
              <Zap size={24} color="var(--brand-color)" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: '#888', fontSize: '0.85rem' }}>
            Peak expected at 6:00 PM
          </div>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 className={styles.statLabel}>Today's Revenue</h3>
              <div className={styles.statValue}>₱{salesTotal.toFixed(0)}</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
              <TrendingUp size={24} color="var(--success)" />
            </div>
          </div>
          <div style={{ marginTop: '1rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Above daily average
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainChartsGrid}>
        
        {/* Charts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.4s' }}>
            <h3 className={styles.statLabel} style={{ marginBottom: '1.5rem' }}>Membership Growth Trend</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand-color)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(245, 166, 35, 0.2)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: 'var(--brand-color)' }}
                  />
                  <Area type="monotone" dataKey="members" stroke="var(--brand-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.subChartsGrid}>
            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.5s' }}>
              <h3 className={styles.statLabel} style={{ marginBottom: '1.5rem' }}>Peak Usage Heatmap</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#121212', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="usage" fill="var(--brand-color)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.6s' }}>
              <h3 className={styles.statLabel} style={{ marginBottom: '1.5rem' }}>Revenue Flow</h3>
              <div style={{ width: '100%', height: '200px' }}>
                <ResponsiveContainer>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#121212', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="rev" stroke="var(--success)" strokeWidth={3} dot={{ fill: 'var(--success)', r: 4, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* Side Column: Notifications & Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.5s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <AlertTriangle size={20} color="var(--brand-color)" />
              <h3 className={styles.statLabel} style={{ margin: 0 }}>System Alerts</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expiringMembers.length > 0 ? expiringMembers.map((member: any) => (
                <div key={member.id} style={{ background: 'rgba(245, 166, 35, 0.05)', border: '1px solid rgba(245, 166, 35, 0.2)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--brand-color)' }}>
                  <p style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem', marginBottom: '4px' }}>Renewal Required</p>
                  <p style={{ color: '#aaa', fontSize: '0.8rem' }}>{member.name}'s membership expires in {Math.ceil((new Date(member.membershipEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days.</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: '#888' }}>
                  <p>No immediate alerts.</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', animationDelay: '0.6s', borderLeft: '4px solid #3b82f6' }}>
            <h3 className={styles.statLabel} style={{ marginBottom: '1rem' }}>Equipment Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '250px', overflowY: 'auto' }}>
              {equipment && equipment.length > 0 ? equipment.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{item.name}</span>
                  <span style={{ 
                    color: item.status === 'OPTIMAL' ? 'var(--success)' : item.status === 'MAINTENANCE' ? 'var(--brand-color)' : 'var(--error)', 
                    fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', 
                    background: item.status === 'OPTIMAL' ? 'rgba(16, 185, 129, 0.1)' : item.status === 'MAINTENANCE' ? 'rgba(245, 166, 35, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: '4px' 
                  }}>
                    {item.status}
                  </span>
                </div>
              )) : (
                <div style={{ color: '#888', fontSize: '0.85rem' }}>No equipment monitored.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
