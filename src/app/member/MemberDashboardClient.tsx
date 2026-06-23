'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Smartphone, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/admin/Toast';

function DashboardUI({ member, attendance }: any) {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const { toast } = useToast();
  const router = useRouter();

  const isExpired = new Date(member.membershipEnd) < new Date();
  const daysRemaining = Math.ceil((new Date(member.membershipEnd).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  const simulatePayment = async () => {
    setPaymentStatus('PROCESSING');
    
    // Simulate network delay and webhook execution
    setTimeout(async () => {
      try {
        const res = await fetch('/api/webhooks/paymongo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ memberId: member.id, amount: member.plan?.price || 1000, planId: member.plan?.id })
        });
        
        if (res.ok) {
          setPaymentStatus('SUCCESS');
          toast('success', 'Payment successful! Membership extended.');
          setTimeout(() => {
            setShowPayment(false);
            setPaymentStatus('IDLE');
            router.refresh();
          }, 3000);
        } else {
          toast('error', 'Payment processing failed.');
          setPaymentStatus('IDLE');
        }
      } catch (err) {
        toast('error', 'Network error during payment.');
        setPaymentStatus('IDLE');
      }
    }, 2500);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Welcome Banner */}
      <div>
        <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 5px 0' }}>Hello, {member.name.split(' ')[0]}!</h1>
        <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
          {member.plan ? `Current Plan: ${member.plan.name}` : 'Welcome to your DKB Fitness Hub.'}
        </p>
      </div>

      {/* Status Card */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem', 
        border: isExpired ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
        background: isExpired ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(0,0,0,0.5))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(0,0,0,0.5))',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background icon */}
        <ShieldCheck size={120} style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05, color: isExpired ? 'var(--error)' : 'var(--success)' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          {isExpired ? <AlertTriangle color="var(--error)" /> : <CheckCircle2 color="var(--success)" />}
          <h2 style={{ color: isExpired ? 'var(--error)' : 'var(--success)', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isExpired ? 'Membership Expired' : 'Active Membership'}
          </h2>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#aaa', margin: '0 0 5px 0', fontSize: '0.85rem' }}>Valid Until</p>
          <p style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {new Date(member.membershipEnd).toLocaleDateString('en-PH', { dateStyle: 'long' })}
          </p>
          {!isExpired && (
            <p style={{ color: daysRemaining <= 7 ? 'var(--brand-color)' : '#888', margin: '5px 0 0 0', fontSize: '0.85rem' }}>
              ({daysRemaining} days remaining)
            </p>
          )}
        </div>

        {!showPayment ? (
          <button 
            onClick={() => setShowPayment(true)}
            className={isExpired ? "brand-button" : "brand-button-outline"} 
            style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', 
              background: isExpired ? '#0052FE' : 'transparent', borderColor: isExpired ? '#0052FE' : '#0052FE', color: isExpired ? '#fff' : '#0052FE' 
            }}
          >
            <Smartphone size={18} /> Renew via GCash {member.plan ? `(₱${member.plan.price})` : ''}
          </button>
        ) : (
          <div className="animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            {paymentStatus === 'IDLE' && (
              <>
                <p style={{ color: '#fff', marginBottom: '1rem', fontSize: '0.9rem' }}>Securely process your ₱1,000 payment.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowPayment(false)} className="brand-button-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                  <button onClick={simulatePayment} className="brand-button" style={{ flex: 1, padding: '10px', background: '#0052FE', border: 'none' }}>Pay Now</button>
                </div>
              </>
            )}
            {paymentStatus === 'PROCESSING' && (
              <div style={{ padding: '1rem 0', color: '#0052FE', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid rgba(0,82,254,0.3)', borderTopColor: '#0052FE', borderRadius: '50%' }}></div>
                <span style={{ fontSize: '0.9rem' }}>Processing Payment...</span>
              </div>
            )}
            {paymentStatus === 'SUCCESS' && (
              <div style={{ padding: '1rem 0', color: 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={32} />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Payment Received!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} color="var(--brand-color)" /> Recent Workouts
        </h3>
        
        {attendance.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attendance.map((att: any) => (
              <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.95rem' }}>{new Date(att.timestamp).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                    <Clock size={12} /> {new Date(att.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {att.tapOut && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>Out</div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{new Date(att.tapOut).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#666', textAlign: 'center', padding: '1rem 0', fontSize: '0.9rem' }}>
            No recent attendance records. Time to hit the gym!
          </div>
        )}
      </div>

    </div>
  );
}

export default function MemberDashboardClient(props: any) {
  return (
    <ToastProvider>
      <DashboardUI {...props} />
    </ToastProvider>
  );
}
