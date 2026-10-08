import React, { useState, useEffect } from 'react';
import { Activity, CurrencyCode, PaymentMethod, Transaction, TransactionType } from '../types/finance';
import { CURRENCIES, getCurrentTimeIso, getTodayIso, PAYMENT_METHODS } from '../utils/formatters';
import { ActivityIcon } from './ActivityIcon';
import { X, ArrowDownRight, ArrowUpRight, Trash2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  transactionToEdit?: Transaction | null;
  activities: Activity[];
  currencyCode: CurrencyCode;
  defaultDate?: string;
  onOpenAddActivity?: () => void;
  onEditActivity?: (act: Activity) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  transactionToEdit,
  activities,
  currencyCode,
  defaultDate,
  onOpenAddActivity,
  onEditActivity,
}) => {

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [activityId, setActivityId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || getTodayIso());
  const [time, setTime] = useState<string>(getCurrentTimeIso());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountStr(String(transactionToEdit.amount));
      setActivityId(transactionToEdit.activityId);
      setTitle(transactionToEdit.title);
      setDescription(transactionToEdit.description || '');
      setDate(transactionToEdit.date);
      setTime(transactionToEdit.time || getCurrentTimeIso());
      setPaymentMethod(transactionToEdit.paymentMethod);
      setReceiptNumber(transactionToEdit.receiptNumber || '');
    } else {
      setType('expense');
      setAmountStr('');
      setActivityId(activities[0]?.id || '');
      setTitle('');
      setDescription('');
      setDate(defaultDate || getTodayIso());
      setTime(getCurrentTimeIso());
      setPaymentMethod('cash');
      setReceiptNumber('');
    }
    setError('');
  }, [transactionToEdit, isOpen, defaultDate, activities]);

  if (!isOpen) return null;

  const currencySymbol = CURRENCIES[currencyCode]?.symbol || currencyCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Veuillez saisir un montant valide supérieur à 0.');
      return;
    }
    if (!title.trim()) {
      setError('Veuillez indiquer un libellé ou motif.');
      return;
    }
    if (!activityId) {
      setError('Veuillez sélectionner une activité.');
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        activityId,
        title: title.trim(),
        description: description.trim(),
        date,
        time,
        paymentMethod,
        receiptNumber: receiptNumber.trim() || undefined,
      },
      transactionToEdit?.id
    );
    onClose();
  };

  const addAmount = (delta: number) => {
    const current = parseFloat(amountStr.replace(',', '.')) || 0;
    setAmountStr(String(Math.max(0, current + delta)));
  };

  const quickSuggestions = type === 'expense' 
    ? ['Alimentation quotidienne', 'Carburant / Déplacement', 'Facture d\'électricité / eau', 'Fournitures & Stock', 'Entretien véhicule', 'Pharmacie / Soins']
    : ['Vente marchandises', 'Acompte client', 'Prestation de service', 'Salaire mensuel', 'Paiement commande', 'Remboursement'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10">
        {/* Grab Handle for Mobile */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              {transactionToEdit ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h2>
            <p className="text-xs text-slate-400">
              {type === 'expense' ? 'Enregistrement d\'une sortie d\'argent' : 'Enregistrement d\'une entrée d\'argent'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Toggle: Entrée vs Sortie */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight size={16} />
              <span>Sortie (Dépense)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight size={16} />
              <span>Entrée (Revenu)</span>
            </button>
          </div>

          {/* Amount Input with big numeric font */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Montant ({currencySymbol}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className={`w-full bg-slate-950 border rounded-xl py-3.5 pl-4 pr-16 text-2xl font-bold font-mono tracking-tight text-white focus:outline-none focus:ring-2 transition-all ${
                  type === 'expense'
                    ? 'border-rose-500/40 focus:ring-rose-500/40 focus:border-rose-500'
                    : 'border-emerald-500/40 focus:ring-emerald-500/40 focus:border-emerald-500'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {currencySymbol}
              </span>
            </div>

            {/* Quick add buttons */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-500 shrink-0 mr-1">Rapide :</span>
              {[10, 25, 50, 100, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addAmount(val)}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors shrink-0"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Activity / Category Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Activité concernée <span className="text-rose-400">*</span>
              </label>
              {onOpenAddActivity && (
                <button
                  type="button"
                  onClick={onOpenAddActivity}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <span>+ Créer une activité</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {activities.map((act) => {
                const isSelected = activityId === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivityId(act.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/60 border-transparent text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${act.color}25` }}
                    >
                      <ActivityIcon iconName={act.icon} color={act.color} size={15} />
                    </div>
                    <span className="text-xs font-medium truncate">{act.name}</span>
                  </button>
                );
              })}

              {/* Add New Activity Quick Tile */}
              {onOpenAddActivity && (
                <button
                  type="button"
                  onClick={onOpenAddActivity}
                  className="flex items-center gap-2 p-2 rounded-lg text-left transition-all border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                >
                  <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                    +
                  </div>
                  <span className="text-xs font-semibold truncate">Autre activité...</span>
                </button>
              )}
            </div>

            {/* Quick Edit Current Activity */}
            {activityId && onEditActivity && (
              <div className="flex items-center justify-end mt-1">
                {(() => {
                  const currentAct = activities.find((a) => a.id === activityId);
                  if (!currentAct) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => onEditActivity(currentAct)}
                      className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      <span>Modifier "{currentAct.name}" (budget, nom, couleur)</span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Title / Libellé */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Motif / Libellé <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Vente comptoir, Courses hebdomadaires, Carburant..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickSuggestions.slice(0, 4).map((sugg) => (
                <button
                  key={sugg}
                  type="button"
                  onClick={() => setTitle(sugg)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Heure</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mode de paiement
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
                const info = PAYMENT_METHODS[method];
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reçu & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                N° de reçu ou pièce (optionnel)
              </label>
              <input
                type="text"
                placeholder="Ex: REC-4920, FAC-08"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Note / Détails complémentaires
              </label>
              <input
                type="text"
                placeholder="Ex: Payé en espèces chez le grossiste"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center gap-3">
            {transactionToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Supprimer cette transaction définitivement ?')) {
                    onDelete(transactionToEdit.id);
                    onClose();
                  }
                }}
                className="h-11 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-colors"
                title="Supprimer la transaction"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="submit"
              className={`flex-1 h-11 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg transition-transform active:scale-[0.98] ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              {transactionToEdit ? 'Enregistrer les modifications' : 'Valider l\'opération'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
