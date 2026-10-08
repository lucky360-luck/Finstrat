import React from 'react';
import { CalendarDays, Layers, BarChart3, FileSpreadsheet, Plus } from 'lucide-react';

export type NavTab = 'daily' | 'activities' | 'analytics' | 'export';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenAddModal: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
}) => {
  const tabs = [
    {
      id: 'daily' as NavTab,
      label: 'Quotidien',
      icon: CalendarDays,
    },
    {
      id: 'activities' as NavTab,
      label: 'Activités',
      icon: Layers,
    },
    {
      id: 'analytics' as NavTab,
      label: 'Graphiques',
      icon: BarChart3,
    },
    {
      id: 'export' as NavTab,
      label: 'Export',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 max-w-md mx-auto md:max-w-none md:static md:border-t-0 md:bg-transparent md:backdrop-blur-none">
      <div className="flex items-center justify-around relative">
        {/* Left 2 tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Center Quick Add Button (Prominent thumb zone action) */}
        <div className="flex flex-col items-center justify-center px-1">
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all -mt-4 border-2 border-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            title="Nouvelle opération"
            aria-label="Ajouter une transaction"
          >
            <Plus size={24} className="stroke-[2.6]" />
          </button>
          <span className="text-[10px] font-medium text-slate-400 mt-0.5">Ajouter</span>
        </div>

        {/* Right 2 tabs */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-tight mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
