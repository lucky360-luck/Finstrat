import React, { useState, useEffect } from 'react';
import { Activity, CurrencyCode } from '../types/finance';
import { CURRENCIES } from '../utils/formatters';
import { ActivityIcon, AVAILABLE_ACTIVITY_COLORS, AVAILABLE_ACTIVITY_ICONS } from './ActivityIcon';
import { X, Trash2 } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: Omit<Activity, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
  activityToEdit?: Activity | null;
  currencyCode: CurrencyCode;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  activityToEdit,
  currencyCode,
}) => {
  const [name, setName] = useState('');
  const [categoryType, setCategoryType] = useState<'business' | 'personal' | 'mixed'>('business');
  const [icon, setIcon] = useState('Store');
  const [color, setColor] = useState('#3b82f6');
  const [monthlyExpenseBudget, setMonthlyExpenseBudget] = useState('500');
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState('1000');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activityToEdit) {
      setName(activityToEdit.name);
      setCategoryType(activityToEdit.categoryType);
      setIcon(activityToEdit.icon);
      setColor(activityToEdit.color);
      setMonthlyExpenseBudget(String(activityToEdit.monthlyExpenseBudget));
      setMonthlyIncomeTarget(String(activityToEdit.monthlyIncomeTarget));
      setDescription(activityToEdit.description || '');
    } else {
      setName('');
      setCategoryType('business');
      setIcon('Store');
      setColor('#3b82f6');
      setMonthlyExpenseBudget('500');
      setMonthlyIncomeTarget('1000');
      setDescription('');
    }
    setError('');
  }, [activityToEdit, isOpen]);

  if (!isOpen) return null;

  const currencySymbol = CURRENCIES[currencyCode]?.symbol || currencyCode;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez renseigner un nom pour cette activité.');
      return;
    }

    const budget = parseFloat(monthlyExpenseBudget.replace(',', '.')) || 0;
    const incomeTarget = parseFloat(monthlyIncomeTarget.replace(',', '.')) || 0;

    onSave(
      {
        name: name.trim(),
        categoryType,
        icon,
        color,
        monthlyExpenseBudget: Math.max(0, budget),
        monthlyIncomeTarget: Math.max(0, incomeTarget),
        description: description.trim() || undefined,
      },
      activityToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden" />

        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              {activityToEdit ? 'Modifier l\'activité' : 'Nouvelle activité'}
            </h2>
            <p className="text-xs text-slate-400">
              Configurez le suivi budgétaire et la rentabilité
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Activity Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nom de l'activité <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Boutique mode, Élevage avicole, Agence web..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              autoFocus
            />

            {/* Quick Inspiration Templates if creating new */}
            {!activityToEdit && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Agriculture & Élevage', icon: 'Sparkles', color: '#84cc16' },
                  { label: 'E-commerce & Vente', icon: 'Store', color: '#3b82f6' },
                  { label: 'Immobilier & Locatif', icon: 'Building2', color: '#6366f1' },
                  { label: 'Prestations / Services', icon: 'Laptop', color: '#8b5cf6' },
                  { label: 'Transport / Livraison', icon: 'Truck', color: '#06b6d4' },
                  { label: 'Éducation & Formation', icon: 'GraduationCap', color: '#f59e0b' },
                ].map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => {
                      setName(tmpl.label);
                      setIcon(tmpl.icon);
                      setColor(tmpl.color);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    + {tmpl.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Activity Classification Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Type d'activité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'business', label: 'Professionnel / Business' },
                { id: 'personal', label: 'Personnel / Foyer' },
                { id: 'mixed', label: 'Mixte' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setCategoryType(t.id as 'business' | 'personal' | 'mixed')}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                    categoryType === t.id
                      ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Icon Preview */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
              style={{ backgroundColor: `${color}25`, border: `1.5px solid ${color}` }}
            >
              <ActivityIcon iconName={icon} color={color} size={24} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Aperçu du badge visuel</div>
              <div className="text-[11px] text-slate-400">
                Couleur et icône distinctives dans les graphiques et listes
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Choisir une icône
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 max-h-28 overflow-y-auto p-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
              {AVAILABLE_ACTIVITY_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`h-9 rounded-lg flex items-center justify-center transition-all border ${
                    icon === ic
                      ? 'bg-slate-800 border-emerald-400 text-white'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <ActivityIcon iconName={ic} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Palette de couleur
            </label>
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
              {AVAILABLE_ACTIVITY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform active:scale-95 flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Budgets & Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-rose-300 mb-1">
                Plafond mensuel de dépenses ({currencySymbol})
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 500"
                value={monthlyExpenseBudget}
                onChange={(e) => setMonthlyExpenseBudget(e.target.value)}
                className="w-full bg-slate-950 border border-rose-500/30 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Alerte déclenchée si les dépenses dépassent ce montant.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1">
                Objectif mensuel de revenus ({currencySymbol})
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 1500"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl py-2 px-3 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Cible d'encaissements ou chiffre d'affaires attendu.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description / Précisions
            </label>
            <input
              type="text"
              placeholder="Ex: Frais fixes, matériel, ventes en gros..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-3">
            {activityToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Voulez-vous supprimer cette activité ? Les transactions associées resteront enregistrées.')) {
                    onDelete(activityToEdit.id);
                    onClose();
                  }
                }}
                className="h-11 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition-colors"
                title="Supprimer l'activité"
              >
                <Trash2 size={16} />
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-11 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center transition-transform active:scale-[0.98]"
            >
              {activityToEdit ? 'Mettre à jour l\'activité' : 'Créer l\'activité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
