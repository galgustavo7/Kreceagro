import React from 'react';
import { FilePlus2, Home, Menu, ShoppingBag, Store } from 'lucide-react';
import { AppView } from '../types/credit';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenMenu,
  isMenuOpen,
}) => {
  const isTabActive = (tab: AppView) => !isMenuOpen && currentView === tab;

  return (
    <nav
      aria-label="Navegación principal"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-white/[0.08] bg-white/92 dark:bg-[#0B0F0F]/92 backdrop-blur-md"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        <button
          type="button"
          onClick={() => onNavigate('inicio')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl ${
            isTabActive('inicio')
              ? 'text-teal-600 dark:text-[#00D1C1]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={isTabActive('inicio') ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium whitespace-nowrap">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('solicitar')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl ${
            isTabActive('solicitar')
              ? 'text-teal-600 dark:text-[#00D1C1]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FilePlus2 className="w-5 h-5" strokeWidth={isTabActive('solicitar') ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium whitespace-nowrap">Solicitar</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('creditos')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl ${
            isTabActive('creditos')
              ? 'text-teal-600 dark:text-[#00D1C1]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={isTabActive('creditos') ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium whitespace-nowrap">Créditos</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('proveedores')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl ${
            isTabActive('proveedores')
              ? 'text-teal-600 dark:text-[#00D1C1]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Store className="w-5 h-5" strokeWidth={isTabActive('proveedores') ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium whitespace-nowrap">Aliados</span>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-xl ${
            isMenuOpen
              ? 'text-teal-600 dark:text-[#00D1C1]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" strokeWidth={isMenuOpen ? 2.4 : 1.8} />
          <span className="text-[10px] font-medium whitespace-nowrap">Menú</span>
        </button>
      </div>
    </nav>
  );
};
