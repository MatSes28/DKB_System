'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loginMember } from './actions';
import { Fingerprint, Smartphone, Loader2 } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/admin/Toast';
import '../../globals.css';

function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [rfidTag, setRfidTag] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginMember(identifier, rfidTag);
      if (res.error) {
        toast('error', res.error);
      } else {
        toast('success', 'Authentication successful');
        router.push('/member');
      }
    } catch (err) {
      toast('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Cyber Background */}
      <div className="cyber-grid" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, zIndex: 0 }}></div>

      <div className="glass-panel animate-fade-in" style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        borderTop: '4px solid var(--brand-color)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{
            position: 'relative', width: '80px', height: '80px', marginBottom: '1rem',
            borderRadius: '16px', backgroundColor: '#000', border: '1px solid rgba(245, 166, 35, 0.3)',
            boxShadow: '0 4px 20px rgba(245, 166, 35, 0.15)', overflow: 'hidden'
          }}>
            <Image src="/logo.png" alt="DKB Logo" fill style={{ objectFit: 'contain', transform: 'scale(0.85)' }} priority />
          </div>
          <h1 style={{ fontSize: '1.5rem', color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '1px' }}>Member Portal</h1>
          <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center' }}>Secure Self-Service Access</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={16} /> Contact Number or Email
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., 09123456789"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fingerprint size={16} /> RFID Tag Number
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter the number on your key fob"
              value={rfidTag}
              onChange={e => setRfidTag(e.target.value)}
              required
            />
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '8px', textAlign: 'right' }}>
              Your RFID tag serves as your secure password.
            </div>
          </div>

          <button
            type="submit"
            className="brand-button"
            disabled={loading}
            style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              fontSize: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              boxShadow: '0 0 20px rgba(245, 166, 35, 0.3)'
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MemberLogin() {
  return (
    <ToastProvider>
      <LoginForm />
    </ToastProvider>
  );
}
