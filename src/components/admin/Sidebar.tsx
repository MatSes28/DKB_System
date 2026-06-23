'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, ClipboardList, Box, LogOut, Wrench, Menu, X, CreditCard, PieChart } from 'lucide-react';
import styles from './Sidebar.module.css';

const allMenuItems = [
  { name: 'Overview', path: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { name: 'Members', path: '/admin/members', icon: Users, roles: ['ADMIN'] },
  { name: 'Attendance', path: '/admin/attendance', icon: ClipboardList, roles: ['ADMIN', 'STAFF'] },
  { name: 'Plans', path: '/admin/plans', icon: CreditCard, roles: ['ADMIN'] },
  { name: 'Sales', path: '/admin/sales', icon: ShoppingCart, roles: ['ADMIN', 'STAFF'] },
  { name: 'Inventory', path: '/admin/inventory', icon: Box, roles: ['ADMIN', 'STAFF'] },
  { name: 'Equipment', path: '/admin/equipment', icon: Wrench, roles: ['ADMIN'] },
  { name: 'Reports', path: '/admin/reports', icon: PieChart, roles: ['ADMIN'] },
];

export default function Sidebar({ role = 'ADMIN' }: { role?: string }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <>
      <button className={styles.mobileOpenBtn} onClick={() => setIsMobileOpen(true)}>
        <Menu size={24} />
      </button>

      {isMobileOpen && <div className={styles.mobileOverlay} onClick={() => setIsMobileOpen(false)} />}

      <div className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <button className={styles.mobileCloseBtn} onClick={() => setIsMobileOpen(false)}>
          <X size={24} />
        </button>
        <div className={styles.logo} style={{ padding: '1.5rem 0', height: 'auto', minHeight: '110px', transition: 'all 0.3s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '10px' }}>
            <div style={{ 
              position: 'relative', 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              overflow: 'hidden', 
              flexShrink: 0, 
              backgroundColor: '#000',
              border: '1px solid rgba(245, 166, 35, 0.3)',
              boxShadow: '0 4px 20px rgba(245, 166, 35, 0.15)',
              transition: 'all 0.3s'
            }}>
              <Image 
                src="/logo.png" 
                alt="DKB Logo" 
                fill 
                style={{ objectFit: 'contain', transform: 'scale(0.85)' }}
                priority
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#666', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'center' }}>
              DKB Fitness Gym
            </span>
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
              >
                <Icon size={20} className={styles.icon} />
                <span className={styles.navText}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button onClick={() => setShowLogoutConfirm(true)} className={styles.logoutBtn}>
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
