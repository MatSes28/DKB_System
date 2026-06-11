'use client';

import { useState, useEffect, useRef } from 'react';
import { ScanLine, CheckCircle2, XCircle, Loader2, Fingerprint, Smartphone } from 'lucide-react';
import styles from './page.module.css';

export default function KioskPage() {
  const [rfidBuffer, setRfidBuffer] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');
  const [memberData, setMemberData] = useState<{id: string, name: string, membershipEnd: string, isActive: boolean} | null>(null);

  // Hidden input ref to capture focus if needed, but we rely on global keydown
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on the hidden input to ensure we capture the RFID reader
    const interval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if we are currently loading
      if (status === 'LOADING') return;

      if (e.key === 'Enter') {
        if (rfidBuffer.trim().length > 0) {
          processRfid(rfidBuffer.trim());
          setRfidBuffer('');
        }
      } else {
        // Accumulate characters (usually numbers/letters from RFID)
        if (e.key.length === 1) {
          setRfidBuffer((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfidBuffer, status]);


  // Audio refs
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const errorAudio = useRef<HTMLAudioElement | null>(null);
  
  // GCash Mock State
  const [showGcashModal, setShowGcashModal] = useState(false);
  const [gcashStatus, setGcashStatus] = useState<'QR' | 'PROCESSING' | 'SUCCESS'>('QR');

  useEffect(() => {
    // We can't guarantee audio files exist yet, but we prepare the objects.
    // In a real app, you'd place success.mp3 and error.mp3 in the public folder.
    successAudio.current = new Audio('/success.mp3');
    errorAudio.current = new Audio('/error.mp3');
  }, []);

  const processRfid = async (rfid: string) => {
    setStatus('LOADING');
    setMemberData(null);
    setMessage('AUTHENTICATING...');

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfidTag: rfid }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('SUCCESS');
        setMemberData(data.member);
        setMessage(data.action === 'tap-out' ? 'CHECKED OUT' : 'ACCESS GRANTED');
        if (successAudio.current) successAudio.current.play().catch(() => {});
        
        setTimeout(() => resetKiosk(), 5000);
      } else {
        setStatus('ERROR');
        // If the error is an expired membership, we still want the member data to offer renewal
        if (data.error === 'Membership Expired' && data.member) {
          setMemberData(data.member);
          setMessage('MEMBERSHIP EXPIRED');
        } else {
          setMessage(data.error || 'ACCESS DENIED');
          setTimeout(() => resetKiosk(), 5000);
        }
        if (errorAudio.current) errorAudio.current.play().catch(() => {});
      }
    } catch (err) {
      setStatus('ERROR');
      setMessage('SYSTEM OFFLINE');
      setTimeout(() => resetKiosk(), 5000);
    }
  };

  const resetKiosk = () => {
    setStatus('IDLE');
    setMemberData(null);
    setMessage('');
    setShowGcashModal(false);
    setGcashStatus('QR');
  };

  const startGcashPayment = () => {
    setShowGcashModal(true);
    setGcashStatus('QR');
  };

  const simulateGcashPayment = async () => {
    if (!memberData) return;
    setGcashStatus('PROCESSING');
    
    // Simulate network delay for payment
    setTimeout(async () => {
      try {
        // Send a request to our mock webhook
        const res = await fetch('/api/webhooks/paymongo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: memberData.id, amount: 1000 })
        });
        
        if (res.ok) {
          setGcashStatus('SUCCESS');
          if (successAudio.current) successAudio.current.play().catch(() => {});
          
          // Auto close after 3 seconds
          setTimeout(() => {
            resetKiosk();
            // Optional: Re-trigger check-in to show the green screen!
            // processRfid(memberData.rfidTag); 
          }, 3000);
        } else {
          alert('Payment Failed! Please go to the front desk.');
          resetKiosk();
        }
      } catch (e) {
        alert('Network error during payment.');
        resetKiosk();
      }
    }, 2000);
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-color)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Cyber Grid */}
      <div className="cyber-grid" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.3, zIndex: 0 }}></div>

      <input 
        ref={inputRef} 
        type="text" 
        style={{ position: 'absolute', opacity: 0, left: '-9999px' }} 
        autoFocus 
        onChange={(e) => {
          if (e.target.value.endsWith('\n')) {
            const val = e.target.value.trim();
            if (val) processRfid(val);
            e.target.value = '';
          }
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.1', textShadow: '0 0 20px rgba(245, 166, 35, 0.3)' }}>
          <span style={{ color: 'var(--brand-color)', fontWeight: '900', letterSpacing: '4px' }}>DKB</span>
          <span style={{ color: '#fff', fontSize: '1.5rem', letterSpacing: '8px', fontWeight: '300' }}>FITNESS GYM</span>
        </h1>

        <div className="glass-panel" style={{ 
          padding: '4rem 2rem', 
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: status === 'SUCCESS' ? '1px solid var(--success)' : status === 'ERROR' ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: status === 'SUCCESS' ? '0 0 50px rgba(16, 185, 129, 0.2)' : status === 'ERROR' ? '0 0 50px rgba(239, 68, 68, 0.2)' : '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          
          {status === 'IDLE' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <ScanLine size={120} color="var(--brand-color)" style={{ opacity: 0.8 }} />
                <div style={{ 
                  position: 'absolute', top: '0', left: '0', width: '100%', height: '2px', 
                  background: 'var(--brand-color)', boxShadow: '0 0 10px var(--brand-color)',
                  animation: 'scan 2s ease-in-out infinite alternate' 
                }}></div>
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '2rem', letterSpacing: '2px', marginBottom: '0.5rem' }}>AWAITING SCAN</h2>
                <p style={{ color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Please tap your RFID card</p>
              </div>
            </div>
          )}

          {status === 'LOADING' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <Loader2 size={80} color="var(--brand-color)" style={{ animation: 'spin 1s linear infinite' }} />
              <h2 style={{ color: '#fff', fontSize: '1.5rem', letterSpacing: '4px' }}>{message}</h2>
            </div>
          )}

          {status === 'SUCCESS' && memberData && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
                border: '2px solid var(--success)', color: 'var(--success)', fontSize: '2.5rem', fontWeight: 'bold'
              }}>
                {getInitials(memberData.name)}
              </div>
              <h2 style={{ color: 'var(--success)', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', textShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}>{message}</h2>
              <h3 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1.5rem' }}>{memberData.name}</h3>
              
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem 2rem', borderRadius: '12px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#888' }}>Status:</span>
                  <span style={{ color: memberData.isActive ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>
                    {memberData.isActive ? 'ACTIVE' : 'EXPIRED'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Valid Until:</span>
                  <span style={{ color: '#fff' }}>{new Date(memberData.membershipEnd).toLocaleDateString('en-PH', { timeZone: 'Asia/Manila' })}</span>
                </div>
              </div>
            </div>
          )}

          {status === 'ERROR' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
              <XCircle size={100} color="var(--error)" />
              <h2 style={{ color: 'var(--error)', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}>{message}</h2>
              
              {/* If we have memberData here, it means they are expired and we can offer renewal */}
              {memberData ? (
                <>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem' }}>{memberData.name}</h3>
                  <p style={{ color: '#888', fontSize: '1rem', marginBottom: '1rem' }}>
                    Your membership ended on {new Date(memberData.membershipEnd).toLocaleDateString('en-PH')}
                  </p>
                  
                  {!showGcashModal ? (
                    <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '400px' }}>
                      <button onClick={resetKiosk} className="brand-button-outline" style={{ flex: 1, borderColor: '#555', color: '#aaa' }}>
                        Close
                      </button>
                      <button onClick={startGcashPayment} className="brand-button" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Smartphone size={18} /> Renew via GCash (₱1000)
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                      {gcashStatus === 'QR' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <h4 style={{ color: '#0052FE', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Smartphone /> GCash Payment
                          </h4>
                          <div style={{ width: '150px', height: '150px', background: '#fff', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Mock QR Code */}
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MockGCashPaymentForDKB" alt="QR Code" />
                          </div>
                          <p style={{ color: '#888', fontSize: '0.9rem' }}>Scan to pay ₱1000 for 1 Month</p>
                          <button onClick={simulateGcashPayment} className="brand-button" style={{ background: '#0052FE', width: '100%' }}>
                            Simulate Scan & Pay
                          </button>
                        </div>
                      )}
                      
                      {gcashStatus === 'PROCESSING' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                          <Loader2 size={48} color="#0052FE" style={{ animation: 'spin 1s linear infinite' }} />
                          <h4 style={{ color: '#fff' }}>Waiting for Payment...</h4>
                        </div>
                      )}

                      {gcashStatus === 'SUCCESS' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
                          <CheckCircle2 size={64} color="var(--success)" />
                          <h4 style={{ color: 'var(--success)', fontSize: '1.5rem' }}>Payment Received!</h4>
                          <p style={{ color: '#fff' }}>Your membership has been extended by 1 month.</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: '#888', fontSize: '1.2rem' }}>Please proceed to the front desk.</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#555', fontFamily: 'monospace' }}>
        <Fingerprint size={16} /> SYSTEM SECURE • READY
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(120px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
