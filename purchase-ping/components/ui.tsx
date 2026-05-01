'use client';
import { COLORS } from '@/lib/types';
import { daysDiff, deadlineStatus, fmtDate } from '@/lib/utils';

export function Badge({ children, color = COLORS.accent, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', color, background: bg || `${color}22` }}>
      {children}
    </span>
  );
}

export function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, ...style, cursor: onClick ? 'pointer' : undefined }}>
      {children}
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style = {} }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg'; disabled?: boolean; style?: React.CSSProperties;
}) {
  const sizes = { sm: { padding: '6px 14px', fontSize: 12 }, md: { padding: '9px 18px', fontSize: 13 }, lg: { padding: '12px 24px', fontSize: 14 } };
  const variants = {
    primary: { background: COLORS.accent, color: COLORS.white, border: 'none' },
    ghost: { background: 'transparent', color: COLORS.textMuted, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.dangerDim, color: COLORS.danger, border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: 8, transition: 'all 0.15s', outline: 'none', opacity: disabled ? 0.5 : 1, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, hint }: {
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: '0.04em' }}>{label}{required && <span style={{ color: COLORS.danger }}> *</span>}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px', color: COLORS.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = COLORS.accent)}
        onBlur={e => (e.target.style.borderColor = COLORS.border)}
      />
      {hint && <span style={{ fontSize: 11, color: COLORS.textDim }}>{hint}</span>}
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3 }: {
  label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: '0.04em' }}>{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px', color: COLORS.text, fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = COLORS.accent)}
        onBlur={e => (e.target.style.borderColor = COLORS.border)}
      />
    </div>
  );
}

export function SelectInput({ label, value, onChange, options, required }: {
  label?: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, letterSpacing: '0.04em' }}>{label}{required && <span style={{ color: COLORS.danger }}> *</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: '9px 12px', color: value ? COLORS.text : COLORS.textDim, fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer', width: '100%', appearance: 'none' }}
        onFocus={e => (e.target.style.borderColor = COLORS.accent)}
        onBlur={e => (e.target.style.borderColor = COLORS.border)}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function DeadlineBadge({ dateStr }: { dateStr: string }) {
  const status = deadlineStatus(dateStr);
  if (!dateStr) return <span style={{ color: COLORS.textDim, fontSize: 12 }}>—</span>;
  const d = daysDiff(dateStr);
  if (status === null || d === null) return null;
  const configs: Record<string, { color: string; text: string }> = {
    expired: { color: COLORS.textDim, text: 'Expired' },
    critical: { color: COLORS.danger, text: d === 0 ? 'Today!' : `${d}d left` },
    warning: { color: COLORS.warning, text: `${d}d left` },
    safe: { color: COLORS.textMuted, text: fmtDate(dateStr) },
  };
  const c = configs[status];
  return (
    <span style={{ color: c.color, fontSize: 12, fontWeight: status === 'critical' ? 700 : 500, display: 'flex', alignItems: 'center', gap: 4 }}>
      {(status === 'critical' || status === 'warning') && <span>⚠</span>}
      {c.text}
    </span>
  );
}
