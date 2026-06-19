import { createClient } from '@/lib/supabase/client'

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error
  return getPublicUrl(bucket, path)
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function generateFilePath(userId: string, fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${Date.now()}_${sanitized}`
}
