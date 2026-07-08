'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useApp } from '@/contexts/AppContext'
import StatusBar from '@/components/ui/StatusBar'
import ScreenHeader from '@/components/ui/ScreenHeader'
import Icon from '@/components/ui/Icon'

const ADMIN_EMAILS = ['marcelomord@gmail.com', 'joaoitaki@gmail.com']
const CATEGORIES = ['Roupinhas', 'Brinquedos', 'Higiene', 'Alimentação', 'Quarto', 'Passeio', 'Outros']

// ── Types ─────────────────────────────────────────────────────────────────────
type Banner = {
  id: string; partner_name: string; image_url: string; link_url: string
  is_active: boolean; sort_order: number; created_at: string
}
type Product = {
  id: string; partner_name: string; title: string; description: string | null
  price: number; original_price: number | null; image_url: string; affiliate_url: string
  category: string; is_active: boolean; is_featured: boolean; sort_order: number; created_at: string
}

// ── Banner form ───────────────────────────────────────────────────────────────
function BannerForm({ initial, onSave, onClose }: {
  initial?: Partial<Banner>; onSave: (data: Partial<Banner>) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({ partner_name: '', image_url: '', link_url: '', sort_order: 0, ...initial })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  function set(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!form.partner_name || !form.image_url || !form.link_url) { setErr('Preencha todos os campos.'); return }
    setSaving(true); setErr('')
    try { await onSave(form); onClose() } catch { setErr('Erro ao salvar.') } finally { setSaving(false) }
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Field label="Nome do parceiro" value={form.partner_name} onChange={v => set('partner_name', v)} />
      <Field label="URL da imagem" value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
      {form.image_url && <img src={form.image_url} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, border: '1px solid #ede9fa' }} onError={e => (e.currentTarget.style.display = 'none')} />}
      <Field label="URL de destino (link de afiliado)" value={form.link_url} onChange={v => set('link_url', v)} placeholder="https://amazon.com.br/...?tag=..." />
      <Field label="Ordem" value={String(form.sort_order)} onChange={v => set('sort_order', Number(v))} type="number" />
      {err && <p style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onClose} style={btnGhost}>Cancelar</button>
        <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  )
}

