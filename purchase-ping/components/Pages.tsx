'use client';
import { useState } from 'react';
import { Purchase, COLORS } from '@/lib/types';
import { fmt, fmtDate, daysDiff, deadlineStatus } from '@/lib/utils';
import { Card, Button, Badge } from './ui';

export function RemindersPage({ purchases }: { purchases: Purchase[] }) {
  const returnDeadlines = purchases
    .filter(p => p.return_deadline)
    .map(p => ({ ...p, _type: 'return', _date: p.return_deadline, _days: daysDiff(p.return_deadline) ?? 999 }))
    .sort((a, b) => a._days - b._days);
  const warranties = purchases
    .filter(p => p.warranty_end_date)
    .map(p => ({ ...p, _type: 'warranty', _date: p.warranty_end_date, _days: daysDiff(p.warranty_end_date) ?? 999 }))
    .sort((a, b) => a._days - b._days);

  const ReminderCard = ({ p }: { p: typeof returnDeadlines[0] }) => {
    const d = p._days;
    const isReturn = p._type === 'return';
    const label = isReturn ? 'Return deadline' : 'Warranty expires';
    const status = deadlineStatus(p._date);
    const color = status === 'critical' ? COLORS.danger : status === 'warning' ? COLORS.warning : d < 0 ? COLORS.textDim : COLORS.success;
    const dText = d < 0 ? `Expired ${Math.abs(d)} days ago` : d === 0 ? 'Expires today!' : `Expires in ${d} day${d !== 1 ? 's' : ''}`;
    return (
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {isReturn ? '↩️' : '🛡️'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{p.item_name}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.merchant} · {label}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color }}>{dText}</div>
          <div style={{ fontSize: 12, color: COLORS.textDim }}>{fmtDate(p._date)}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 24 }}>Reminders</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>↩️ Return Deadlines</div>
          <Card>
            {returnDeadlines.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: COLORS.textDim }}>No return deadlines tracked</div>}
            {returnDeadlines.map(p => <ReminderCard key={p.id + '-r'} p={p} />)}
          </Card>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>🛡️ Warranty Expirations</div>
          <Card>
            {warranties.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: COLORS.textDim }}>No warranties tracked</div>}
            {warranties.map(p => <ReminderCard key={p.id + '-w'} p={p} />)}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AISearchPage({ purchases }: { purchases: Purchase[] }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, purchases }),
      });
      const data = await res.json();
      setResult(data.answer || 'No answer found.');
    } catch { setResult('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  const examples = [
    'Blue jacket I bought a few months ago',
    'What electronics have warranties expiring soon?',
    'Did I buy anything from Amazon this month?',
    "What's the most expensive thing I've bought?",
  ];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: '0 0 8px' }}>Find Anything</h2>
        <p style={{ color: COLORS.textMuted, fontSize: 14, margin: 0 }}>Ask anything about your purchases in plain English</p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="What am I looking for?"
          style={{ flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 16px', color: COLORS.text, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = COLORS.accent)}
          onBlur={e => (e.target.style.borderColor = COLORS.border)}
        />
        <Button onClick={search} disabled={!query.trim() || loading} size="lg">{loading ? '...' : 'Search'}</Button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {examples.map(ex => (
          <button key={ex} onClick={() => setQuery(ex)}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: '5px 12px', fontSize: 12, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
            {ex}
          </button>
        ))}
      </div>
      {result && (
        <Card style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
            <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.7 }}>{result}</div>
          </div>
        </Card>
      )}
    </div>
  );
}

export function SettingsPage({ plan, onUpgrade }: { plan: string; onUpgrade: () => void }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 24 }}>Settings</h2>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Account</div>
        </div>
        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Email</span>
            <span style={{ fontSize: 13, color: COLORS.text }}>user@example.com</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Plan</span>
            <Badge color={plan === 'pro' ? COLORS.success : COLORS.accent}>{plan === 'pro' ? '✓ Pro' : 'Free'}</Badge>
          </div>
        </div>
      </Card>
      {plan === 'free' && (
        <Card style={{ background: 'linear-gradient(135deg, #1a1830 0%, #16161d 100%)', border: `1px solid ${COLORS.accent}44`, padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Upgrade to Pro</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.6 }}>Unlimited purchases · Reminder emails · All charts & insights · 5GB receipt storage</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent, marginBottom: 16, fontFamily: 'var(--font-dm-mono), monospace' }}>$9<span style={{ fontSize: 14, color: COLORS.textMuted, fontFamily: 'inherit' }}>/month</span></div>
          <Button onClick={onUpgrade} style={{ background: COLORS.accent, color: COLORS.white }}>Upgrade Now →</Button>
        </Card>
      )}
      <Card style={{ padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 16 }}>Notifications</div>
        {['Return deadline (3 days before)', 'Warranty expiry (30 days before)', 'Weekly spending summary'].map(item => (
          <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: plan === 'pro' ? COLORS.text : COLORS.textDim }}>{item}</span>
            {plan === 'pro' ? (
              <div style={{ width: 40, height: 22, borderRadius: 999, background: COLORS.success, display: 'flex', alignItems: 'center', padding: '0 3px', cursor: 'pointer' }}>
                <div style={{ width: 16, height: 16, borderRadius: 999, background: COLORS.white, marginLeft: 'auto' }} />
              </div>
            ) : <Badge color={COLORS.textDim} bg={COLORS.bg}>🔒 Pro</Badge>}
          </div>
        ))}
      </Card>
    </div>
  );
}
