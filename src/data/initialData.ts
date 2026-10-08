import { Activity, Transaction } from '../types/finance';

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: 'Commerce & Boutique',
    icon: 'Store',
    color: '#3b82f6', // blue
    categoryType: 'business',
    monthlyExpenseBudget: 850,
    monthlyIncomeTarget: 2200,
    description: 'Vente de marchandises, réapprovisionnement et stocks',
  },
  {
    id: 'act-2',
    name: 'Prestations & Freelance',
    icon: 'Laptop',
    color: '#8b5cf6', // purple
    categoryType: 'business',
    monthlyExpenseBudget: 250,
    monthlyIncomeTarget: 1500,
    description: 'Services clients, consultations, facturation freelance',
  },
  {
    id: 'act-3',
    name: 'Salaire & Emploi',
    icon: 'Briefcase',
    color: '#10b981', // emerald
    categoryType: 'personal',
    monthlyExpenseBudget: 100,
    monthlyIncomeTarget: 2400,
    description: 'Revenus fixes, primes, cotisations professionnelles',
  },
  {
    id: 'act-4',
    name: 'Alimentation & Ménage',
    icon: 'UtensilsCrossed',
    color: '#f59e0b', // amber
    categoryType: 'personal',
    monthlyExpenseBudget: 600,
    monthlyIncomeTarget: 0,
    description: 'Supermarché, courses quotidiennes, produits ménagers',
  },
  {
    id: 'act-5',
    name: 'Transport & Véhicule',
    icon: 'Car',
    color: '#06b6d4', // cyan
    categoryType: 'mixed',
    monthlyExpenseBudget: 320,
    monthlyIncomeTarget: 100,
    description: 'Carburant, entretien, tickets de transport, péages',
  },
  {
    id: 'act-6',
    name: 'Logement & Charges',
    icon: 'Home',
    color: '#ec4899', // pink
    categoryType: 'personal',
    monthlyExpenseBudget: 750,
    monthlyIncomeTarget: 0,
    description: 'Loyer, électricité, eau, internet, entretien habitat',
  },
  {
    id: 'act-7',
    name: 'Santé & Bien-être',
    icon: 'HeartPulse',
    color: '#ef4444', // red
    categoryType: 'personal',
    monthlyExpenseBudget: 180,
    monthlyIncomeTarget: 0,
    description: 'Pharmacie, consultations médicales, sport',
  },
];

// Generates transactions relative to today's date
export function getInitialTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const getDateStr = (offsetDays: number) => {
    const target = new Date(year, month, day - offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return [
    // Today
    {
      id: 'tx-1',
      type: 'income',
      amount: 350,
      activityId: 'act-1',
      title: 'Vente boutique comptoir',
      description: 'Encaissement journée lot accessoires',
      date: getDateStr(0),
      time: '11:45',
      paymentMethod: 'cash',
      receiptNumber: 'VNT-2026-081',
      createdAt: Date.now() - 3600000 * 3,
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 42.50,
      activityId: 'act-4',
      title: 'Courses déjeuner & provisions',
      description: 'Supermarché local',
      date: getDateStr(0),
      time: '13:15',
      paymentMethod: 'card',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 25,
      activityId: 'act-5',
      title: 'Recharge carburant',
      description: 'Station Total plein essence',
      date: getDateStr(0),
      time: '09:10',
      paymentMethod: 'card',
      createdAt: Date.now() - 3600000 * 5,
    },

    // Yesterday
    {
      id: 'tx-4',
      type: 'income',
      amount: 600,
      activityId: 'act-2',
      title: 'Acompte mission web design',
      description: 'Client Studio Nova - Facture 26-04',
      date: getDateStr(1),
      time: '16:30',
      paymentMethod: 'bank_transfer',
      receiptNumber: 'FAC-2026-004',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-5',
      type: 'expense',
      amount: 120,
      activityId: 'act-1',
      title: 'Réassort marchandise express',
      description: 'Grossiste emballages et sacs',
      date: getDateStr(1),
      time: '10:00',
      paymentMethod: 'mobile_money',
      receiptNumber: 'CMD-8991',
      createdAt: Date.now() - 86400000 * 1.2,
    },
    {
      id: 'tx-6',
      type: 'expense',
      amount: 18.50,
      activityId: 'act-7',
      title: 'Achat pharmacie',
      description: 'Vitamines et soins',
      date: getDateStr(1),
      time: '18:20',
      paymentMethod: 'cash',
      createdAt: Date.now() - 86400000 * 1.1,
    },

    // 2 days ago
    {
      id: 'tx-7',
      type: 'income',
      amount: 220,
      activityId: 'act-1',
      title: 'Vente directe boutique',
      description: 'Articles déco',
      date: getDateStr(2),
      time: '15:10',
      paymentMethod: 'cash',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-8',
      type: 'expense',
      amount: 85,
      activityId: 'act-4',
      title: 'Grand marché hebdomadaire',
      description: 'Fruits, légumes et viandes',
      date: getDateStr(2),
      time: '08:40',
      paymentMethod: 'cash',
      createdAt: Date.now() - 86400000 * 2.2,
    },

    // 3 days ago
    {
      id: 'tx-9',
      type: 'expense',
      amount: 45,
      activityId: 'act-2',
      title: 'Abonnement logiciel créatif',
      description: 'Licence mensuelle outils SaaS',
      date: getDateStr(3),
      time: '02:00',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-10',
      type: 'income',
      amount: 400,
      activityId: 'act-2',
      title: 'Solde maintenance site',
      description: 'Client Artisan Boulangerie',
      date: getDateStr(3),
      time: '14:20',
      paymentMethod: 'bank_transfer',
      createdAt: Date.now() - 86400000 * 3.1,
    },

    // Earlier this month
    {
      id: 'tx-11',
      type: 'income',
      amount: 2100,
      activityId: 'act-3',
      title: 'Virement Salaire mensuel',
      description: 'Paie mensuelle principale',
      date: getDateStr(6),
      time: '09:00',
      paymentMethod: 'bank_transfer',
      receiptNumber: 'PAYE-OCT-26',
      createdAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'tx-12',
      type: 'expense',
      amount: 680,
      activityId: 'act-6',
      title: 'Paiement Loyer & Charges',
      description: 'Virement propriétaire bail',
      date: getDateStr(6),
      time: '10:00',
      paymentMethod: 'bank_transfer',
      receiptNumber: 'LOY-2026-10',
      createdAt: Date.now() - 86400000 * 6.1,
    },
    {
      id: 'tx-13',
      type: 'expense',
      amount: 190,
      activityId: 'act-1',
      title: 'Facture fournisseur expédition',
      description: 'Frais de transport colis arrivés',
      date: getDateStr(8),
      time: '14:00',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'tx-14',
      type: 'income',
      amount: 480,
      activityId: 'act-1',
      title: 'Vente boutique week-end',
      description: 'Gros volume clients',
      date: getDateStr(9),
      time: '19:15',
      paymentMethod: 'mobile_money',
      createdAt: Date.now() - 86400000 * 9,
    },
    {
      id: 'tx-15',
      type: 'expense',
      amount: 65,
      activityId: 'act-5',
      title: 'Entretien vidange véhicule',
      description: 'Garage auto révision rapide',
      date: getDateStr(11),
      time: '11:30',
      paymentMethod: 'card',
      createdAt: Date.now() - 86400000 * 11,
    },
  ];
}
