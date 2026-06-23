'use client';

import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  const accentColor = variant === 'danger' ? 'var(--error)' : variant === 'warning' ? 'var(--brand-color)' : 'var(--brand-color)';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="glass-panel animate-fade-in" style={{
        padding: '2rem', maxWidth: '420px', width: '90%', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <AlertTriangle size={48} color={accentColor} style={{ margin: '0 auto 1rem auto' }} />
        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>{message}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            className="brand-button-outline"
            style={{ flex: 1, borderColor: '#555', color: '#aaa' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="brand-button"
            style={{
              flex: 1,
              background: variant === 'danger' ? 'var(--error)' : undefined,
              borderColor: variant === 'danger' ? 'var(--error)' : undefined,
            }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