// ── Product form ──────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onClose }: {
  initial?: Partial<Product>; onSave: (data: Partial<Product>) => Promise<void>; onClose: () => void
}) {
  const [form, setForm] = useState({
    partner_name: initial?.partner_name ?? 'Amazon',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    price: String(initial?.price ?? ''),
    original_price: String(initial?.original_price ?? ''),
    image_url: initial?.image_url ?? '',
    affiliate_url: initial?.affiliate_url ?? '',
    category: initial?.category ?? 'Outros',
    is_featured: initial?.is_featured ?? false,
    sort_order: initial?.sort_order ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  function set(k: string, v: string | number | boolean) { setForm(f => ({ ...f, [k]: v })) }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.price || !form.image_url || !form.affiliate_url) { setErr('Preencha os campos obrigatórios.'); return }
    setSaving(true); setErr('')
    try {
      await onSave({
        ...form,
        price: parseFloat(String(form.price)),
        original_price: form.original_price ? parseFloat(String(form.original_price)) : null,
      })
      onClose()
    } catch { setErr('Erro ao salvar.') } finally { setSaving(false) }
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Parceiro" value={form.partner_name} onChange={v => set('partner_name', v)} />
        <div>
          <label style={labelStyle}>Categoria</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={inputStyle}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <Field label="Título *" value={form.title} onChange={v => set('title', v)} />
      <div>
        <label style={labelStyle}>Descrição</label>
        <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Preço (R$) *" value={String(form.price)} onChange={v => set('price', v)} type="number" placeholder="0.00" />
        <Field label="Preço original (R$)" value={String(form.original_price)} onChange={v => set('original_price', v)} type="number" placeholder="0.00" />
      </div>
      <Field label="URL da imagem *" value={form.image_url} onChange={v => set('image_url', v)} placeholder="https://..." />
      {form.image_url && <img src={form.image_url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #ede9fa' }} onError={e => (e.currentTarget.style.display = 'none')} />}
      <Field label="Link de afiliado *" value={form.affiliate_url} onChange={v => set('affiliate_url', v)} placeholder="https://amazon.com.br/...?tag=..." />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" id="featured" checked={form.is_featured as boolean} onChange={e => set('is_featured', e.target.checked)} />
        <label htmlFor="featured" style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--text-strong)' }}>Destaque</label>
      </div>
      {err && <p style={{ fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onClose} style={btnGhost}>Cancelar</button>
        <button type="submit" disabled={saving} style={btnPrimary}>{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--text-strong)', fontFamily: 'var(--font-body)', display: 'block', marginBottom: 5 }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border-strong)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-strong)', background: '#fff', boxSizing: 'border-box', outline: 'none' }
const btnPrimary: React.CSSProperties = { flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--gradient-brand)', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }
const btnGhost: React.CSSProperties = { flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border-subtle)', background: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', cursor: 'pointer' }

function Field({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '90dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--border-strong)' }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-strong)', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Icon name="x" size={20} color="var(--text-muted)" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminParceirosPage() {
  const router = useRouter()
  const { user } = useApp()
  const supabase = createClient()

  const [tab, setTab] = useState<'banners' | 'products'>('banners')
  const [banners, setBanners] = useState<Banner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingB, setLoadingB] = useState(true)
  const [loadingP, setLoadingP] = useState(true)
  const [sheetMode, setSheetMode] = useState<'none' | 'add-banner' | 'edit-banner' | 'add-product' | 'edit-product'>('none')
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [catFilter, setCatFilter] = useState('Todas')
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'banner' | 'product'; id: string } | null>(null)

  // Auth guard
  useEffect(() => {
    if (user && !ADMIN_EMAILS.includes(user.email)) router.replace('/inicio')
  }, [user])

  useEffect(() => { fetchBanners() }, [])
  useEffect(() => { fetchProducts() }, [])

  async function fetchBanners() {
    setLoadingB(true)
    const { data } = await supabase.from('partner_banners').select('*').order('sort_order')
    setBanners(data ?? [])
    setLoadingB(false)
  }
  async function fetchProducts() {
    setLoadingP(true)
    const { data } = await supabase.from('partner_products').select('*').order('sort_order')
    setProducts(data ?? [])
    setLoadingP(false)
  }

  // Banner CRUD
  async function saveBanner(data: Partial<Banner>) {
    if (selectedBanner) await supabase.from('partner_banners').update(data).eq('id', selectedBanner.id)
    else await supabase.from('partner_banners').insert({ ...data, is_active: true })
    await fetchBanners()
  }
  async function toggleBanner(id: string, val: boolean) {
    await supabase.from('partner_banners').update({ is_active: val }).eq('id', id)
    setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: val } : b))
  }
  async function deleteBanner(id: string) {
    await supabase.from('partner_banners').delete().eq('id', id)
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  // Product CRUD
  async function saveProduct(data: Partial<Product>) {
    if (selectedProduct) await supabase.from('partner_products').update(data).eq('id', selectedProduct.id)
    else await supabase.from('partner_products').insert({ ...data, is_active: true })
    await fetchProducts()
  }
  async function toggleProduct(id: string, field: 'is_active' | 'is_featured', val: boolean) {
    await supabase.from('partner_products').update({ [field]: val }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  }
  async function deleteProduct(id: string) {
    await supabase.from('partner_products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  async function handleSeed() {
    setSeeding(true); setSeedMsg('')
    const res = await fetch('/api/admin/seed-partners', { method: 'POST' })
    const json = await res.json()
    if (json.ok) { setSeedMsg(`✓ ${json.banners} banners e ${json.products} produtos importados!`); fetchBanners(); fetchProducts() }
    else setSeedMsg('Erro: ' + json.error)
    setSeeding(false)
  }

  if (!user) return null

  const filteredProducts = catFilter === 'Todas' ? products : products.filter(p => p.category === catFilter)

  return (
    <div style={{ flex: 1, background: 'var(--surface-page)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#fff' }}>
        <StatusBar />
        <ScreenHeader title="CRM · Parceiros" onBack={() => router.push('/inicio')} />
      </div>

      {/* Stats bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border-subtle)', padding: '12px 20px', display: 'flex', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>{banners.filter(b => b.is_active).length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>banners ativos</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--accent)' }}>{products.filter(p => p.is_active).length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>produtos ativos</div>
        </div>
        <div style={{ width: 1, background: 'var(--border-subtle)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#f59e0b' }}>{products.filter(p => p.is_featured).length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>em destaque</div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleSeed} disabled={seeding}
          style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'var(--violet-50)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}
        >
          {seeding ? '...' : '⬇ Exemplos'}
        </button>
      </div>
      {seedMsg && <div style={{ background: '#d1fae5', padding: '8px 20px', fontSize: 13, color: '#047857', fontFamily: 'var(--font-body)' }}>{seedMsg}</div>}

      {/* Tabs */}
      <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
        {(['banners', 'products'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '14px', border: 'none', background: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: tab === t ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', borderBottom: tab === t ? '2.5px solid var(--accent)' : '2.5px solid transparent' }}>
            {t === 'banners' ? `🖼 Banners (${banners.length})` : `🛍 Produtos (${products.length})`}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* ── BANNERS TAB ── */}
        {tab === 'banners' && (
          <>
            <button onClick={() => { setSelectedBanner(null); setSheetMode('add-banner') }} style={{ ...btnPrimary, width: '100%', marginBottom: 16, borderRadius: 14 }}>
              + Novo banner
            </button>
            {loadingB ? <Spinner /> : banners.length === 0 ? (
              <Empty text="Nenhum banner. Crie um ou importe os exemplos." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {banners.map(b => (
                  <div key={b.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ position: 'relative', height: 100 }}>
                      <img src={b.image_url} alt={b.partner_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.style.background = 'var(--violet-50)'; e.currentTarget.src = '' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,.5), transparent)', display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#fff' }}>{b.partner_name}</span>
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Toggle value={b.is_active} onChange={v => toggleBanner(b.id, v)} />
                      <span style={{ fontSize: 11, color: b.is_active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>{b.is_active ? 'Ativo' : 'Inativo'}</span>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => { setSelectedBanner(b); setSheetMode('edit-banner') }} style={iconBtn}><Icon name="edit" size={16} color="var(--accent)" /></button>
                      <button onClick={() => setConfirmDelete({ type: 'banner', id: b.id })} style={iconBtn}><Icon name="trash" size={16} color="var(--danger)" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <>
            <button onClick={() => { setSelectedProduct(null); setSheetMode('add-product') }} style={{ ...btnPrimary, width: '100%', marginBottom: 12, borderRadius: 14 }}>
              + Novo produto
            </button>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 14, paddingBottom: 2 }}>
              {['Todas', ...CATEGORIES].map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 999, border: 'none', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer', background: catFilter === c ? 'var(--accent)' : 'var(--surface-card)', color: catFilter === c ? '#fff' : 'var(--text-body)' }}>
                  {c}
                </button>
              ))}
            </div>
            {loadingP ? <Spinner /> : filteredProducts.length === 0 ? (
              <Empty text="Nenhum produto nesta categoria." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                    <img src={p.image_url} alt={p.title} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12, flexShrink: 0, background: 'var(--violet-50)' }} onError={e => { e.currentTarget.style.background = 'var(--violet-50)'; e.currentTarget.src = '' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-strong)', margin: '0 0 2px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 6px' }}>{p.category} · {p.partner_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>R$ {p.price.toFixed(2).replace('.', ',')}</span>
                        {p.original_price && <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>R$ {p.original_price.toFixed(2).replace('.', ',')}</span>}
                        {p.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: '#fef3c7', borderRadius: 999, padding: '1px 7px' }}>DESTAQUE</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                      <Toggle value={p.is_active} onChange={v => toggleProduct(p.id, 'is_active', v)} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => { setSelectedProduct(p); setSheetMode('edit-product') }} style={iconBtn}><Icon name="edit" size={14} color="var(--accent)" /></button>
                        <button onClick={() => setConfirmDelete({ type: 'product', id: p.id })} style={iconBtn}><Icon name="trash" size={14} color="var(--danger)" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sheets */}
      {(sheetMode === 'add-banner' || sheetMode === 'edit-banner') && (
        <Sheet title={sheetMode === 'add-banner' ? 'Novo banner' : 'Editar banner'} onClose={() => setSheetMode('none')}>
          <BannerForm initial={selectedBanner ?? undefined} onSave={saveBanner} onClose={() => setSheetMode('none')} />
        </Sheet>
      )}
      {(sheetMode === 'add-product' || sheetMode === 'edit-product') && (
        <Sheet title={sheetMode === 'add-product' ? 'Novo produto' : 'Editar produto'} onClose={() => setSheetMode('none')}>
          <ProductForm initial={selectedProduct ?? undefined} onSave={saveProduct} onClose={() => setSheetMode('none')} />
        </Sheet>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(18,17,26,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }} onClick={() => setConfirmDelete(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: '24px', width: '100%', maxWidth: 340, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-strong)', marginBottom: 8 }}>Excluir?</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={btnGhost}>Cancelar</button>
              <button onClick={async () => {
                if (confirmDelete.type === 'banner') await deleteBanner(confirmDelete.id)
                else await deleteProduct(confirmDelete.id)
                setConfirmDelete(null)
              }} style={{ ...btnPrimary, background: 'var(--danger)', boxShadow: 'none' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Micro-components ──────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 999, background: value ? 'var(--accent)' : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', padding: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)', display: 'block' }} />
    </button>
  )
}
function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><span style={{ width: 28, height: 28, border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /></div>
}
function Empty({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-body)' }}>{text}</div>
}
const iconBtn: React.CSSProperties = { width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-subtle)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }
