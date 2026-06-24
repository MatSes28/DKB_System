import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/Toast';
import styles from './layout.module.css';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');
  
  let role = 'ADMIN'; // Default
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      role = session.role || 'ADMIN';
    } catch(e) {}
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar role={role} />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.mobileLogoWrapper}>
            <Image src="/logo.png" alt="DKB Logo" width={32} height={32} style={{ objectFit: 'contain' }} />
          </div>
          <h2 className={styles.headerTitle}>Dashboard</h2>
        </header>
        <div className={styles.pageContent}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </div>
      </main>
    </div>
  );
}

