'use client';
import { COLORS } from '@/lib/types';

interface Props { onEnter: () => void; }

export default function LandingPage({ onEnter }: Props) {
  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
    border: 'none', borderRadius: 8, transition: 'all 0.15s', padding: '12px 28px', fontSize: 15,
    background: COLORS.accent, color: COLORS.white,
  };
  const ghostBtn: React.CSSProperties = { ...btnStyle, background: 'transparent', color: COLORS.textMuted, border: `1px solid ${COLORS.border}` };
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text }}>
      <nav style={{ padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🛒</span>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px' }}>Purchase<span style={{ color: COLORS.accent }}>Ping</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onEnter} style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Sign in</button>
          <button onClick={onEnter} style={btnStyle}>Start free →</button>
        </div>
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 999, padding: '4px 14px', fontSize: 12, color: COLORS.accentLight, marginBottom: 24, fontWeight: 600 }}>
          ✨ AI-powered purchase tracking
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px', maxWidth: 720 }}>
          Never miss a return<br /><span style={{ color: COLORS.accent }}>deadline again.</span>
        </h1>
        <p style={{ fontSize: 18, color: COLORS.textMuted, maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
          Purchase Ping tracks every order, receipt, return window, and warranty — so you always know what needs attention before it&apos;s too late.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onEnter} style={{ ...btnStyle, padding: '14px 36px', fontSize: 16 }}>Start for free →</button>
          <button onClick={onEnter} style={{ ...ghostBtn, padding: '14px 28px', fontSize: 16 }}>View demo</button>
        </div>
        <p style={{ fontSize: 12, color: COLORS.textDim, marginTop: 16 }}>No credit card required · Free up to 10 purchases</p>
      </div>
      <div style={{ padding: '40px 48px 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
        {[
          { icon: '🔔', title: 'Deadline alerts that work', desc: 'Return window closing in 3 days? Get emailed before it\'s too late — not after you\'ve lost the money.' },
          { icon: '🔍', title: 'Find anything you\'ve bought', desc: 'Stop digging through email. Search your full purchase history in seconds. "Blue headphones, November" — found.' },
          { icon: '📊', title: 'See where your money goes', desc: 'Clean monthly spending dashboard. No bank connection. No data sharing. Just clarity on your habits.' },
        ].map(f => (
          <div key={f.title} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '40px 48px 80px', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-1px' }}>Simple pricing</h2>
        <p style={{ color: COLORS.textMuted, marginBottom: 40 }}>Most people pay for one missed return. This costs less.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['Up to 10 purchases', 'Receipt uploads', 'Full dashboard'], cta: 'Get started free', highlight: false },
            { name: 'Pro', price: '$9', period: 'month', features: ['Unlimited purchases', 'Reminder emails', 'Spending charts', '5GB storage', 'AI search'], cta: 'Upgrade to Pro', highlight: true },
          ].map(p => (
            <div key={p.name} style={{ background: COLORS.surface, border: `${p.highlight ? 2 : 1}px solid ${p.highlight ? COLORS.accent : COLORS.border}`, borderRadius: 12, padding: 28, position: 'relative' }}>
              {p.highlight && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: COLORS.accent, color: COLORS.white, fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>MOST POPULAR</div>}
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 36, fontWeight: 800, color: p.highlight ? COLORS.accent : COLORS.text, marginBottom: 20 }}>
                {p.price}<span style={{ fontSize: 14, color: COLORS.textMuted, fontFamily: 'inherit' }}>/{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', marginBottom: 24, textAlign: 'left' }}>
                {p.features.map(f => <li key={f} style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: COLORS.success }}>✓</span>{f}</li>)}
              </ul>
              <button onClick={onEnter} style={{ ...(p.highlight ? btnStyle : ghostBtn), width: '100%', justifyContent: 'center' }}>{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
