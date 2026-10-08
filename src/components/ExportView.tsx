import React, { useState } from 'react';
import { Activity, CurrencyCode, FilterPeriod, Transaction } from '../types/finance';
import { exportFullBackupJson, exportTransactionsToCsv } from '../utils/exportUtils';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Database,
  Calendar,
} from 'lucide-react';

interface ExportViewProps {
  transactions: Transaction[];
  activities: Activity[];
  currencyCode: CurrencyCode;
  onOpenPrintReport: (rangeLabel: string, filteredList: Transaction[]) => void;
  onResetToDemo: () => void;
  onClearAll: () => void;
  onImportBackup: (importedData: { activities: Activity[]; transactions: Transaction[]; currencyCode?: CurrencyCode }) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  transactions,
  activities,
  currencyCode,
  onOpenPrintReport,
  onResetToDemo,
  onClearAll,
  onImportBackup,
}) => {
  const [selectedRange, setSelectedRange] = useState<FilterPeriod>('month');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Filter transactions for export
  const getFilteredTransactions = () => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return transactions.filter((tx) => {
      if (selectedActivityId !== 'all' && tx.activityId !== selectedActivityId) {
        return false;
      }

      const txDate = new Date(tx.date);
      if (selectedRange === 'today') {
        return tx.date === todayStr;
      }
      if (selectedRange === 'week') {
        const diffTime = Math.abs(now.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (selectedRange === 'month') {
        return (
          txDate.getFullYear() === now.getFullYear() &&
          txDate.getMonth() === now.getMonth()
        );
      }
      if (selectedRange === 'year') {
        return txDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const getRangeLabel = () => {
    switch (selectedRange) {
      case 'today':
        return "Aujourd'hui";
      case 'week':
        return '7 derniers jours';
      case 'month':
        return 'Mois en cours';
      case 'year':
        return 'Année en cours';
      default:
        return 'Historique complet';
    }
  };

  const handleExportCsv = () => {
    const filtered = getFilteredTransactions();
    exportTransactionsToCsv(filtered, activities, currencyCode);
    setSuccessMessage(`Fichier CSV téléchargé avec succès (${filtered.length} opérations).`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleOpenPdfReport = () => {
    const filtered = getFilteredTransactions();
    onOpenPrintReport(getRangeLabel(), filtered);
  };

  const handleExportJson = () => {
    exportFullBackupJson(transactions, activities, currencyCode);
    setSuccessMessage('Fichier de sauvegarde JSON téléchargé.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.transactions) && Array.isArray(json.activities)) {
          onImportBackup(json);
          setSuccessMessage('Sauvegarde restaurée avec succès !');
          setTimeout(() => setSuccessMessage(''), 4000);
        } else {
          alert('Format de fichier de sauvegarde invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  const filteredCount = getFilteredTransactions().length;

  return (
    <div className="space-y-4 pb-20">
      {/* Title */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">
          Exportation & Gestion des Données
        </h2>
        <p className="text-xs text-slate-400">
          Téléchargez vos rapports au format CSV ou PDF selon vos besoins
        </p>
      </div>

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Scope Filter for Exports */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Calendar size={14} className="text-emerald-400" />
          <span>Périmètre de l'exportation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Période temporelle
            </label>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as FilterPeriod)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="today">Aujourd'hui uniquement</option>
              <option value="week">7 derniers jours</option>
              <option value="month">Mois en cours</option>
              <option value="year">Année en cours</option>
              <option value="all">Tout l'historique</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Filtre par activité
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="all">Toutes les activités confondues</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-1">
          Opérations sélectionnées pour l'export :{' '}
          <strong className="text-emerald-400 font-mono">{filteredCount}</strong> / {transactions.length}
        </div>
      </div>

      {/* Export Options Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CSV Export Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Format Tableur (CSV)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Fichier universel compatible Microsoft Excel, Apple Numbers et Google Sheets avec encodage UTF-8 et caractères accentués.
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={filteredCount === 0}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              filteredCount > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Download size={15} />
            <span>Télécharger le fichier CSV</span>
          </button>
        </div>

        {/* PDF Export Card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Rapport Comptable (PDF)</h4>
              <p className="text-xs text-slate-400 mt-1">
                Génération d'un document structuré au format A4 avec en-tête officiel, bilan des activités et tableau d'opérations prêt à imprimer.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenPdfReport}
            disabled={filteredCount === 0}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              filteredCount > 0
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <FileText size={15} />
            <span>Générer le Rapport PDF</span>
          </button>
        </div>
      </div>

      {/* Backup & Data Administration */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database size={14} className="text-cyan-400" />
          <span>Sauvegarde & Gestion du Stockage Local</span>
        </h3>

        <p className="text-xs text-slate-400">
          Toutes vos transactions et activités sont enregistrées en toute sécurité dans la mémoire locale de votre appareil.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExportJson}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Sauvegarder tout en JSON</span>
          </button>

          <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer">
            <Upload size={14} />
            <span>Restaurer une sauvegarde</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser l\'application avec les données d\'exemple ?')) {
                onResetToDemo();
                setSuccessMessage('Données d\'exemple rechargées avec succès.');
                setTimeout(() => setSuccessMessage(''), 3000);
              }
            }}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Recharger les données de démonstration</span>
          </button>

          <button
            onClick={() => {
              if (confirm('ATTENTION : Voulez-vous vraiment effacer toutes les opérations et repartir de zéro ?')) {
                onClearAll();
                setSuccessMessage('Toutes les transactions ont été effacées.');
                setTimeout(() => setSuccessMessage(''), 3000);
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            <AlertTriangle size={13} />
            <span>Effacer tout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
