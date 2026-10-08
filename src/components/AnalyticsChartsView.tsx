import React, { useState, useMemo } from 'react';
import { Activity, CurrencyCode, FilterPeriod, Transaction } from '../types/finance';
import { formatMoney } from '../utils/formatters';
import { ActivityIcon } from './ActivityIcon';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsChartsViewProps {
  transactions: Transaction[];
  activities: Activity[];
  currencyCode: CurrencyCode;
}

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({
  transactions,
  activities,
  currencyCode,
}) => {
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [selectedDonutActivityId, setSelectedDonutActivityId] = useState<string | null>(null);

  // Filter transactions according to selected period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);

      if (period === 'today') {
        return tx.date === todayStr;
      }
      if (period === 'week') {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (period === 'month') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }
      if (period === 'last_month') {
        const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return (
          txDate.getFullYear() === lastMonthYear &&
          txDate.getMonth() === lastMonth
        );
      }
      if (period === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true; // 'all'
    });
  }, [transactions, period]);

  // Aggregate by activity
  const activityData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    activities.forEach((a) => map.set(a.id, { income: 0, expense: 0 }));

    filteredTransactions.forEach((tx) => {
      const entry = map.get(tx.activityId) || { income: 0, expense: 0 };
      if (tx.type === 'expense') {
        entry.expense += tx.amount;
      } else {
        entry.income += tx.amount;
      }
      map.set(tx.activityId, entry);
    });

    const list = activities.map((act) => {
      const data = map.get(act.id) || { income: 0, expense: 0 };
      return {
        ...act,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    });

    return list;
  }, [activities, filteredTransactions]);

  const totalPeriodIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalPeriodExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalPeriodNet = totalPeriodIncome - totalPeriodExpense;

  // Donut chart calculations for expenses
  const expenseBreakdown = useMemo(() => {
    const withExpenses = activityData.filter((a) => a.expense > 0);
    const totalExp = totalPeriodExpense || 1;

    let accumulatedPct = 0;
    return withExpenses.map((a) => {
      const pct = (a.expense / totalExp) * 100;
      const startPct = accumulatedPct;
      accumulatedPct += pct;
      return {
        ...a,
        pct: Math.round(pct * 10) / 10,
        startPct,
        endPct: accumulatedPct,
      };
    });
  }, [activityData, totalPeriodExpense]);

  // Top spender and top earner
  const topSpender = useMemo(() => {
    const sorted = [...activityData].sort((a, b) => b.expense - a.expense);
    return sorted[0]?.expense > 0 ? sorted[0] : null;
  }, [activityData]);

  const topEarner = useMemo(() => {
    const sorted = [...activityData].sort((a, b) => b.income - a.income);
    return sorted[0]?.income > 0 ? sorted[0] : null;
  }, [activityData]);

  // Active donut slice
  const activeDonutItem = useMemo(() => {
    if (!selectedDonutActivityId) return null;
    return expenseBreakdown.find((item) => item.id === selectedDonutActivityId) || null;
  }, [selectedDonutActivityId, expenseBreakdown]);

  // Daily timeline bars (last 10 days of the filtered transactions or current days)
  const timelineData = useMemo(() => {
    const dateMap = new Map<string, { income: number; expense: number }>();
    filteredTransactions.forEach((tx) => {
      const cur = dateMap.get(tx.date) || { income: 0, expense: 0 };
      if (tx.type === 'income') cur.income += tx.amount;
      else cur.expense += tx.amount;
      dateMap.set(tx.date, cur);
    });

    const dates = Array.from(dateMap.keys()).sort();
    // take up to last 10 dates
    const recentDates = dates.slice(-10);
    return recentDates.map((date) => {
      const cur = dateMap.get(date)!;
      const [year, month, day] = date.split('-');
      return {
        date,
        shortLabel: `${day}/${month}`,
        income: cur.income,
        expense: cur.expense,
      };
    });
  }, [filteredTransactions]);

  const maxTimelineAmount = useMemo(() => {
    let max = 100;
    timelineData.forEach((d) => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max;
  }, [timelineData]);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Period Selector Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'today', label: "Aujourd'hui" },
          { id: 'week', label: '7 jours' },
          { id: 'month', label: 'Ce mois' },
          { id: 'last_month', label: 'Mois dernier' },
          { id: 'year', label: 'Cette année' },
          { id: 'all', label: 'Tout' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPeriod(p.id as FilterPeriod);
              setSelectedDonutActivityId(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              period === p.id
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 2. Key Period Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mb-1">
            <ArrowUpRight size={13} />
            <span>Entrées</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
            +{formatMoney(totalPeriodIncome, currencyCode)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center gap-1 text-[11px] text-rose-400 font-medium mb-1">
            <ArrowDownRight size={13} />
            <span>Sorties</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-mono text-white tabular-nums">
            -{formatMoney(totalPeriodExpense, currencyCode)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium mb-1">
            <TrendingUp size={13} />
            <span>Solde Net</span>
          </div>
          <div
            className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
              totalPeriodNet >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPeriodNet >= 0 ? '+' : ''}
            {formatMoney(totalPeriodNet, currencyCode)}
          </div>
        </div>
      </div>

      {/* 3. Donut Chart: Répartition des Dépenses par Activité */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <PieIcon size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Répartition des dépenses
              </h3>
              <p className="text-[11px] text-slate-400">Par activité sur la période</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
            {formatMoney(totalPeriodExpense, currencyCode)}
          </span>
        </div>

        {expenseBreakdown.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Aucune dépense enregistrée sur cette période.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="14"
                />
                {/* Segments */}
                {expenseBreakdown.map((item) => {
                  const circumference = 2 * Math.PI * 38; // ~238.76
                  const strokeDasharray = `${(item.pct / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((item.startPct / 100) * circumference);
                  const isSelected = selectedDonutActivityId === item.id;

                  return (
                    <circle
                      key={item.id}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isSelected ? '18' : '14'}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="cursor-pointer transition-all duration-300 hover:opacity-90"
                      onClick={() =>
                        setSelectedDonutActivityId(
                          selectedDonutActivityId === item.id ? null : item.id
                        )
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                {activeDonutItem ? (
                  <>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {activeDonutItem.name}
                    </span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {activeDonutItem.pct}%
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 tabular-nums">
                      {formatMoney(activeDonutItem.expense, currencyCode)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-slate-400 font-medium">Total Sorties</span>
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {formatMoney(totalPeriodExpense, currencyCode)}
                    </span>
                    <span className="text-[9px] text-slate-500">Touchez un secteur</span>
                  </>
                )}
              </div>
            </div>

            {/* Donut Legend */}
            <div className="w-full space-y-1.5 flex-1 max-h-48 overflow-y-auto pr-1">
              {expenseBreakdown.map((item) => {
                const isSelected = selectedDonutActivityId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setSelectedDonutActivityId(
                        selectedDonutActivityId === item.id ? null : item.id
                      )
                    }
                    className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left transition-colors border ${
                      isSelected
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-transparent border-transparent hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-md shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-200 truncate font-medium">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        {item.pct}%
                      </span>
                      <span className="text-xs font-mono font-semibold text-white tabular-nums">
                        {formatMoney(item.expense, currencyCode)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Suivi Budgétaire Comparatif par Activité (Jauges Horizontales) */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <BarChart2 size={15} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Suivi Budgétaire par Activité
              </h3>
              <p className="text-[11px] text-slate-400">
                Dépenses réelles vs Budget alloué
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {activityData.map((act) => {
            const budget = act.monthlyExpenseBudget || 0;
            const spent = act.expense;
            const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
            const isOver = budget > 0 && spent > budget;

            return (
              <div key={act.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <ActivityIcon iconName={act.icon} color={act.color} size={14} />
                    <span className="font-semibold text-slate-200 truncate">{act.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-[11px] shrink-0">
                    <span className={isOver ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {formatMoney(spent, currencyCode)}
                    </span>
                    <span className="text-slate-500">/ {formatMoney(budget, currencyCode)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isOver
                          ? 'bg-rose-500/20 text-rose-300'
                          : pct >= 80
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver
                        ? 'bg-rose-500'
                        : pct >= 80
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{
                      width: `${budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Rentabilité des Activités (Entrées vs Sorties pour chaque activité) */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Rentabilité & Balance par Pôle
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparatif direct Entrées (+) vs Sorties (-)
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {activityData.map((act) => {
            const hasActivity = act.income > 0 || act.expense > 0;
            if (!hasActivity) return null;

            return (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ActivityIcon iconName={act.icon} color={act.color} size={15} />
                    <span className="font-bold text-white">{act.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Marge nette</span>
                    <span
                      className={`text-xs font-bold font-mono tabular-nums ${
                        act.net > 0 ? 'text-emerald-400' : act.net < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {act.net > 0 ? '+' : ''}
                      {formatMoney(act.net, currencyCode)}
                    </span>
                  </div>
                </div>

                {/* Comparative Double Bars */}
                <div className="space-y-1 pt-1 text-[11px]">
                  {/* Income bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-emerald-400 font-medium shrink-0">
                      Entrées
                    </span>
                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${
                            Math.max(act.income, act.expense) > 0
                              ? (act.income / Math.max(act.income, act.expense)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-emerald-400 tabular-nums">
                      +{formatMoney(act.income, currencyCode)}
                    </span>
                  </div>

                  {/* Expense bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 text-[10px] text-rose-400 font-medium shrink-0">
                      Sorties
                    </span>
                    <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${
                            Math.max(act.income, act.expense) > 0
                              ? (act.expense / Math.max(act.income, act.expense)) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="w-20 text-right font-mono text-rose-400 tabular-nums">
                      -{formatMoney(act.expense, currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Évolution Chronologique des Flux (Histogramme temporel) */}
      {timelineData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Historique des flux quotidiens
              </h3>
              <p className="text-[11px] text-slate-400">
                Évolution journalière des encaissements et décaissements
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Entrées
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Sorties
              </span>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <div className="flex items-end justify-between gap-1.5 h-36 px-1 border-b border-slate-800 pb-1">
              {timelineData.map((d) => {
                const incHeight = maxTimelineAmount > 0 ? (d.income / maxTimelineAmount) * 100 : 0;
                const expHeight = maxTimelineAmount > 0 ? (d.expense / maxTimelineAmount) * 100 : 0;

                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-28">
                      {/* Income Bar */}
                      <div
                        className="w-2 sm:w-3 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-400"
                        style={{ height: `${Math.max(4, incHeight)}%` }}
                        title={`${d.date} - Entrées: +${formatMoney(d.income, currencyCode)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-2 sm:w-3 bg-rose-500 rounded-t-sm transition-all group-hover:bg-rose-400"
                        style={{ height: `${Math.max(4, expHeight)}%` }}
                        title={`${d.date} - Sorties: -${formatMoney(d.expense, currencyCode)}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono rotate-0 group-hover:text-white">
                      {d.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
