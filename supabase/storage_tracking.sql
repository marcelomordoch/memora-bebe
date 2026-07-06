-- ══════════════════════════════════════════════════════
-- Tracking de armazenamento por plano
-- Rodar no Supabase SQL Editor (Dashboard → SQL Editor)
-- ══════════════════════════════════════════════════════

-- Tamanho de cada arquivo de memória (foto, vídeo, áudio)
ALTER TABLE memories ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT DEFAULT 0;

-- Plano e limite de armazenamento do usuário
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_plan  TEXT    DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS storage_limit_gb INT  DEFAULT 1;

-- Índice para somas rápidas de storage por bebê
CREATE INDEX IF NOT EXISTS idx_memories_baby_size
  ON memories (baby_id, file_size_bytes);
