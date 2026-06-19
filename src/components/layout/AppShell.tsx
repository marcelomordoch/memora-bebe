'use client'

import BottomNav from './BottomNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 76 }}>
      {children}
      <BottomNav />
    </div>
  )
}
