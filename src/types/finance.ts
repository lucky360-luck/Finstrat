export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'bank_transfer' 
  | 'mobile_money' 
  | 'check' 
  | 'other';

export interface Activity {
  id: string;
  name: string;
  icon: string; // Lucide icon key
  color: string; // Hex color code
  categoryType: 'business' | 'personal' | 'mixed';
  monthlyExpenseBudget: number; // Monthly limit for expenses
  monthlyIncomeTarget: number; // Monthly target for income
  description?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  activityId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  receiptNumber?: string;
  createdAt: number;
}

export type CurrencyCode = 'EUR' | 'XOF' | 'XAF' | 'USD' | 'MAD' | 'CAD' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  decimals: number;
}

export type FilterPeriod = 'today' | 'week' | 'month' | 'last_month' | 'year' | 'all' | 'custom';
