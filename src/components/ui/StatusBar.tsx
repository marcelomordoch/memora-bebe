'use client'

export default function StatusBar({ light = false }: { light?: boolean }) {
  const c = light ? '#fff' : 'var(--text-strong)'
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 22px 4px', fontFamily: 'var(--font-body)',
      fontSize: 12, fontWeight: 600, color: c, flexShrink: 0,
    }}>
      <span>9:41</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill={c}>
          <rect x="0" y="5" width="3" height="6" rx="1"/>
          <rect x="4" y="3" width="3" height="8" rx="1"/>
          <rect x="8" y="1" width="3" height="10" rx="1"/>
          <rect x="12" y="0" width="3" height="11" rx="1" opacity=".35"/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke={c} strokeWidth="1.5">
          <path d="M7.5 2.5C9.9 2.5 12 3.4 13.5 4.9"/>
          <path d="M1.5 4.9C3 3.4 5.1 2.5 7.5 2.5"/>
          <path d="M4.5 7.4C5.4 6.6 6.4 6 7.5 6s2.1.6 3 1.4"/>
          <circle cx="7.5" cy="9.5" r="1.2" fill={c} stroke="none"/>
        </svg>
        <span style={{ fontSize: 11 }}>100%</span>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0" y="1" width="22" height="10" rx="2.5" stroke={c} strokeWidth="1.2" fill="none"/>
          <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill={c} opacity=".4"/>
          <rect x="1.5" y="2.5" width="18" height="7" rx="1.5" fill={c}/>
        </svg>
      </div>
    </div>
  )
}
