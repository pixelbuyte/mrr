'use client';
import { useState } from 'react';
import { Purchase, CATEGORIES, COLORS } from '@/lib/types';
import { Button, Input, SelectInput, Textarea } from './ui';

const EMPTY: Partial<Purchase> = { item_name: '', merchant: '', order_date: '', price: 0, category_id: '', return_deadline: '', warranty_end_date: '', notes: '', order_number: '' };

interface Props { initial?: Partial<Purchase>; onSave: (p: Purchase) => void; onCancel: () => void; onDelete?: (id: string) => void; }

export default function PurchaseForm({ initial, onSave, onCancel, onDelete }: Props) {
  const [form, setForm] = useState<Partial<Purchase>>(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ tip?: string; typical_return_days?: number; typical_warranty_months?: number } | null>(null);
  const set = (k: keyof Purchase) => (v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.item_name || !form.order_date || !form.price) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ ...EMPTY, ...form, id: form.id || `p${Date.now()}`, price: parseFloat(String(form.price)) || 0 } as Purchase);
      setSaving(false);
    }, 300);
  };

  const askAI = async () => {
    if (!form.item_name) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch('/api/ai-autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: form.item_name, merchant: form.merchant }),
      });
      const parsed = await res.json();
      setAiSuggestion(parsed);
      if (parsed.suggested_category && !form.category_id) set('category_id')(parsed.suggested_category);
      if (parsed.typical_return_days && !form.return_deadline && form.order_date) {
        const d = new Date(String(form.order_date) + 'T12:00:00');
        d.setDate(d.getDate() + parsed.typical_return_days);
        set('return_deadline')(d.toISOString().split('T')[0]);
      }
      if (parsed.typical_warranty_months && !form.warranty_end_date && form.order_date) {
        const d = new Date(String(form.order_date) + 'T12:00:00');
        d.setMonth(d.getMonth() + parsed.typical_warranty_months);
        set('warranty_end_date')(d.toISOString().split('T')[0]);
      }
    } catch { setAiSuggestion({ tip: "Couldn't get AI suggestions right now." }); }
    setAiLoading(false);
  };

  const catOptions = [{ value: '', label: 'Select category...' }, ...CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))];

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{initial?.id ? 'Edit Purchase' : 'Add Purchase'}</h2>
        <Button variant="ghost" onClick={onCancel}>✕ Cancel</Button>
      </div>
      <div style={{ background: COLORS.accentDim, border: `1px solid ${COLORS.accent}44`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentLight }}>✨ AI Auto-fill</span>
          <span style={{ fontSize: 13, color: COLORS.textMuted }}> — Enter item name and let AI suggest deadlines & category</span>
        </div>
        <Button size="sm" onClick={askAI} disabled={!form.item_name || aiLoading} style={{ background: COLORS.accent, color: COLORS.white, flexShrink: 0 }}>
          {aiLoading ? 'Thinking...' : '✨ Auto-fill'}
        </Button>
      </div>
      {aiSuggestion && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 6 }}>💡 AI Suggestion</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{aiSuggestion.tip}</div>
          {aiSuggestion.typical_return_days && <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 4 }}>Typical return window: {aiSuggestion.typical_return_days} days</div>}
          {aiSuggestion.typical_warranty_months && <div style={{ fontSize: 12, color: COLORS.textDim }}>Typical warranty: {aiSuggestion.typical_warranty_months} months</div>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <Input label="Item Name" value={String(form.item_name || '')} onChange={set('item_name')} placeholder="Sony WH-1000XM5 Headphones" required />
        </div>
        <Input label="Merchant / Store" value={String(form.merchant || '')} onChange={set('merchant')} placeholder="Amazon" />
        <Input label="Order Number" value={String(form.order_number || '')} onChange={set('order_number')} placeholder="AMZ-12345" />
        <Input label="Price" type="number" value={String(form.price || '')} onChange={set('price')} placeholder="0.00" required />
        <Input label="Order Date" type="date" value={String(form.order_date || '')} onChange={set('order_date')} required />
        <div style={{ gridColumn: '1/-1' }}>
          <SelectInput label="Category" value={String(form.category_id || '')} onChange={set('category_id')} options={catOptions} />
        </div>
        <Input label="Return Deadline" type="date" value={String(form.return_deadline || '')} onChange={set('return_deadline')} hint="When is the last day you can return this?" />
        <Input label="Warranty End Date" type="date" value={String(form.warranty_end_date || '')} onChange={set('warranty_end_date')} hint="When does the manufacturer warranty expire?" />
        <div style={{ gridColumn: '1/-1' }}>
          <Textarea label="Notes" value={String(form.notes || '')} onChange={set('notes')} placeholder="Size, color, serial number, anything useful..." />
        </div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'space-between' }}>
        <div>{initial?.id && onDelete && <Button variant="danger" onClick={() => onDelete(initial.id!)}>🗑 Delete</Button>}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.item_name || !form.order_date || !form.price || saving}>
            {saving ? 'Saving...' : '💾 Save Purchase'}
          </Button>
        </div>
      </div>
    </div>
  );
}
