import React, { useMemo } from 'react';
import { Activity, CurrencyCode, Transaction } from '../types/finance';
import { formatMoney } from '../utils/formatters';
import { ActivityIcon } from './ActivityIcon';
import { Plus, Edit2, AlertTriangle, CheckCircle2, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ActivitiesBudgetViewProps {
  activities: Activity[];
  transactions: Transaction[];
  currencyCode: CurrencyCode;
  onOpenAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onSelectActivityFilter?: (activityId: string) => void;
}

export const ActivitiesBudgetView: React.FC<ActivitiesBudgetViewProps> = ({
  activities,
  transactions,
  currencyCode,
  onOpenAddActivity,
  onEditActivity,
}) => {
  // Compute monthly figures for current month (YYYY-MM)
  const currentMonthPrefix = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }, []);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  // Aggregate per activity
  const activityStats = useMemo(() => {
    const statsMap = new Map<
      string,
      {
        totalExpense: number;
        totalIncome: number;
        count: number;
      }
    >();

    activities.forEach((a) => {
      statsMap.set(a.id, { totalExpense: 0, totalIncome: 0, count: 0 });
    });

    currentMonthTransactions.forEach((tx) => {
      const current = statsMap.get(tx.activityId) || { totalExpense: 0, totalIncome: 0, count: 0 };
      if (tx.type === 'expense') {
        current.totalExpense += tx.amount;
      } else {
        current.totalIncome += tx.amount;
      }
      current.count += 1;
      statsMap.set(tx.activityId, current);
    });

    return statsMap;
  }, [activities, currentMonthTransactions]);

  // Global monthly sums
  const totalMonthlyBudget = useMemo(() => {
    return activities.reduce((sum, a) => sum + (a.monthlyExpenseBudget || 0), 0);
  }, [activities]);

  const totalMonthlySpent = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalMonthlyIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalMonthlyIncomeTarget = useMemo(() => {
    return activities.reduce((sum, a) => sum + (a.monthlyIncomeTarget || 0), 0);
  }, [activities]);

  const globalBudgetPct = totalMonthlyBudget > 0 
    ? Math.min(100, Math.round((totalMonthlySpent / totalMonthlyBudget) * 100))
    : 0;

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Header with Add Activity Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Suivi Budgétaire des Activités
          </h2>
          <p className="text-xs text-slate-400">
            Contrôle des plafonds de dépenses et rentabilité par pôle
          </p>
        </div>
        <button
          onClick={onOpenAddActivity}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Nouvelle activité</span>
        </button>
      </div>

      {/* 2. Global Monthly Budget Envelope */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Wallet size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                Enveloppe Globale du Mois
              </span>
              <span className="text-[11px] text-slate-400">
                Plafond total alloué : {formatMoney(totalMonthlyBudget, currencyCode)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-white tabular-nums">
              {formatMoney(totalMonthlySpent, currencyCode)}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {globalBudgetPct}% consommé
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalMonthlySpent > totalMonthlyBudget
                ? 'bg-rose-500'
                : globalBudgetPct > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (totalMonthlySpent / (totalMonthlyBudget || 1)) * 100)}%` }}
          />
        </div>

        {/* Quick Month Metrics */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Revenus réels vs Objectif
            </span>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {formatMoney(totalMonthlyIncome, currencyCode)} / {formatMoney(totalMonthlyIncomeTarget, currencyCode)}
            </div>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
              Bénéfice net global
            </span>
            <div
              className={`text-xs font-bold font-mono mt-0.5 tabular-nums ${
                totalMonthlyIncome - totalMonthlySpent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalMonthlyIncome - totalMonthlySpent >= 0 ? '+' : ''}
              {formatMoney(totalMonthlyIncome - totalMonthlySpent, currencyCode)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. List of Activities with Individual Budget Tracking Gauges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Détail par activité ({activities.length})
          </h3>
          <span className="text-[11px] text-slate-500">Mois en cours</span>
        </div>

        {activities.map((act) => {
          const stats = activityStats.get(act.id) || { totalExpense: 0, totalIncome: 0, count: 0 };
          const budget = act.monthlyExpenseBudget || 0;
          const spent = stats.totalExpense;
          const income = stats.totalIncome;
          const net = income - spent;

          const pctSpent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
          const isOverBudget = budget > 0 && spent > budget;
          const isNearBudget = budget > 0 && pctSpent >= 80 && !isOverBudget;

          return (
            <div
              key={act.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3 transition-colors hover:border-slate-700/80"
            >
              {/* Top Row: Icon, Title, Type, and Edit */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group flex-1"
                  onClick={() => onEditActivity(act)}
                  title="Cliquez pour modifier cette activité"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${act.color}20`,
                      borderColor: `${act.color}40`,
                    }}
                  >
                    <ActivityIcon iconName={act.icon} color={act.color} size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-emerald-300 transition-colors">
                      <span>{act.name}</span>
                    </h4>
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span>
                        {act.categoryType === 'business'
                          ? 'Professionnel'
                          : act.categoryType === 'personal'
                          ? 'Personnel'
                          : 'Mixte'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{stats.count} transaction{stats.count > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onEditActivity(act)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 flex items-center gap-1.5 text-xs font-medium transition-colors border border-slate-700/60"
                  title="Modifier l'activité et le budget"
                >
                  <Edit2 size={13} className="text-emerald-400" />
                  <span>Modifier</span>
                </button>
              </div>

              {/* Budget Expense Gauge */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Budget dépenses :</span>
                    {isOverBudget ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> Dépassement ({pctSpent}%)
                      </span>
                    ) : isNearBudget ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle size={12} /> Seuil d'alerte ({pctSpent}%)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Maîtrisé ({pctSpent}%)
                      </span>
                    )}
                  </div>
                  <div className="font-mono tabular-nums">
                    <span className={`font-bold ${isOverBudget ? 'text-rose-400' : 'text-slate-200'}`}>
                      {formatMoney(spent, currencyCode)}
                    </span>
                    <span className="text-slate-500"> / {formatMoney(budget, currencyCode)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-rose-500'
                        : isNearBudget
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Activity Financial Inflow / Outflow / Net Margins */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Entrées générées</span>
                  <span className="font-bold font-mono text-emerald-400 tabular-nums">
                    +{formatMoney(income, currencyCode)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Sorties réelles</span>
                  <span className="font-bold font-mono text-rose-400 tabular-nums">
                    -{formatMoney(spent, currencyCode)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Solde net</span>
                  <span
                    className={`font-bold font-mono tabular-nums ${
                      net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {net > 0 ? '+' : ''}
                    {formatMoney(net, currencyCode)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom Add Activity Action Card */}
        <button
          onClick={onOpenAddActivity}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center gap-2.5 text-slate-400 hover:text-emerald-400 font-semibold text-xs transition-all active:scale-[0.99]"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
            <Plus size={16} />
          </div>
          <span>Ajouter une nouvelle activité (Commerce, Freelance, Personnel, etc.)</span>
        </button>
      </div>
    </div>
  );
};
