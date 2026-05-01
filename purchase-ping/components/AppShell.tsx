'use client';
import { useState } from 'react';
import { Purchase, COLORS } from '@/lib/types';
import { SEED_PURCHASES, deadlineStatus } from '@/lib/utils';
import { AlertStrip, StatsRow, SpendingChart, CategoryChart, RecentPurchases, PurchaseDetail } from './Dashboard';
import PurchaseTable from './PurchaseTable';
import PurchaseForm from './PurchaseForm';
import { RemindersPage, AISearchPage, SettingsPage } from './Pages';
import { Badge, Button } from './ui';

type Page = 'dashboard' | 'purchases' | 'reminders' | 'ai-search' | 'form' | 'settings';

export default function AppShell() {
  const [page, setPage] = useState<Page>('dashboard');
  const [purchases, setPurchases] = useState<Purchase[]>(SEED_PURCHASES);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Partial<Purchase> | null>(null);
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const FREE_LIMIT = 10;

  const alertCount = purchases.filter(p => {
    const rs = deadlineStatus(p.return_deadline);
    const ws = deadlineStatus(p.warranty_end_date);
    return rs === 'critical' || rs === 'warning' || ws === 'critical' || ws === 'warning';
  }).length;

  const handleAddClick = () => {
    if (plan === 'free' && purchases.length >= FREE_LIMIT) { setShowUpgrade(true); return; }
    setEditingPurchase({});
    setPage('form');
  };

  const handleSave = (data: Purchase) => {
    if (data.id && purchases.find(p => p.id === data.id)) {
      setPurchases(ps => ps.map(p => p.id === data.id ? data : p));
    } else {
      setPurchases(ps => [...ps, { ...data, id: `p${Date.now()}` }]);
    }
    setEditingPurchase(null);
    setPage('purchases');
  };

  const handleDelete = (id: string) => {
    setPurchases(ps => ps.filter(p => p.id !== id));
    setEditingPurchase(null);
    setPage('purchases');
  };

  const navItems = [
    { id: 'dashboard' as Page, icon: '🏠', label: 'Dashboard' },
    { id: 'purchases' as Page, icon: '🛍️', label: 'Purchases' },
    { id: 'reminders' as Page, icon: '🔔', label: 'Reminders' },
    { id: 'ai-search' as Page, icon: '✨', label: 'AI Search' },
    { id: 'settings' as Page, icon: '⚙️', label: 'Settings' },
  ];

  const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard', purchases: 'All Purchases', reminders: 'Reminders',
    'ai-search': 'AI Search', form: editingPurchase?.id ? 'Edit Purchase' : 'Add Purchase', settings: 'Settings',
  };

  return (
    <div style={{ fontFamily: "var(--font-dm-sans), 'Segoe UI', sans-serif", background: COLORS.bg, minHeight: '100vh', display: 'flex' }}>
      <aside style={{ width: 220, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🛒</span>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px', color: COLORS.text }}>
              Purchase<span style={{ color: COLORS.accent }}>Ping</span>
            </span>
          </div>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: page === item.id ? COLORS.accentDim : 'transparent', border: page === item.id ? `1px solid ${COLORS.accent}44` : '1px solid transparent', borderRadius: 8, color: page === item.id ? COLORS.accentLight : COLORS.textMuted, fontSize: 13, fontWeight: page === item.id ? 700 : 500, cursor: 'pointer', textAlign: 'left', marginBottom: 2, fontFamily: 'inherit', transition: 'all 0.1s', position: 'relative' }}
              onMouseEnter={e => { if (page !== item.id) (e.currentTarget as HTMLElement).style.background = COLORS.surfaceHover; }}
              onMouseLeave={e => { if (page !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.id === 'reminders' && alertCount > 0 && (
                <span style={{ marginLeft: 'auto', background: COLORS.danger, color: COLORS.white, fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>{alertCount}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 6 }}>
              {plan === 'free' ? `${purchases.length}/${FREE_LIMIT} purchases · Free` : 'Pro plan · Unlimited'}
            </div>
            {plan === 'free' && (
              <>
                <div style={{ height: 3, background: COLORS.border, borderRadius: 999, marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (purchases.length / FREE_LIMIT) * 100)}%`, background: purchases.length >= FREE_LIMIT ? COLORS.danger : COLORS.accent, borderRadius: 999 }} />
                </div>
                <button onClick={() => setShowUpgrade(true)}
                  style={{ width: '100%', background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: COLORS.accentLight, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ⚡ Upgrade to Pro
                </button>
              </>
            )}
            {plan === 'pro' && <Badge color={COLORS.success}>✓ Pro Plan</Badge>}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <header style={{ background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}`, padding: '12px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{pageTitles[page]}</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button onClick={handleAddClick}>+ Add Purchase</Button>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: COLORS.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>👤</div>
          </div>
        </header>

        <div style={{ flex: 1, padding: 28, overflowY: 'auto', display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {page === 'dashboard' && (
              <>
                <AlertStrip purchases={purchases} onView={p => setSelectedPurchase(p)} />
                <StatsRow purchases={purchases} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                  <SpendingChart purchases={purchases} />
                  <CategoryChart purchases={purchases} />
                </div>
                <RecentPurchases purchases={purchases} onView={p => setSelectedPurchase(p)} onAdd={handleAddClick} />
              </>
            )}
            {page === 'purchases' && <PurchaseTable purchases={purchases} onView={p => setSelectedPurchase(p)} onEdit={p => { setEditingPurchase(p); setPage('form'); }} />}
            {page === 'reminders' && <RemindersPage purchases={purchases} />}
            {page === 'ai-search' && <AISearchPage purchases={purchases} />}
            {page === 'form' && <PurchaseForm initial={editingPurchase ?? undefined} onSave={handleSave} onCancel={() => setPage('purchases')} onDelete={handleDelete} />}
            {page === 'settings' && <SettingsPage plan={plan} onUpgrade={() => { setPlan('pro'); setShowUpgrade(false); }} />}
          </div>

          {selectedPurchase && (
            <div style={{ width: 320, flexShrink: 0 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, height: 'calc(100vh - 120px)', position: 'sticky', top: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <PurchaseDetail purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} onEdit={p => { setEditingPurchase(p); setSelectedPurchase(null); setPage('form'); }} />
              </div>
            </div>
          )}
        </div>
      </main>

      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Upgrade to Pro</h3>
            <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>Unlock unlimited purchases, reminder emails, and spending insights.</p>
            <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: 40, fontWeight: 800, color: COLORS.accent, marginBottom: 24 }}>
              $9<span style={{ fontSize: 16, color: COLORS.textMuted, fontFamily: 'inherit' }}>/month</span>
            </div>
            <Button onClick={() => { setPlan('pro'); setShowUpgrade(false); }} style={{ width: '100%', justifyContent: 'center', marginBottom: 10, fontSize: 15, padding: '13px 24px' }}>Upgrade Now →</Button>
            <button onClick={() => setShowUpgrade(false)} style={{ background: 'transparent', border: 'none', color: COLORS.textDim, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Maybe later</button>
          </div>
        </div>
      )}
    </div>
  );
}
