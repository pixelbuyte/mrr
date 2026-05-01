import { Purchase } from './types';

export const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const fmtDate = (s: string) =>
  s ? new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const daysDiff = (dateStr: string): number | null => {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T12:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export const deadlineStatus = (dateStr: string): string | null => {
  const d = daysDiff(dateStr);
  if (d === null) return null;
  if (d < 0) return 'expired';
  if (d <= 3) return 'critical';
  if (d <= 7) return 'warning';
  return 'safe';
};

const today = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const monthsAgo = (n: number, day = 15) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() - n);
  d.setDate(day);
  return d.toISOString().split('T')[0];
};

export const SEED_PURCHASES: Purchase[] = [
  {
    id: 'p1', item_name: 'Sony WH-1000XM5 Headphones', merchant: 'Amazon',
    order_date: daysAgo(12), price: 279.99, category_id: 'electronics',
    return_deadline: daysFromNow(3), warranty_end_date: daysFromNow(365),
    notes: 'Black colorway. Serial: SN-8823-XM5', order_number: 'AMZ-2934-884',
  },
  {
    id: 'p2', item_name: 'Linen Button-Down Shirt', merchant: 'Everlane',
    order_date: daysAgo(8), price: 88.00, category_id: 'clothing',
    return_deadline: daysFromNow(6), warranty_end_date: '',
    notes: 'Size M, White. Ordered for summer trip.', order_number: 'EVL-0091',
  },
  {
    id: 'p3', item_name: 'Vitamix 5200 Blender', merchant: 'Williams Sonoma',
    order_date: daysAgo(45), price: 449.95, category_id: 'home',
    return_deadline: '', warranty_end_date: daysFromNow(2555),
    notes: '7-year warranty registered', order_number: 'WS-77312',
  },
  {
    id: 'p4', item_name: "Arc'teryx Atom Hoody", merchant: 'REI',
    order_date: daysAgo(20), price: 259.00, category_id: 'sports',
    return_deadline: daysFromNow(15), warranty_end_date: '',
    notes: 'Size L, Black Sapphire.', order_number: 'REI-5517',
  },
  {
    id: 'p5', item_name: 'Dyson V15 Detect Vacuum', merchant: 'Best Buy',
    order_date: monthsAgo(2), price: 649.99, category_id: 'home',
    return_deadline: '', warranty_end_date: daysFromNow(455),
    notes: 'Gold/Iron. Extra head included.', order_number: 'BB-99142',
  },
  {
    id: 'p6', item_name: 'Nike Air Zoom Pegasus 41', merchant: 'Nike.com',
    order_date: monthsAgo(1), price: 130.00, category_id: 'sports',
    return_deadline: '', warranty_end_date: '',
    notes: 'Size 11, Triple Black', order_number: 'NK-2244-A',
  },
  {
    id: 'p7', item_name: 'Kindle Paperwhite (11th Gen)', merchant: 'Amazon',
    order_date: monthsAgo(3), price: 139.99, category_id: 'electronics',
    return_deadline: '', warranty_end_date: daysFromNow(300),
    notes: '16GB, Agave Green.', order_number: 'AMZ-1122-KPW',
  },
  {
    id: 'p8', item_name: 'Le Creuset Dutch Oven 5.5qt', merchant: 'Sur La Table',
    order_date: monthsAgo(4), price: 399.95, category_id: 'home',
    return_deadline: '', warranty_end_date: daysFromNow(3650),
    notes: 'Cerise red. Lifetime warranty.', order_number: 'SLT-30091',
  },
  {
    id: 'p9', item_name: 'Tatcha Dewy Skin Cream', merchant: 'Sephora',
    order_date: daysAgo(5), price: 68.00, category_id: 'beauty',
    return_deadline: daysFromNow(55), warranty_end_date: '',
    notes: '60-day returns', order_number: 'SEPH-4419',
  },
  {
    id: 'p10', item_name: 'Atomic Habits (Hardcover)', merchant: 'Bookshop.org',
    order_date: monthsAgo(5), price: 27.99, category_id: 'books',
    return_deadline: '', warranty_end_date: '',
    notes: 'Re-read annually. Gift inscription inside.', order_number: 'BO-7821',
  },
];
