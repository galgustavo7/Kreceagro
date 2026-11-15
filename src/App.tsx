import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import {
  INITIAL_COUPONS,
  INITIAL_CREDITS,
  INITIAL_MERCHANT,
  SUPPLIERS_DATA,
} from './data/initialData';
import {
  AppView,
  BusinessType,
  ColdChainType,
  Coupon,
  CreditCategory,
  CreditRecord,
  Installment,
  MerchantProfile,
  Supplier,
} from './types/credit';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DrawerMenu } from './components/DrawerMenu';
import { HomeDashboard } from './components/HomeDashboard';
import { CreditsView } from './components/CreditsView';
import { SuppliersView } from './components/SuppliersView';
import { LevelsView } from './components/LevelsView';
import { SimulatorView } from './components/SimulatorView';
import { CouponsView } from './components/CouponsView';
import { CreditRequestFormView } from './components/CreditRequestFormView';
import { PaymentModal } from './components/PaymentModal';
import {
  ColdChainModal,
  ContractModal,
  DispatchQrModal,
  HelpModal,
  ReferralModal,
  TutorialModal,
} from './components/UtilityModals';

const STORAGE_KEY = 'krece_agro_state_v1';

interface PersistedState {
  merchant: MerchantProfile;
  credits: CreditRecord[];
  coupons: Coupon[];
  isDark: boolean;
}

