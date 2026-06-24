'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            position: 'relative', 
            width: '80px', 
            height: '80px', 
            borderRadius: '20px', 
            overflow: 'hidden', 
            backgroundColor: '#000',
            border: '2px solid rgba(245, 166, 35, 0.4)',
            boxShadow: '0 10px 30px rgba(245, 166, 35, 0.2)',
            marginBottom: '1rem'
          }}>
            <Image 
              src="/logo.png" 
              alt="DKB Logo" 
              fill 
              style={{ objectFit: 'contain', transform: 'scale(0.85)' }}
              priority
            />
          </div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 0 }}>
            <span className="text-brand" style={{ fontSize: '2.5rem', lineHeight: '1' }}>DKB</span>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '1.2rem', lineHeight: '1.1', textAlign: 'left', letterSpacing: '2px', color: '#fff' }}>
              <span>FITNESS</span>
              <span>GYM</span>
            </div>
          </h1>
        </div>
        
        {error && <div className={styles.errorText}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className="label">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className={`brand-button ${styles.loginBtn}`} disabled={loading}>
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
