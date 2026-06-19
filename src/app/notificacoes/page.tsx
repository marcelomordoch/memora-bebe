'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';
import { timeAgo } from '@/lib/utils';

type NotificationType = 'memory' | 'milestone' | 'system' | 'offer' | 'family' | string;

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  subtitle?: string;
  body?: string;
  createdAt?: string | Date;
  created_at?: string;
  read: boolean;
}

function getIconConfig(type: NotificationType): {
  icon: string;
  bg: string;
  color: string;
} {
  switch (type) {
    case 'memory':
      return { icon: 'camera', bg: 'var(--violet-100)', color: 'var(--accent)' };
    case 'milestone':
      return { icon: 'award', bg: 'var(--violet-100)', color: 'var(--accent)' };
    case 'system':
      return { icon: 'clock', bg: 'var(--violet-100)', color: 'var(--accent)' };
    case 'offer':
      return { icon: 'tag', bg: 'var(--warning-soft)', color: 'var(--warning)' };
    case 'family':
      return { icon: 'circle', bg: 'var(--rose-100)', color: 'var(--rose-500)' };
    default:
      return { icon: 'bell', bg: 'var(--violet-100)', color: 'var(--accent)' };
  }
}

export default function NotificacoesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    (MOCK_NOTIFICATIONS as NotificationItem[]) ?? []
  );

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppShell>
      <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
        <StatusBar />
        <ScreenHeader
          title="Notificações"
          onBack={() => router.back()}
          right={
            <button
              onClick={markAllRead}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--text-accent)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                padding: '4px 0',
              }}
            >
              Marcar todas como lidas
            </button>
          }
        />

        <div style={{ paddingBottom: 32 }}>
          {notifications.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 16px',
              color: 'var(--text-muted)',
              gap: 12,
            }}>
              <Icon name="bell" size={48} color="var(--border-strong)" strokeWidth={1.5} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, margin: 0 }}>
                Sem notificações por enquanto
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const { icon, bg, color } = getIconConfig(notif.type);
              return (
                <div
                  key={notif.id}
                  style={{
                    background: notif.read ? 'var(--surface-card)' : 'var(--violet-50)',
                    borderBottom: '1px solid var(--border-subtle)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 13,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((n) => n.id === notif.id ? { ...n, read: true } : n)
                    );
                  }}
                >
                  {/* Icon tile */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 13,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon name={icon} size={22} color={color} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: 'var(--text-strong)',
                      margin: '0 0 3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {notif.title}
                    </p>
                    <p style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      margin: '0 0 4px',
                      fontFamily: 'var(--font-body)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {notif.subtitle || notif.body}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      margin: 0,
                      fontFamily: 'var(--font-body)',
                    }}>
                      {timeAgo(notif.createdAt as string || notif.created_at || '')}
                    </p>
                  </div>

                  {/* Unread dot + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {!notif.read && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                      }} />
                    )}
                    <Icon name="chevron-right" size={16} color="var(--text-muted)" strokeWidth={2} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
