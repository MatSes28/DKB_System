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
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    }
  };

  return (
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
        <button onClick={handleLogout} className={styles.logoutBtn} title={isCollapsed ? "Logout" : undefined}>
          <LogOut size={20} className={styles.icon} />
          <span className={styles.navText}>Logout</span>
        </button>
      </div>
    </div>
  );
}
