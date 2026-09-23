import React from 'react';

export default function Navbar({ activeTab, setActiveTab, stats, theme, toggleTheme }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'practice', label: 'Practice Quiz', icon: 'fa-bolt' },
    { id: 'mistakes', label: 'Mistakes Bank', icon: 'fa-triangle-exclamation', badge: stats.mistakesCount }
  ].filter(tab => !(activeTab === 'practice' && tab.id === 'mistakes'));

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.85rem 1.5rem'
    }}>
      <div style={{
        maxWidth: '1300px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <i className="fa-solid fa-stethoscope" style={{ fontSize: '1.3rem' }}></i>
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', lineHeight: 1 }} className="gradient-text">
              FCPS Pro
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              FCPS Part 1 & MBBS Prep Engine
            </span>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {navItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : 'rgba(244,63,94,0.2)',
                  color: activeTab === tab.id ? '#fff' : 'var(--accent-rose)',
                  fontSize: '0.75rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '99px',
                  fontWeight: 700
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="badge" style={{ padding: '0.4rem 0.85rem' }}>
            <i className="fa-solid fa-fire" style={{ color: 'var(--accent-amber)' }}></i>
            <span>{stats.attemptedCount} / 3,967 Solved</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}
            title="Toggle Light/Dark Theme"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
}
