import React, { useState } from 'react';
import { ArrowRight, Calculator, Drumstick, Flame, TrendingUp } from 'lucide-react';
import { CreditCategory } from '../types/credit';

interface SimulatorViewProps {
  availableLine: number;
  onProceedToRequest: (category: CreditCategory, amount: number, weeks: number) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  availableLine,
  onProceedToRequest,
}) => {
  const [category, setCategory] = useState<CreditCategory>(CreditCategory.AVICOLA);
  const [kgVolume, setKgVolume] = useState(120);
  const [weeks, setWeeks] = useState(3);

  const wholesalePrice =
    category === CreditCategory.AVICOLA
      ? 2.15
      : category === CreditCategory.PORCICOLA
      ? 3.6
      : 2.85;

  const retailPrice =
    category === CreditCategory.AVICOLA
      ? 3.1
      : category === CreditCategory.PORCICOLA
      ? 5.15
      : 4.1;

  const lotTotal = Math.round(kgVolume * wholesalePrice);
  const initialPayment = Math.round(lotTotal * 0.15);
  const financedAmount = lotTotal - initialPayment;
  const serviceFee = Math.round(financedAmount * (weeks * 0.025));
  const totalFinancedWithFee = financedAmount + serviceFee;
  const weeklyInstallment = Math.round(totalFinancedWithFee / weeks);

  const projectedRevenue = Math.round(kgVolume * retailPrice);
  const netProfit = projectedRevenue - lotTotal - serviceFee;
  const roiPct = Math.round((netProfit / lotTotal) * 100);

  return (
    <div className="space-y-6 pb-24 lg:pb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-[#00D1C1]">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Simulador de Rentabilidad y Cuotas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calcula tu inversión por kilo, cuota semanal y ganancia en tu zona
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-5 rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08]">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              1. Selecciona el rubro a abastecer
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: CreditCategory.AVICOLA,
                  label: 'Avícola',
                  sub: '$2.15/kg',
                  icon: <Drumstick className="w-4 h-4" />,
                },
                {
                  id: CreditCategory.PORCICOLA,
                  label: 'Porcícola',
                  sub: '$3.60/kg',
                  icon: <Flame className="w-4 h-4" />,
                },
                {
                  id: CreditCategory.MIXTO,
                  label: 'Combo Mixto',
                  sub: '$2.85/kg',
                  icon: <TrendingUp className="w-4 h-4" />,
                },
              ].map((item) => {
                const active = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`min-h-[68px] p-3 rounded-2xl border text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-teal-600 dark:border-[#00D1C1] bg-teal-50/70 dark:bg-teal-500/12'
                        : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="text-teal-600 dark:text-[#00D1C1] mb-1">
                      {item.icon}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {item.sub}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kilogram Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="kg-slider"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                2. Volumen del lote (kilogramos)
              </label>
              <span className="font-mono text-base font-bold text-teal-600 dark:text-[#00D1C1] tabular-nums">
                {kgVolume} kg
              </span>
            </div>
            <input
              id="kg-slider"
              type="range"
              min={30}
              max={350}
              step={10}
              value={kgVolume}
              onChange={(e) => setKgVolume(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 tabular-nums mt-1">
              <span>30 kg (Revendedor)</span>
              <span>150 kg (Bodega)</span>
              <span>350 kg (Abasto)</span>
            </div>
          </div>

          {/* Term Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              3. Plazo de rotación en semanas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeeks(w)}
                  className={`min-h-[46px] rounded-xl border text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                    weeks === w
                      ? 'bg-teal-600 dark:bg-[#00D1C1] text-white dark:text-[#041413] border-teal-600 dark:border-[#00D1C1]'
                      : 'bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/[0.1]'
                  }`}
                >
                  {w * 7} días ({w} sem)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation Output Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl p-6 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3.5">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Valor total del lote
              </span>
              <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                ${lotTotal}
              </span>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Inicial hoy (15%)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  ${initialPayment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Monto financiado + gestión
                </span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  ${totalFinancedWithFee}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Cuota semanal ({weeks} pagos)
                </span>
                <span className="font-mono font-bold text-teal-600 dark:text-[#00D1C1] tabular-nums">
                  ${weeklyInstallment} / sem
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <span>Venta estimada al detal (${retailPrice.toFixed(2)}/kg)</span>
                <span className="font-mono font-bold tabular-nums">${projectedRevenue}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Ganancia neta para tu bodega
                </span>
                <span className="font-mono text-lg font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  +${netProfit} ({roiPct}%)
                </span>
              </div>
            </div>

            {financedAmount > availableLine && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                El monto financiado (${financedAmount}) supera tu línea disponible actual ($
                {availableLine}). Reduce los kg o paga una cuota activa.
              </p>
            )}

            <button
              type="button"
              onClick={() => onProceedToRequest(category, lotTotal, weeks)}
              className="w-full min-h-[48px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1FE3D3] text-white dark:text-[#041413] font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Solicitar este lote ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
