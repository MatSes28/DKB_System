import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key');

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('member_session')?.value;

  if (!token) {
    redirect('/member/login');
  }

  let decoded;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    decoded = payload;
  } catch (err) {
    redirect('/member/login');
  }

  if (decoded.role !== 'MEMBER') {
    redirect('/member/login');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
      {/* Navbar */}
      <nav style={{ 
        background: 'rgba(0,0,0,0.8)', 
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#000', border: '1px solid var(--brand-color)', position: 'relative', overflow: 'hidden' }}>
             <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(0.8)' }} />
          </div>
          <span style={{ color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>MEMBER PORTAL</span>
        </div>
        
        <form action={async () => {
          'use server';
          const cookieStore = await cookies();
          cookieStore.delete('member_session');
          redirect('/member/login');
        }}>
          <button type="submit" style={{ background: 'transparent', border: 'none', color: '#888', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <LogOut size={16} /> <span style={{ fontSize: '0.85rem' }}>Logout</span>
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