export default function App() {
  const [state, setState] = useState<PersistedState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as PersistedState;
      }
    } catch {
      // ignore storage errors
    }
    return {
      merchant: INITIAL_MERCHANT,
      credits: INITIAL_CREDITS,
      coupons: INITIAL_COUPONS,
      isDark: true,
    };
  });

  const [currentView, setCurrentView] = useState<AppView>('inicio');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Request Form Preset state
  const [presetCategory, setPresetCategory] = useState<CreditCategory | undefined>();
  const [presetSupplier, setPresetSupplier] = useState<Supplier | undefined>();
  const [presetAmount, setPresetAmount] = useState<number | undefined>();
  const [presetWeeks, setPresetWeeks] = useState<number | undefined>();

  // Payment & Utility Modals
  const [paymentItems, setPaymentItems] = useState<
    Array<{ credit: CreditRecord; installment: Installment }>
  >([]);
  const [contractCredit, setContractCredit] = useState<CreditRecord | null>(null);
  const [dispatchCredit, setDispatchCredit] = useState<CreditRecord | null>(null);
  const [referralOpen, setReferralOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [coldChainOpen, setColdChainOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.isDark]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const usedLine = useMemo(() => {
    return state.credits
      .filter((c) => c.status === 'active')
      .reduce((acc, c) => acc + c.remainingAmount, 0);
  }, [state.credits]);

  const availableLine = Math.max(0, state.merchant.creditLimit - usedLine);

  const handleOpenRequestModal = (
    category?: CreditCategory,
    supplier?: Supplier,
    amount?: number,
    weeks?: number
  ) => {
    setPresetCategory(category);
    setPresetSupplier(supplier);
    setPresetAmount(amount);
    setPresetWeeks(weeks);
    setCurrentView('solicitar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateCredit = (newCredit: CreditRecord, usedCouponId?: string) => {
    setState((prev) => ({
      ...prev,
      credits: [newCredit, ...prev.credits],
      coupons: usedCouponId
        ? prev.coupons.map((c) =>
            c.id === usedCouponId ? { ...c, status: 'used' as const } : c
          )
        : prev.coupons,
      merchant: {
        ...prev.merchant,
        points: prev.merchant.points + 35,
      },
    }));
  };

  const handleConfirmPayments = (
    paidItems: Array<{ creditId: string; installmentId: string; amount: number }>
  ) => {
    const todayLabel = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
    });

    setState((prev) => {
      const updatedCredits = prev.credits.map((credit) => {
        const matchingPaid = paidItems.filter((p) => p.creditId === credit.id);
        if (matchingPaid.length === 0) return credit;

        const paidIds = new Set(matchingPaid.map((p) => p.installmentId));
        const newInstallments = credit.installments.map((inst) =>
          paidIds.has(inst.id) ? { ...inst, paid: true, paidDate: todayLabel } : inst
        );

        const paidCount = newInstallments.filter((i) => i.paid).length;
        const paidSum = newInstallments
          .filter((i) => i.paid)
          .reduce((acc, i) => acc + i.amount, 0);
        const remainingSum = Math.max(0, credit.totalAmount - paidSum);
        const nextUnpaid = newInstallments.find((i) => !i.paid);

        return {
          ...credit,
          installments: newInstallments,
          paidInstallments: paidCount,
          paidAmount: paidSum,
          remainingAmount: remainingSum,
          nextDueDate: nextUnpaid
            ? nextUnpaid.dueLabel.split('· ')[1] || nextUnpaid.dueLabel
            : 'Pagado',
          status: remainingSum === 0 ? ('completed' as const) : ('active' as const),
        };
      });

      return {
        ...prev,
        credits: updatedCredits,
        merchant: {
          ...prev.merchant,
          points: prev.merchant.points + paidItems.length * 18,
        },
      };
    });
  };

  const handleToggleColdInsurance = (creditId: string) => {
    setState((prev) => ({
      ...prev,
      credits: prev.credits.map((c) =>
        c.id === creditId ? { ...c, coldChainInsured: !c.coldChainInsured } : c
      ),
    }));
  };

  const handleSwitchDemoRole = () => {
    const order = [
      BusinessType.BODEGA,
      BusinessType.ABASTO,
      BusinessType.REVENDEDOR,
      BusinessType.FRIGORIFICO,
    ];
    const currentIndex = order.indexOf(state.merchant.businessType);
    const nextRole = order[(currentIndex + 1) % order.length];
    setState((prev) => ({
      ...prev,
      merchant: {
        ...prev.merchant,
        businessType: nextRole,
      },
    }));
  };

  const viewTitles: Record<AppView, string> = {
    inicio: `Hola, ${state.merchant.firstName}`,
    solicitar: 'Solicitud de crédito',
    creditos: `Hola, ${state.merchant.firstName}`,
    proveedores: `Hola, ${state.merchant.firstName}`,
    niveles: 'Mi nivel KreceAgro',
    simulador: 'Simulador avícola y porcícola',
    cupones: 'Mis cupones',
  };

  return (
    <div className="min-h-screen bg-[#F4F7F7] dark:bg-[#080B0B] text-slate-900 dark:text-slate-100 relative">
      {/* Subtle top teal aurora gradient matching the Krece app */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-teal-500/12 via-teal-500/4 to-transparent dark:from-[#0C4442]/45 dark:via-[#091F1F]/20 dark:to-transparent z-0"
      />

      <DesktopSidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenRequestModal={() => handleOpenRequestModal()}
        onOpenReferral={() => setReferralOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        isDark={state.isDark}
        onToggleTheme={() =>
          setState((prev) => ({ ...prev, isDark: !prev.isDark }))
        }
        merchant={state.merchant}
      />

      <div className="lg:pl-72 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          {/* Compact Top App Bar */}
          <header className="flex items-center justify-between gap-4 pb-5">
            <div className="min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {viewTitles[currentView]}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {state.merchant.businessName} · {state.merchant.zone}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('niveles')}
              aria-label={`Ver nivel y puntos: ${state.merchant.points} puntos`}
              className="min-h-[42px] px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141A1B] border border-slate-200 dark:border-white/[0.12] flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white shadow-xs hover:border-teal-500/50 transition-colors shrink-0 cursor-pointer tabular-nums"
            >
              <span className="w-4 h-4 rounded-full border-2 border-teal-500 dark:border-[#00D1C1]" />
              <span>{state.merchant.points} pts</span>
            </button>
          </header>

          {/* Main Active View */}
          <main>
            {currentView === 'inicio' && (
              <HomeDashboard
                merchant={state.merchant}
                credits={state.credits}
                suppliers={SUPPLIERS_DATA}
                availableLine={availableLine}
                usedLine={usedLine}
                onStartCreditRequest={(cat, sup) =>
                  handleOpenRequestModal(cat, sup)
                }
                onNavigate={setCurrentView}
                onPayInstallments={(items) => setPaymentItems(items)}
                onOpenReferral={() => setReferralOpen(true)}
                onOpenColdChainModal={() => setColdChainOpen(true)}
              />
            )}

            {currentView === 'solicitar' && (
              <CreditRequestFormView
                merchant={state.merchant}
                suppliers={SUPPLIERS_DATA}
                coupons={state.coupons}
                availableLine={availableLine}
                presetCategory={presetCategory}
                presetSupplier={presetSupplier}
                presetAmount={presetAmount}
                presetWeeks={presetWeeks}
                onSubmitCredit={handleCreateCredit}
                onDoneNavigate={() => setCurrentView('creditos')}
              />
            )}

            {currentView === 'creditos' && (
              <CreditsView
                credits={state.credits}
                onPayInstallment={(credit, installment) =>
                  setPaymentItems([{ credit, installment }])
                }
                onOpenContract={(credit) => setContractCredit(credit)}
                onOpenDispatchQr={(credit) => setDispatchCredit(credit)}
                onToggleColdInsurance={handleToggleColdInsurance}
                onRequestNewCredit={() => handleOpenRequestModal()}
              />
            )}

            {currentView === 'proveedores' && (
              <SuppliersView
                suppliers={SUPPLIERS_DATA}
                onRequestAtSupplier={(cat, sup) =>
                  handleOpenRequestModal(cat, sup)
                }
              />
            )}

            {currentView === 'niveles' && (
              <LevelsView
                merchant={state.merchant}
                onBack={() => setCurrentView('inicio')}
              />
            )}

            {currentView === 'simulador' && (
              <SimulatorView
                availableLine={availableLine}
                onProceedToRequest={(cat, amount, weeks) =>
                  handleOpenRequestModal(cat, undefined, amount, weeks)
                }
              />
            )}

            {currentView === 'cupones' && (
              <CouponsView
                coupons={state.coupons}
                onApplyCoupon={(coupon) =>
                  handleOpenRequestModal(
                    coupon.categoryFilter === 'all'
                      ? CreditCategory.AVICOLA
                      : coupon.categoryFilter
                  )
                }
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => {
          setIsDrawerOpen(false);
          setCurrentView(view);
        }}
        onOpenMenu={() => setIsDrawerOpen(true)}
        isMenuOpen={isDrawerOpen}
      />

      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenReferral={() => setReferralOpen(true)}
        onOpenHelp={() => setHelpOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        isDark={state.isDark}
        onToggleTheme={() =>
          setState((prev) => ({ ...prev, isDark: !prev.isDark }))
        }
        onSwitchDemoRole={handleSwitchDemoRole}
        merchant={state.merchant}
      />

      {/* Modals */}
      <PaymentModal
        items={paymentItems}
        onClose={() => setPaymentItems([])}
        onConfirmPayment={handleConfirmPayments}
      />

      <ContractModal
        credit={contractCredit}
        merchant={state.merchant}
        onClose={() => setContractCredit(null)}
      />

      <DispatchQrModal
        credit={dispatchCredit}
        onClose={() => setDispatchCredit(null)}
      />

      <ReferralModal
        isOpen={referralOpen}
        referralCode={state.merchant.referralCode}
        onClose={() => setReferralOpen(false)}
      />

      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <TutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />

      <ColdChainModal
        isOpen={coldChainOpen}
        merchant={state.merchant}
        onClose={() => setColdChainOpen(false)}
      />

      {/* Merchant Profile Edit Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#0E1314] border border-slate-200 dark:border-white/[0.1] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Perfil comercial
              </h2>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                aria-label="Cerrar perfil"
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Nombre del comercio
                </label>
                <input
                  type="text"
                  value={state.merchant.businessName}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      merchant: { ...prev.merchant, businessName: e.target.value },
                    }))
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Modalidad de negocio
                </label>
                <select
                  value={state.merchant.businessType}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      merchant: {
                        ...prev.merchant,
                        businessType: e.target.value as BusinessType,
                      },
                    }))
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                >
                  {Object.values(BusinessType).map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Zona de demanda local
                </label>
                <input
                  type="text"
                  value={state.merchant.zone}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      merchant: { ...prev.merchant, zone: e.target.value },
                    }))
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Infraestructura de frío
                </label>
                <select
                  value={state.merchant.coldChain}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      merchant: {
                        ...prev.merchant,
                        coldChain: e.target.value as ColdChainType,
                      },
                    }))
                  }
                  className="w-full min-h-[44px] px-3.5 rounded-xl bg-slate-50 dark:bg-[#141A1C] border border-slate-200 dark:border-white/[0.1] text-sm text-slate-900 dark:text-white"
                >
                  {Object.values(ColdChainType).map((cc) => (
                    <option key={cc} value={cc}>
                      {cc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              className="w-full min-h-[46px] rounded-2xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-bold text-sm cursor-pointer"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
