'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, ClipboardList, Box, LogOut, Wrench, Menu, X, CreditCard, PieChart, BadgeCheck, Activity } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close menus on mobile when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  // 4 items for bottom nav (3 primary + 1 for menu)
  const bottomNavItems = menuItems.slice(0, 3);

  return (
    <>
      {/* Mobile Header Trigger is removed, replaced by bottom nav */}
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar & Mobile Drawer */}
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        <button className={styles.mobileCloseBtn} onClick={() => setIsMobileMenuOpen(false)}>
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
          <div className={styles.navSectionLabel}>Menu</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.navItemIndicator} />
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

      {/* iOS/Android Style Bottom Navigation Bar */}
      <div className={styles.bottomNav}>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`}>
              <div className={styles.bottomNavIconWrapper}>
                <Icon size={22} className={styles.bottomNavIcon} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={styles.bottomNavText}>{item.name}</span>
            </Link>
          );
        })}
        <button className={styles.bottomNavItem} onClick={() => setIsMobileMenuOpen(true)}>
          <div className={styles.bottomNavIconWrapper}>
            <Menu size={22} className={styles.bottomNavIcon} />
          </div>
          <span className={styles.bottomNavText}>More</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="glass-panel animate-fade-in" style={{
            padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            borderRadius: '24px'
          }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <LogOut size={40} color="var(--error)" />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Confirm Logout</h3>
            <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem' }}>Are you sure you want to end your secure session?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowLogoutConfirm(false)} className="brand-button-outline" style={{ flex: 1, borderColor: '#555', color: '#ccc', borderRadius: '12px' }}>
                Cancel
              </button>
              <button onClick={handleLogout} className="brand-button" style={{ flex: 1, background: 'var(--error)', borderColor: 'var(--error)', color: '#fff', borderRadius: '12px' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

