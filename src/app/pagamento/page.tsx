'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBar from '@/components/ui/StatusBar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import AppShell from '@/components/layout/AppShell';
import { useApp } from '@/contexts/AppContext';

type PaymentTab = 'card' | 'pix' | 'boleto';

const MOCK_PIX_CODE = 'memora00020126580014br.gov.bcb.pix01366b8c1f2a-4e3b-4d8a-9f0b-3c7e2a1b5d9e520400005303986540549.905802BR5920Memora Bebe LTDA6009Sao Paulo62070503***6304B2C3';

function PagamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPlan } = useApp();

  const type = searchParams.get('type') ?? 'upgrade';
  const plan = searchParams.get('plan') ?? 'premium';
  const billing = searchParams.get('billing') ?? 'monthly';
  const amount = searchParams.get('amount') ?? '49,90';

  const [tab, setTab] = useState<PaymentTab>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderLabel = type === 'giftcard'
    ? `Gift Card R$ ${amount}`
    : plan === 'premium'
      ? `Plano Premium ${billing === 'annual' ? 'Anual' : 'Mensal'}`
      : 'Plano Premium Mensal';

  const orderPrice = type === 'giftcard'
    ? `R$ ${amount}`
    : billing === 'annual' ? 'R$ 249,90' : 'R$ 29,90';

  const handlePay = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 2000));
    setLoading(false);
    setSuccess(true);
    if (type === 'upgrade') {
      setPlan('premium');
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(MOCK_PIX_CODE).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCardNumber = (val: string) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <StatusBar />
      <ScreenHeader title="Pagamento" onBack={() => router.back()} />

      <div style={{ padding: '0 16px 40px' }}>
        {/* Sandbox banner */}
        <div style={{
          background: 'var(--warning-soft)',
          borderRadius: 12,
          padding: '10px 14px',
          marginBottom: 16,
          border: '1px solid var(--warning)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--warning)',
            margin: '0 0 3px',
            letterSpacing: '0.05em',
          }}>
            🧪 AMBIENTE DE SANDBOX
          </p>
          <p style={{
            fontSize: 13,
            color: '#7A5C28',
            margin: 0,
            fontFamily: 'var(--font-body)',
          }}>
            Este é um ambiente de teste. Nenhuma cobrança real será efetuada.
          </p>
        </div>

        {success ? (
          /* Success state */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 24,
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--success-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Icon name="check" size={36} color="var(--success)" strokeWidth={2.5} />
            </div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--text-strong)',
              margin: '0 0 8px',
              textAlign: 'center',
            }}>
              Pagamento aprovado! 🎉
            </p>
            <p style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              margin: '0 0 6px',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
            }}>
              {orderLabel}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 24,
              color: 'var(--accent)',
              margin: '0 0 32px',
            }}>
              {orderPrice}
            </p>
            <Button variant="primary" fullWidth onClick={() => router.push('/')}>
              Voltar ao início
            </Button>
          </div>
        ) : (
          <>
            {/* Order summary */}
            <div style={{
              background: 'var(--surface-card)',
              borderRadius: 16,
              padding: '16px 18px',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  margin: '0 0 4px',
                  fontFamily: 'var(--font-body)',
                }}>
                  Resumo do pedido
                </p>
                <p style={{
                  fontSize: 15,
                  color: 'var(--text-body)',
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                }}>
                  {orderLabel}
                </p>
              </div>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 18,
                color: 'var(--text-strong)',
                margin: 0,
              }}>
                {orderPrice}
              </p>
            </div>

            {/* Payment method tabs */}
            <div style={{
              display: 'flex',
              background: 'var(--surface-sunken)',
              borderRadius: 12,
              padding: 3,
              marginBottom: 20,
              gap: 3,
            }}>
              {([['card', 'Cartão'], ['pix', 'PIX'], ['boleto', 'Boleto']] as [PaymentTab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 14,
                    background: tab === t ? 'var(--surface-card)' : 'transparent',
                    color: tab === t ? 'var(--text-strong)' : 'var(--text-muted)',
                    boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cartão form */}
            {tab === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: 6,
                  }}>
                    Número do cartão
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Nome no cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="NOME COMPLETO"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Validade (MM/AA)</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/AA"
                      maxLength={5}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>CVV</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="123"
                      maxLength={3}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Test card info */}
                <div style={{
                  background: 'var(--violet-50)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  border: '1px solid var(--violet-100)',
                }}>
                  <p style={{
                    fontSize: 12,
                    color: 'var(--text-accent)',
                    margin: 0,
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.5,
                  }}>
                    <strong>Cartão de teste:</strong> Use o cartão <strong>4111 1111 1111 1111</strong>, validade <strong>11/25</strong>, CVV <strong>123</strong> para aprovar pagamento.
                  </p>
                </div>

                <div style={{ marginTop: 6 }}>
                  <Button
                    variant="primary"
                    fullWidth
                    loading={loading}
                    onClick={handlePay}
                  >
                    Pagar {orderPrice}
                  </Button>
                </div>
              </div>
            )}

            {/* PIX view */}
            {tab === 'pix' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 200,
                  height: 200,
                  background: 'var(--surface-sunken)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--border-subtle)',
                }}>
                  <Icon name="qr-code" size={64} color="var(--text-muted)" strokeWidth={1.5} />
                </div>
                <div style={{ width: '100%' }}>
                  <label style={labelStyle}>Código PIX</label>
                  <input
                    type="text"
                    readOnly
                    value={MOCK_PIX_CODE}
                    style={{ ...inputStyle, fontSize: 11, color: 'var(--text-muted)' }}
                  />
                </div>
                <Button variant="secondary" fullWidth onClick={handleCopyPix}>
                  {copied ? 'Copiado! ✓' : 'Copiar código'}
                </Button>
              </div>
            )}

            {/* Boleto view */}
            {tab === 'boleto' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 8 }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'var(--surface-sunken)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon name="file-text" size={32} color="var(--text-muted)" strokeWidth={1.5} />
                </div>
                <p style={{
                  fontSize: 15,
                  color: 'var(--text-body)',
                  textAlign: 'center',
                  margin: 0,
                  fontFamily: 'var(--font-body)',
                }}>
                  Boleto será gerado após confirmação
                </p>
                <Button variant="primary" fullWidth loading={loading} onClick={handlePay}>
                  Gerar boleto
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px 14px',
  borderRadius: 12,
  border: '2px solid var(--border-strong)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: 15,
  color: 'var(--text-strong)',
  background: 'var(--surface-card)',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  display: 'block',
  marginBottom: 6,
};

export default function PagamentoPage() {
  return (
    <AppShell>
      <Suspense fallback={<div style={{ padding: 32, textAlign: 'center' }}>Carregando...</div>}>
        <PagamentoContent />
      </Suspense>
    </AppShell>
  );
}
