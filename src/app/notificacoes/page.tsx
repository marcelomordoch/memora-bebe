'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { timeAgo } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { getNotifications, markAllNotificationsRead } from '@/lib/supabase/queries';
import type { Notification } from '@/types';

function getIconConfig(type: string): { icon: string; bg: string; color: string } {
  switch (type) {
    case 'memory':   return { icon: 'camera', bg: '#E7E1F4', color: '#6B53AE' };
    case 'milestone': return { icon: 'award', bg: '#E7E1F4', color: '#6B53AE' };
    case 'system':   return { icon: 'clock', bg: '#E7E1F4', color: '#6B53AE' };
    case 'offer':    return { icon: 'tag', bg: '#FEF3C7', color: '#B45309' };
    case 'family':   return { icon: 'users', bg: '#FCE7F3', color: '#C76FB0' };
    default:         return { icon: 'bell', bg: '#E7E1F4', color: '#6B53AE' };
  }
}

export default function NotificacoesPage() {
  const router = useRouter();
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getNotifications(user.id)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleMarkAllRead() {
    if (!user?.id || marking) return;
    setMarking(true);
    try {
      await markAllNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  }

  return (
    <AppShell>
      <div style={{ background: '#F4F3F7', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <StatusBar />
        <ScreenHeader
          title="Notificações"
          onBack={() => router.back()}
          right={
            <button
              onClick={handleMarkAllRead}
              disabled={marking}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B53AE', fontFamily: 'Inter, sans-serif', fontWeight: 600, padding: '4px 0', opacity: marking ? 0.5 : 1 }}
            >
              {marking ? '...' : 'Todas lidas'}
            </button>
          }
        />

        <div style={{ paddingBottom: 32 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', gap: 12 }}>
              <span style={{ width: 32, height: 32, border: '3px solid #E7E5F0', borderTopColor: '#6B53AE', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#8B89B0', margin: 0 }}>Carregando...</p>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 16px', gap: 12 }}>
              <Icon name="bell" size={48} color="#C8C7D8" strokeWidth={1.5} />
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, margin: 0, color: '#8B89B0' }}>
                Sem notificações por enquanto
              </p>
            </div>
          )}

          {notifications.map((notif) => {
            const { icon, bg, color } = getIconConfig(notif.type);
            return (
              <div
                key={notif.id}
                style={{
                  background: notif.read ? '#fff' : '#F3EFFA',
                  borderBottom: '1px solid #E7E5F0',
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
                <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={22} color={color} strokeWidth={2} />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, color: '#2E2C4A', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {notif.title}
                  </p>
                  <p style={{ fontSize: 13, color: '#8B89B0', margin: '0 0 4px', fontFamily: 'Inter, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notif.body}
                  </p>
                  <p style={{ fontSize: 11, color: '#8B89B0', margin: 0, fontFamily: 'Inter, sans-serif' }}>
                    {timeAgo(notif.created_at)}
                  </p>
                </div>

                {/* Unread dot + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6B53AE' }} />}
                  <Icon name="chevron-right" size={16} color="#8B89B0" strokeWidth={2} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppShell>
  );
}
