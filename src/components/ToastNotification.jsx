import React from 'react';

export default function ToastNotification({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '380px',
      width: '100%'
    }}>
      {toasts.map(toast => {
        let bg = 'rgba(21, 28, 44, 0.95)';
        let border = 'var(--accent-cyan)';
        let icon = 'fa-info-circle';
        let color = 'var(--accent-cyan)';

        if (toast.type === 'success') {
          border = 'var(--accent-emerald)';
          icon = 'fa-circle-check';
          color = 'var(--accent-emerald)';
        } else if (toast.type === 'error') {
          border = 'var(--accent-rose)';
          icon = 'fa-circle-xmark';
          color = 'var(--accent-rose)';
        } else if (toast.type === 'warning') {
          border = 'var(--accent-amber)';
          icon = 'fa-triangle-exclamation';
          color = 'var(--accent-amber)';
        }

        return (
          <div
            key={toast.id}
            className="animate-fade-in"
            style={{
              background: bg,
              backdropFilter: 'blur(16px)',
              borderLeft: `4px solid ${border}`,
              border: `1px solid var(--border-subtle)`,
              borderLeftWidth: '4px',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1.1rem',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <i className={`fa-solid ${icon}`} style={{ color, fontSize: '1.1rem' }}></i>
              <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-subdued)',
                cursor: 'pointer',
                padding: '0.2rem',
                marginLeft: '0.75rem'
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}
