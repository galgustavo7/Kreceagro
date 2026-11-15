import React, { useState } from 'react';
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  Drumstick,
  Flame,
  Gift,
  Landmark,
  ShieldCheck,
  Snowflake,
  Smartphone,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import {
  AppView,
  CreditCategory,
  CreditRecord,
  Installment,
  MerchantProfile,
  Supplier,
} from '../types/credit';
import { DemandZoneMap } from './DemandZoneMap';

interface HomeDashboardProps {
  merchant: MerchantProfile;
  credits: CreditRecord[];
  suppliers: Supplier[];
  availableLine: number;
  usedLine: number;
  onStartCreditRequest: (presetCategory?: CreditCategory, presetSupplier?: Supplier) => void;
  onNavigate: (view: AppView) => void;
  onPayInstallments: (items: Array<{ credit: CreditRecord; installment: Installment }>) => void;
  onOpenReferral: () => void;
  onOpenColdChainModal: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  merchant,
  credits,
  suppliers,
  availableLine,
  usedLine,
  onStartCreditRequest,
  onNavigate,
  onPayInstallments,
  onOpenReferral,
  onOpenColdChainModal,
}) => {
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedInstallmentKeys, setSelectedInstallmentKeys] = useState<string[]>([]);

  const activeCredits = credits.filter((c) => c.status === 'active');

  const upcomingInstallments: Array<{
    key: string;
    credit: CreditRecord;
    installment: Installment;
  }> = activeCredits
    .flatMap((credit) => {
      const nextUnpaid = credit.installments.find((i) => !i.paid);
      if (!nextUnpaid) return [];
      return [
        {
          key: `${credit.id}-${nextUnpaid.id}`,
          credit,
          installment: nextUnpaid,
        },
      ];
    })
    .slice(0, 4);

  const usedPercent = Math.min(100, Math.round((usedLine / merchant.creditLimit) * 100));

  const toggleSelectKey = (key: string) => {
    setSelectedInstallmentKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const selectedItems = upcomingInstallments.filter((u) =>
    selectedInstallmentKeys.includes(u.key)
  );
  const selectedTotal = selectedItems.reduce((acc, item) => acc + item.installment.amount, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-10">
      {/* Desktop & Mobile Hero Credit Line Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Línea disponible Card */}
          <section
            aria-label="Resumen de línea de crédito"
            className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] shadow-xs"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Línea disponible · {merchant.businessType}
                </p>
                <p className="mt-1 font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  ${availableLine.toLocaleString('es-VE')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('niveles')}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors tabular-nums cursor-pointer shrink-0"
              >
                {merchant.tierName} · {merchant.points} pts
              </button>
            </div>

            <div className="mt-6">
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.09] overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-600 dark:bg-[#00D1C1] transition-all duration-300"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                <span>Usado ${usedLine.toLocaleString('es-VE')}</span>
                <span>Límite ${merchant.creditLimit.toLocaleString('es-VE')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartCreditRequest()}
              className="mt-5 w-full min-h-[48px] rounded-2xl border border-slate-300 dark:border-white/[0.15] bg-slate-900 dark:bg-[#192224] hover:bg-slate-800 dark:hover:bg-[#1F2C2E] text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-teal-400 dark:text-[#00D1C1]" />
              <span>Usar mi línea para pedido avícola o porcícola</span>
            </button>
          </section>

          {/* Todo lo que puedes hacer */}
          <section aria-label="Acciones rápidas de financiamiento">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white mb-3.5">
              Todo lo que puedes hacer
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => onStartCreditRequest(CreditCategory.AVICOLA)}
                className="min-h-[88px] p-3 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center text-teal-600 dark:text-[#00D1C1]">
                  <Drumstick className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Pollo al Mayor
                  </span>
                  <span className="block text-[11px] text-teal-600 dark:text-[#00D1C1] font-medium tabular-nums mt-0.5">
                    $2.15/kg
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onStartCreditRequest(CreditCategory.PORCICOLA)}
                className="min-h-[88px] p-3 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/12 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Cortes Cerdo
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums mt-0.5">
                    $3.50/kg
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onStartCreditRequest(CreditCategory.MIXTO)}
                className="min-h-[88px] p-3 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/12 flex items-center justify-center text-sky-600 dark:text-sky-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Combo Mixto
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Abasto
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('creditos')}
                className="min-h-[88px] p-3 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/12 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Pago Móvil
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    Cuotas
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenColdChainModal}
                className="min-h-[88px] p-3 rounded-2xl bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/12 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    Cadena Frío
                  </span>
                  <span className="block text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    Protegida
                  </span>
                </div>
              </button>
            </div>
          </section>

          {/* Feature Promo Card: Repone tu cava hoy, paga en 14 días */}
          {showPromoBanner && (
            <section
              aria-label="Reposición rápida de inventario"
              className="relative rounded-3xl p-5 sm:p-6 overflow-hidden border border-teal-500/25 bg-gradient-to-r from-[#0B2D2B] via-[#0F1E1E] to-[#132623] text-white"
            >
              <button
                type="button"
                onClick={() => setShowPromoBanner(false)}
                aria-label="Ocultar aviso"
                className="absolute top-3 right-3 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div
                onClick={() => onStartCreditRequest(CreditCategory.MIXTO)}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer pr-6"
              >
                <div>
                  <p className="text-xs font-medium text-teal-300">
                    Reposición Express de Fin de Semana
                  </p>
                  <h3 className="mt-1 font-display text-lg sm:text-xl font-bold leading-snug text-balance">
                    Repone tu cava hoy. Paga en 14 días.
                  </h3>
                  <p className="mt-1 text-xs text-slate-300">
                    Despacho inmediato en mataderos de tu zona de alta demanda.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-start sm:items-center gap-2">
                  <div className="w-12 h-14 rounded-xl border-2 border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-300 tabular-nums">
                    <span>Hoy</span>
                    <span className="w-5 h-0.5 bg-emerald-400/70 rounded-full" />
                    <span>14 días</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Próximos pagos */}
          <section aria-label="Próximos pagos">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Próximos pagos
              </h2>
              {upcomingInstallments.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectMode((prev) => !prev);
                    setSelectedInstallmentKeys([]);
                  }}
                  className="min-h-[36px] px-2.5 text-sm font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
                >
                  {selectMode ? 'Cancelar' : 'Seleccionar'}
                </button>
              )}
            </div>

            {upcomingInstallments.length === 0 ? (
              <div className="rounded-2xl p-5 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] text-sm text-slate-500 dark:text-slate-400">
                No tienes cuotas pendientes próximas. Tu línea está al día.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingInstallments.map(({ key, credit, installment }) => {
                  const isSelected = selectedInstallmentKeys.includes(key);
                  return (
                    <div
                      key={key}
                      onClick={() =>
                        selectMode
                          ? toggleSelectKey(key)
                          : onPayInstallments([{ credit, installment }])
                      }
                      className={`rounded-2xl p-4 bg-white dark:bg-[#121718] border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 dark:border-[#00D1C1] bg-teal-50/40 dark:bg-teal-500/10'
                          : 'border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {selectMode ? (
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-teal-600 dark:bg-[#00D1C1] border-teal-600 dark:border-[#00D1C1] text-white dark:text-[#041413]'
                                : 'border-slate-300 dark:border-white/25'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" strokeWidth={2.8} />}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center text-teal-600 dark:text-[#00D1C1] shrink-0">
                            <Banknote className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {credit.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate tabular-nums">
                            {installment.dueLabel} · Cuota {installment.number} de{' '}
                            {credit.totalInstallments}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                          ${installment.amount}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}

                {selectMode && selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onPayInstallments(
                        selectedItems.map((item) => ({
                          credit: item.credit,
                          installment: item.installment,
                        }))
                      );
                      setSelectMode(false);
                      setSelectedInstallmentKeys([]);
                    }}
                    className="w-full min-h-[48px] mt-2 rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1EE2D2] text-white dark:text-[#041413] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer tabular-nums"
                  >
                    <span>
                      Pagar {selectedItems.length} cuota{selectedItems.length > 1 ? 's' : ''} ($
                      {selectedTotal})
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('creditos')}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-[#00D1C1] cursor-pointer"
                >
                  Ver todos los pagos
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column on Desktop / Continued Flow on Mobile */}
        <div className="lg:col-span-5 space-y-6">
          {/* Lo que tienes activo */}
          <section aria-label="Créditos activos">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Lo que tienes activo
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('creditos')}
                className="text-xs font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
              >
                Administrar
              </button>
            </div>

            <div className="space-y-2.5">
              {activeCredits.map((credit) => {
                const pct = Math.round(
                  (credit.paidInstallments / credit.totalInstallments) * 100
                );
                return (
                  <button
                    key={credit.id}
                    type="button"
                    onClick={() => onNavigate('creditos')}
                    className="w-full text-left rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {credit.title}
                      </span>
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                        ${credit.totalAmount}
                      </span>
                    </div>
                    <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 dark:bg-[#00D1C1]"
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>{credit.supplierName}</span>
                      <span>
                        {credit.paidInstallments} de {credit.totalInstallments} cuotas pagadas
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Nivel Platino */}
          <button
            type="button"
            onClick={() => onNavigate('niveles')}
            className="w-full text-left rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] hover:border-teal-500/40 flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full border-2 border-slate-300 dark:border-slate-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Krece {merchant.tierName} · {merchant.points} pts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Paga a tiempo y tu línea avícola puede llegar a $3,500+
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          {/* Proveedores aliados en tu zona */}
          <section aria-label="Proveedores aliados en tu zona">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Mataderos y granjas en tu zona
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('proveedores')}
                className="text-xs font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            <DemandZoneMap
              suppliers={suppliers}
              compact
              onSelectSupplier={(sup) =>
                onStartCreditRequest(
                  sup.category === 'porcicola'
                    ? CreditCategory.PORCICOLA
                    : CreditCategory.AVICOLA,
                  sup
                )
              }
            />

            <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {suppliers.slice(0, 5).map((sup) => (
                <button
                  key={sup.id}
                  type="button"
                  onClick={() =>
                    onStartCreditRequest(
                      sup.category === 'porcicola'
                        ? CreditCategory.PORCICOLA
                        : CreditCategory.AVICOLA,
                      sup
                    )
                  }
                  className="shrink-0 w-36 rounded-2xl p-3 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.07] hover:border-teal-500/50 text-left transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/15 flex items-center justify-center text-xs font-extrabold text-teal-700 dark:text-[#00D1C1] mb-2">
                    {sup.code}
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {sup.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {sup.distanceKm} km
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Refiere y gana */}
          <button
            type="button"
            onClick={onOpenReferral}
            className="w-full text-left rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] hover:border-teal-500/40 flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center text-teal-600 dark:text-[#00D1C1] shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Gana $15 por cada bodeguero referido
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Tu colega recibe un cupón en su primer lote de pollo o cerdo
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
