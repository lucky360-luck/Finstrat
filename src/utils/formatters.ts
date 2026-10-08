import { CurrencyCode, CurrencyConfig, PaymentMethod } from '../types/finance';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', label: 'Euro (€)', decimals: 2 },
  XOF: { code: 'XOF', symbol: 'FCFA', label: 'Franc CFA Ouest (FCFA)', decimals: 0 },
  XAF: { code: 'XAF', symbol: 'FCFA', label: 'Franc CFA Centre (FCFA)', decimals: 0 },
  USD: { code: 'USD', symbol: '$', label: 'Dollar US ($)', decimals: 2 },
  MAD: { code: 'MAD', symbol: 'DH', label: 'Dirham Marocain (DH)', decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', label: 'Dollar Canadien (CA$)', decimals: 2 },
  CHF: { code: 'CHF', symbol: 'CHF', label: 'Franc Suisse (CHF)', decimals: 2 },
};

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; iconName: string }> = {
  cash: { label: 'Espèces', iconName: 'Banknote' },
  mobile_money: { label: 'Mobile Money', iconName: 'Smartphone' },
  card: { label: 'Carte Bancaire', iconName: 'CreditCard' },
  bank_transfer: { label: 'Virement', iconName: 'ArrowRightLeft' },
  check: { label: 'Chèque', iconName: 'FileCheck' },
  other: { label: 'Autre', iconName: 'Wallet' },
};

export function formatMoney(amount: number, currencyCode: CurrencyCode = 'EUR'): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.EUR;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(absAmount);

  if (currencyCode === 'USD' || currencyCode === 'CAD') {
    return `${amount < 0 ? '-' : ''}${config.symbol}${formatted}`;
  }
  return `${amount < 0 ? '-' : ''}${formatted} ${config.symbol}`;
}

export function formatDateFrench(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateLongFrench(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeIso(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
