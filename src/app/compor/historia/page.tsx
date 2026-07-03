'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import AppShell from '@/components/layout/AppShell';
import { MEMORY_EMOJIS, MEMORY_COLORS, getLifeStage } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { createMemory, unlockAchievement, getMemories } from '@/lib/supabase/queries';

function HistoriaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt') ?? '';
  const { user, baby } = useApp();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Stage is computed from the current moment vs baby's birth date
  const stage = getLifeStage(new Date().toISOString(), baby?.birth_date)
  const emojis: string[] = MEMORY_EMOJIS[stage] ?? MEMORY_EMOJIS['ano-1'] ?? [];

  const handleSave = async () => {
    if (!title.trim() || !body.trim()) { setError('Preencha o título e o conteúdo.'); return }
    if (!baby?.id || !user?.id) { setError('Sessão inválida. Faça login novamente.'); return }
    setError('');
    setLoading(true);
    try {
      await createMemory({
        baby_id: baby.id,
        user_id: user.id,
        type: 'historia',
        title: title.trim(),
        body: body.trim(),
        life_stage: stage,
        emoji: selectedEmoji ?? undefined,
        bg_color: MEMORY_COLORS[stage] ?? MEMORY_COLORS['ano-1'],
        week: baby.week,
      })

      const allMemories = await getMemories(baby.id)
      if (allMemories.length <= 1) {
        await unlockAchievement(baby.id, user.id, 'primeira-memoria', 50).catch(() => {})
      }
      if (allMemories.length >= 10) {
        await unlockAchievement(baby.id, user.id, 'escritor', 200).catch(() => {})
      }

      router.push('/memorias')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar. Tente novamente.')
      setLoading(false)
    }
  };

  return (
    <div style={{ background: '#F4F3F7', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <StatusBar />
      <ScreenHeader title="Nova História" onBack={() => router.back()} />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da memória"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid #E7E5F0',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#2E2C4A',
            padding: '0 0 12px',
            marginBottom: 18,
            outline: 'none',
          }}
        />

        {/* Writing prompt box */}
        <div style={{ background: '#F3EFFA', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: '1px solid #E7E1F4' }}>
          <p style={{ fontSize: 14, color: '#6B53AE', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            {promptParam || 'Como foi esse momento especial?'}
          </p>
        </div>

        {/* Body textarea */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva sua memória aqui..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            minHeight: 200,
            background: '#fff',
            border: '2px solid #E7E5F0',
            borderRadius: 14,
            padding: '14px 16px',
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: '#2E2C4A',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            marginBottom: 18,
          }}
        />

        {/* Emoji picker */}
        {emojis.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: '#8B89B0', fontFamily: 'Inter, sans-serif', fontWeight: 500, margin: '0 0 10px' }}>
              Escolha um emoji
            </p>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    border: selectedEmoji === emoji ? '2.5px solid #6B53AE' : '2px solid #E7E5F0',
                    background: selectedEmoji === emoji ? '#F3EFFA' : '#fff',
                    fontSize: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                    boxShadow: selectedEmoji === emoji ? '0 2px 8px rgba(107,83,174,0.25)' : 'none',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p style={{ color: '#EF4444', fontSize: 13, margin: '0 0 12px' }}>{error}</p>}

        {/* Save button */}
        <Button variant="primary" fullWidth loading={loading} onClick={handleSave}>
          Salvar memória
        </Button>
      </div>
    </div>
  );
}

export default function HistoriaPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ padding: 32, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: '#8B89B0' }}>Carregando...</div>}>
        <HistoriaContent />
      </Suspense>
    </AppShell>
  );
}
