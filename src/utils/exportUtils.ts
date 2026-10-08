import { Activity, CurrencyCode, Transaction } from '../types/finance';
import { CURRENCIES, PAYMENT_METHODS } from './formatters';

export function exportTransactionsToCsv(
  transactions: Transaction[],
  activities: Activity[],
  currencyCode: CurrencyCode
): void {
  const activityMap = new Map(activities.map((a) => [a.id, a]));
  const currencySymbol = CURRENCIES[currencyCode]?.symbol || currencyCode;

  const headers = [
    'ID',
    'Date',
    'Heure',
    'Type',
    'Montant',
    'Devise',
    'Activité',
    'Titre',
    'Description',
    'Mode de Paiement',
    'N° Reçu / Pièce',
  ];

  const rows = transactions.map((tx) => {
    const activity = activityMap.get(tx.activityId);
    const typeLabel = tx.type === 'income' ? 'Entrée (Revenu)' : 'Sortie (Dépense)';
    const paymentLabel = PAYMENT_METHODS[tx.paymentMethod]?.label || tx.paymentMethod;

    return [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.time}"`,
      `"${typeLabel}"`,
      tx.type === 'expense' ? `-${tx.amount}` : `${tx.amount}`,
      `"${currencySymbol}"`,
      `"${activity ? activity.name.replace(/"/g, '""') : 'Inconnue'}"`,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${paymentLabel}"`,
      `"${(tx.receiptNumber || '').replace(/"/g, '""')}"`,
    ].join(';');
  });

  // UTF-8 BOM so Microsoft Excel on Windows/Mac properly parses French accents
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `finstrat-export-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFullBackupJson(
  transactions: Transaction[],
  activities: Activity[],
  currencyCode: CurrencyCode
): void {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    currencyCode,
    activities,
    transactions,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `finstrat-sauvegarde-${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
