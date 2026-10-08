import React, { useRef } from 'react';
import { Activity, CurrencyCode, Transaction } from '../types/finance';
import { formatDateFrench, formatDateLongFrench, formatMoney, PAYMENT_METHODS } from '../utils/formatters';
import { Printer, Download, X, CheckCircle, FileText } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  activities: Activity[];
  currencyCode: CurrencyCode;
  dateRangeLabel: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  activities,
  currencyCode,
  dateRangeLabel,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const activityMap = new Map(activities.map((a) => [a.id, a]));

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Activity breakdown
  const activityBreakdown = activities.map((act) => {
    const actTx = transactions.filter((t) => t.activityId === act.id);
    const inc = actTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = actTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      ...act,
      income: inc,
      expense: exp,
      net: inc - exp,
      count: actTx.length,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:m-0 print:p-0 print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold">Aperçu du Rapport PDF / Imprimable</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Printer size={15} />
              <span>Imprimer / Enregistrer en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          ref={reportRef}
          className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white print:p-0 print:overflow-visible print:space-y-6"
        >
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  FS
                </span>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  FINSTRAT
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Rapport de Trésorerie & Suivi Budgétaire par Activité
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Période : <strong className="text-slate-800">{dateRangeLabel}</strong>
              </p>
            </div>

            <div className="text-right text-xs text-slate-500">
              <p>Généré le : {formatDateLongFrench(new Date().toISOString().slice(0, 10))}</p>
              <p className="font-mono mt-0.5">Total opérations : {transactions.length}</p>
              <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                Devise : {currencyCode}
              </span>
            </div>
          </div>

          {/* Key Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                Total des Entrées
              </span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                +{formatMoney(totalIncome, currencyCode)}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="text-[11px] uppercase font-bold text-rose-800 tracking-wider">
                Total des Sorties
              </span>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1">
                -{formatMoney(totalExpense, currencyCode)}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${
              netBalance >= 0 ? 'border-slate-300 bg-slate-50' : 'border-amber-200 bg-amber-50'
            }`}>
              <span className="text-[11px] uppercase font-bold text-slate-700 tracking-wider">
                Solde Net de Période
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${
                netBalance >= 0 ? 'text-slate-900' : 'text-rose-700'
              }`}>
                {netBalance >= 0 ? '+' : ''}
                {formatMoney(netBalance, currencyCode)}
              </div>
            </div>
          </div>

          {/* Activity Breakdown Table */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Bilan & Suivi Budgétaire par Activité
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Activité</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5 text-right">Budget Alloué</th>
                    <th className="p-2.5 text-right">Dépenses Réelles</th>
                    <th className="p-2.5 text-right">Entrées Réalisées</th>
                    <th className="p-2.5 text-right">Solde Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {activityBreakdown.map((act) => {
                    const isOver = act.monthlyExpenseBudget > 0 && act.expense > act.monthlyExpenseBudget;
                    return (
                      <tr key={act.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900">{act.name}</td>
                        <td className="p-2.5 text-slate-500 capitalize">{act.categoryType}</td>
                        <td className="p-2.5 text-right font-mono text-slate-600">
                          {formatMoney(act.monthlyExpenseBudget, currencyCode)}
                        </td>
                        <td className={`p-2.5 text-right font-mono font-bold ${isOver ? 'text-rose-600' : 'text-slate-900'}`}>
                          {formatMoney(act.expense, currencyCode)}
                          {isOver && <span className="text-[10px] text-rose-600 ml-1 font-normal">(dépassement)</span>}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-600 font-bold">
                          +{formatMoney(act.income, currencyCode)}
                        </td>
                        <td className={`p-2.5 text-right font-mono font-bold ${act.net >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {act.net >= 0 ? '+' : ''}{formatMoney(act.net, currencyCode)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Log Table */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Journal Détaillé des Opérations
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Activité</th>
                    <th className="p-2.5">Libellé & Note</th>
                    <th className="p-2.5">Règlement</th>
                    <th className="p-2.5">N° Pièce</th>
                    <th className="p-2.5 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {transactions.slice(0, 50).map((tx) => {
                    const act = activityMap.get(tx.activityId);
                    const isIncome = tx.type === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">
                          {tx.date} {tx.time && <span className="text-slate-400">({tx.time})</span>}
                        </td>
                        <td className="p-2.5 text-slate-800 font-medium">{act?.name || '-'}</td>
                        <td className="p-2.5 text-slate-900">
                          <span className="font-semibold block">{tx.title}</span>
                          {tx.description && (
                            <span className="text-[11px] text-slate-500 block">{tx.description}</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600">
                          {PAYMENT_METHODS[tx.paymentMethod]?.label || tx.paymentMethod}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">
                          {tx.receiptNumber || '-'}
                        </td>
                        <td
                          className={`p-2.5 text-right font-mono font-bold whitespace-nowrap ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatMoney(tx.amount, currencyCode)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {transactions.length > 50 && (
                <div className="p-2 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
                  Affichage des 50 premières opérations sur {transactions.length} au total.
                </div>
              )}
            </div>
          </div>

          {/* Document Sign-off Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">Document généré via FinStrat Mobile</p>
              <p>Gestion financière quotidienne et pilotage budgétaire</p>
            </div>
            <div className="text-right">
              <p>Signature / Visa :</p>
              <div className="w-36 h-10 border-b border-dashed border-slate-400 mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
