import React, { useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { LEVELS_DATA } from '../data/initialData';
import { MerchantProfile } from '../types/credit';

interface LevelsViewProps {
  merchant: MerchantProfile;
  onBack: () => void;
}

export const LevelsView: React.FC<LevelsViewProps> = ({ merchant, onBack }) => {
  const currentIdx = LEVELS_DATA.findIndex((l) =>
    l.name.toLowerCase().includes(merchant.tierName.toLowerCase())
  );
  const [selectedIndex, setSelectedIndex] = useState(
    currentIdx >= 0 ? currentIdx : LEVELS_DATA.length - 1
  );

  const level = LEVELS_DATA[selectedIndex];
  const isUserLevel = level.name
    .toLowerCase()
    .includes(merchant.tierName.toLowerCase());

  return (
    <div className="space-y-6 pb-24 lg:pb-10">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-[#00D1C1] cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-1.5">
          {LEVELS_DATA.map((l, idx) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`Ver nivel ${l.name}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === selectedIndex
                  ? 'w-6 bg-teal-600 dark:bg-[#00D1C1]'
                  : 'w-2 bg-slate-300 dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero Tier Card (matching the silver Krece Platino card in the video) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-br ${level.accentGradient} border border-white/15 shadow-lg relative overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-300">Nivel</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {level.name}
            </h2>
            <p className="mt-1 text-xs text-slate-300 tabular-nums">
              {level.minPoints}+ puntos requeridos
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-display text-xl font-black text-white">
            K
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold tabular-nums">
            <Star className="w-4 h-4 text-teal-300 fill-teal-300" />
            <span>Tus puntos: {merchant.points}</span>
          </div>

          <span className="text-xs font-semibold text-teal-300">
            {isUserLevel
              ? 'Este es tu nivel actual'
              : merchant.points >= level.minPoints
              ? 'Nivel desbloqueado'
              : `Te faltan ${level.minPoints - merchant.points} pts`}
          </span>
        </div>
      </div>

      {/* Beneficios de este nivel */}
      <section className="space-y-4">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Beneficios de este nivel
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Línea General (mínimo)
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              ${level.minLine.toLocaleString('es-VE')}
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lotes Avícola / Cerdo
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              Hasta ${level.maxLotLimit.toLocaleString('es-VE')}
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cuotas para lotes
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              Hasta {level.maxInstallmentsLot} sem
            </p>
          </div>

          <div className="rounded-2xl p-4 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cuotas cadena de frío
            </p>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              Hasta {level.maxInstallmentsLine}
            </p>
          </div>
        </div>

        <div className="rounded-3xl p-5 bg-white dark:bg-[#121718] border border-slate-200 dark:border-white/[0.08] space-y-3.5">
          {level.benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-[#00D1C1] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={selectedIndex === 0}
          onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
          className="flex-1 min-h-[48px] rounded-2xl border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-[#121718] text-sm font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Nivel anterior</span>
        </button>

        <button
          type="button"
          disabled={selectedIndex === LEVELS_DATA.length - 1}
          onClick={() =>
            setSelectedIndex((prev) => Math.min(LEVELS_DATA.length - 1, prev + 1))
          }
          className="flex-1 min-h-[48px] rounded-2xl bg-teal-600 hover:bg-teal-500 dark:bg-[#00D1C1] dark:hover:bg-[#1CE3D3] text-white dark:text-[#041413] text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Siguiente nivel</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
