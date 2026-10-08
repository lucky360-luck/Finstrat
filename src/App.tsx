import React, { useState, useEffect } from 'react';
import { Activity, CurrencyCode, Transaction } from './types/finance';
import { getInitialTransactions, INITIAL_ACTIVITIES } from './data/initialData';
import { getTodayIso } from './utils/formatters';
import { TopBar } from './components/TopBar';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { DailyView } from './components/DailyView';
import { ActivitiesBudgetView } from './components/ActivitiesBudgetView';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { ExportView } from './components/ExportView';
import { TransactionModal } from './components/TransactionModal';
import { ActivityModal } from './components/ActivityModal';
import { PrintReportModal } from './components/PrintReportModal';
import { CheckCircle2, Smartphone } from 'lucide-react';

const STORAGE_KEY_TX = 'finstrat_transactions_v1';
const STORAGE_KEY_ACT = 'finstrat_activities_v1';
const STORAGE_KEY_CURRENCY = 'finstrat_currency_v1';
const STORAGE_KEY_FRAME = 'finstrat_mobile_frame_v1';

export default function App() {
  // 1. Initial State from localStorage or initial seed
  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACT) || localStorage.getItem('kauri_activities_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load activities', e);
    }
    return INITIAL_ACTIVITIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX) || localStorage.getItem('kauri_transactions_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transactions', e);
    }
    return getInitialTransactions();
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = (localStorage.getItem(STORAGE_KEY_CURRENCY) || localStorage.getItem('kauri_currency_v2')) as CurrencyCode;
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to load currency', e);
    }
    return 'EUR';
  });

  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FRAME) ?? localStorage.getItem('kauri_mobile_frame_v2');
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error('Failed to load mobile frame preference', e);
    }
    return false;
  });

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<NavTab>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState<{ label: string; filteredList: Transaction[] }>({
    label: 'Ce mois-ci',
    filteredList: [],
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACT, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENCY, currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FRAME, String(isMobileFrame));
  }, [isMobileFrame]);

  // Toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Transaction Actions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === existingId
            ? { ...t, ...txData }
            : t
        )
      );
      showToast('Opération mise à jour');
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      // Also update selectedDate to match transaction date so the user immediately sees it
      setSelectedDate(txData.date);
      showToast(txData.type === 'income' ? 'Entrée enregistrée (+)' : 'Sortie enregistrée (-)');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Opération supprimée');
  };

  // Activity Actions
  const handleSaveActivity = (
    actData: Omit<Activity, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setActivities((prev) =>
        prev.map((a) =>
          a.id === existingId
            ? { ...a, ...actData }
            : a
        )
      );
      showToast('Activité mise à jour');
    } else {
      const newAct: Activity = {
        ...actData,
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      };
      setActivities((prev) => [...prev, newAct]);
      showToast('Nouvelle activité créée');
    }
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast('Activité supprimée');
  };

  // Reset & Clear
  const handleResetToDemo = () => {
    setActivities(INITIAL_ACTIVITIES);
    setTransactions(getInitialTransactions());
    setSelectedDate(getTodayIso());
    showToast('Données de démonstration restaurées');
  };

  const handleClearAll = () => {
    setTransactions([]);
    showToast('Toutes les transactions ont été effacées');
  };

  const handleImportBackup = (data: {
    activities: Activity[];
    transactions: Transaction[];
    currencyCode?: CurrencyCode;
  }) => {
    if (Array.isArray(data.activities)) setActivities(data.activities);
    if (Array.isArray(data.transactions)) setTransactions(data.transactions);
    if (data.currencyCode) setCurrency(data.currencyCode);
    showToast('Sauvegarde importée avec succès');
  };

  // Print Report Opener
  const handleOpenPrintReport = (label: string, filteredList: Transaction[]) => {
    setPrintData({ label, filteredList });
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Full width on mobile, or clean centered device shell on desktop */}
      <div
        className={`w-full min-h-screen flex flex-col transition-all ${
          isMobileFrame
            ? 'max-w-[420px] my-4 md:my-8 rounded-[40px] border-[6px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-950'
            : 'max-w-2xl bg-slate-950 sm:border-x sm:border-slate-800/80 shadow-2xl'
        }`}
      >
        {/* Mobile Mockup Top Notch if Mobile Frame is active */}
        {isMobileFrame && (
          <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0 border-b border-slate-800/60">
            <div className="w-24 h-3.5 bg-slate-950 rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          </div>
        )}

        {/* Top App Bar */}
        <TopBar
          currentCurrency={currency}
          onCurrencyChange={setCurrency}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          activeTab={activeTab}
        />

        {/* Scrollable Tab Content Container */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'daily' && (
            <DailyView
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              transactions={transactions}
              activities={activities}
              currencyCode={currency}
              onOpenAddModal={() => {
                setTransactionToEdit(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setTransactionToEdit(tx);
                setIsTxModalOpen(true);
              }}
              onOpenAddActivity={() => {
                setActivityToEdit(null);
                setIsActModalOpen(true);
              }}
              onEditActivity={(act) => {
                setActivityToEdit(act);
                setIsActModalOpen(true);
              }}
            />
          )}

          {activeTab === 'activities' && (
            <ActivitiesBudgetView
              activities={activities}
              transactions={transactions}
              currencyCode={currency}
              onOpenAddActivity={() => {
                setActivityToEdit(null);
                setIsActModalOpen(true);
              }}
              onEditActivity={(act) => {
                setActivityToEdit(act);
                setIsActModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsChartsView
              transactions={transactions}
              activities={activities}
              currencyCode={currency}
            />
          )}

          {activeTab === 'export' && (
            <ExportView
              transactions={transactions}
              activities={activities}
              currencyCode={currency}
              onOpenPrintReport={handleOpenPrintReport}
              onResetToDemo={handleResetToDemo}
              onClearAll={handleClearAll}
              onImportBackup={handleImportBackup}
            />
          )}
        </main>

        {/* Bottom Nav Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddModal={() => {
            setTransactionToEdit(null);
            setIsTxModalOpen(true);
          }}
        />
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        transactionToEdit={transactionToEdit}
        activities={activities}
        currencyCode={currency}
        defaultDate={selectedDate}
        onOpenAddActivity={() => {
          setActivityToEdit(null);
          setIsActModalOpen(true);
        }}
        onEditActivity={(act) => {
          setActivityToEdit(act);
          setIsActModalOpen(true);
        }}
      />

      {/* Activity Modal (Add / Edit) */}
      <ActivityModal
        isOpen={isActModalOpen}
        onClose={() => setIsActModalOpen(false)}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
        activityToEdit={activityToEdit}
        currencyCode={currency}
      />

      {/* Printable PDF Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        transactions={printData.filteredList.length > 0 ? printData.filteredList : transactions}
        activities={activities}
        currencyCode={currency}
        dateRangeLabel={printData.label}
      />
    </div>
  );
}
