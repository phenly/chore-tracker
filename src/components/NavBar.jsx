export default function NavBar({ view, setView }) {
  const tabs = [
    { id: 'current', icon: '🎮', label: 'This Week' },
    { id: 'history', icon: '📜', label: 'History' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(13,13,26,0.95)',
      borderTop: '1px solid rgba(124,58,237,0.25)',
      display: 'flex',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          style={{
            flex: 1, padding: '14px 12px', background: 'none', border: 'none',
            color: view === tab.id ? '#a78bfa' : 'rgba(255,255,255,0.35)',
            fontSize: '0.8rem', fontWeight: view === tab.id ? 800 : 400,
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '4px',
            borderTop: view === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
