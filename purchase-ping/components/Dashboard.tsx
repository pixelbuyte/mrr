'use client';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Purchase, CATEGORIES, CAT_COLORS, COLORS } from '@/lib/types';
import { fmt, fmtDate, deadlineStatus, daysDiff } from '@/lib/utils';
import { Card, Button, Badge, DeadlineBadge } from './ui';

export function AlertStrip({ purchases, onView }: { purchases: Purchase[]; onView: (p: Purchase) => void }) {
  const alerts = purchases.filter(p => {
    const rs = deadlineStatus(p.return_deadline);
    const ws = deadlineStatus(p.warranty_end_date);
    return rs === 'critical' || rs === 'warning' || ws === 'critical' || ws === 'warning';
  });
  if (!alerts.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
      {alerts.map(p => {
        const rs = deadlineStatus(p.return_deadline);
        const ws = deadlineStatus(p.warranty_end_date);
        const isCritical = rs === 'critical' || ws === 'critical';
        const isReturn = rs === 'critical' || rs === 'warning';
        const deadline = isReturn ? p.return_deadline : p.warranty_end_date;
        const d = daysDiff(deadline) ?? 0;
        const label = isReturn ? 'Return deadline' : 'Warranty expires';
        const color = isCritical ? COLORS.danger : COLORS.warning;
        const bg = isCritical ? COLORS.dangerDim : COLORS.warningDim;
        return (
          <div key={p.id} style={{ background: bg, border: `1px solid ${color}44`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{isCritical ? '🔴' : '🟡'}</span>
              <div>
                <span style={{ color, fontWeight: 700, fontSize: 13 }}>{label} in {d === 0 ? 'today' : `${d} day${d !== 1 ? 's' : ''}`}</span>
                <span style={{ color: COLORS.textMuted, fontSize: 13 }}> — {p.item_name}</span>
                <span style={{ color: COLORS.textDim, fontSize: 12 }}> from {p.merchant}</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onView(p)} style={{ borderColor: `${color}44`, color }}>View</Button>
          </div>
        );
      })}
    </div>
  );
}

export function StatsRow({ purchases }: { purchases: Purchase[] }) {
  const today = new Date();
  const thisMonth = purchases.filter(p => {
    const d = new Date(p.order_date + 'T12:00:00');
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).reduce((s, p) => s + p.price, 0);
  const activeWarranties = purchases.filter(p => { const d = daysDiff(p.warranty_end_date); return d !== null && d > 0; }).length;
  const expiring = purchases.filter(p => { const rs = deadlineStatus(p.return_deadline); return rs === 'critical' || rs === 'warning'; }).length;
  const stats = [
    { label: 'Spent This Month', value: fmt(thisMonth), icon: '💳', color: COLORS.accent },
    { label: 'Active Warranties', value: String(activeWarranties), icon: '🛡️', color: COLORS.success },
    { label: 'Returns Expiring Soon', value: String(expiring), icon: '⏰', color: expiring > 0 ? COLORS.warning : COLORS.textMuted },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
      {stats.map(s => (
        <Card key={s.label} style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-dm-mono), monospace', letterSpacing: '-1px' }}>{s.value}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{s.label}</div>
        </Card>
      ))}
    </div>
  );
}

export function SpendingChart({ purchases }: { purchases: Purchase[] }) {
  const today = new Date();
  const data = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - (5 - i));
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const m = d.getMonth(); const y = d.getFullYear();
      const total = purchases.filter(p => { const pd = new Date(p.order_date + 'T12:00:00'); return pd.getMonth() === m && pd.getFullYear() === y; }).reduce((s, p) => s + p.price, 0);
      return { month: label, total: parseFloat(total.toFixed(2)) };
    });
  }, [purchases]);
  return (
    <Card style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Monthly Spending</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="month" tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: COLORS.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text }} formatter={(v: number) => [fmt(v), 'Spent']} />
          <Bar dataKey="total" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function CategoryChart({ purchases }: { purchases: Purchase[] }) {
  const data = useMemo(() => {
    const totals: Record<string, number> = {};
    purchases.forEach(p => {
      const cat = CATEGORIES.find(c => c.id === p.category_id);
      const name = cat ? cat.name : 'Other';
      totals[name] = (totals[name] || 0) + p.price;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) })).sort((a, b) => b.value - a.value);
  }, [purchases]);
  return (
    <Card style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>By Category</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="40%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
          <Legend iconType="circle" iconSize={8} formatter={(v: string) => <span style={{ color: COLORS.textMuted, fontSize: 11 }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function RecentPurchases({ purchases, onView, onAdd }: { purchases: Purchase[]; onView: (p: Purchase) => void; onAdd: () => void }) {
  const recent = [...purchases].sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime()).slice(0, 5);
  if (!recent.length) return (
    <Card style={{ padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
      <div style={{ color: COLORS.textMuted, marginBottom: 16 }}>No purchases yet</div>
      <Button onClick={onAdd}>+ Add Your First Purchase</Button>
    </Card>
  );
  return (
    <Card>
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recent Purchases</span>
      </div>
      {recent.map((p, i) => {
        const cat = CATEGORIES.find(c => c.id === p.category_id);
        return (
          <div key={p.id} onClick={() => onView(p)}
            style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', borderBottom: i < recent.length - 1 ? `1px solid ${COLORS.border}` : undefined, transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.background = COLORS.surfaceHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {cat?.icon || '📦'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.item_name}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>{p.merchant} · {fmtDate(p.order_date)}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: 'var(--font-dm-mono), monospace' }}>{fmt(p.price)}</div>
              <DeadlineBadge dateStr={p.return_deadline} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

export function PurchaseDetail({ purchase, onClose, onEdit }: { purchase: Purchase; onClose: () => void; onEdit: (p: Purchase) => void }) {
  const cat = CATEGORIES.find(c => c.id === purchase.category_id);
  const Field = ({ label, value }: { label: string; value?: string }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? COLORS.text : COLORS.textDim }}>{value || '—'}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{cat?.icon || '📦'}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{purchase.item_name}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{purchase.merchant}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, fontFamily: 'var(--font-dm-mono), monospace', marginBottom: 24 }}>{fmt(purchase.price)}</div>
        <Field label="Order Date" value={fmtDate(purchase.order_date)} />
        <Field label="Order Number" value={purchase.order_number} />
        <Field label="Category" value={cat ? `${cat.icon} ${cat.name}` : undefined} />
        <div style={{ background: COLORS.bg, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Deadlines</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Return by</span>
            <DeadlineBadge dateStr={purchase.return_deadline} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>Warranty until</span>
            <DeadlineBadge dateStr={purchase.warranty_end_date} />
          </div>
        </div>
        {purchase.notes && <Field label="Notes" value={purchase.notes} />}
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${COLORS.border}` }}>
        <Button onClick={() => onEdit(purchase)} style={{ width: '100%', justifyContent: 'center' }}>✏️ Edit Purchase</Button>
      </div>
    </div>
  );
}
