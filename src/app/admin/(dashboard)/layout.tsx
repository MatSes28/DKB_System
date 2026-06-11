import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import Sidebar from '@/components/admin/Sidebar';
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
          <h2 className={styles.headerTitle}>Dashboard</h2>
          {/* We can add a logout button here or in sidebar */}
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
