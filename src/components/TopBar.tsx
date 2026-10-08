import React, { useState } from 'react';
import { CurrencyCode } from '../types/finance';
import { CURRENCIES } from '../utils/formatters';
import { Smartphone, Monitor, ChevronDown, Check } from 'lucide-react';

interface TopBarProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  activeTab: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentCurrency,
  onCurrencyChange,
  isMobileFrame,
  onToggleMobileFrame,
  activeTab,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'daily':
        return 'Journal Quotidien';
      case 'activities':
        return 'Activités & Budgets';
      case 'analytics':
        return 'Analytique & Graphiques';
      case 'export':
        return 'Rapports & Export';
      default:
        return 'FinStrat';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between text-slate-100 transition-colors">
      {/* Zone 1: Brand & View Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-tight shadow-sm">
          FS
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">
            {getTabTitle()}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            FinStrat
          </p>
        </div>
      </div>

      {/* Zone 2: Actions (Devise & Switcher Plein écran / Mobile Frame) */}
      <div className="flex items-center gap-2">
        {/* Currency Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors min-h-[36px]"
            title="Changer la devise"
          >
            <span>{CURRENCIES[currentCurrency].symbol}</span>
            <span className="text-[10px] text-slate-400">{currentCurrency}</span>
            <ChevronDown size={12} className="text-slate-400 ml-0.5" />
          </button>

          {showCurrencyDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCurrencyDropdown(false)}
              />
              <div className="absolute right-0 mt-1.5 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Devise de compte
                </div>
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCurrencyChange(c.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                      currentCurrency === c.code
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    {currentCurrency === c.code && <Check size={14} className="text-emerald-400 ml-2" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop View Switcher (Simulateur smartphone vs Plein écran fluide) */}
        <button
          onClick={onToggleMobileFrame}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition-colors min-h-[36px]"
          title={isMobileFrame ? 'Passer en plein écran' : 'Passer en vue mobile'}
        >
          {isMobileFrame ? (
            <>
              <Monitor size={14} className="text-slate-400" />
              <span className="text-[11px]">Écran large</span>
            </>
          ) : (
            <>
              <Smartphone size={14} className="text-emerald-400" />
              <span className="text-[11px]">Format Mobile</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
