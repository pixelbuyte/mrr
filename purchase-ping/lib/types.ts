export interface Purchase {
  id: string;
  item_name: string;
  merchant: string;
  order_date: string;
  price: number;
  category_id: string;
  return_deadline: string;
  warranty_end_date: string;
  notes: string;
  order_number: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { id: 'electronics', name: 'Electronics', icon: '💻' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'home', name: 'Home & Kitchen', icon: '🏠' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '🏃' },
  { id: 'beauty', name: 'Beauty & Health', icon: '✨' },
  { id: 'books', name: 'Books & Media', icon: '📚' },
  { id: 'food', name: 'Food & Grocery', icon: '🛒' },
  { id: 'other', name: 'Other', icon: '📦' },
];

export const CAT_COLORS = [
  '#7c6af7','#34d399','#fbbf24','#f87171',
  '#60a5fa','#f472b6','#a78bfa','#2dd4bf'
];

export const COLORS = {
  bg: '#0f0f13',
  surface: '#16161d',
  surfaceHover: '#1c1c26',
  border: '#2a2a38',
  accent: '#7c6af7',
  accentLight: '#9d8fff',
  accentDim: 'rgba(124,106,247,0.15)',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  dangerDim: 'rgba(248,113,113,0.12)',
  warningDim: 'rgba(251,191,36,0.12)',
  text: '#e8e8f0',
  textMuted: '#7b7b9a',
  textDim: '#4a4a62',
  white: '#ffffff',
};
