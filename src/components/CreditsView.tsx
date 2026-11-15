import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Drumstick,
  FileText,
  Flame,
  QrCode,
  ShieldCheck,
  Snowflake,
} from 'lucide-react';
import { CreditCategory, CreditRecord, Installment } from '../types/credit';

interface CreditsViewProps {
  credits: CreditRecord[];
  onPayInstallment: (credit: CreditRecord, installment: Installment) => void;
  onOpenContract: (credit: CreditRecord) => void;
  onOpenDispatchQr: (credit: CreditRecord) => void;
  onToggleColdInsurance: (creditId: string) => void;
  onRequestNewCredit: () => void;
}

export const CreditsView: React.FC<CreditsViewProps> = ({
  credits,
  onPayInstallment,
  onOpenContract,
  onOpenDispatchQr,
  onToggleColdInsurance,
  onRequestNewCredit,
}) => {
  const [statusTab, setStatusTab] = useState<'active' | 'completed'>('active');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CreditCategory>('all');
  const [expandedCreditId, setExpandedCreditId] = useState<string | null>(null);

  const filteredCredits = credits.filter((credit) => {
    const matchesStatus = credit.status === statusTab;
    const matchesCategory =
      categoryFilter === 'all' || credit.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const getCategoryIcon = (cat: CreditCategory) => {
    if (cat === CreditCategory.AVICOLA) return <Drumstick className="w-5 h-5" />;
    if (cat === CreditCategory.PORCICOLA) return <Flame className="w-5 h-5" />;
    return <Snowflake className="w-5 h-5" />;
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-10">
      {/* Activa / Historial Top Tabs */}
      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setStatusTab('active')}
          className={`min-h-[46px] text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            statusTab === 'active'
              ? 'border-teal-600 dark:border-[#00D1C1] text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Activos
        </button>
        <button
          type="button"
          onClick={() => setStatusTab('completed')}
          className={`min-h-[46px] text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            statusTab === 'completed'
              ? 'border-teal-600 dark:border-[#00D1C1] text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Historial
        </button>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'Todos' },
          { id: CreditCategory.AVICOLA, label: 'Avícola' },
          { id: CreditCategory.PORCICOLA, label: 'Porcícola' },
          { id: CreditCategory.CAPITAL, label: 'Cadena Frío' },
        ].map((item) => {
          const active = categoryFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategoryFilter(item.id as 'all' | CreditCategory)}
              className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                active
                  ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                  : 'bg-white dark:bg-[#121718] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.1] hover:border-teal-500/40'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Credit Cards List */}
      {filteredCredits.length === 0 ? (
        <div className="rounded-3xl p-8 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] text-center space-y-3">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-white">
            No hay créditos en esta categoría
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Solicita un nuevo lote de pollo o cerdo con tu línea disponible para abastecer tu negocio.
          </p>
          <button
            type="button"
            onClick={onRequestNewCredit}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] font-semibold text-sm cursor-pointer"
          >
            Solicitar crédito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCredits.map((credit) => {
            const isExpanded = expandedCreditId === credit.id;
            const nextInstallment = credit.installments.find((i) => !i.paid);
            const progressPct = Math.round(
              (credit.paidAmount / credit.totalAmount) * 100
            );

            return (
              <article
                key={credit.id}
                className="rounded-3xl p-5 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-500/12 flex items-center justify-center text-teal-600 dark:text-[#00D1C1] shrink-0">
                        {getCategoryIcon(credit.category)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {credit.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate tabular-nums">
                          {credit.paidInstallments} de {credit.totalInstallments} cuotas pagadas ·{' '}
                          {credit.supplierName}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0 tabular-nums">
                      {credit.status === 'active'
                        ? `Vence ${credit.nextDueDate}`
                        : 'Finalizado'}
                    </span>
                  </div>

                  {/* Interactive Action Rows inside Card */}
                  <div className="divide-y divide-slate-100 dark:divide-white/[0.06] border-y border-slate-100 dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => onOpenDispatchQr(credit)}
                      className="w-full min-h-[44px] flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-[#00D1C1] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <QrCode className="w-4 h-4 text-slate-400" />
                        <span>Orden de despacho / QR en matadero</span>
                      </span>
                      <span className="font-semibold text-teal-600 dark:text-[#00D1C1]">
                        Ver
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleColdInsurance(credit.id)}
                      className="w-full min-h-[44px] flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-[#00D1C1] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>Seguro Cadena de Frío</span>
                      </span>
                      <span
                        className={`font-semibold ${
                          credit.coldChainInsured
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-teal-600 dark:text-[#00D1C1]'
                        }`}
                      >
                        {credit.coldChainInsured ? 'Activo' : 'Solicitar'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenContract(credit)}
                      className="w-full min-h-[44px] flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-[#00D1C1] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span>Contrato digital · {credit.contractCode}</span>
                      </span>
                      <span className="font-semibold text-teal-600 dark:text-[#00D1C1]">
                        Ver
                      </span>
                    </button>
                  </div>

                  {/* Pagado vs Restante */}
                  <div>
                    <div className="flex items-end justify-between text-xs mb-2">
                      <div>
                        <span className="block text-[11px] font-medium text-slate-400">
                          Pagado
                        </span>
                        <span className="font-mono text-base font-bold text-teal-600 dark:text-[#00D1C1] tabular-nums">
                          ${credit.paidAmount}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[11px] font-medium text-slate-400">
                          Restante
                        </span>
                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums">
                          ${credit.remainingAmount}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal-600 dark:bg-[#00D1C1] transition-all duration-300"
                        style={{ width: `${Math.max(3, progressPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expandable Installment Schedule */}
                {isExpanded && (
                  <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Zona: {credit.zone}</span>
                      {credit.weightKg && (
                        <span className="tabular-nums">
                          Lote: {credit.weightKg} kg · Margen est. {credit.estimatedMarginPct}%
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {credit.installments.map((inst) => (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] text-xs"
                        >
                          <div className="tabular-nums">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Cuota {inst.number}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 ml-2">
                              {inst.paid ? `Pagada el ${inst.paidDate}` : inst.dueLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 tabular-nums">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              ${inst.amount}
                            </span>
                            {inst.paid ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                Pagada
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onPayInstallment(credit, inst)}
                                className="font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
                              >
                                Pagar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Footer Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedCreditId(isExpanded ? null : credit.id)
                    }
                    className="min-h-[40px] flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-[#00D1C1] hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {nextInstallment ? (
                    <button
                      type="button"
                      onClick={() => onPayInstallment(credit, nextInstallment)}
                      className="min-h-[40px] px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1]/15 dark:hover:bg-[#00D1C1]/25 text-white dark:text-[#00D1C1] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Pagar cuota (${nextInstallment.amount})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Crédito saldado
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
