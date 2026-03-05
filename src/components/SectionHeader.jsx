export default function SectionHeader({ icon, title, subtitle, color }) {
  return (
    <div style={{ margin: '0 16px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{subtitle}</div>
      </div>
    </div>
  )
}
