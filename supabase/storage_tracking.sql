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

-- ══════════════════════════════════════════════════════
-- CRÍTICO: Atualizar constraint de life_stage
-- O app agora usa 'gestacao' e 'ano-1', 'ano-2', etc.
-- A constraint antiga só aceitava 'gestacao','0-1','1-3','escola'
-- ══════════════════════════════════════════════════════

-- 1. Remover constraint antiga
ALTER TABLE memories DROP CONSTRAINT IF EXISTS memories_life_stage_check;

-- 2. Migrar valores antigos para o novo formato
UPDATE memories SET life_stage = 'ano-1' WHERE life_stage = '0-1';
UPDATE memories SET life_stage = 'ano-2' WHERE life_stage = '1-3';
UPDATE memories SET life_stage = 'ano-4' WHERE life_stage = 'escola';

-- 3. Adicionar nova constraint que aceita o formato atual
ALTER TABLE memories ADD CONSTRAINT memories_life_stage_check
  CHECK (life_stage = 'gestacao' OR life_stage ~ '^ano-[0-9]+$');
