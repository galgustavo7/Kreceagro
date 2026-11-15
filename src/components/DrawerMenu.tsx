import React from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  ChevronRight,
  Database,
  FilePlus2,
  HelpCircle,
  Home,
  LogOut,
  Moon,
  ShoppingBag,
  Store,
  Sun,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { AppView, MerchantProfile } from '../types/credit';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenReferral: () => void;
  onOpenHelp: () => void;
  onOpenTutorial: () => void;
  onOpenBackup: () => void;
  onOpenProfileModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onSignOutOrAuth: () => void;
  isDemoMode: boolean;
  merchant: MerchantProfile;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onOpenReferral,
  onOpenHelp,
  onOpenTutorial,
  onOpenBackup,
  onOpenProfileModal,
  isDark,
  onToggleTheme,
  onSignOutOrAuth,
  isDemoMode,
  merchant,
}) => {
  if (!isOpen) return null;

  const handleNav = (view: AppView) => {
    onNavigate(view);
    onClose();
  };

  const menuItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'solicitar', label: 'Solicitar crédito', icon: <FilePlus2 className="w-5 h-5" /> },
    { id: 'creditos', label: 'Mis Créditos', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'niveles', label: 'Niveles', icon: <Award className="w-5 h-5" /> },
    { id: 'proveedores', label: 'Proveedores aliados', icon: <Store className="w-5 h-5" /> },
    { id: 'simulador', label: 'Simulador', icon: <Calculator className="w-5 h-5" /> },
    { id: 'cupones', label: 'Cupones', icon: <Ticket className="w-5 h-5" /> },
  ];

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label="Menú lateral"
        className="relative w-[84%] max-w-[330px] h-full bg-white dark:bg-[#0C1010] border-l border-slate-200 dark:border-white/[0.08] flex flex-col justify-between p-6 overflow-y-auto shadow-2xl"
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <span className="font-display text-3xl font-extrabold tracking-tight text-teal-600 dark:text-[#00D1C1]">
              KreceAgro
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar menú"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={`w-full min-h-[48px] flex items-center gap-3.5 px-3 rounded-xl text-[15px] font-medium transition-colors ${
                    active
                      ? 'text-teal-600 dark:text-[#00D1C1] bg-teal-50 dark:bg-teal-500/10'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReferral();
              }}
              className="w-full min-h-[48px] flex items-center gap-3.5 px-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Refiere y gana</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHelp();
              }}
              className="w-full min-h-[48px] flex items-center gap-3.5 px-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Ayuda</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="w-full min-h-[48px] flex items-center gap-3.5 px-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Ver tutorial</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBackup();
              }}
              className="w-full min-h-[48px] flex items-center gap-3.5 px-3 rounded-xl text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <Database className="w-5 h-5" />
              <span>Respaldo SQL</span>
            </button>
          </div>
        </div>

        <div className="pt-6 space-y-4 border-t border-slate-200 dark:border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfileModal();
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#141819] text-left"
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
                  {merchant.tierName} · {merchant.businessName}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={onToggleTheme}
              className="min-h-[44px] flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {isDark ? <Moon className="w-4 h-4 text-teal-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{isDark ? 'Oscuro' : 'Claro'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOutOrAuth();
              }}
              className="min-h-[44px] flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isDemoMode ? 'Iniciar sesión' : 'Salir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
