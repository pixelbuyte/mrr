'use client';
import { useState, useMemo } from 'react';
import { Purchase, CATEGORIES, CAT_COLORS, COLORS } from '@/lib/types';
import { fmt, fmtDate, deadlineStatus } from '@/lib/utils';
import { Card, Badge, DeadlineBadge } from './ui';

interface Props { purchases: Purchase[]; onView: (p: Purchase) => void; onEdit: (p: Purchase) => void; }

export default function PurchaseTable({ purchases, onView, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [sort, setSort] = useState({ key: 'order_date', dir: 'desc' });

  const filtered = useMemo(() => {
    let list = [...purchases];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.item_name.toLowerCase().includes(q) || (p.merchant || '').toLowerCase().includes(q) || (p.notes || '').toLowerCase().includes(q));
    }
    if (catFilter !== 'all') list = list.filter(p => p.category_id === catFilter);
    if (expiringOnly) list = list.filter(p => {
      const rs = deadlineStatus(p.return_deadline);
      const ws = deadlineStatus(p.warranty_end_date);
      return rs === 'critical' || rs === 'warning' || ws === 'critical' || ws === 'warning';
    });
    list.sort((a: any, b: any) => {
      let va = a[sort.key], vb = b[sort.key];
      if (sort.key === 'price') { va = +va; vb = +vb; }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [purchases, search, catFilter, expiringOnly, sort]);

  const toggleSort = (key: string) => setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: COLORS.textDim }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchases..."
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px 9px 32px', color: COLORS.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            onFocus={e => (e.target.style.borderColor = COLORS.accent)}
            onBlur={e => (e.target.style.borderColor = COLORS.border)}
          />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px', color: COLORS.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <button onClick={() => setExpiringOnly(e => !e)}
          style={{ background: expiringOnly ? COLORS.warningDim : COLORS.surface, border: `1px solid ${expiringOnly ? COLORS.warning : COLORS.border}`, borderRadius: 8, padding: '9px 14px', color: expiringOnly ? COLORS.warning : COLORS.textMuted, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', fontWeight: expiringOnly ? 700 : 400 }}>
          ⏰ Expiring Soon
        </button>
      </div>
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {([['item_name','Item'],['merchant','Merchant'],['order_date','Date'],['price','Amount'],['category_id','Category']] as [string,string][]).map(([key, label]) => (
                  <th key={key} onClick={() => toggleSort(key)}
                    style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    {label}{sort.key === key ? <span style={{ color: COLORS.accent }}>{sort.dir === 'asc' ? ' ↑' : ' ↓'}</span> : null}
                  </th>
                ))}
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Return</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: COLORS.textDim, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Warranty</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>No purchases found</td></tr>}
              {filtered.map((p, i) => {
                const cat = CATEGORIES.find(c => c.id === p.category_id);
                return (
                  <tr key={p.id} onClick={() => onView(p)}
                    style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${COLORS.border}` : undefined, cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.surfaceHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.text, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.item_name}</div>
                      {p.order_number && <div style={{ fontSize: 11, color: COLORS.textDim }}>#{p.order_number}</div>}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: COLORS.textMuted }}>{p.merchant || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>{fmtDate(p.order_date)}</td>
                    <td style={{ padding: '13px 16px', fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: 'var(--font-dm-mono), monospace', whiteSpace: 'nowrap' }}>{fmt(p.price)}</td>
                    <td style={{ padding: '13px 16px' }}>
                      {cat ? <Badge color={CAT_COLORS[CATEGORIES.indexOf(cat) % CAT_COLORS.length]}>{cat.icon} {cat.name}</Badge> : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}><DeadlineBadge dateStr={p.return_deadline} /></td>
                    <td style={{ padding: '13px 16px' }}><DeadlineBadge dateStr={p.warranty_end_date} /></td>
                    <td style={{ padding: '13px 16px' }}>
                      <button onClick={e => { e.stopPropagation(); onEdit(p); }}
                        style={{ background: 'transparent', border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 11, color: COLORS.textMuted, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: `1px solid ${COLORS.border}`, fontSize: 12, color: COLORS.textDim }}>
            {filtered.length} purchase{filtered.length !== 1 ? 's' : ''} · {fmt(filtered.reduce((s, p) => s + p.price, 0))} total
          </div>
        )}
      </Card>
    </div>
  );
}
