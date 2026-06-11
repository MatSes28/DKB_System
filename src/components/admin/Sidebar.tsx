'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, ClipboardList, Box, LogOut, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import styles from './Sidebar.module.css';

const allMenuItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { name: 'Members', path: '/admin/members', icon: Users, roles: ['ADMIN'] },
  { name: 'Equipment', path: '/admin/equipment', icon: Wrench, roles: ['ADMIN'] },
  { name: 'Attendance', path: '/admin/attendance', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
  { name: 'Sales', path: '/admin/sales', icon: ShoppingCart, roles: ['ADMIN', 'STAFF'] },
  { name: 'Inventory', path: '/admin/inventory', icon: Box, roles: ['ADMIN', 'STAFF'] },
];

export default function Sidebar({ role = 'ADMIN' }: { role?: string }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
        <button 
          className={styles.toggleBtn} 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={styles.logo} style={{ padding: isCollapsed ? '0' : '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="text-brand" style={{ fontSize: isCollapsed ? '1.2rem' : '1.8rem', lineHeight: '1', transition: 'all 0.3s' }}>DKB</span>
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.85rem', lineHeight: '1.1', textAlign: 'left', letterSpacing: '1.5px', color: '#fff' }}>
                <span>FITNESS</span>
                <span>GYM</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon size={20} className={styles.icon} />
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={() => setShowLogoutConfirm(true)} className={styles.logoutBtn} title={isCollapsed ? "Logout" : undefined}>
            <LogOut size={20} className={styles.icon} />
            <span className={styles.navText}>Logout</span>
          </button>
        </div>
      </div>

      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-fade-in" style={{
            padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <LogOut size={48} color="var(--error)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Confirm Logout</h3>
            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Are you sure you want to end your secure session?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="brand-button-outline" style={{ flex: 1, borderColor: '#555', color: '#aaa' }}>
                Cancel
              </button>
              <button onClick={handleLogout} className="brand-button" style={{ flex: 1, background: 'var(--error)', borderColor: 'var(--error)' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
