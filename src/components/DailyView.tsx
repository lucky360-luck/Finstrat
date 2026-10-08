import React, { useState, useMemo } from 'react';
import { Activity, CurrencyCode, Transaction, TransactionType } from '../types/finance';
import { formatDateFrench, formatDateLongFrench, formatMoney, getTodayIso, PAYMENT_METHODS } from '../utils/formatters';
import { ActivityIcon } from './ActivityIcon';
import {
  Calendar,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Plus,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface DailyViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  transactions: Transaction[];
  activities: Activity[];
  currencyCode: CurrencyCode;
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onOpenAddActivity?: () => void;
  onEditActivity?: (act: Activity) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  onSelectDate,
  transactions,
  activities,
  currencyCode,
  onOpenAddModal,
  onEditTransaction,
  onOpenAddActivity,
  onEditActivity,
}) => {
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const todayIso = getTodayIso();

  // Create carousel of dates (today and past 13 days)
  const dateCarousel = useMemo(() => {
    const list: { iso: string; label: string; dayNum: number; dayName: string; isToday: boolean }[] = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${day}`;

      const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(d);
      list.push({
        iso,
        label: formatDateFrench(iso),
        dayNum: d.getDate(),
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
        isToday: iso === todayIso,
      });
    }
    return list;
  }, [todayIso]);

  // Activity lookup map
  const activityMap = useMemo(() => {
    return new Map(activities.map((a) => [a.id, a]));
  }, [activities]);

  // Filter transactions for the selected day
  const dayTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date === selectedDate);
  }, [transactions, selectedDate]);

  // Compute daily aggregates
  const dayIncome = useMemo(() => {
    return dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const dayExpense = useMemo(() => {
    return dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const dayNet = dayIncome - dayExpense;

  // Filtered transactions by user controls (search, type, activity)
  const filteredTransactions = useMemo(() => {
    return dayTransactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (selectedActivityId !== 'all' && tx.activityId !== selectedActivityId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tx.title.toLowerCase().includes(q);
        const matchesDesc = (tx.description || '').toLowerCase().includes(q);
        const matchesReceipt = (tx.receiptNumber || '').toLowerCase().includes(q);
        const actName = activityMap.get(tx.activityId)?.name.toLowerCase() || '';
        const matchesAct = actName.includes(q);
        if (!matchesTitle && !matchesDesc && !matchesReceipt && !matchesAct) return false;
      }
      return true;
    });
  }, [dayTransactions, filterType, selectedActivityId, searchQuery, activityMap]);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Date Scroller Carousel */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 -mx-4 px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar size={14} className="text-emerald-400" />
            <span>{formatDateLongFrench(selectedDate)}</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedDate !== todayIso && (
              <button
                onClick={() => onSelectDate(todayIso)}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md transition-colors"
              >
                Aujourd'hui
              </button>
            )}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              title="Sélectionner une date personnalisée"
            />
          </div>
        </div>

        {/* Carousel buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {dateCarousel.map((item) => {
            const isSelected = item.iso === selectedDate;
            return (
              <button
                key={item.iso}
                onClick={() => onSelectDate(item.iso)}
                className={`flex flex-col items-center justify-center min-w-[50px] py-2 px-1 rounded-xl transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-800/70 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-base font-bold font-mono tabular-nums leading-tight">
                  {item.dayNum}
                </span>
                {item.isToday && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Daily Summary Metric Card */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Bilan de la journée
            </span>
            <div className="text-xs text-slate-400 font-medium">
              {dayTransactions.length} opération{dayTransactions.length > 1 ? 's' : ''} enregistrée{dayTransactions.length > 1 ? 's' : ''}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Solde net</span>
            <span
              className={`text-lg font-bold font-mono tabular-nums ${
                dayNet > 0
                  ? 'text-emerald-400'
                  : dayNet < 0
                  ? 'text-rose-400'
                  : 'text-slate-300'
              }`}
            >
              {dayNet > 0 ? '+' : ''}
              {formatMoney(dayNet, currencyCode)}
            </span>
          </div>
        </div>

        {/* Inflow vs Outflow 2-column breakdown */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
              <div className="w-5 h-5 rounded-md bg-emerald-500/15 flex items-center justify-center">
                <ArrowUpRight size={14} />
              </div>
              <span>Entrées</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
              +{formatMoney(dayIncome, currencyCode)}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-1">
              <div className="w-5 h-5 rounded-md bg-rose-500/15 flex items-center justify-center">
                <ArrowDownRight size={14} />
              </div>
              <span>Sorties</span>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
              -{formatMoney(dayExpense, currencyCode)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une opération..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>

          {/* Activity Dropdown Filter & Management */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 max-w-[130px] sm:max-w-none truncate"
            >
              <option value="all">Toutes activités</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>

            {onOpenAddActivity && (
              <button
                type="button"
                onClick={onOpenAddActivity}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-colors shrink-0"
                title="Ajouter une nouvelle activité"
              >
                <Plus size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Quick helper when an activity is specifically selected */}
        {selectedActivityId !== 'all' && onEditActivity && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>Filtre actif : {activityMap.get(selectedActivityId)?.name}</span>
            <button
              type="button"
              onClick={() => {
                const act = activityMap.get(selectedActivityId);
                if (act) onEditActivity(act);
              }}
              className="text-emerald-400 hover:underline font-medium"
            >
              Modifier cette activité
            </button>
          </div>
        )}

        {/* Type Filter Buttons (Segmented Controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setFilterType('all')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Toutes ({dayTransactions.length})
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sorties ({dayTransactions.filter((t) => t.type === 'expense').length})
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrées ({dayTransactions.filter((t) => t.type === 'income').length})
          </button>
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Opérations du {formatDateFrench(selectedDate)}
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredTransactions.length} affichée{filteredTransactions.length > 1 ? 's' : ''}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500 mb-3">
              <Receipt size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              Aucune opération enregistrée
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
              {searchQuery || filterType !== 'all' || selectedActivityId !== 'all'
                ? 'Aucun résultat ne correspond à vos filtres de recherche.'
                : 'Vous n\'avez pas encore saisi d\'entrée ou sortie pour cette date.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              <Plus size={16} />
              <span>Ajouter une opération</span>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl divide-y divide-slate-800/70 overflow-hidden shadow-sm">
            {filteredTransactions.map((tx) => {
              const activity = activityMap.get(tx.activityId);
              const paymentInfo = PAYMENT_METHODS[tx.paymentMethod];
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onEditTransaction(tx)}
                  className="p-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-center gap-3.5 group"
                >
                  {/* Category icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${activity?.color || '#64748b'}20`,
                      borderColor: `${activity?.color || '#64748b'}40`,
                    }}
                  >
                    <ActivityIcon
                      iconName={activity?.icon || 'CircleDot'}
                      color={activity?.color || '#64748b'}
                      size={18}
                    />
                  </div>

                  {/* Transaction Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {tx.title}
                      </h4>
                      {/* Amount */}
                      <span
                        className={`text-sm sm:text-base font-bold font-mono tabular-nums shrink-0 ${
                          isIncome ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(tx.amount, currencyCode)}
                      </span>
                    </div>

                    {/* Zero-Pill Unboxed Metadata */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 truncate">
                      <span className="font-medium text-slate-300 truncate">
                        {activity?.name || 'Général'}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span>{paymentInfo?.label || tx.paymentMethod}</span>
                      {tx.time && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-mono">{tx.time}</span>
                        </>
                      )}
                      {tx.receiptNumber && (
                        <>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="font-mono text-emerald-400/90">{tx.receiptNumber}</span>
                        </>
                      )}
                    </div>

                    {tx.description && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {tx.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
