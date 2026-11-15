import React from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  ChevronRight,
  FilePlus2,
  HelpCircle,
  Home,
  Moon,
  Plus,
  ShoppingBag,
  Store,
  Sun,
  Ticket,
  Users,
} from 'lucide-react';
import { AppView, MerchantProfile } from '../types/credit';

interface DesktopSidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenRequestModal: () => void;
  onOpenReferral: () => void;
  onOpenHelp: () => void;
  onOpenTutorial: () => void;
  onOpenProfileModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  merchant: MerchantProfile;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentView,
  onNavigate,
  onOpenRequestModal,
  onOpenReferral,
  onOpenHelp,
  onOpenTutorial,
  onOpenProfileModal,
  isDark,
  onToggleTheme,
  merchant,
}) => {
  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    { id: 'solicitar', label: 'Formulario de solicitud', icon: <FilePlus2 className="w-4 h-4" /> },
    { id: 'creditos', label: 'Mis Créditos', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'niveles', label: 'Niveles', icon: <Award className="w-4 h-4" /> },
    { id: 'proveedores', label: 'Proveedores aliados', icon: <Store className="w-4 h-4" /> },
    { id: 'simulador', label: 'Simulador', icon: <Calculator className="w-4 h-4" /> },
    { id: 'cupones', label: 'Cupones', icon: <Ticket className="w-4 h-4" /> },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 border-r border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0E0E] px-5 py-6 justify-between z-30">
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
          <span className="font-display text-2xl font-extrabold tracking-tight text-teal-600 dark:text-[#00D1C1]">
            KreceAgro
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenRequestModal}
          className="w-full min-h-[44px] mb-6 flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#19E3D3] text-white dark:text-[#041413] font-semibold text-sm transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="whitespace-nowrap">Solicitar crédito</span>
        </button>

        <nav className="space-y-1" aria-label="Menú principal de escritorio">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-500/12 text-teal-700 dark:text-[#00D1C1]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.07] space-y-1">
            <button
              type="button"
              onClick={onOpenReferral}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span className="whitespace-nowrap">Refiere y gana</span>
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">Ayuda</span>
            </button>
            <button
              type="button"
              onClick={onOpenTutorial}
              className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span className="whitespace-nowrap">Ver tutorial</span>
            </button>
          </div>
        </nav>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#121617] hover:border-teal-500/40 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
              {merchant.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {merchant.firstName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {merchant.tierName} · {merchant.businessType}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className="min-h-[40px] flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-teal-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
