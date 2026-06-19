'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import AppShell from '@/components/layout/AppShell';
import { MEMORY_EMOJIS } from '@/lib/utils';

type LifeStage = 'gestacao' | '0-1' | '1-3' | 'escola';

const STAGE_OPTIONS: { value: LifeStage; label: string }[] = [
  { value: 'gestacao', label: 'Gestação' },
  { value: '0-1', label: '0-1 ano' },
  { value: '1-3', label: '1-3 anos' },
  { value: 'escola', label: 'Escola' },
];

function HistoriaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get('prompt') ?? '';

  const [stage, setStage] = useState<LifeStage>('gestacao');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emojis: string[] = MEMORY_EMOJIS[stage] ?? [];

  const handleSave = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1000));
    setLoading(false);
    router.push('/memorias');
  };

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <StatusBar />
      <ScreenHeader title="Nova História" onBack={() => router.back()} />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Stage chips */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 22,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {STAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStage(opt.value);
                setSelectedEmoji(null);
              }}
              style={{
                padding: '7px 16px',
                borderRadius: 30,
                border: stage === opt.value
                  ? '2px solid var(--accent)'
                  : '2px solid var(--border-subtle)',
                background: stage === opt.value ? 'var(--accent)' : 'var(--surface-card)',
                color: stage === opt.value ? '#fff' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

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
            borderBottom: '2px solid var(--border-subtle)',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-strong)',
            padding: '0 0 12px',
            marginBottom: 18,
            outline: 'none',
          }}
        />

        {/* Writing prompt box */}
        <div style={{
          background: 'var(--violet-50)',
          borderRadius: 14,
          padding: '12px 14px',
          marginBottom: 16,
          border: '1px solid var(--violet-100)',
        }}>
          <p style={{
            fontSize: 14,
            color: 'var(--text-accent)',
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.5,
          }}>
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
            background: 'var(--surface-card)',
            border: '2px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '14px 16px',
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            color: 'var(--text-body)',
            lineHeight: 1.6,
            resize: 'none',
            outline: 'none',
            marginBottom: 18,
          }}
        />

        {/* Emoji picker */}
        {emojis.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              margin: '0 0 10px',
            }}>
              Escolha um emoji
            </p>
            <div style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              paddingBottom: 4,
            }}>
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(selectedEmoji === emoji ? null : emoji)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    border: selectedEmoji === emoji
                      ? '2.5px solid var(--accent)'
                      : '2px solid var(--border-subtle)',
                    background: selectedEmoji === emoji ? 'var(--violet-50)' : 'var(--surface-card)',
                    fontSize: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                    boxShadow: selectedEmoji === emoji ? 'var(--shadow-accent)' : 'none',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save button */}
        <Button
          variant="primary"
          fullWidth
          loading={loading}
          onClick={handleSave}
        >
          Salvar memória
        </Button>
      </div>
    </div>
  );
}

export default function HistoriaPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Carregando...</div>}>
        <HistoriaContent />
      </Suspense>
    </AppShell>
  );
}
